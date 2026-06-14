import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const smsProviderServiceMocks = vi.hoisted(() => ({
  getProviderInfo: vi.fn(),
  isConfigured: vi.fn(),
  getSmsAccount: vi.fn(),
  syncAccountStatus: vi.fn(),
  activateAccount: vi.fn(),
}));

vi.mock("@/helpers/hono", () => ({
  createApp: () => {
    const app = new Hono<{
      Variables: {
        user: { id: string; name: string; email: string };
        session: { id: string; activeOrganizationId: string | null };
      };
    }>();
    app.use(async (c, next) => {
      const userId = c.req.header("x-user-id");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      c.set("user", { id: userId, name: "Test User", email: "test@example.com" });
      c.set("session", {
        id: "session-1",
        activeOrganizationId: c.req.header("x-org-id") ?? null,
      });
      return next();
    });
    return app;
  },
}));

vi.mock("@/services/sms-provider-service", () => ({
  smsProviderService: smsProviderServiceMocks,
}));

import smsRoutes from "./sms";

const headers = {
  "x-user-id": "user-1",
  "x-org-id": "org-1",
};
const jsonHeaders = { ...headers, "content-type": "application/json" };

describe("sms routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    smsProviderServiceMocks.getProviderInfo.mockReturnValue({
      id: "twilio",
      displayName: "Twilio",
      implemented: true,
      supportsInbound: true,
    });
    smsProviderServiceMocks.isConfigured.mockReturnValue(true);
  });

  describe("GET /provider/config", () => {
    it("returns provider info and configured status", async () => {
      const res = await smsRoutes.request("/provider/config", { headers });
      expect(res.status).toBe(200);

      const body: any = await res.json();
      expect(body.provider.id).toBe("twilio");
      expect(body.configured).toBe(true);
    });
  });

  describe("GET /account/status", () => {
    it("returns null when no account exists", async () => {
      smsProviderServiceMocks.getSmsAccount.mockResolvedValue(null);

      const res = await smsRoutes.request("/account/status", { headers });
      expect(res.status).toBe(200);

      const body: any = await res.json();
      expect(body.account).toBeNull();
    });

    it("returns synced account status", async () => {
      smsProviderServiceMocks.getSmsAccount.mockResolvedValue({
        id: "sms-1",
        status: "onboarding",
      });
      smsProviderServiceMocks.syncAccountStatus.mockResolvedValue({
        id: "sms-1",
        status: "active",
      });

      const res = await smsRoutes.request("/account/status", { headers });
      expect(res.status).toBe(200);

      const body: any = await res.json();
      expect(body.account.status).toBe("active");
    });

    it("returns 400 when no active org", async () => {
      const res = await smsRoutes.request("/account/status", {
        headers: { "x-user-id": "user-1" },
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /account/activate", () => {
    it("activates account with fromNumber", async () => {
      smsProviderServiceMocks.activateAccount.mockResolvedValue({
        id: "sms-1",
        status: "active",
        fromNumber: "+15551234567",
      });

      const res = await smsRoutes.request("/account/activate", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ fromNumber: "+15551234567" }),
      });

      expect(res.status).toBe(200);
      const body: any = await res.json();
      expect(body.account.fromNumber).toBe("+15551234567");
    });

    it("activates account with messagingServiceSid", async () => {
      smsProviderServiceMocks.activateAccount.mockResolvedValue({
        id: "sms-1",
        status: "active",
        messagingServiceSid: "MG_abc",
      });

      const res = await smsRoutes.request("/account/activate", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ messagingServiceSid: "MG_abc" }),
      });

      expect(res.status).toBe(200);
    });

    it("returns 400 when neither fromNumber nor messagingServiceSid provided", async () => {
      const res = await smsRoutes.request("/account/activate", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it("returns 404 when no SMS account exists", async () => {
      smsProviderServiceMocks.activateAccount.mockResolvedValue(null);

      const res = await smsRoutes.request("/account/activate", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ fromNumber: "+1555" }),
      });

      expect(res.status).toBe(404);
    });
  });
});
