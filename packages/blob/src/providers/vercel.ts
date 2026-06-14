import { createHmac, timingSafeEqual } from "node:crypto";
import { del, get, put } from "@vercel/blob";
import type { BlobProvider, VercelBlobConfig } from "../types";

function buildSignedProxyUrl(
  config: VercelBlobConfig,
  action: "upload" | "download",
  key: string,
  expiresIn: number,
  contentType?: string,
): string {
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const payload = `${action}|${key}|${contentType ?? ""}|${exp}`;
  const sig = createHmac("sha256", config.signingSecret).update(payload).digest("hex");

  const params = new URLSearchParams({ action, key, exp: String(exp), sig });
  if (contentType) params.set("ct", contentType);
  return `${config.serverUrl}/api/blobs/proxy?${params.toString()}`;
}

export function createVercelProvider(config: VercelBlobConfig): BlobProvider {
  return {
    async upload(key, body, contentType) {
      const buf = body instanceof Buffer ? body : Buffer.from(body);
      await put(key, buf, {
        access: "private",
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
        token: config.token,
      });
      return { key };
    },

    async getDownloadUrl(key, expiresIn = 3600) {
      return buildSignedProxyUrl(config, "download", key, expiresIn);
    },

    async getBuffer(key) {
      const result = await get(key, { access: "private", token: config.token });
      if (!result?.stream) throw new Error(`Empty body for key: ${key}`);
      const reader = result.stream.getReader();
      const chunks: Uint8Array[] = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const total = chunks.reduce((sum, c) => sum + c.byteLength, 0);
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return merged.buffer as ArrayBuffer;
    },

    async getUploadUrl(key, contentType, expiresIn = 3600) {
      return buildSignedProxyUrl(config, "upload", key, expiresIn, contentType);
    },

    async exists(key) {
      try {
        const result = await get(key, { access: "private", token: config.token });
        if (result?.stream) result.stream.cancel();
        return result?.statusCode === 200;
      } catch {
        return false;
      }
    },

    async remove(key) {
      await del(key, { token: config.token });
    },
  };
}

/**
 * Fetch a private blob and return its stream + metadata.
 * Used by the proxy route to serve downloads.
 */
export async function getPrivateBlob(token: string, key: string) {
  return get(key, { access: "private", token });
}

/**
 * Verify the HMAC signature on a proxy URL.
 * Returns true if the signature is valid and the URL hasn't expired.
 */
export function verifyProxySignature(
  signingSecret: string,
  action: string,
  key: string,
  contentType: string,
  exp: string,
  sig: string,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (now > Number(exp)) return false;

  const payload = `${action}|${key}|${contentType}|${exp}`;
  const expected = createHmac("sha256", signingSecret).update(payload).digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
