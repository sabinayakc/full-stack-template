import Twilio from "twilio";
import { BaseSmsProvider } from "../provider";
import type {
  CreateSmsSubAccountInput,
  CreateSmsSubAccountResult,
  SendSmsInput,
  SendSmsResult,
  SmsDeliveryEvent,
  SmsProviderInfo,
  SmsSubAccountStatus,
} from "../types";

export class TwilioSmsProvider extends BaseSmsProvider {
  readonly info: SmsProviderInfo = {
    id: "twilio",
    displayName: "Twilio",
    implemented: true,
    supportsInbound: true,
  };

  private getClient() {
    if (!this.config.accountSid || !this.config.authToken) {
      throw new Error(
        "Twilio credentials not configured: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required",
      );
    }
    return Twilio(this.config.accountSid, this.config.authToken);
  }

  private getFromNumber(): string {
    if (this.config.messagingServiceSid) return this.config.messagingServiceSid;
    if (this.config.fromNumber) return this.config.fromNumber;
    throw new Error("Twilio requires either TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID");
  }

  async sendSms(input: SendSmsInput): Promise<SendSmsResult> {
    const client = this.getClient();

    const createOpts: {
      to: string;
      body: string;
      from?: string;
      messagingServiceSid?: string;
      statusCallback?: string;
    } = {
      to: input.to,
      body: input.body,
    };

    if (this.config.messagingServiceSid) {
      createOpts.messagingServiceSid = this.config.messagingServiceSid;
    } else {
      createOpts.from = this.getFromNumber();
    }

    if (input.statusCallbackUrl) {
      createOpts.statusCallback = input.statusCallbackUrl;
    }

    const message = await client.messages.create(createOpts);

    return {
      externalMessageId: message.sid,
      status: message.status === "failed" || message.status === "undelivered" ? "failed" : "queued",
    };
  }

  async verifyWebhookSignature(rawBody: string, signature: string, url: string): Promise<boolean> {
    if (!this.config.authToken) return false;

    const params = Object.fromEntries(new URLSearchParams(rawBody));
    return Twilio.validateRequest(this.config.authToken, signature, url, params);
  }

  parseDeliveryStatus(payload: Record<string, unknown>): SmsDeliveryEvent {
    const messageSid = String(payload.MessageSid ?? payload.SmsSid ?? "");
    const to = String(payload.To ?? "");
    const rawStatus = String(payload.MessageStatus ?? payload.SmsStatus ?? "");
    const errorCode = payload.ErrorCode ? String(payload.ErrorCode) : undefined;
    const errorMessage = payload.ErrorMessage ? String(payload.ErrorMessage) : undefined;

    let status: SmsDeliveryEvent["status"];
    switch (rawStatus) {
      case "delivered":
        status = "delivered";
        break;
      case "undelivered":
        status = "undelivered";
        break;
      default:
        status = "failed";
    }

    return { externalMessageId: messageSid, to, status, errorCode, errorMessage };
  }

  async createSubAccount(input: CreateSmsSubAccountInput): Promise<CreateSmsSubAccountResult> {
    const client = this.getClient();
    const account = await client.api.accounts.create({
      friendlyName: `App | ${input.friendlyName} (${input.organizationId})`,
    });

    return {
      externalAccountSid: account.sid,
      authToken: account.authToken,
    };
  }

  async getSubAccountStatus(externalAccountSid: string): Promise<SmsSubAccountStatus> {
    const client = this.getClient();
    const account = await client.api.accounts(externalAccountSid).fetch();

    let status: SmsSubAccountStatus["status"];
    switch (account.status) {
      case "active":
        status = "active";
        break;
      case "suspended":
        status = "suspended";
        break;
      default:
        status = "closed";
    }

    return {
      externalAccountSid: account.sid,
      friendlyName: account.friendlyName,
      status,
    };
  }
}
