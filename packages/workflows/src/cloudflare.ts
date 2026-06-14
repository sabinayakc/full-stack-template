// ─── Cloudflare Bindings Helper ──────────────────────────────────────────────
// Stashes CF bindings on globalThis so downstream packages (db, kv, blob)
// can access them. Must be called in queue() and scheduled() handlers
// since they don't go through Hono middleware.

export interface CloudflareBindings {
  HYPERDRIVE: { connectionString: string };
  KV: KVNamespace;
  R2: unknown;
  ENCRYPTION_KEY?: string;
}

export function setupBindings(env: CloudflareBindings): void {
  const g = globalThis as Record<string, unknown>;
  g.HYPERDRIVE = env.HYPERDRIVE;
  g.__cfKV = env.KV;
  g.__cfR2 = env.R2;
  g.__cfEnv = env;
  if (env.ENCRYPTION_KEY) g.__encryptionKey = env.ENCRYPTION_KEY;
}
