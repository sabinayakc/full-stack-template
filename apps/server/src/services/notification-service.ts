/** biome-ignore-all lint/suspicious/noExplicitAny: Test File*/

import { and, desc, eq, lt } from "@repo/db";
import { db } from "@repo/db/client";
import { notification, pushToken, user } from "@repo/db/schema";
import { sendMail } from "@repo/email";
import type {
  NotificationCategory,
  NotificationChannel,
  NotificationMetadata,
  NotificationStatus,
  NotificationType,
  SendNotificationInput,
  UserNotificationPreferences,
} from "@repo/shared";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@repo/shared";
import { getJobQueue } from "@repo/workflows";
import { smsProviderService } from "@/services/sms-provider-service";

const DEFAULT_PAGE_SIZE = 20;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const TYPE_TO_CATEGORY: Record<NotificationType, NotificationCategory> = {
  general: "general",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toHtmlMessage(body: string) {
  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#111827;">${escapeHtml(body).replaceAll("\n", "<br />")}</div>`;
}

export const notificationService = {
  async list(opts: {
    organizationId: string;
    cursor?: string;
    limit?: number;
    channel?: string;
    status?: string;
    type?: string;
    recipientUserId?: string;
  }) {
    const limit = opts.limit ?? DEFAULT_PAGE_SIZE;
    const conditions = [eq(notification.organizationId, opts.organizationId)];

    if (opts.channel)
      conditions.push(eq(notification.channel, opts.channel as NotificationChannel));
    if (opts.status) conditions.push(eq(notification.status, opts.status as NotificationStatus));
    if (opts.type) conditions.push(eq(notification.type, opts.type as NotificationType));
    if (opts.recipientUserId)
      conditions.push(eq(notification.recipientUserId, opts.recipientUserId));

    if (opts.cursor) {
      const [cursorRow] = await db
        .select({ createdAt: notification.createdAt })
        .from(notification)
        .where(eq(notification.id, opts.cursor));
      if (cursorRow) {
        conditions.push(lt(notification.createdAt, cursorRow.createdAt));
      }
    }

    const rows = await db
      .select()
      .from(notification)
      .where(and(...conditions))
      .orderBy(desc(notification.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return { notifications: items, nextCursor };
  },

  async getById(id: string, organizationId: string) {
    const [row] = await db
      .select()
      .from(notification)
      .where(and(eq(notification.id, id), eq(notification.organizationId, organizationId)));
    return row ?? null;
  },

  /**
   * Inserts a notification row then queues delivery via the job queue.
   * in_app notifications are delivered synchronously (no external call needed).
   */
  async send(
    data: SendNotificationInput & { organizationId: string; metadata?: NotificationMetadata },
  ) {
    // Resolve recipient details if userId is provided
    let recipientEmail = data.recipientEmail;
    const recipientPhone = data.recipientPhone;

    if (data.recipientUserId) {
      const [recipient] = await db
        .select({ email: user.email, name: user.name })
        .from(user)
        .where(eq(user.id, data.recipientUserId));

      if (recipient) {
        recipientEmail = recipientEmail ?? recipient.email;
      }
    }

    const [row] = await db
      .insert(notification)
      .values({
        organizationId: data.organizationId,
        recipientUserId: data.recipientUserId,
        recipientEmail,
        recipientPhone,
        type: data.type ?? "general",
        channel: data.channel,
        subject: data.subject,
        body: data.body,
        metadata: data.metadata,
        status: "pending",
      })
      .returning();

    if (data.channel === "in_app") {
      const [updated] = await db
        .update(notification)
        .set({ status: "delivered", deliveredAt: new Date() })
        .where(eq(notification.id, row.id))
        .returning();
      return updated;
    }

    // Queue delivery for external channels
    try {
      await getJobQueue().dispatch("notifications.deliver", {
        notificationId: row.id,
        organizationId: data.organizationId,
      });
    } catch (err) {
      console.error("[notification] Failed to queue delivery, falling back to inline:", err);
      await this.deliver(row.id, data.organizationId);
    }

    return row;
  },

  /**
   * Delivers a pending notification. Called by the queue consumer.
   * Reads the notification row, dispatches via the appropriate channel,
   * and updates status to sent/failed.
   */
  async deliver(notificationId: string, organizationId: string) {
    const row = await this.getById(notificationId, organizationId);
    if (!row) {
      console.error(`[notification.deliver] Notification ${notificationId} not found`);
      return;
    }

    if (row.status !== "pending") return;

    if (row.channel === "email") {
      if (!row.recipientEmail) {
        await db
          .update(notification)
          .set({ status: "failed", failedReason: "Missing email recipient" })
          .where(eq(notification.id, row.id));
      } else {
        await this.dispatchEmail(row.id, row.recipientEmail, row.subject, row.body);
      }
    }

    if (row.channel === "sms") {
      if (!row.recipientPhone) {
        await db
          .update(notification)
          .set({ status: "failed", failedReason: "Missing phone recipient" })
          .where(eq(notification.id, row.id));
      } else {
        await this.dispatchSms(row.id, row.recipientPhone, row.body, row.organizationId);
      }
    }

    if (row.channel === "push") {
      if (!row.recipientUserId) {
        await db
          .update(notification)
          .set({ status: "failed", failedReason: "Missing recipient user for push" })
          .where(eq(notification.id, row.id));
      } else {
        const tokens = await db
          .select({ token: pushToken.token })
          .from(pushToken)
          .where(eq(pushToken.userId, row.recipientUserId));

        if (tokens.length > 0) {
          await this.dispatchPush(
            row.id,
            tokens.map((t) => t.token),
            row.subject,
            row.body,
          );
        } else {
          await db
            .update(notification)
            .set({ status: "failed", failedReason: "No push tokens registered" })
            .where(eq(notification.id, row.id));
        }
      }
    }
  },

  async dispatchEmail(
    notificationId: string,
    to: string,
    subject: string | undefined | null,
    body: string,
  ) {
    try {
      await sendMail({
        to,
        subject: subject ?? "Notification",
        html: toHtmlMessage(body),
      });

      await db
        .update(notification)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(notification.id, notificationId));
    } catch (err) {
      console.error("Email delivery error:", err);
      await db
        .update(notification)
        .set({
          status: "failed",
          failedReason: err instanceof Error ? err.message : "Unknown email error",
        })
        .where(eq(notification.id, notificationId));
    }
  },

  async dispatchSms(notificationId: string, to: string, body: string, organizationId?: string) {
    const resolvedTo = smsProviderService.resolveRecipient(to);

    // Try org-level provider first, fall back to platform provider
    let provider = organizationId ? await smsProviderService.getOrgProvider(organizationId) : null;

    if (!provider && smsProviderService.isConfigured()) {
      provider = smsProviderService.getProvider();
    }

    if (!provider) {
      if ((process.env.ENVIRONMENT || process.env.NODE_ENV) !== "production") {
        console.info(`[sms][dev] to=${resolvedTo} ${body}`);
        await db
          .update(notification)
          .set({ status: "sent", sentAt: new Date() })
          .where(eq(notification.id, notificationId));
        return;
      }

      await db
        .update(notification)
        .set({ status: "failed", failedReason: "SMS transport is not configured" })
        .where(eq(notification.id, notificationId));
      return;
    }

    try {
      const result = await provider.sendSms({ to: resolvedTo, body });

      await db
        .update(notification)
        .set({
          status: result.status === "failed" ? "failed" : "sent",
          sentAt: result.status === "failed" ? undefined : new Date(),
          failedReason: result.status === "failed" ? "Provider returned failed status" : undefined,
          metadata: { externalMessageId: result.externalMessageId },
        })
        .where(eq(notification.id, notificationId));
    } catch (err) {
      console.error("SMS delivery error:", err);
      await db
        .update(notification)
        .set({
          status: "failed",
          failedReason: err instanceof Error ? err.message : "Unknown SMS error",
        })
        .where(eq(notification.id, notificationId));
    }
  },

  async dispatchPush(
    notificationId: string,
    tokens: string[],
    title: string | undefined | null,
    body: string,
  ) {
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default" as const,
      title: title ?? "Notification",
      body,
      data: { notificationId },
    }));

    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages),
      });

      if (res.ok) {
        await db
          .update(notification)
          .set({ status: "sent", sentAt: new Date() })
          .where(eq(notification.id, notificationId));
      } else {
        const errorText = await res.text();
        console.error("Expo push error:", errorText);
        await db
          .update(notification)
          .set({ status: "failed", failedReason: `Expo push: ${res.status}` })
          .where(eq(notification.id, notificationId));
      }
    } catch (err) {
      console.error("Push delivery error:", err);
      await db
        .update(notification)
        .set({
          status: "failed",
          failedReason: err instanceof Error ? err.message : "Unknown push error",
        })
        .where(eq(notification.id, notificationId));
    }
  },

  async markAsRead(id: string, organizationId: string) {
    const [row] = await db
      .update(notification)
      .set({ status: "read", readAt: new Date() })
      .where(and(eq(notification.id, id), eq(notification.organizationId, organizationId)))
      .returning();
    return row ?? null;
  },

  async getUnreadCount(userId: string, organizationId: string) {
    const rows = await db
      .select({ id: notification.id })
      .from(notification)
      .where(
        and(
          eq(notification.organizationId, organizationId),
          eq(notification.recipientUserId, userId),
          eq(notification.status, "delivered"),
        ),
      );
    return rows.length;
  },

  async getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences> {
    const [row] = await db
      .select({ metadata: user.metadata })
      .from(user)
      .where(eq(user.id, userId));

    const metadata = row?.metadata as Record<string, unknown> | null;
    const prefs = metadata?.notificationPreferences as
      | Partial<UserNotificationPreferences>
      | undefined;
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...prefs,
      categories: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.categories,
        ...(prefs?.categories ?? {}),
      },
    };
  },

  /**
   * Sends notifications to a user across their preferred channels.
   * Respects category subscriptions — if the user unsubscribed from
   * the category that maps to this notification type, skip entirely.
   * Creates tracked notification rows for all channels (queued delivery).
   */
  async sendToUser(opts: {
    organizationId: string;
    recipientUserId: string;
    type?: NotificationType;
    subject: string;
    body: string;
    metadata?: NotificationMetadata;
  }) {
    const prefs = await this.getUserNotificationPreferences(opts.recipientUserId);
    const resolvedType = opts.type ?? "general";

    // Check category subscription
    const category = TYPE_TO_CATEGORY[resolvedType];
    if (prefs.categories[category] === false) {
      return null;
    }

    // Always create an in-app notification (shows in notification list)
    const saved = await this.send({
      organizationId: opts.organizationId,
      recipientUserId: opts.recipientUserId,
      channel: "in_app",
      type: resolvedType,
      subject: opts.subject,
      body: opts.body,
      metadata: opts.metadata,
    });

    // Push — tracked, queued delivery
    if (prefs.push) {
      await this.send({
        organizationId: opts.organizationId,
        recipientUserId: opts.recipientUserId,
        channel: "push",
        type: resolvedType,
        subject: opts.subject,
        body: opts.body,
      });
    }

    // Email — tracked, queued delivery
    if (prefs.email) {
      const [recipient] = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, opts.recipientUserId));

      if (recipient?.email) {
        await this.send({
          organizationId: opts.organizationId,
          recipientUserId: opts.recipientUserId,
          recipientEmail: recipient.email,
          channel: "email",
          type: resolvedType,
          subject: opts.subject,
          body: opts.body,
        });
      }
    }

    // SMS — tracked, queued delivery
    if (prefs.sms) {
      const [recipient] = await db
        .select({ metadata: user.metadata })
        .from(user)
        .where(eq(user.id, opts.recipientUserId));

      const phone = (recipient?.metadata as Record<string, unknown> | null)?.profileContact as
        | { displayPhone?: string }
        | undefined;

      if (phone?.displayPhone) {
        await this.send({
          organizationId: opts.organizationId,
          recipientUserId: opts.recipientUserId,
          recipientPhone: phone.displayPhone,
          channel: "sms",
          type: resolvedType,
          subject: opts.subject,
          body: opts.body,
        });
      }
    }

    return saved;
  },

  // ─── Mark All Read ────────────────────────────────────────────────────────────

  async markAllAsRead(userId: string, organizationId: string) {
    const result = await db
      .update(notification)
      .set({ status: "read", readAt: new Date() })
      .where(
        and(
          eq(notification.organizationId, organizationId),
          eq(notification.recipientUserId, userId),
          eq(notification.channel, "in_app"),
          eq(notification.status, "delivered"),
        ),
      )
      .returning({ id: notification.id });
    return result.length;
  },

  // ─── Push Token Management ──────────────────────────────────────────────────

  async registerPushToken(userId: string, token: string, platform: string, deviceId?: string) {
    return db.transaction(async (tx) => {
      // Prefer matching by deviceId (same device, possibly rotated token)
      // Fall back to matching by token (same token, no deviceId yet)
      const existing = deviceId
        ? await tx
            .select({ id: pushToken.id })
            .from(pushToken)
            .where(and(eq(pushToken.userId, userId), eq(pushToken.deviceId, deviceId)))
        : await tx
            .select({ id: pushToken.id })
            .from(pushToken)
            .where(and(eq(pushToken.userId, userId), eq(pushToken.token, token)));

      if (existing.length > 0) {
        const [row] = await tx
          .update(pushToken)
          .set({ token, platform, deviceId, updatedAt: new Date() })
          .where(eq(pushToken.id, existing[0].id))
          .returning();
        return row;
      }

      const [row] = await tx
        .insert(pushToken)
        .values({ userId, token, platform, deviceId })
        .returning();
      return row;
    });
  },

  async removePushToken(userId: string, token: string) {
    await db.delete(pushToken).where(and(eq(pushToken.userId, userId), eq(pushToken.token, token)));
  },
};
