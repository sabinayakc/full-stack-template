import * as Crypto from "expo-crypto";
import { secureStorage } from "@/lib/storage";

const DEVICE_ID_KEY = "app_device_id";

let cached: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;

  const stored = await secureStorage.getItemAsync(DEVICE_ID_KEY);
  if (stored) {
    cached = stored;
    return stored;
  }

  const id = Crypto.randomUUID();
  await secureStorage.setItemAsync(DEVICE_ID_KEY, id);
  cached = id;
  return id;
}
