import { expoClient } from "@better-auth/expo/client";
import { organizationPluginSchema } from "@repo/shared";
import { organizationClient, phoneNumberClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { APP_NAME, APP_VERSION, SERVER_URL } from "@/constants/app";
import { ac, roles } from "./auth-permissions";
import { secureStorage } from "./storage";

function buildNativeUserAgent(): string {
  const os = Platform.OS === "ios" ? "iOS" : "Android";
  const osVersion = Device.osVersion ?? "unknown";
  const model = Device.modelName ?? "unknown";
  const isPhone = Device.deviceType === Device.DeviceType.PHONE;
  return `${APP_NAME}/${APP_VERSION} (${os} ${osVersion}; ${model}; ${isPhone ? "Mobile" : "Tablet"})`;
}

export const authClient = createAuthClient({
  baseURL: SERVER_URL,
  ...(Platform.OS !== "web" && {
    fetchOptions: { headers: { "user-agent": buildNativeUserAgent() } },
  }),
  plugins: [
    expoClient({
      scheme: APP_NAME.toLowerCase(),
      storagePrefix: APP_NAME.toLowerCase(),
      storage: secureStorage,
    }),
    organizationClient({
      schema: organizationPluginSchema,
      ac,
      roles: {
        owner: roles.owner,
        admin: roles.admin,
        member: roles.member,
        estimator: roles.estimator,
        field: roles.field,
      },
      teams: {
        enabled: true,
      },
    }),
    twoFactorClient(),
    phoneNumberClient(),
  ],
});

export const { useSession, signIn, signUp, signOut, useListOrganizations, useActiveOrganization } =
  authClient;
