import { registerJobHandler } from "@repo/workflows";
import { notificationService } from "@/services/notification-service";

export function registerAllJobHandlers(): void {
  registerJobHandler("notifications.deliver", async (payload) => {
    await notificationService.deliver(payload.notificationId, payload.organizationId);
  });
}
