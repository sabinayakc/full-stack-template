import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import { type SmsAccountCredentials, smsAccount } from "@repo/db/schema";
import { createSmsProvider, type SmsProvider, type SmsProviderConfig } from "@repo/providers";
import { ConfigService } from "@/config/config-service";

type SmsAccountRow = typeof smsAccount.$inferSelect;

export class SmsProviderService {
  private readonly platformConfig: SmsProviderConfig;
  private readonly sandboxMode: boolean;
  private readonly sandboxNumber: string | undefined;

  constructor(configService = ConfigService.getInstance()) {
    this.platformConfig = configService.getSmsProviderConfig();
    this.sandboxMode = configService.isTwilioSandboxMode();
    this.sandboxNumber = configService.getTwilioSandboxNumber();
  }

  isSandboxMode(): boolean {
    return this.sandboxMode;
  }

  resolveRecipient(to: string): string {
    if (this.sandboxMode && this.sandboxNumber) return this.sandboxNumber;
    return to;
  }

  getProviderInfo() {
    return createSmsProvider(this.platformConfig).info;
  }

  getProvider(): SmsProvider {
    return createSmsProvider(this.platformConfig);
  }

  isConfigured(): boolean {
    return this.platformConfig.provider !== "none";
  }

  // ─── Org-Level SMS Account (Sub-Account) ─────────────────────────────

  async getSmsAccount(organizationId: string): Promise<SmsAccountRow | null> {
    const [row] = await db
      .select()
      .from(smsAccount)
      .where(eq(smsAccount.organizationId, organizationId));
    return row ?? null;
  }

  async ensureSmsAccount(organizationId: string, organizationName: string): Promise<SmsAccountRow> {
    const existing = await this.getSmsAccount(organizationId);
    if (existing) return existing;

    const provider = this.getProvider();
    const result = await provider.createSubAccount({
      friendlyName: organizationName,
      organizationId,
    });

    const credentials: SmsAccountCredentials = {
      accountSid: result.externalAccountSid,
      authToken: result.authToken,
    };

    const [row] = await db
      .insert(smsAccount)
      .values({
        organizationId,
        provider: this.platformConfig.provider,
        externalAccountSid: result.externalAccountSid,
        credentials: credentials as unknown as Record<string, unknown>,
        status: "onboarding",
      })
      .returning();

    return row;
  }

  async getOrgProvider(organizationId: string): Promise<SmsProvider | null> {
    // Sandbox mode: skip org sub-accounts, use root account
    if (this.sandboxMode) return null;

    const account = await this.getSmsAccount(organizationId);
    if (!account || account.status === "disabled") return null;

    const creds = account.credentials as unknown as SmsAccountCredentials | null;
    if (!creds?.accountSid || !creds?.authToken) return null;

    return createSmsProvider({
      provider: this.platformConfig.provider,
      accountSid: creds.accountSid,
      authToken: creds.authToken,
      fromNumber: account.fromNumber ?? this.platformConfig.fromNumber,
      messagingServiceSid: account.messagingServiceSid ?? this.platformConfig.messagingServiceSid,
    });
  }

  async syncAccountStatus(organizationId: string): Promise<SmsAccountRow | null> {
    const account = await this.getSmsAccount(organizationId);
    if (!account) return null;

    const provider = this.getProvider();
    const status = await provider.getSubAccountStatus(account.externalAccountSid);

    const newStatus =
      status.status === "active"
        ? "active"
        : status.status === "suspended"
          ? "suspended"
          : "disabled";

    const [updated] = await db
      .update(smsAccount)
      .set({ status: newStatus, lastValidatedAt: new Date() })
      .where(eq(smsAccount.id, account.id))
      .returning();

    return updated ?? null;
  }

  async activateAccount(
    organizationId: string,
    fromNumber?: string,
    messagingServiceSid?: string,
  ): Promise<SmsAccountRow | null> {
    const account = await this.getSmsAccount(organizationId);
    if (!account) return null;

    const [updated] = await db
      .update(smsAccount)
      .set({
        status: "active",
        fromNumber: fromNumber ?? account.fromNumber,
        messagingServiceSid: messagingServiceSid ?? account.messagingServiceSid,
      })
      .where(eq(smsAccount.id, account.id))
      .returning();

    return updated ?? null;
  }
}

export const smsProviderService = new SmsProviderService();
