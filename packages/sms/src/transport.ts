import type { SmsProvider } from "@repo/providers/sms";

let _provider: SmsProvider | null = null;

export function setSmsProvider(provider: SmsProvider) {
  _provider = provider;
}

export function getSmsProvider(): SmsProvider {
  if (!_provider) {
    throw new Error("SMS provider not initialized. Call setSmsProvider() at startup.");
  }
  return _provider;
}

export interface SendSmsOptions {
  to: string;
  body: string;
  statusCallbackUrl?: string;
}

export interface SendSmsResponse {
  externalMessageId: string;
  status: "queued" | "sent" | "failed";
}

export async function sendSms(options: SendSmsOptions): Promise<SendSmsResponse> {
  const provider = getSmsProvider();
  return provider.sendSms(options);
}
