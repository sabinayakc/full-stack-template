import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createApp } from "@/helpers/hono";
import { smsProviderService } from "@/services/sms-provider-service";

const app = createApp("sms");

app.get("/provider/config", async (c) => {
  return c.json({
    provider: smsProviderService.getProviderInfo(),
    configured: smsProviderService.isConfigured(),
  });
});

// ─── SMS Account (Sub-Account) ──────────────────────────────────────────────

app.get("/account/status", async (c) => {
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;
  if (!organizationId) return c.json({ error: "No active organization" }, 400);

  const account = await smsProviderService.getSmsAccount(organizationId);
  if (!account) return c.json({ account: null });

  const synced = await smsProviderService.syncAccountStatus(organizationId);
  return c.json({ account: synced });
});

const activateSchema = z.object({
  fromNumber: z.string().min(1).optional(),
  messagingServiceSid: z.string().min(1).optional(),
});

app.post("/account/activate", zValidator("json", activateSchema), async (c) => {
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;
  if (!organizationId) return c.json({ error: "No active organization" }, 400);

  const body = c.req.valid("json");

  if (!body.fromNumber && !body.messagingServiceSid) {
    return c.json({ error: "Either fromNumber or messagingServiceSid is required" }, 400);
  }

  const account = await smsProviderService.activateAccount(
    organizationId,
    body.fromNumber,
    body.messagingServiceSid,
  );

  if (!account) return c.json({ error: "No SMS account found — run onboarding first" }, 404);

  return c.json({ account });
});

export default app;
