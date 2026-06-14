import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDrizzle(connectionString: string) {
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

function getConnectionString(): string {
  // biome-ignore lint/suspicious/noExplicitAny: Hyperdrive global binding
  const hyperdrive = (globalThis as any).HYPERDRIVE;
  if (hyperdrive?.connectionString) {
    return hyperdrive.connectionString;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }
  return url;
}

/**
 * Fresh Drizzle client per access — avoids Workers cross-request I/O errors.
 * Hyperdrive handles connection pooling at the edge.
 */
export const db: ReturnType<typeof createDrizzle> = new Proxy(
  {} as ReturnType<typeof createDrizzle>,
  {
    get(_target, prop, receiver) {
      const fresh = createDrizzle(getConnectionString());
      return Reflect.get(fresh, prop, receiver);
    },
  },
);

export type Database = typeof db;
