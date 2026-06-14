import { Hono } from "hono";
import type { Session } from "@/auth/server";
import { requirePermission } from "@/middleware/require-permission";
import { blobService } from "@/services/blob-service";
import { getOrgDeletePreflight, getUserDeletePreflight } from "@/services/delete-preflight-service";
import { organizationService } from "@/services/organization-service";

type Env = { Variables: { user: Session["user"]; session: Session["session"] } };

const app = new Hono<Env>();

// PATCH /organizations/:orgId/settings
// Deep-merges partial settings into the existing organization settings column.
app.patch("/:orgId/settings", requirePermission("settings", "update"), async (c) => {
  const orgId = c.req.param("orgId");
  const session = c.get("session");

  // Verify the user belongs to this organization
  if (session?.activeOrganizationId !== orgId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json();
  const result = await organizationService.updateSettings(orgId, body);

  if ("error" in result) {
    const status = result.error === "Organization not found" ? 404 : 400;
    return c.json({ error: result.error }, status);
  }

  return c.json(result);
});

// GET /organizations/:orgId/settings
app.get("/:orgId/settings", async (c) => {
  const orgId = c.req.param("orgId");
  const session = c.get("session");

  if (session?.activeOrganizationId !== orgId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const settings = await organizationService.getSettings(orgId);
  if (!settings) {
    return c.json({ error: "Organization not found" }, 404);
  }

  return c.json({ settings });
});

// GET /organizations/:orgId/delete-preflight
app.get("/:orgId/delete-preflight", async (c) => {
  const orgId = c.req.param("orgId");
  const session = c.get("session");

  if (session?.activeOrganizationId !== orgId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json(await getOrgDeletePreflight(orgId));
});

// GET /organizations/user/delete-preflight
app.get("/user/delete-preflight", async (c) => {
  const user = c.get("user");
  return c.json(await getUserDeletePreflight(user.id));
});

// GET /organizations/:orgId/logo-upload-url
app.get("/:orgId/logo-upload-url", async (c) => {
  const orgId = c.req.param("orgId");
  const key = `organizations/${orgId}/avatar.png`;
  const url = await blobService.getUploadUrl(key, "image/png");
  return c.json({ url, key });
});

// GET /organizations/:orgId/logo-url
app.get("/:orgId/logo-url", async (c) => {
  const orgId = c.req.param("orgId");
  const key = `organizations/${orgId}/avatar.png`;
  try {
    const url = await blobService.getDownloadUrl(key);
    return c.json({ url });
  } catch {
    return c.json({ url: null });
  }
});

// GET /organizations/user/avatar-upload-url
app.get("/user/avatar-upload-url", async (c) => {
  const user = c.get("user");
  const contentType = c.req.query("contentType") ?? "image/jpeg";
  const ext = contentType.split("/")[1] ?? "jpg";
  const key = `users/${user.id}/avatar.${ext}`;
  const url = await blobService.getUploadUrl(key, contentType);
  return c.json({ url, key });
});

// GET /organizations/user/avatar-url
app.get("/user/avatar-url", async (c) => {
  const user = c.get("user");
  const key = user.image;
  if (!key) return c.json({ url: null });
  try {
    const url = await blobService.getDownloadUrl(key);
    return c.json({ url });
  } catch {
    return c.json({ url: null });
  }
});

export default app;
