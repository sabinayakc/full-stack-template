import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "test-signing-secret";

const blobServiceMocks = vi.hoisted(() => ({
  upload: vi.fn().mockResolvedValue({ key: "docs/test.pdf" }),
}));

vi.mock("@/services/blob-service", () => ({
  blobService: blobServiceMocks,
}));

vi.mock("@/config/config-service", () => ({
  ConfigService: {
    getInstance: () => ({
      getBetterAuthSecret: () => SECRET,
      getBlobConfig: () => ({ vercelToken: "tok_test" }),
    }),
  },
}));

// Mock getPrivateBlob (Vercel fallback) at the module level
const mockGetPrivateBlob = vi.hoisted(() => vi.fn());

vi.mock("@repo/blob", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/blob")>();
  return {
    ...actual,
    getPrivateBlob: mockGetPrivateBlob,
  };
});

import blobRoutes from "./blobs";

function signUrl(
  action: string,
  key: string,
  contentType: string,
  expiresIn: number,
): { exp: string; sig: string } {
  const exp = String(Math.floor(Date.now() / 1000) + expiresIn);
  const payload = `${action}|${key}|${contentType}|${exp}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return { exp, sig };
}

function buildProxyUrl(action: string, key: string, contentType = "", expiresIn = 3600): string {
  const { exp, sig } = signUrl(action, key, contentType, expiresIn);
  const params = new URLSearchParams({ action, key, exp, sig });
  if (contentType) params.set("ct", contentType);
  return `/proxy?${params.toString()}`;
}

describe("blob routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear R2 binding between tests
    delete (globalThis as any).__cfR2;
  });

  // ── GET /proxy ──────────────────────────────────────────────────────────

  describe("GET /proxy", () => {
    it("returns 400 when query params are missing", async () => {
      const res = await blobRoutes.request("/proxy");
      expect(res.status).toBe(400);
    });

    it("returns 400 when action is not download", async () => {
      const { exp, sig } = signUrl("upload", "test.pdf", "", 3600);
      const res = await blobRoutes.request(
        `/proxy?action=upload&key=test.pdf&exp=${exp}&sig=${sig}`,
      );
      expect(res.status).toBe(400);
    });

    it("returns 403 for an expired signature", async () => {
      const exp = String(Math.floor(Date.now() / 1000) - 60);
      const payload = `download|test.pdf||${exp}`;
      const sig = createHmac("sha256", SECRET).update(payload).digest("hex");

      const res = await blobRoutes.request(
        `/proxy?action=download&key=test.pdf&exp=${exp}&sig=${sig}`,
      );
      expect(res.status).toBe(403);
    });

    it("returns 403 for a tampered signature", async () => {
      const { exp } = signUrl("download", "test.pdf", "", 3600);
      const res = await blobRoutes.request(
        `/proxy?action=download&key=test.pdf&exp=${exp}&sig=${"a".repeat(64)}`,
      );
      expect(res.status).toBe(403);
    });

    it("returns 403 when key is tampered after signing", async () => {
      const url = buildProxyUrl("download", "legit.pdf");
      const tampered = url.replace("legit.pdf", "secret.pdf");
      const res = await blobRoutes.request(tampered);
      expect(res.status).toBe(403);
    });

    // ── R2 path ──

    it("streams R2 object when R2 binding is present", async () => {
      const body = new TextEncoder().encode("%PDF-fake-content");
      const mockR2 = {
        get: vi.fn().mockResolvedValue({
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(body);
              controller.close();
            },
          }),
          httpMetadata: { contentType: "application/pdf" },
        }),
      };
      (globalThis as any).__cfR2 = mockR2;

      const res = await blobRoutes.request(buildProxyUrl("download", "invoices/org/inv/1.pdf"));

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("application/pdf");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(mockR2.get).toHaveBeenCalledWith("invoices/org/inv/1.pdf");

      const buf = await res.arrayBuffer();
      expect(new TextDecoder().decode(buf)).toBe("%PDF-fake-content");
    });

    it("returns 404 when R2 object does not exist", async () => {
      const mockR2 = { get: vi.fn().mockResolvedValue(null) };
      (globalThis as any).__cfR2 = mockR2;

      const res = await blobRoutes.request(buildProxyUrl("download", "missing.pdf"));
      expect(res.status).toBe(404);
    });

    it("defaults Content-Type to application/octet-stream when R2 has no metadata", async () => {
      const mockR2 = {
        get: vi.fn().mockResolvedValue({
          body: new ReadableStream({
            start(c) {
              c.close();
            },
          }),
          httpMetadata: {},
        }),
      };
      (globalThis as any).__cfR2 = mockR2;

      const res = await blobRoutes.request(buildProxyUrl("download", "file.bin"));
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("application/octet-stream");
    });

    // ── Vercel fallback path ──

    it("falls back to Vercel Blob when no R2 binding", async () => {
      const body = new TextEncoder().encode("vercel-blob-data");
      mockGetPrivateBlob.mockResolvedValue({
        statusCode: 200,
        blob: { contentType: "application/pdf", etag: '"abc123"' },
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue(body);
            controller.close();
          },
        }),
      });

      const res = await blobRoutes.request(buildProxyUrl("download", "docs/proposal.pdf"));

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("application/pdf");
      expect(res.headers.get("ETag")).toBe('"abc123"');
      expect(mockGetPrivateBlob).toHaveBeenCalledWith("tok_test", "docs/proposal.pdf");
    });

    it("returns 404 when Vercel blob is not found", async () => {
      mockGetPrivateBlob.mockResolvedValue(null);

      const res = await blobRoutes.request(buildProxyUrl("download", "missing.pdf"));
      expect(res.status).toBe(404);
    });

    it("returns 404 when Vercel blob returns non-200", async () => {
      mockGetPrivateBlob.mockResolvedValue({ statusCode: 404 });

      const res = await blobRoutes.request(buildProxyUrl("download", "missing.pdf"));
      expect(res.status).toBe(404);
    });
  });

  // ── PUT /proxy ──────────────────────────────────────────────────────────

  describe("PUT /proxy", () => {
    it("returns 400 when query params are missing", async () => {
      const res = await blobRoutes.request("/proxy", { method: "PUT" });
      expect(res.status).toBe(400);
    });

    it("returns 400 when action is not upload", async () => {
      const url = buildProxyUrl("download", "test.pdf", "application/pdf");
      const res = await blobRoutes.request(url, { method: "PUT", body: "data" });
      expect(res.status).toBe(400);
    });

    it("returns 403 for tampered upload signature", async () => {
      const { exp } = signUrl("upload", "test.pdf", "application/pdf", 3600);
      const params = new URLSearchParams({
        action: "upload",
        key: "test.pdf",
        exp,
        sig: "b".repeat(64),
        ct: "application/pdf",
      });
      const res = await blobRoutes.request(`/proxy?${params}`, {
        method: "PUT",
        body: "data",
      });
      expect(res.status).toBe(403);
    });

    it("uploads blob and returns key", async () => {
      const url = buildProxyUrl("upload", "docs/new.pdf", "application/pdf");
      const body = new Uint8Array([1, 2, 3, 4]);

      const res = await blobRoutes.request(url, {
        method: "PUT",
        body,
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ key: "docs/new.pdf" });
      expect(blobServiceMocks.upload).toHaveBeenCalledWith(
        "docs/new.pdf",
        expect.any(Uint8Array),
        "application/pdf",
      );
    });
  });
});
