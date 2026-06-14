import { otpSms } from "@repo/sms";
import { smsProviderService } from "../services/sms-provider-service";

function cfWaitUntil(promise: Promise<unknown>) {
  const waitUntil = (globalThis as Record<string, unknown>).__cfWaitUntil as
    | ((p: Promise<unknown>) => void)
    | undefined;
  if (waitUntil) waitUntil(promise);
}

export function sendSmsBackground({ to, body }: { to: string; body: string }) {
  const provider = smsProviderService.getProvider();
  const recipient = smsProviderService.resolveRecipient(to);
  const promise = provider
    .sendSms({ to: recipient, body })
    .catch((err) => console.error("[auth] Failed to send SMS:", err));
  cfWaitUntil(promise);
}

export function sendOtpSms({ to, code }: { to: string; code: string }) {
  sendSmsBackground({ to, body: otpSms({ code }) });
}
