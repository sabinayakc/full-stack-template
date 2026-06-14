/** biome-ignore-all lint/suspicious/noExplicitAny: Test File*/
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    transaction: vi.fn(async (callback: any) => callback(mocks.db)),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  fetch: vi.fn(),
  sendMail: vi.fn(),
  consoleInfo: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock("@repo/db/client", () => ({
  db: mocks.db,
}));

vi.mock("@repo/email", () => ({
  sendMail: mocks.sendMail,
}));

vi.mock("@repo/workflows", () => ({
  getJobQueue: () => ({ dispatch: mocks.dispatch }),
}));

vi.mock("@/services/sms-provider-service", () => ({
  smsProviderService: {
    isConfigured: vi.fn().mockReturnValue(false),
    getProvider: vi.fn(),
    getOrgProvider: vi.fn().mockResolvedValue(null),
    isSandboxMode: vi.fn().mockReturnValue(false),
    resolveRecipient: vi.fn((to: string) => to),
  },
}));

vi.mock("@repo/db", async () => {
  const actual = await vi.importActual<typeof import("@repo/db")>("@repo/db");
  return { ...actual };
});

vi.mock("@repo/db/schema", () => ({
  notification: {
    id: "notif_id_col",
    organizationId: "notif_org_col",
    recipientUserId: "notif_recipient_col",
    channel: "notif_channel_col",
    status: "notif_status_col",
    createdAt: "notif_created_at_col",
  },
  pushToken: {
    id: "pt_id_col",
    userId: "pt_user_col",
    token: "pt_token_col",
    platform: "pt_platform_col",
    deviceId: "pt_device_id_col",
    updatedAt: "pt_updated_at_col",
  },
  user: {
    id: "user_id_col",
    email: "user_email_col",
    name: "user_name_col",
    metadata: "user_metadata_col",
  },
}));

// Mock global fetch for Expo push
vi.stubGlobal("fetch", mocks.fetch);

const originalConsoleInfo = console.info;

import { notificationService } from "./notification-service";

