import { getJobHandler, type QueueMessage, setupBindings } from "@repo/workflows";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ConfigService } from "@/config/config-service";
import { registerAllJobHandlers } from "@/jobs/register-handlers";
import { authMiddleware } from "@/middleware/auth";
import authRoutes from "@/routes/auth";
import blobRoutes from "@/routes/blobs";
import healthRoutes from "@/routes/health";
import notificationRoutes from "@/routes/notifications";
import organizationRoutes from "@/routes/organizations";
import smsRoutes from "@/routes/sms";
import wellKnownRoutes from "@/routes/well-known";
import type { Bindings } from "@/types/bindings";
import { ExampleWorkflow } from "@/workflows/example-workflow";
import { requestLogger } from "./middleware/request-logger";

// Root app serves .well-known at the root level (outside /api)
const rootApp = new Hono<{ Bindings: Bindings }>();

// Stash CF bindings on globalThis so packages (db, kv, blob) can access them
// without passing `c.env` through every layer.
rootApp.use(async (c, next) => {
  const g = globalThis as Record<string, unknown>;
  g.HYPERDRIVE = c.env.HYPERDRIVE;
  g.__cfKV = c.env.KV;
  g.__cfR2 = c.env.R2;
  g.__cfEnv = c.env;
  g.__cfWaitUntil = c.executionCtx.waitUntil.bind(c.executionCtx);
  g.__encryptionKey = c.env.ENCRYPTION_KEY;
  await next();
});

rootApp.route("/.well-known", wellKnownRoutes);

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");
const config = ConfigService.getInstance();

// Logging — skip health checks
app.use(async (c, next) => {
  if (c.req.path === "/api/health") return next();
  return logger()(c, next);
});

// CORS
app.use(
  "*",
  cors({
    origin: [config.getClientUrl()],
    maxAge: 600,
    credentials: true,
  }),
);

// Public routes (blobs proxy-upload uses HMAC auth, not session)
app.route("/health", healthRoutes);
app.route("/auth", authRoutes);
app.route("/blobs", blobRoutes);

// Auth middleware for all routes below
app.use(authMiddleware);
if (config.isDev()) {
  app.use(requestLogger);
}

// Protected routes
app.route("/notifications", notificationRoutes);
app.route("/organizations", organizationRoutes);
app.route("/sms", smsRoutes);

// Error handler
app.onError((err, c) => {
  console.error(`[${c.req.method}] ${c.req.path} —`, err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// Mount API app into root app
rootApp.route("/", app);

registerAllJobHandlers();

// ─── Export for Cloudflare Workers ───────────────────────────────────────────
// Exports fetch (Hono), queue (CF Queue consumer), and scheduled (CF Cron).

export default {
  fetch: rootApp.fetch,

  async queue(
    batch: MessageBatch<QueueMessage>,
    env: Bindings,
    _ctx: ExecutionContext,
  ): Promise<void> {
    setupBindings(env);

    for (const message of batch.messages) {
      const handler = getJobHandler(message.body.job);
      if (!handler) {
        console.error(`[queue] No handler for job: ${message.body.job}`);
        message.ack();
        continue;
      }

      try {
        await handler(message.body.payload);
        message.ack();
      } catch (err) {
        console.error(`[queue] Job ${message.body.job} failed:`, err);
        message.retry();
      }
    }
  },

  async scheduled(_event: ScheduledEvent, env: Bindings, _ctx: ExecutionContext): Promise<void> {
    setupBindings(env);
    // Add scheduled work here (cron configured in wrangler.toml [triggers])
  },
};

// CF Workflows must be exported from the entry point
export { app, ExampleWorkflow };
export type AppType = typeof app;
