export type NotificationChannel = "sms" | "email" | "push" | "in_app";

export type NotificationStatus = "pending" | "sent" | "delivered" | "failed" | "read";

export type NotificationType = "general";

export interface NotificationMetadata {
  href?: string;
  source?: string;
  action?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  organizationId: string;
  recipientUserId: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject: string | null;
  body: string;
  metadata: NotificationMetadata | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  failedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