describe("notificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.info = mocks.consoleInfo;
    mocks.dispatch.mockResolvedValue(undefined);
  });

  describe("send", () => {
    it("inserts and immediately delivers in_app notifications", async () => {
      const selectUserChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ email: "user@test.com", name: "Test" }]),
      };
      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "in_app",
            status: "pending",
            deliveredAt: null,
          },
        ]),
      };
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "in_app",
            status: "delivered",
            deliveredAt: new Date(),
          },
        ]),
      };

      mocks.db.select.mockReturnValueOnce(selectUserChain);
      mocks.db.insert.mockReturnValueOnce(insertChain);
      mocks.db.update.mockReturnValueOnce(updateChain);

      const result = await notificationService.send({
        recipientUserId: "user-1",
        channel: "in_app",
        body: "Hello",
        organizationId: "org-1",
      });

      expect(result.status).toBe("delivered");
      expect(mocks.db.insert).toHaveBeenCalled();
      expect(mocks.db.update).toHaveBeenCalled();
      expect(mocks.dispatch).not.toHaveBeenCalled();
    });

    it("queues delivery for email notifications", async () => {
      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "email",
            recipientEmail: "customer@test.com",
            status: "pending",
          },
        ]),
      };

      mocks.db.insert.mockReturnValueOnce(insertChain);

      const result = await notificationService.send({
        recipientEmail: "customer@test.com",
        channel: "email",
        subject: "Estimate ready",
        body: "Open your estimate",
        organizationId: "org-1",
      });

      expect(result.status).toBe("pending");
      expect(mocks.dispatch).toHaveBeenCalledWith("notifications.deliver", {
        notificationId: "notif-1",
        organizationId: "org-1",
      });
      expect(mocks.sendMail).not.toHaveBeenCalled();
    });

    it("queues delivery for SMS notifications", async () => {
      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "sms",
            recipientPhone: "+15551234567",
            status: "pending",
          },
        ]),
      };

      mocks.db.insert.mockReturnValueOnce(insertChain);

      const result = await notificationService.send({
        recipientPhone: "+15551234567",
        channel: "sms",
        body: "View your estimate",
        organizationId: "org-1",
      });

      expect(result.status).toBe("pending");
      expect(mocks.dispatch).toHaveBeenCalledWith("notifications.deliver", {
        notificationId: "notif-1",
        organizationId: "org-1",
      });
    });

    it("queues delivery for push notifications", async () => {
      const selectUserChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ email: "user@test.com", name: "Test" }]),
      };
      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "push",
            status: "pending",
          },
        ]),
      };

      mocks.db.select.mockReturnValueOnce(selectUserChain);
      mocks.db.insert.mockReturnValueOnce(insertChain);

      await notificationService.send({
        recipientUserId: "user-1",
        channel: "push",
        body: "New job assigned",
        subject: "Job Update",
        organizationId: "org-1",
      });

      expect(mocks.dispatch).toHaveBeenCalledWith("notifications.deliver", {
        notificationId: "notif-1",
        organizationId: "org-1",
      });
      expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it("falls back to inline delivery when queue dispatch fails", async () => {
      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "email",
            recipientEmail: "customer@test.com",
            status: "pending",
            organizationId: "org-1",
          },
        ]),
      };
      const selectNotificationChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "email",
            recipientEmail: "customer@test.com",
            status: "pending",
            organizationId: "org-1",
            body: "Open your estimate",
            subject: "Estimate ready",
          },
        ]),
      };
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      mocks.dispatch.mockRejectedValueOnce(new Error("Queue unavailable"));
      mocks.db.insert.mockReturnValueOnce(insertChain);
      mocks.db.select.mockReturnValueOnce(selectNotificationChain);
      mocks.db.update.mockReturnValueOnce(updateChain);
      mocks.sendMail.mockResolvedValueOnce(undefined);

      await notificationService.send({
        recipientEmail: "customer@test.com",
        channel: "email",
        subject: "Estimate ready",
        body: "Open your estimate",
        organizationId: "org-1",
      });

      expect(mocks.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "customer@test.com",
          subject: "Estimate ready",
        }),
      );
    });
  });

  describe("deliver", () => {
    it("dispatches email via SMTP transport", async () => {
      const selectNotificationChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "email",
            recipientEmail: "customer@test.com",
            status: "pending",
            body: "Open your estimate",
            subject: "Estimate ready",
            organizationId: "org-1",
          },
        ]),
      };
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      mocks.db.select.mockReturnValueOnce(selectNotificationChain);
      mocks.db.update.mockReturnValueOnce(updateChain);
      mocks.sendMail.mockResolvedValueOnce(undefined);

      await notificationService.deliver("notif-1", "org-1");

      expect(mocks.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "customer@test.com",
          subject: "Estimate ready",
        }),
      );
    });

    it("dispatches push via Expo push API", async () => {
      const selectNotificationChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "push",
            recipientUserId: "user-1",
            status: "pending",
            body: "New job assigned",
            subject: "Job Update",
            organizationId: "org-1",
          },
        ]),
      };
      const selectTokenChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ token: "ExponentPushToken[abc]" }]),
      };
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      mocks.db.select
        .mockReturnValueOnce(selectNotificationChain)
        .mockReturnValueOnce(selectTokenChain);
      mocks.db.update.mockReturnValueOnce(updateChain);
      mocks.fetch.mockResolvedValueOnce({ ok: true });

      await notificationService.deliver("notif-1", "org-1");

      expect(mocks.fetch).toHaveBeenCalledWith(
        "https://exp.host/--/api/v2/push/send",
        expect.objectContaining({ method: "POST" }),
      );

      const fetchCall = mocks.fetch.mock.calls[0];
      const pushBody = JSON.parse(fetchCall[1].body);
      expect(pushBody).toEqual([
        expect.objectContaining({
          to: "ExponentPushToken[abc]",
          title: "Job Update",
          body: "New job assigned",
        }),
      ]);
    });

    it("logs SMS in development", async () => {
      const selectNotificationChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "sms",
            recipientPhone: "+15551234567",
            status: "pending",
            body: "View your estimate",
            organizationId: "org-1",
          },
        ]),
      };
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      mocks.db.select.mockReturnValueOnce(selectNotificationChain);
      mocks.db.update.mockReturnValueOnce(updateChain);

      await notificationService.deliver("notif-1", "org-1");

      expect(mocks.consoleInfo).toHaveBeenCalledWith(
        expect.stringContaining("[sms][dev] to=+15551234567"),
      );
    });

    it("marks notification as failed when Expo push API fails", async () => {
      const selectNotificationChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "push",
            recipientUserId: "user-1",
            status: "pending",
            body: "Test",
            subject: null,
            organizationId: "org-1",
          },
        ]),
      };
      const selectTokenChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ token: "ExponentPushToken[abc]" }]),
      };
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      mocks.db.select
        .mockReturnValueOnce(selectNotificationChain)
        .mockReturnValueOnce(selectTokenChain);
      mocks.db.update.mockReturnValueOnce(updateChain);

      mocks.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await notificationService.deliver("notif-1", "org-1");

      expect(mocks.db.update).toHaveBeenCalled();
      const setCall = updateChain.set.mock.calls[0][0];
      expect(setCall.status).toBe("failed");
      expect(setCall.failedReason).toContain("Expo push: 500");
    });

    it("skips already-delivered notifications", async () => {
      const selectNotificationChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: "notif-1",
            channel: "email",
            status: "sent",
            organizationId: "org-1",
          },
        ]),
      };

      mocks.db.select.mockReturnValueOnce(selectNotificationChain);

      await notificationService.deliver("notif-1", "org-1");

      expect(mocks.sendMail).not.toHaveBeenCalled();
      expect(mocks.db.update).not.toHaveBeenCalled();
    });
  });

  describe("registerPushToken", () => {
    it("inserts a new token when none exists (no deviceId)", async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "pt-1",
            userId: "user-1",
            token: "ExponentPushToken[xxx]",
            platform: "ios",
          },
        ]),
      };

      mocks.db.select.mockReturnValueOnce(selectChain);
      mocks.db.insert.mockReturnValueOnce(insertChain);

      const result = await notificationService.registerPushToken(
        "user-1",
        "ExponentPushToken[xxx]",
        "ios",
      );

      expect(result.token).toBe("ExponentPushToken[xxx]");
      expect(mocks.db.insert).toHaveBeenCalled();
    });

    it("inserts a new token when none exists (with deviceId)", async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      const insertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "pt-1",
            userId: "user-1",
            token: "ExponentPushToken[xxx]",
            platform: "ios",
            deviceId: "device-abc",
          },
        ]),
      };

      mocks.db.select.mockReturnValueOnce(selectChain);
      mocks.db.insert.mockReturnValueOnce(insertChain);

      const result = await notificationService.registerPushToken(
        "user-1",
        "ExponentPushToken[xxx]",
        "ios",
        "device-abc",
      );

      expect(result.token).toBe("ExponentPushToken[xxx]");
      expect(result.deviceId).toBe("device-abc");
      expect(mocks.db.insert).toHaveBeenCalled();
    });

    it("updates an existing token matched by token (no deviceId)", async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "pt-1" }]),
      };
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "pt-1",
            userId: "user-1",
            token: "ExponentPushToken[xxx]",
            platform: "android",
          },
        ]),
      };

      mocks.db.select.mockReturnValueOnce(selectChain);
      mocks.db.update.mockReturnValueOnce(updateChain);

      const result = await notificationService.registerPushToken(
        "user-1",
        "ExponentPushToken[xxx]",
        "android",
      );

      expect(result.platform).toBe("android");
      expect(mocks.db.update).toHaveBeenCalled();
      expect(mocks.db.insert).not.toHaveBeenCalled();
    });

    it("updates existing token matched by deviceId (replaces rotated token)", async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "pt-1" }]),
      };
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: "pt-1",
            userId: "user-1",
            token: "ExponentPushToken[new]",
            platform: "ios",
            deviceId: "device-abc",
          },
        ]),
      };

      mocks.db.select.mockReturnValueOnce(selectChain);
      mocks.db.update.mockReturnValueOnce(updateChain);

      const result = await notificationService.registerPushToken(
        "user-1",
        "ExponentPushToken[new]",
        "ios",
        "device-abc",
      );

      expect(result.token).toBe("ExponentPushToken[new]");
      expect(result.deviceId).toBe("device-abc");
      expect(mocks.db.update).toHaveBeenCalled();
      expect(mocks.db.insert).not.toHaveBeenCalled();
    });
  });

  describe("getUnreadCount", () => {
    it("returns count of delivered notifications for user", async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "n1" }, { id: "n2" }, { id: "n3" }]),
      };
      mocks.db.select.mockReturnValueOnce(selectChain);

      const count = await notificationService.getUnreadCount("user-1", "org-1");
      expect(count).toBe(3);
    });
  });

  describe("markAsRead", () => {
    it("updates status to read and returns the notification", async () => {
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: "notif-1", status: "read" }]),
      };
      mocks.db.update.mockReturnValueOnce(updateChain);

      const result = await notificationService.markAsRead("notif-1", "org-1");
      expect(result?.status).toBe("read");
    });

    it("returns null when notification not found", async () => {
      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      mocks.db.update.mockReturnValueOnce(updateChain);

      const result = await notificationService.markAsRead("notif-1", "org-1");
      expect(result).toBeNull();
    });
  });

  afterEach(() => {
    console.info = originalConsoleInfo;
  });
});
