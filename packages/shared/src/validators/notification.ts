import { z } from "zod";

const notificationTypeValues = ["general"] as const;

const notificationChannelValues = ["sms", "email", "push", "in_app"] as const;

export const sendNotificationSchema = z.object({
  recipientUserId: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().max(30).optional(),
  type: z.enum(notificationTypeValues).optional(),
  channel: z.enum(notificationChannelValues),
  subject: z.string().max(300).optional(),
  body: z.string().min(1).max(5000),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
