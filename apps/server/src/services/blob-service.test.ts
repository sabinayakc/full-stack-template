import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpload = vi.hoisted(() => vi.fn().mockResolvedValue({ key: "test-key" }));
const mockGetDownloadUrl = vi.hoisted(() =>
  vi.fn().mockResolvedValue("https://blob.example.com/signed"),
);
const mockGetUploadUrl = vi.hoisted(() =>
  vi.fn().mockResolvedValue("https://blob.example.com/upload-signed"),
);
const mockGetBuffer = vi.hoisted(() => vi.fn().mockResolvedValue(new ArrayBuffer(4)));
const mockRemove = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@/config/config-service", () => ({
  ConfigService: {
    getInstance: () => ({
      getBlobConfig: () => ({
        provider: "s3",
        vercelToken: "",
      }),
      getS3Config: () => ({
        endpoint: "http://localhost:4566",
        accessKeyId: "test",
        secretAccessKey: "test",
        region: "us-east-1",
        bucket: "test-bucket",
      }),
      getBetterAuthUrl: () => "http://localhost:4000",
      getBetterAuthSecret: () => "test-secret",
    }),
  },
}));

vi.mock("@repo/blob", () => ({
  createBlobService: () => ({
    upload: mockUpload,
    getDownloadUrl: mockGetDownloadUrl,
    getUploadUrl: mockGetUploadUrl,
    getBuffer: mockGetBuffer,
    remove: mockRemove,
  }),
}));

import { blobService } from "./blob-service";

describe("blobService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("upload", () => {
    it("delegates to the blob provider", async () => {
      mockUpload.mockResolvedValue({ key: "docs/test.pdf" });
      const body = Buffer.from("hello");
      const result = await blobService.upload("docs/test.pdf", body, "application/pdf");

      expect(result).toEqual({ key: "docs/test.pdf" });
      expect(mockUpload).toHaveBeenCalledWith("docs/test.pdf", body, "application/pdf");
    });
  });

  describe("getDownloadUrl", () => {
    it("returns a download URL from the provider", async () => {
      const url = await blobService.getDownloadUrl("docs/test.pdf");

      expect(url).toBe("https://blob.example.com/signed");
      expect(mockGetDownloadUrl).toHaveBeenCalledWith("docs/test.pdf");
    });

    it("passes custom expiresIn", async () => {
      await blobService.getDownloadUrl("docs/test.pdf", 600);

      expect(mockGetDownloadUrl).toHaveBeenCalledWith("docs/test.pdf", 600);
    });
  });

  describe("getUploadUrl", () => {
    it("returns an upload URL from the provider", async () => {
      const url = await blobService.getUploadUrl("docs/upload.pdf", "application/pdf");

      expect(url).toBe("https://blob.example.com/upload-signed");
      expect(mockGetUploadUrl).toHaveBeenCalledWith("docs/upload.pdf", "application/pdf");
    });
  });

  describe("getBuffer", () => {
    it("returns an ArrayBuffer from the provider", async () => {
      const expected = new ArrayBuffer(8);
      mockGetBuffer.mockResolvedValue(expected);

      const result = await blobService.getBuffer("diagrams/layout.png");

      expect(result).toBe(expected);
      expect(mockGetBuffer).toHaveBeenCalledWith("diagrams/layout.png");
    });
  });

  describe("remove", () => {
    it("delegates removal to the provider", async () => {
      await blobService.remove("docs/test.pdf");

      expect(mockRemove).toHaveBeenCalledWith("docs/test.pdf");
    });
  });
});
