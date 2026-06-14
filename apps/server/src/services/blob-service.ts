import { type BlobProvider, createBlobService } from "@repo/blob";
import { ConfigService } from "@/config/config-service";

export type { BlobProvider };

let _instance: BlobProvider | undefined;

function getInstance(): BlobProvider {
  if (!_instance) {
    // Prefer R2 binding on Workers
    // biome-ignore lint/suspicious/noExplicitAny: CF binding on globalThis
    const r2Bucket = (globalThis as any).__cfR2;
    if (r2Bucket) {
      const config = ConfigService.getInstance();
      _instance = createBlobService({
        provider: "r2",
        bucket: r2Bucket,
        serverUrl: config.getClientUrl(),
        signingSecret: config.getBetterAuthSecret(),
      });
      return _instance;
    }

    const config = ConfigService.getInstance();
    const blobConfig = config.getBlobConfig();

    if (blobConfig.provider === "vercel") {
      _instance = createBlobService({
        provider: "vercel",
        token: blobConfig.vercelToken,
        serverUrl: config.getBetterAuthUrl(),
        signingSecret: config.getBetterAuthSecret(),
      });
    } else {
      const s3 = config.getS3Config();
      _instance = createBlobService({
        provider: "s3",
        endpoint: s3.endpoint,
        accessKeyId: s3.accessKeyId,
        secretAccessKey: s3.secretAccessKey,
        region: s3.region,
        bucket: s3.bucket,
      });
    }
  }
  return _instance;
}

export const blobService: BlobProvider = {
  upload: (...args) => getInstance().upload(...args),
  getDownloadUrl: (...args) => getInstance().getDownloadUrl(...args),
  getUploadUrl: (...args) => getInstance().getUploadUrl(...args),
  getBuffer: (...args) => getInstance().getBuffer(...args),
  exists: (...args) => getInstance().exists(...args),
  remove: (...args) => getInstance().remove(...args),
};
