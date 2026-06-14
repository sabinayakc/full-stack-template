export interface BlobProvider {
  upload(key: string, body: Buffer | Uint8Array, contentType: string): Promise<{ key: string }>;
  getDownloadUrl(key: string, expiresIn?: number): Promise<string>;
  getUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
  getBuffer(key: string): Promise<ArrayBuffer>;
  exists(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}

export type BlobProviderId = "vercel" | "s3" | "r2";

export interface S3BlobConfig {
  provider: "s3";
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

export interface VercelBlobConfig {
  provider: "vercel";
  token: string;
  /** Base URL of the server, used to build proxy URLs for upload/download */
  serverUrl: string;
  /** Secret used for HMAC-signing proxy URLs */
  signingSecret: string;
}

/**
 * Minimal interface matching Cloudflare R2Bucket binding.
 * Avoids a hard dependency on @cloudflare/workers-types in this shared package.
 */
export interface R2BucketLike {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  get(
    key: string,
  ): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
  head(key: string): Promise<unknown | null>;
  delete(key: string | string[]): Promise<void>;
}

export interface R2BlobConfig {
  provider: "r2";
  /** R2Bucket binding from the Worker env (e.g. env.R2) */
  bucket: R2BucketLike;
  /** Public URL prefix for download URLs (e.g. https://cdn.example.com) */
  publicUrlPrefix?: string;
  /** Base URL of the server, used to build signed proxy URLs */
  serverUrl: string;
  /** Secret used for HMAC-signing proxy URLs */
  signingSecret: string;
}

export type BlobConfig = S3BlobConfig | VercelBlobConfig | R2BlobConfig;
