import { relations } from "drizzle-orm";
import { index, jsonb, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { organization, user } from "./auth";
import { defaultTimeStampFields, timestamptz } from "./base";

export const notificationChannelEnum = pgEnum("notification_channel", [
  "sms",
  "email",
  "push",
  "in_app",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "delivered",
  "failed",
  "read",
]);

export const notificationTypeEnum = pgEnum("notification_type", ["general"]);

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    recipientUserId: text("recipient_user_id").references(() => user.id),
    recipientEmail: text("recipient_email"),
    recipientPhone: text("recipient_phone"),
    type: notificationTypeEnum("type").default("general").notNull(),
    channel: notificationChannelEnum("channel").notNull(),
    status: notificationStatusEnum("status").default("pending").notNull(),
    subject: text("subject"),
    body: text("body").notNull(),
    metadata: jsonb("metadata"),
    sentAt: timestamptz("sent_at"),
    deliveredAt: timestamptz("delivered_at"),
    readAt: timestamptz("read_at"),
    failedReason: text("failed_reason"),
    ...defaultTimeStampFields,
  },
  (table) => [
    index("notification_organizationId_idx").on(table.organizationId),
    index("notification_recipientUserId_idx").on(table.recipientUserId),
    index("notification_status_idx").on(table.status),
    index("notification_type_idx").on(table.type),
    index("notification_channel_idx").on(table.channel),
  ],
);

// ─── Push Token Storage ────────────────────────────────────────────────────────

export const pushToken = pgTable(
  "push_token",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    platform: text("platform").notNull(), // "ios" | "android" | "web"
    deviceId: text("device_id"),
    ...defaultTimeStampFields,
  },
  (table) => [
    index("push_token_userId_idx").on(table.userId),
    index("push_token_token_idx").on(table.token),
    index("push_token_deviceId_idx").on(table.deviceId),
  ],
);

export const pushTokenRelations = relations(pushToken, ({ one }) => ({
  user: one(user, {
    fields: [pushToken.userId],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  organization: one(organization, {
    fields: [notification.organizationId],
    references: [organization.id],
  }),
  recipient: one(user, {
    fields: [notification.recipientUserId],
    references: [user.id],
  }),
}));
