import { parseOrganizationSettings } from "@repo/shared";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Service mocks ─────────────────────────────────────────────────────────

const orgServiceMocks = vi.hoisted(() => ({
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
}));

vi.mock("@/services/organization-service", () => ({
  organizationService: {
    getSettings: orgServiceMocks.getSettings,
    updateSettings: orgServiceMocks.updateSettings,
  },
}));

vi.mock("@/auth/server", () => ({}));

vi.mock("@/middleware/require-permission", () => ({
  requirePermission: () => async (_c: unknown, next: () => Promise<void>) => next(),
}));

vi.mock("@/services/blob-service", () => ({
  blobService: { getUploadUrl: vi.fn(), getDownloadUrl: vi.fn() },
}));

vi.mock("@/services/delete-preflight-service", () => ({
  getOrgDeletePreflight: vi.fn().mockResolvedValue({}),
  getUserDeletePreflight: vi.fn().mockResolvedValue({}),
}));

// ─── App setup ──────────────────────────────────────────────────────────────

import orgRoutes from "./organizations";

const app = new Hono();

app.use(async (c, next) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const ctx = c as unknown as { set: (key: string, value: unknown) => void };
  ctx.set("user", { id: userId, name: "Test User", image: null });
  ctx.set("session", {
    id: "session-1",
    activeOrganizationId: c.req.header("x-org-id") ?? null,
  });
  return next();
});

app.route("/organizations", orgRoutes);

const HEADERS = { "x-user-id": "user-1", "x-org-id": "org-1" };
const JSON_HEADERS = { ...HEADERS, "content-type": "application/json" };

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("organization settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orgServiceMocks.getSettings.mockResolvedValue(parseOrganizationSettings({}));
    orgServiceMocks.updateSettings.mockImplementation(
      async (_orgId: string, body: Record<string, unknown>) => {
        const current = parseOrganizationSettings({});
        const merged = { ...current, ...body };
        const { organizationSettingsSchema } = await import("@repo/shared");
        const result = organizationSettingsSchema.safeParse(merged);
        if (!result.success)
          return { error: result.error.issues[0]?.message ?? "Invalid settings" };
        return { settings: result.data };
      },
    );
  });

  describe("PATCH /organizations/:orgId/settings", () => {
    it("accepts valid contact settings", async () => {
      const res = await app.request("/organizations/org-1/settings", {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          address: "123 Main St",
          phone: "+15555550100",
          email: "hello@example.com",
          website: "https://example.com",
        }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as { settings: Record<string, unknown> };
      expect(data.settings.address).toBe("123 Main St");
      expect(data.settings.email).toBe("hello@example.com");
    });

    it("returns 403 for non-member org", async () => {
      const res = await app.request("/organizations/other-org/settings", {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({ address: "x" }),
      });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /organizations/:orgId/settings", () => {
    it("returns the organization settings", async () => {
      orgServiceMocks.getSettings.mockResolvedValue(
        parseOrganizationSettings({ address: "456 Oak Ave" }),
      );

      const res = await app.request("/organizations/org-1/settings", {
        headers: HEADERS,
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as { settings: Record<string, unknown> };
      expect(data.settings.address).toBe("456 Oak Ave");
    });
  });
});
