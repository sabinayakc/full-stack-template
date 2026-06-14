import { createMiddleware } from "hono/factory";

const IGNORED_PATHS = ["/api/health", "/api/notifications"];

export const requestLogger = createMiddleware(async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  if (IGNORED_PATHS.some((ignoredPath) => path.startsWith(ignoredPath))) {
    return next();
  }

  let body: unknown = null;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await c.req.json().catch(() => null);
      if (body) {
        c.req.bodyCache.json = body;
      }
    } catch {
      body = null;
    }
  }

  console.info(`[${new Date().toISOString()}] Incoming Request:`, {
    method,
    path,
    headers: Object.fromEntries(c.req.raw.headers.entries()),
    body,
  });

  await next();

  const duration = Date.now() - start;
  console.info(`[${new Date().toISOString()}] Request Completed:`, {
    method,
    path,
    status: c.res.status,
    duration: `${duration}ms`,
  });
});
