import type { KVStore } from "../index";

/**
 * Minimal interface matching Cloudflare KVNamespace binding.
 * Avoids a hard dependency on @cloudflare/workers-types in this shared package.
 */
export interface KVNamespaceLike {
  get(key: string, type: "text"): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Cloudflare Workers KV provider.
 * Accepts the KV namespace binding from the Worker env (e.g. `env.KV`).
 *
 * Note: Cloudflare KV is eventually consistent. Writes propagate globally
 * within ~60 seconds. Fine for caching, not for strong consistency.
 */
export function createCloudflareKVStore(kvNamespace: KVNamespaceLike): KVStore {
  return {
    get: (key) => kvNamespace.get(key, "text"),
    set: async (key, value, ttl) => {
      // Cloudflare KV requires expirationTtl >= 60
      const options = ttl ? { expirationTtl: Math.max(ttl, 60) } : undefined;
      await kvNamespace.put(key, value, options);
    },
    delete: async (key) => {
      await kvNamespace.delete(key);
    },
  };
}
