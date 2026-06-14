export interface KVStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export { createCloudflareKVStore } from "./providers/cloudflare";
/**
 * Create a KV store from a Redis URL.
 * @deprecated Use createRedisKVStore instead for clarity.
 */
export { createRedisKVStore, createRedisKVStore as createKVStore } from "./providers/redis";
