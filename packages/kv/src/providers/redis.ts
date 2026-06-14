import Redis from "ioredis";
import type { KVStore } from "../index";

export function createRedisKVStore(redisUrl: string): KVStore {
  const redis = new Redis(redisUrl);

  return {
    get: (key) => redis.get(key),
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, "EX", ttl);
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  };
}
