export type SmsProviderId = "twilio" | "none";

export interface SmsProviderInfo {
  id: SmsProviderId;
  displayName: string;
  implemented: boolean;
  supportsInbound: boolean;
}

export interface SmsProviderConfig {
  provider: SmsProviderId;
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  messagingServiceSid?: string;
}

// ─── Send ───────────────────────────────────────────────────────────────────

export interface SendSmsInput {
  to: string;
  body: string;
  statusCallbackUrl?: string;
}

export interface SendSmsResult {
  externalMessageId: string;
  status: "queued" | "sent" | "failed";
}

// ─── Delivery Status (webhook) ──────────────────────────────────────────────

export interface SmsDeliveryEvent {
  externalMessageId: string;
  to: string;
  status: "delivered" | "undelivered" | "failed";
  errorCode?: string;
  errorMessage?: string;
}

// ─── Sub-Account Management ─────────────────────────────────────────────────

export interface CreateSmsSubAccountInput {
  friendlyName: string;
  organizationId: string;
}

export interface CreateSmsSubAccountResult {
  externalAccountSid: string;
  authToken: string;
}

export interface SmsSubAccountStatus {
  externalAccountSid: string;
  friendlyName: string;
  status: "active" | "suspended" | "closed";
}

// ─── Inbound (future) ──────────────────────────────────────────────────────

export interface InboundSmsEvent {
  externalMessageId: string;
  from: string;
  to: string;
  body: string;
}
