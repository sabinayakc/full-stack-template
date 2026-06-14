import { zValidator } from "@hono/zod-validator";
import { sendNotificationSchema } from "@repo/shared";
import { createApp } from "@/helpers/hono";
import { notificationService } from "@/services/notification-service";

const app = createApp("notifications");

app.get("/", async (c) => {
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;
  if (!organizationId) return c.json({ error: "No active organization" }, 400);

  const cursor = c.req.query("cursor");
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!, 10) : undefined;
  const channel = c.req.query("channel");
  const status = c.req.query("status");
  const type = c.req.query("type");

  const result = await notificationService.list({
    organizationId,
    cursor,
    limit,
    channel,
    status,
    type,
  });
  return c.json(result);
});

app.get("/unread-count", async (c) => {
  const user = c.get("user")!;
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;
  if (!organizationId) return c.json({ error: "No active organization" }, 400);

  const count = await notificationService.getUnreadCount(user.id, organizationId);
  return c.json({ count });
});

app.get("/mine", async (c) => {
  const user = c.get("user")!;
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;
  if (!organizationId) return c.json({ error: "No active organization" }, 400);

  const cursor = c.req.query("cursor");
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!, 10) : undefined;
  const type = c.req.query("type");

  const result = await notificationService.list({
    organizationId,
    cursor,
    limit,
    recipientUserId: user.id,
    channel: "in_app",
    type,
  });
  return c.json(result);
});

app.put("/mine/read-all", async (c) => {
  const user = c.get("user")!;
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;
  if (!organizationId) return c.json({ error: "No active organization" }, 400);

  const count = await notificationService.markAllAsRead(user.id, organizationId);
  return c.json({ count });
});

app.get("/:id", async (c) => {
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;
  const id = c.req.param("id");
  if (!organizationId) return c.json({ error: "No active organization" }, 400);

  const notification = await notificationService.getById(id, organizationId);
  if (!notification) return c.json({ error: "Notification not found" }, 404);
  return c.json({ notification });
});

app.post("/", zValidator("json", sendNotificationSchema), async (c) => {
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;
  const body = c.req.valid("json");
  if (!organizationId) return c.json({ error: "No active organization" }, 400);

  const notification = await notificationService.send({
    ...body,
    organizationId,
  });
  return c.json({ notification }, 201);
});

// ─── Push Token Registration ─────────────────────────────────────────────────

app.post("/push-token", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json<{ token: string; platform: string; deviceId?: string }>();

  if (!body.token || !body.platform) {
    return c.json({ error: "token and platform are required" }, 400);
  }

  const pushToken = await notificationService.registerPushToken(
    user.id,
    body.token,
    body.platform,
    body.deviceId,
  );
  return c.json({ pushToken }, 201);
});

app.delete("/push-token", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json<{ token: string }>();

  if (!body.token) {
    return c.json({ error: "token is required" }, 400);
  }

  await notificationService.removePushToken(user.id, body.token);
  return c.json({ success: true });
});

app.put("/:id/read", async (c) => {
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;
  const id = c.req.param("id");
  if (!organizationId) return c.json({ error: "No active organization" }, 400);

  const notification = await notificationService.markAsRead(id, organizationId);
  if (!notification) return c.json({ error: "Notification not found" }, 404);
  return c.json({ notification });
});

export default app;
