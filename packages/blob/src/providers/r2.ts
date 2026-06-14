import { createHmac } from "node:crypto";
import type { BlobProvider, R2BlobConfig } from "../types";

function buildSignedProxyUrl(
  config: R2BlobConfig,
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

/**
 * Cloudflare R2 provider using the native Workers R2Bucket binding.
 * Uses HMAC-signed proxy URLs for downloads/uploads, matching the Vercel Blob pattern.
 */
export function createR2Provider(config: R2BlobConfig): BlobProvider {
  const { bucket, publicUrlPrefix } = config;

  return {
    async upload(key, body, contentType) {
      await bucket.put(key, body, {
        httpMetadata: { contentType },
      });
      return { key };
    },

    async getDownloadUrl(key, expiresIn = 3600) {
      if (publicUrlPrefix) {
        return `${publicUrlPrefix}/${key}`;
      }
      return buildSignedProxyUrl(config, "download", key, expiresIn);
    },

    async getBuffer(key) {
      const obj = await bucket.get(key);
      if (!obj?.body) throw new Error(`Empty body for key: ${key}`);
      const reader = obj.body.getReader();
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
      const head = await bucket.head(key);
      return head !== null;
    },

    async remove(key) {
      await bucket.delete(key);
    },
  };
}
