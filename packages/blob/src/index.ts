export { createR2Provider } from "./providers/r2";
export { createS3Provider } from "./providers/s3";
export { createVercelProvider, getPrivateBlob, verifyProxySignature } from "./providers/vercel";
export type {
  BlobConfig,
  BlobProvider,
  BlobProviderId,
  R2BlobConfig,
  R2BucketLike,
  S3BlobConfig,
  VercelBlobConfig,
} from "./types";

import { createR2Provider } from "./providers/r2";
import { createS3Provider } from "./providers/s3";
import { createVercelProvider } from "./providers/vercel";
import type { BlobConfig, BlobProvider } from "./types";

export function createBlobService(config: BlobConfig): BlobProvider {
  switch (config.provider) {
    case "vercel":
      return createVercelProvider(config);
    case "s3":
      return createS3Provider(config);
    case "r2":
      return createR2Provider(config);
  }
}
