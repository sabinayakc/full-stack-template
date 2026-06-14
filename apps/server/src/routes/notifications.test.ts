/** biome-ignore-all lint/suspicious/noExplicitAny: Test File*/

import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  getById: vi.fn(),
  send: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  getUnreadCount: vi.fn(),
  registerPushToken: vi.fn(),
  removePushToken: vi.fn(),
}));

vi.mock("@/helpers/hono", () => ({
  createApp: () => {
    const app = new Hono<{
      Variables: {
        user: { id: string; name: string };
        session: { id: string; activeOrganizationId: string | null };
      };
    }>();
    app.use(async (c, next) => {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ error: "Unauthorized" }, 401);
      c.set("user", { id: userId, name: "Test User" });
      c.set("session", {
        id: "session-1",
        activeOrganizationId: c.req.header("x-org-id") ?? null,
      });
      return next();
    });
    return app;
  },
}));

vi.mock("@/services/notification-service", () => ({
  notificationService: mocks,
}));

import notificationRoutes from "./notifications";

describe("notification routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── GET / ──────────────────────────────────────────────────────────────────

  describe("GET /", () => {
    it("requires an active organization", async () => {
      const res = await notificationRoutes.request("/", {
        headers: { "x-user-id": "user-1" },
      });
      expect(res.status).toBe(400);
      expect(mocks.list).not.toHaveBeenCalled();
    });

    it("lists notifications with filters", async () => {
      mocks.list.mockResolvedValue({ notifications: [], nextCursor: undefined });

      const res = await notificationRoutes.request("/?channel=push&status=delivered&limit=5", {
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      expect(mocks.list).toHaveBeenCalledWith({
        organizationId: "org-1",
        cursor: undefined,
        limit: 5,
        channel: "push",
        status: "delivered",
        type: undefined,
      });
    });

    it("passes type filter to list", async () => {
      mocks.list.mockResolvedValue({ notifications: [], nextCursor: undefined });

      const res = await notificationRoutes.request("/?type=general", {
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      expect(mocks.list).toHaveBeenCalledWith(expect.objectContaining({ type: "general" }));
    });
  });

  // ─── GET /unread-count ────────────────────────────────────────────────────

  describe("GET /unread-count", () => {
    it("returns unread count for the authenticated user", async () => {
      mocks.getUnreadCount.mockResolvedValue(3);

      const res = await notificationRoutes.request("/unread-count", {
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ count: 3 });
      expect(mocks.getUnreadCount).toHaveBeenCalledWith("user-1", "org-1");
    });

    it("requires an active organization", async () => {
      const res = await notificationRoutes.request("/unread-count", {
        headers: { "x-user-id": "user-1" },
      });

      expect(res.status).toBe(400);
      expect(mocks.getUnreadCount).not.toHaveBeenCalled();
    });
  });

  // ─── GET /mine ────────────────────────────────────────────────────────────

  describe("GET /mine", () => {
    it("lists in-app notifications for the authenticated user", async () => {
      mocks.list.mockResolvedValue({ notifications: [], nextCursor: undefined });

      const res = await notificationRoutes.request("/mine?limit=10", {
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      expect(mocks.list).toHaveBeenCalledWith({
        organizationId: "org-1",
        cursor: undefined,
        limit: 10,
        recipientUserId: "user-1",
        channel: "in_app",
        type: undefined,
      });
    });

    it("passes type filter to list", async () => {
      mocks.list.mockResolvedValue({ notifications: [], nextCursor: undefined });

      const res = await notificationRoutes.request("/mine?type=general", {
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      expect(mocks.list).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUserId: "user-1",
          channel: "in_app",
          type: "general",
        }),
      );
    });

    it("supports cursor-based pagination", async () => {
      mocks.list.mockResolvedValue({
        notifications: [{ id: "notif-2", body: "Second" }],
        nextCursor: undefined,
      });

      const res = await notificationRoutes.request("/mine?cursor=notif-1&limit=5", {
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      expect(mocks.list).toHaveBeenCalledWith(
        expect.objectContaining({ cursor: "notif-1", limit: 5 }),
      );
    });

    it("requires an active organization", async () => {
      const res = await notificationRoutes.request("/mine", {
        headers: { "x-user-id": "user-1" },
      });

      expect(res.status).toBe(400);
      expect(mocks.list).not.toHaveBeenCalled();
    });
  });

  // ─── PUT /mine/read-all ───────────────────────────────────────────────────

  describe("PUT /mine/read-all", () => {
    it("marks all unread notifications as read", async () => {
      mocks.markAllAsRead.mockResolvedValue(5);

      const res = await notificationRoutes.request("/mine/read-all", {
        method: "PUT",
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ count: 5 });
      expect(mocks.markAllAsRead).toHaveBeenCalledWith("user-1", "org-1");
    });

    it("returns 0 when there are no unread notifications", async () => {
      mocks.markAllAsRead.mockResolvedValue(0);

      const res = await notificationRoutes.request("/mine/read-all", {
        method: "PUT",
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ count: 0 });
    });

    it("requires an active organization", async () => {
      const res = await notificationRoutes.request("/mine/read-all", {
        method: "PUT",
        headers: { "x-user-id": "user-1" },
      });

      expect(res.status).toBe(400);
      expect(mocks.markAllAsRead).not.toHaveBeenCalled();
    });
  });

  // ─── GET /:id ─────────────────────────────────────────────────────────────

  describe("GET /:id", () => {
    it("returns a notification by id", async () => {
      mocks.getById.mockResolvedValue({ id: "notif-1", body: "Test" });

      const res = await notificationRoutes.request("/notif-1", {
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        notification: { id: "notif-1", body: "Test" },
      });
    });

    it("returns 404 when not found", async () => {
      mocks.getById.mockResolvedValue(null);

      const res = await notificationRoutes.request("/notif-1", {
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(404);
    });

    it("requires an active organization", async () => {
      const res = await notificationRoutes.request("/notif-1", {
        headers: { "x-user-id": "user-1" },
      });

      expect(res.status).toBe(400);
      expect(mocks.getById).not.toHaveBeenCalled();
    });
  });

  // ─── POST / ───────────────────────────────────────────────────────────────

  describe("POST /", () => {
    it("sends a notification", async () => {
      mocks.send.mockResolvedValue({ id: "notif-1", channel: "in_app" });

      const res = await notificationRoutes.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
          "x-org-id": "org-1",
        },
        body: JSON.stringify({
          channel: "in_app",
          body: "Job assigned to you",
          recipientUserId: "user-2",
        }),
      });

      expect(res.status).toBe(201);
      expect(mocks.send).toHaveBeenCalledWith({
        channel: "in_app",
        body: "Job assigned to you",
        recipientUserId: "user-2",
        organizationId: "org-1",
      });
    });

    it("sends with type and subject", async () => {
      mocks.send.mockResolvedValue({ id: "notif-1", channel: "in_app", type: "general" });

      const res = await notificationRoutes.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
          "x-org-id": "org-1",
        },
        body: JSON.stringify({
          channel: "in_app",
          type: "general",
          subject: "Heads up",
          body: "Something happened.",
          recipientUserId: "user-2",
        }),
      });

      expect(res.status).toBe(201);
      expect(mocks.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "general",
          subject: "Heads up",
        }),
      );
    });

    it("rejects invalid payloads (missing body)", async () => {
      const res = await notificationRoutes.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
          "x-org-id": "org-1",
        },
        body: JSON.stringify({ channel: "in_app" }),
      });

      expect(res.status).toBe(400);
      expect(mocks.send).not.toHaveBeenCalled();
    });

    it("rejects invalid channel", async () => {
      const res = await notificationRoutes.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
          "x-org-id": "org-1",
        },
        body: JSON.stringify({ channel: "telegram", body: "Hello" }),
      });

      expect(res.status).toBe(400);
      expect(mocks.send).not.toHaveBeenCalled();
    });

    it("requires an active organization", async () => {
      const res = await notificationRoutes.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ channel: "in_app", body: "Test" }),
      });

      expect(res.status).toBe(400);
      expect(mocks.send).not.toHaveBeenCalled();
    });
  });

  // ─── POST /push-token ────────────────────────────────────────────────────

  describe("POST /push-token", () => {
    it("registers a push token without deviceId", async () => {
      mocks.registerPushToken.mockResolvedValue({
        id: "pt-1",
        token: "ExponentPushToken[xxx]",
        platform: "ios",
      });

      const res = await notificationRoutes.request("/push-token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({
          token: "ExponentPushToken[xxx]",
          platform: "ios",
        }),
      });

      expect(res.status).toBe(201);
      expect(mocks.registerPushToken).toHaveBeenCalledWith(
        "user-1",
        "ExponentPushToken[xxx]",
        "ios",
        undefined,
      );
    });

    it("registers a push token with deviceId", async () => {
      mocks.registerPushToken.mockResolvedValue({
        id: "pt-1",
        token: "ExponentPushToken[xxx]",
        platform: "ios",
        deviceId: "device-abc",
      });

      const res = await notificationRoutes.request("/push-token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({
          token: "ExponentPushToken[xxx]",
          platform: "ios",
          deviceId: "device-abc",
        }),
      });

      expect(res.status).toBe(201);
      expect(mocks.registerPushToken).toHaveBeenCalledWith(
        "user-1",
        "ExponentPushToken[xxx]",
        "ios",
        "device-abc",
      );
    });

    it("rejects missing token or platform", async () => {
      const res = await notificationRoutes.request("/push-token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ token: "ExponentPushToken[xxx]" }),
      });

      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({ error: "token and platform are required" });
    });
  });

  // ─── DELETE /push-token ───────────────────────────────────────────────────

  describe("DELETE /push-token", () => {
    it("removes a push token", async () => {
      mocks.removePushToken.mockResolvedValue(undefined);

      const res = await notificationRoutes.request("/push-token", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ token: "ExponentPushToken[xxx]" }),
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ success: true });
      expect(mocks.removePushToken).toHaveBeenCalledWith("user-1", "ExponentPushToken[xxx]");
    });

    it("rejects missing token", async () => {
      const res = await notificationRoutes.request("/push-token", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });
  });

  // ─── PUT /:id/read ────────────────────────────────────────────────────────

  describe("PUT /:id/read", () => {
    it("marks a notification as read", async () => {
      mocks.markAsRead.mockResolvedValue({ id: "notif-1", status: "read" });

      const res = await notificationRoutes.request("/notif-1/read", {
        method: "PUT",
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(200);
      expect(mocks.markAsRead).toHaveBeenCalledWith("notif-1", "org-1");
    });

    it("returns 404 when notification not found", async () => {
      mocks.markAsRead.mockResolvedValue(null);

      const res = await notificationRoutes.request("/notif-1/read", {
        method: "PUT",
        headers: { "x-user-id": "user-1", "x-org-id": "org-1" },
      });

      expect(res.status).toBe(404);
    });

    it("requires an active organization", async () => {
      const res = await notificationRoutes.request("/notif-1/read", {
        method: "PUT",
        headers: { "x-user-id": "user-1" },
      });

      expect(res.status).toBe(400);
      expect(mocks.markAsRead).not.toHaveBeenCalled();
    });
  });
});
