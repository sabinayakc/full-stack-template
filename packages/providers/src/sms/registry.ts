import { BaseSmsProvider, type SmsProvider, UnsupportedSmsProvider } from "./provider";
import { TwilioSmsProvider } from "./providers/twilio";
import type {
  CreateSmsSubAccountResult,
  SendSmsResult,
  SmsDeliveryEvent,
  SmsProviderConfig,
  SmsSubAccountStatus,
} from "./types";

class NoopSmsProvider extends BaseSmsProvider {
  readonly info = {
    id: "none" as const,
    displayName: "Disabled",
    implemented: true,
    supportsInbound: false,
  };

  private noop(): never {
    throw new Error("No SMS provider configured");
  }

  async sendSms(): Promise<SendSmsResult> {
    this.noop();
  }
  async verifyWebhookSignature(): Promise<boolean> {
    return false;
  }
  parseDeliveryStatus(): SmsDeliveryEvent {
    this.noop();
  }
  async createSubAccount(): Promise<CreateSmsSubAccountResult> {
    this.noop();
  }
  async getSubAccountStatus(): Promise<SmsSubAccountStatus> {
    this.noop();
  }
}

export function createSmsProvider(config: SmsProviderConfig): SmsProvider {
  switch (config.provider) {
    case "twilio":
      return new TwilioSmsProvider(config);
    case "none":
      return new NoopSmsProvider(config);
    default:
      return new UnsupportedSmsProvider(config, "Unknown SMS provider");
  }
}
