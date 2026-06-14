import { describe, expect, it, vi } from "vitest";

vi.mock("@repo/db/client", () => ({
  db: { select: vi.fn() },
}));

vi.mock("@repo/db/schema", () => ({
  smsAccount: { organizationId: "org_id_col" },
}));

vi.mock("@repo/providers", () => ({
  createSmsProvider: vi.fn(() => ({ info: { id: "twilio" } })),
}));

import { SmsProviderService } from "./sms-provider-service";

function makeService(
  overrides: { sandboxMode?: boolean; sandboxNumber?: string; provider?: string } = {},
) {
  const configService = {
    getSmsProviderConfig: () => ({
      provider: overrides.provider ?? "twilio",
      accountSid: "AC_test",
      authToken: "token",
      fromNumber: "+15550000000",
    }),
    isTwilioSandboxMode: () => overrides.sandboxMode ?? false,
    getTwilioSandboxNumber: () => overrides.sandboxNumber,
  };
  return new SmsProviderService(configService as never);
}

describe("SmsProviderService", () => {
  describe("isSandboxMode", () => {
    it("returns false by default", () => {
      expect(makeService().isSandboxMode()).toBe(false);
    });

    it("returns true when sandbox mode is enabled", () => {
      expect(makeService({ sandboxMode: true }).isSandboxMode()).toBe(true);
    });
  });

  describe("resolveRecipient", () => {
    it("returns the original number when sandbox is off", () => {
      const svc = makeService();
      expect(svc.resolveRecipient("+15551234567")).toBe("+15551234567");
    });

    it("returns sandbox number when sandbox mode is on", () => {
      const svc = makeService({ sandboxMode: true, sandboxNumber: "+15559999999" });
      expect(svc.resolveRecipient("+15551234567")).toBe("+15559999999");
    });

    it("returns the original number when sandbox is on but no sandbox number configured", () => {
      const svc = makeService({ sandboxMode: true });
      expect(svc.resolveRecipient("+15551234567")).toBe("+15551234567");
    });
  });

  describe("getOrgProvider (sandbox)", () => {
    it("returns null in sandbox mode without hitting DB", async () => {
      const svc = makeService({ sandboxMode: true });
      const result = await svc.getOrgProvider("org-1");
      expect(result).toBeNull();
    });
  });
});
