import { render } from "@react-email/components";
import type { OrgContext } from "./templates/components/layout";
import { NotificationEmail } from "./templates/notification";
import { OrganizationInviteEmail } from "./templates/organization-invite";
import { OTPEmail } from "./templates/otp";
import { ResetPasswordEmail } from "./templates/reset-password";
import { TwoFactorEmail } from "./templates/two-factor";
import { VerificationEmail } from "./templates/verification";
import { sendMail, sendMailBackground } from "./transport";

export type { OrgContext } from "./templates/components/layout";
export { sendMail, sendMailBackground } from "./transport";

/**
 * Send a transactional notification email rendered with the shared Layout
 * (org logo + footer). Used for estimate/invoice/portal-action delivery, etc.
 * Awaits the send so callers can record delivery status.
 */
export async function sendNotificationEmail({
  to,
  subject,
  body,
  org,
}: {
  to: string;
  subject: string;
  body: string;
  org?: OrgContext;
}): Promise<void> {
  const html = await render(NotificationEmail({ subject, body, org }));
  await sendMail({ to, subject, html });
}

export async function sendOTPEmail({
  to,
  otp,
  type,
}: {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}) {
  const subjectMap = {
    "sign-in": "Your sign-in code",
    "email-verification": "Verify your email",
    "forget-password": "Reset your password",
  };

  const html = await render(OTPEmail({ otp, type }));

  sendMailBackground({
    to,
    subject: `${subjectMap[type]} - App`,
    html,
  });
}

export async function sendTwoFactorEmail({
  to,
  otp,
  org,
}: {
  to: string;
  otp: string;
  org?: OrgContext;
}) {
  const label = org?.name ?? "App";
  const html = await render(TwoFactorEmail({ otp, org }));

  sendMailBackground({
    to,
    subject: `Two-factor authentication code - ${label}`,
    html,
  });
}

export async function sendVerificationEmail({
  to,
  url,
  org,
}: {
  to: string;
  url: string;
  org?: OrgContext;
}) {
  const label = org?.name ?? "App";
  const html = await render(VerificationEmail({ url, org }));

  sendMailBackground({
    to,
    subject: `Verify your email address - ${label}`,
    html,
  });
}

export async function sendResetPasswordEmail({
  to,
  url,
  org,
}: {
  to: string;
  url: string;
  org?: OrgContext;
}) {
  const label = org?.name ?? "App";
  const html = await render(ResetPasswordEmail({ url, org }));

  sendMailBackground({
    to,
    subject: `Reset your password - ${label}`,
    html,
  });
}

export async function sendOrganizationInviteEmail({
  to,
  organizationName,
  inviterName,
  url,
  role,
  org,
}: {
  to: string;
  organizationName: string;
  inviterName: string;
  url: string;
  role: string;
  org?: OrgContext;
}) {
  const html = await render(
    OrganizationInviteEmail({ organizationName, inviterName, url, role, org }),
  );

  sendMailBackground({
    to,
    subject: `You've been invited to ${organizationName} - App`,
    html,
  });
}
