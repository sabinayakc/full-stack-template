import { sql } from "drizzle-orm";
import { db } from "../client";

const EXTENSIONS = ["vector"] as const;

async function ensureExtensions() {
  try {
    for (const ext of EXTENSIONS) {
      await db.execute(sql.raw(`CREATE EXTENSION IF NOT EXISTS "${ext}"`));
      console.info(`Extension "${ext}" ensured`);
    }
    console.info("All extensions ready");
  } catch (error) {
    console.error("Failed to create extensions:", error);
    process.exit(1);
  }
}

void ensureExtensions().finally(() => process.exit(0));
