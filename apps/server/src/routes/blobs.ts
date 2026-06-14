import { verifyProxySignature } from "@repo/blob";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { ConfigService } from "@/config/config-service";
import { blobService } from "@/services/blob-service";

const app = new Hono();

/**
 * Unified signed-proxy endpoint for blob storage (Vercel Blob + R2).
 * Both uploads (PUT) and downloads (GET) are HMAC-signed by the blob
 * service's getUploadUrl / getDownloadUrl methods.
 */

app.get("/proxy", async (c) => {
  const key = c.req.query("key");
  const exp = c.req.query("exp");
  const sig = c.req.query("sig");
  const action = c.req.query("action");

  if (!key || !exp || !sig || action !== "download") {
    return c.json({ error: "Missing or invalid query parameters" }, 400);
  }

  const config = ConfigService.getInstance();
  if (!verifyProxySignature(config.getBetterAuthSecret(), action, key, "", exp, sig)) {
    return c.json({ error: "Invalid or expired signature" }, 403);
  }

  // Resolve from whichever provider is active (R2 binding or Vercel Blob)
  // biome-ignore lint/suspicious/noExplicitAny: CF binding on globalThis
  const r2Bucket = (globalThis as any).__cfR2;
  if (r2Bucket) {
    const object = await r2Bucket.get(key);
    if (!object) {
      return c.json({ error: "Blob not found" }, 404);
    }

    c.header("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
    c.header("X-Content-Type-Options", "nosniff");
    c.header("Cache-Control", "private, max-age=300, must-revalidate");

    return stream(c, async (s) => {
      const reader = object.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await s.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    });
  }

  // Fallback: Vercel Blob
  const { getPrivateBlob } = await import("@repo/blob");
  const token = config.getBlobConfig().vercelToken;
  const result = await getPrivateBlob(token, key);

  if (!result || result.statusCode !== 200) {
    return c.json({ error: "Blob not found" }, 404);
  }

  c.header("Content-Type", result.blob.contentType);
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Cache-Control", "private, max-age=300, must-revalidate");
  c.header("ETag", result.blob.etag);

  return stream(c, async (s) => {
    const reader = result.stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await s.write(value);
      }
    } finally {
      reader.releaseLock();
    }
  });
});

app.put("/proxy", async (c) => {
  const key = c.req.query("key");
  const contentType = c.req.query("ct");
  const exp = c.req.query("exp");
  const sig = c.req.query("sig");
  const action = c.req.query("action");

  if (!key || !contentType || !exp || !sig || action !== "upload") {
    return c.json({ error: "Missing or invalid query parameters" }, 400);
  }

  const secret = ConfigService.getInstance().getBetterAuthSecret();
  if (!verifyProxySignature(secret, action, key, contentType, exp, sig)) {
    return c.json({ error: "Invalid or expired signature" }, 403);
  }

  const body = await c.req.arrayBuffer();
  await blobService.upload(key, new Uint8Array(body), contentType);

  return c.json({ key }, 200);
});

export default app;
