import type { R2BucketLike } from "@repo/blob";
import type { QueueMessage } from "@repo/workflows";

/**
 * Cloudflare Workers bindings available via `c.env` in Hono handlers.
 * String vars/secrets come from wrangler.toml [vars] and `wrangler secret`.
 * Object bindings (KV, R2, HYPERDRIVE, ASSETS) are native CF resources.
 */
export interface SendEmailBinding {
  send(message: {
    to: string | string[];
    from: string;
    subject: string;
    html?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    reply_to?: string;
  }): Promise<{ messageId: string }>;
}

export interface Bindings {
  // ── Object bindings ──────────────────────────────────────────────────
  AI: unknown;
  KV: KVNamespace;
  R2: R2BucketLike;
  HYPERDRIVE: { connectionString: string };
  ASSETS: Fetcher;
  EMAIL: SendEmailBinding;

  // ── Queue & Workflow bindings ────────────────────────────────────────
  JOB_QUEUE: Queue<QueueMessage>;
  REMINDER_WORKFLOW: Workflow;
  ONBOARDING_WORKFLOW: Workflow;
  RAG_WORKFLOW: Workflow;
  INTEGRATION_MIGRATION_WORKFLOW: Workflow;

  // ── Vars (from wrangler.toml [vars]) ─────────────────────────────────
  ENVIRONMENT: string;

  // ── Secrets (from `wrangler secret put`) ─────────────────────────────
  CLIENT_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DATABASE_URL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_BEDROCK_REGION?: string;
  GOOGLE_MAPS_API_KEY?: string;
  CRON_SECRET?: string;
  ENCRYPTION_KEY?: string;
}
