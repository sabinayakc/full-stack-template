import type {
  CreateSmsSubAccountInput,
  CreateSmsSubAccountResult,
  SendSmsInput,
  SendSmsResult,
  SmsDeliveryEvent,
  SmsProviderConfig,
  SmsProviderInfo,
  SmsSubAccountStatus,
} from "./types";

export interface SmsProvider {
  readonly info: SmsProviderInfo;

  sendSms(input: SendSmsInput): Promise<SendSmsResult>;

  verifyWebhookSignature(rawBody: string, signature: string, url: string): Promise<boolean>;

  parseDeliveryStatus(payload: Record<string, unknown>): SmsDeliveryEvent;

  // ─── Sub-Account Management ───────────────────────────────────────────

  createSubAccount(input: CreateSmsSubAccountInput): Promise<CreateSmsSubAccountResult>;

  getSubAccountStatus(externalAccountSid: string): Promise<SmsSubAccountStatus>;
}

export abstract class BaseSmsProvider implements SmsProvider {
  constructor(protected readonly config: SmsProviderConfig) {}

  abstract readonly info: SmsProviderInfo;
  abstract sendSms(input: SendSmsInput): Promise<SendSmsResult>;
  abstract verifyWebhookSignature(
    rawBody: string,
    signature: string,
    url: string,
  ): Promise<boolean>;
  abstract parseDeliveryStatus(payload: Record<string, unknown>): SmsDeliveryEvent;
  abstract createSubAccount(input: CreateSmsSubAccountInput): Promise<CreateSmsSubAccountResult>;
  abstract getSubAccountStatus(externalAccountSid: string): Promise<SmsSubAccountStatus>;
}

export class UnsupportedSmsProvider extends BaseSmsProvider {
  readonly info: SmsProviderInfo;

  constructor(config: SmsProviderConfig, displayName: string) {
    super(config);
    this.info = {
      id: config.provider,
      displayName,
      implemented: false,
      supportsInbound: false,
    };
  }

  private unsupported(): never {
    throw new Error(`${this.info.displayName} SMS provider is not implemented yet`);
  }

  async sendSms(): Promise<SendSmsResult> {
    this.unsupported();
  }
  async verifyWebhookSignature(): Promise<boolean> {
    this.unsupported();
  }
  parseDeliveryStatus(): SmsDeliveryEvent {
    this.unsupported();
  }
  async createSubAccount(): Promise<CreateSmsSubAccountResult> {
    this.unsupported();
  }
  async getSubAccountStatus(): Promise<SmsSubAccountStatus> {
    this.unsupported();
  }
}
