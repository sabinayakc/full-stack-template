import { expo } from "@better-auth/expo";
import { db } from "@repo/db/client";
import * as schema from "@repo/db/schema";
import {
  sendOrganizationInviteEmail,
  sendResetPasswordEmail,
  sendTwoFactorEmail,
  sendVerificationEmail,
} from "@repo/email";
import type { KVStore } from "@repo/kv";
import { createCloudflareKVStore } from "@repo/kv";
import {
  MAX_ORGANIZATIONS,
  organizationPluginSchema,
  organizationSettingsSchema,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  userAdditionalFields,
  VERIFICATION_EMAIL_RESEND_COOLDOWN_SECONDS,
} from "@repo/shared";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { admin, organization, phoneNumber, twoFactor } from "better-auth/plugins";
import { getOrgDeletePreflight } from "../services/delete-preflight-service";
import { sendOtpSms } from "../utils/sms";
import { ac, roles } from "./permissions";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:8081";
const _REDIS_URL = process.env.REDIS_URL || "";
const IS_PROD = (process.env.ENVIRONMENT || process.env.NODE_ENV) === "production";
const E2E_AUTO_VERIFY = !IS_PROD && process.env.E2E_AUTO_VERIFY === "true";

if (E2E_AUTO_VERIFY) {
  console.warn("[auth] E2E_AUTO_VERIFY is enabled — email verification is disabled");
}

function rewriteToClientUrl(apiUrl: string, clientPath: string): string {
  const parsed = new URL(apiUrl);
  const token = parsed.searchParams.get("token");
  const clientUrl = new URL(clientPath, CLIENT_URL);
  if (token) {
    clientUrl.searchParams.set("token", token);
  }
  return clientUrl.toString();
}

let _kv: KVStore | null | undefined;

function getKV(): KVStore | null {
  if (_kv !== undefined) return _kv;
  // Prefer CF KV binding (Workers), fall back to Redis (local dev)
  // biome-ignore lint/suspicious/noExplicitAny: CF binding on globalThis
  const cfKV = (globalThis as any).__cfKV;
  if (cfKV) {
    _kv = createCloudflareKVStore(cfKV);
    return _kv;
  }
  // No KV available (Redis is not supported on Workers)
  _kv = null;
  return null;
}

export const auth = betterAuth({
  basePath: "/api/auth",
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip"],
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  secondaryStorage: {
    get: (key: string) => getKV()?.get(key) ?? Promise.resolve(null),
    set: (key: string, value: string, ttl?: number) =>
      getKV()?.set(key, value, ttl) ?? Promise.resolve(),
    delete: (key: string) => getKV()?.delete(key) ?? Promise.resolve(),
  },
  appName: "App",
  plugins: [
    expo(),
    admin(),
    twoFactor({
      issuer: "App",
      skipVerificationOnEnable: true,
      allowPasswordless: true,
      otpOptions: {
        sendOTP: ({ user, otp }, ctx) => {
          const channel = ctx?.headers?.get("x-otp-channel");
          const u = user as typeof user & {
            phoneNumber?: string | null;
            phoneNumberVerified?: boolean;
          };
          if (channel === "sms" && u.phoneNumber && u.phoneNumberVerified) {
            sendOtpSms({ to: u.phoneNumber, code: otp });
          } else {
            void sendTwoFactorEmail({ to: user.email, otp });
          }
        },
      },
    }),
    phoneNumber({
      sendOTP: ({ phoneNumber: to, code }) => {
        sendOtpSms({ to, code });
      },
      phoneNumberValidator: (value) => /^\+?[1-9]\d{6,14}$/.test(value),
    }),
    // TODO: Add captcha plugin for sign-in/sign-up when ready
    // captcha({ provider: "cloudflare-turnstile", secretKey: process.env.TURNSTILE_SECRET_KEY || "" }),
    organization({
      schema: organizationPluginSchema,
      organizationLimit: MAX_ORGANIZATIONS,
      ac,
      roles: {
        owner: roles.owner,
        admin: roles.admin,
        member: roles.member,
      },
      teams: {
        enabled: true,
        maximumTeams: 10,
        allowRemovingAllTeams: false,
      },
      dynamicAccessControl: {
        enabled: true,
        maximumRolesPerOrganization: 20,
      },
      sendInvitationEmail: async (data) => {
        const invitationUrl = `${CLIENT_URL}/invitation?id=${data.id}`;
        const orgRecord = data.organization as typeof data.organization & {
          settings?: Record<string, unknown> | null;
        };
        const settings = orgRecord.settings ?? {};
        void sendOrganizationInviteEmail({
          to: data.email,
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
          url: invitationUrl,
          role: data.role,
          org: {
            name: data.organization.name,
            logoUrl: data.organization.logo ?? null,
            email: (settings.email as string) ?? null,
            phone: (settings.phone as string) ?? null,
            website: (settings.website as string) ?? null,
          },
        }).catch((err) => console.error("[auth] Failed to send invitation email:", err));
      },
      organizationHooks: {
        beforeCreateOrganization: async ({ organization }) => {
          const parsedSettings = organizationSettingsSchema.safeParse(organization.settings ?? {});

          if (!parsedSettings.success) {
            throw new APIError("BAD_REQUEST", {
              message: parsedSettings.error.issues[0]?.message ?? "Invalid organization settings.",
            });
          }

          return {
            data: {
              ...organization,
              settings: parsedSettings.data,
            },
          };
        },
        beforeDeleteOrganization: async ({ organization: org }) => {
          const preflight = await getOrgDeletePreflight(org.id);
          if (!preflight.canDelete) {
            const summary = preflight.blockers
              .map((b) => `${b.count} ${b.label}${b.count > 1 ? "s" : ""}`)
              .join(", ");
            throw new APIError("BAD_REQUEST", {
              message: `Cannot delete organization: ${summary}.`,
            });
          }
        },
        beforeUpdateOrganization: async ({ organization }) => {
          if (organization.settings === undefined) {
            return;
          }

          const parsedSettings = organizationSettingsSchema.safeParse(organization.settings ?? {});

          if (!parsedSettings.success) {
            throw new APIError("BAD_REQUEST", {
              message: parsedSettings.error.issues[0]?.message ?? "Invalid organization settings.",
            });
          }

          return {
            data: {
              ...organization,
              settings: parsedSettings.data,
            },
          };
        },
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    requireEmailVerification: !E2E_AUTO_VERIFY,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      void sendResetPasswordEmail({
        to: user.email,
        url: rewriteToClientUrl(url, "/reset-password"),
      }).catch((err) => console.error("[auth] Failed to send reset password email:", err));
    },
    onPasswordReset: async ({ user }) => {
      console.info(`[auth] Password reset completed for ${user.email}`);
    },
  },
  emailVerification: {
    sendOnSignUp: !E2E_AUTO_VERIFY,
    sendOnSignIn: !E2E_AUTO_VERIFY,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail({
        to: user.email,
        url: rewriteToClientUrl(url, "/verify-email"),
      }).catch((err) => console.error("[auth] Failed to send verification email:", err));
    },
  },
  rateLimit: {
    enabled: true,
    customRules: {
      "/send-verification-email": {
        window: VERIFICATION_EMAIL_RESEND_COOLDOWN_SECONDS,
        max: 1,
      },
    },
  },
  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:8081",
    "app://",
    ...(!IS_PROD ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"] : []),
  ],
  session: {
    expiresIn: 604800, // 7 days
    updateAge: 86400, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: userAdditionalFields,
  },
});

export type Session = typeof auth.$Infer.Session;
