import { createMiddleware } from "hono/factory";
import type { organizationStatements } from "@/auth/permissions";
import { auth } from "@/auth/server";
import type { AuthVariables } from "./auth";

type Resource = keyof typeof organizationStatements;
type Action = "create" | "read" | "update" | "delete" | "manage";

/**
 * Hono middleware factory that checks if the current user has the required
 * permission for a resource+action in their active organization.
 *
 * Usage in routes:
 *   app.post("/", requirePermission("estimate", "create"), async (c) => { ... })
 *   app.get("/",  requirePermission("customer", "read"),   async (c) => { ... })
 */
export function requirePermission(resource: Resource, action: Action) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const result = await auth.api.hasPermission({
      headers: c.req.raw.headers,
      body: {
        permissions: {
          [resource]: [action],
        },
      },
    });

    if (!result.success) {
      return c.json({ error: `Forbidden: insufficient permission for ${resource}:${action}` }, 403);
    }

    return next();
  });
}
