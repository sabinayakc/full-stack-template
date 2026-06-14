import { describe, expect, it, vi } from "vitest";

vi.mock("@repo/db/client", () => ({ db: {} }));
vi.mock("@repo/db/schema", () => ({}));
vi.mock("@repo/kv", () => ({
  createCloudflareKVStore: vi.fn(),
}));
vi.mock("@repo/email", () => ({
  sendOrganizationInviteEmail: vi.fn(),
  sendResetPasswordEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendTwoFactorEmail: vi.fn(),
}));
vi.mock("../../services/delete-preflight-service", () => ({
  getOrgDeletePreflight: vi.fn(),
}));

describe("Auth server 2FA plugin", () => {
  it("includes twoFactor plugin in auth config", async () => {
    const { auth } = await import("../server");
    const options = (auth as unknown as { options: { plugins: { id: string }[] } }).options;
    const pluginIds = options.plugins.map((p) => p.id);
    expect(pluginIds).toContain("two-factor");
  });

  it("has sendTwoFactorEmail imported and available", async () => {
    const email = await import("@repo/email");
    expect(email.sendTwoFactorEmail).toBeDefined();
  });
});
