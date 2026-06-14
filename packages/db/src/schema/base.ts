import { customType, timestamp } from "drizzle-orm/pg-core";
import { decrypt, encrypt, parseKey } from "../crypto";

/** Timezone-aware timestamp — always use this instead of bare `timestamp()` */
export const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const defaultTimeStampFields = {
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  updatedAt: timestamptz("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

function getEncryptionKey(): Buffer {
  const hex = (globalThis as Record<string, unknown>).__encryptionKey as string | undefined;
  if (!hex) {
    throw new Error(
      "Encryption key not available. Ensure ENCRYPTION_KEY is set and middleware has run.",
    );
  }
  return parseKey(hex);
}

export const encryptedJsonb = customType<{
  data: Record<string, unknown>;
  driverData: string;
}>({
  dataType() {
    return "text";
  },
  toDriver(value: Record<string, unknown>): string {
    const key = getEncryptionKey();
    return encrypt(JSON.stringify(value), key);
  },
  fromDriver(value: string): Record<string, unknown> {
    if (!value) return {};
    const key = getEncryptionKey();
    return JSON.parse(decrypt(value, key));
  },
});
