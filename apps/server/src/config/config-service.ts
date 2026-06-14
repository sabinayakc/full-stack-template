import type { AIProviderId } from "@repo/ai";
import type { BlobProviderId } from "@repo/blob";
import type { SmsProviderConfig, SmsProviderId } from "@repo/providers";
import { getSystemPrompt } from "../ai/prompts/system";

export interface EnvConfig {
  DATABASE_URL: string;
  SERVER_PORT: number;
  CLIENT_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  AI_SUMMARY_THRESHOLD: number;
  BLOB_PROVIDER: BlobProviderId;
  BLOB_READ_WRITE_TOKEN: string;
  AWS_ENDPOINT: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  S3_ENDPOINT: string;
  S3_BUCKET: string;
  AWS_BEDROCK_REGION: string;
  REDIS_URL: string;
  IS_DEV: boolean;
  AI_PROVIDER: AIProviderId;
  AI_DEFAULT_MODEL: string;
  AI_FAST_MODEL: string;
  AI_IMAGE_MODEL: string;
  AI_EMBEDDING_MODEL: string;
  AI_SYSTEM_PROMPT: string;
  CRON_SECRET: string;
  APPLE_TEAM_ID: string;
  APP_BUNDLE_ID: string;
  ENCRYPTION_KEY: string;
  SMS_PROVIDER: SmsProviderId;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_NUMBER?: string;
  TWILIO_MESSAGING_SERVICE_SID?: string;
  TWILIO_SANDBOX_MODE: boolean;
  TWILIO_SANDBOX_NUMBER?: string;
  SMTP_SANDBOX_MODE: boolean;
  SMTP_SANDBOX_EMAIL?: string;
}

export class ConfigService {
  private static instance: ConfigService;
  private config: EnvConfig;

  private constructor() {
    this.config = this.loadEnvConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadEnvConfig(): EnvConfig {
    // DATABASE_URL may be absent on Workers (provided by Hyperdrive binding instead)
    const databaseUrl = process.env.DATABASE_URL ?? "";

    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl) {
      throw new Error("CLIENT_URL environment variable is not set.");
    }

    return {
      DATABASE_URL: databaseUrl,
      SERVER_PORT: parseInt(process.env.SERVER_PORT || "4000", 10),
      CLIENT_URL: clientUrl,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "change-me-to-a-random-secret",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
      BLOB_PROVIDER: (process.env.BLOB_PROVIDER as BlobProviderId | undefined) ?? "vercel",
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || "",
      AWS_ENDPOINT: process.env.AWS_ENDPOINT || "http://localhost:4566",
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "test",
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "test",
      AWS_REGION: process.env.AWS_REGION || "us-east-1",
      S3_ENDPOINT: process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT || "http://localhost:4566",
      S3_BUCKET: process.env.S3_BUCKET || "app-uploads",
      REDIS_URL: process.env.REDIS_URL || "",
      AWS_BEDROCK_REGION: process.env.AWS_BEDROCK_REGION || "us-east-1",
      IS_DEV: (process.env.ENVIRONMENT || process.env.NODE_ENV) !== "production",
      AI_PROVIDER: (process.env.AI_PROVIDER as AIProviderId | undefined) ?? "bedrock",
      AI_DEFAULT_MODEL: process.env.AI_DEFAULT_MODEL || "us.anthropic.claude-opus-4-6-v1",
      AI_FAST_MODEL: process.env.AI_FAST_MODEL || "us.anthropic.claude-haiku-4-5-20251001-v1",
      AI_SYSTEM_PROMPT: process.env.AI_SYSTEM_PROMPT || getSystemPrompt(),
      AI_IMAGE_MODEL: process.env.AI_IMAGE_MODEL || "amazon.nova-canvas-v1:0",
      AI_EMBEDDING_MODEL: process.env.AI_EMBEDDING_MODEL || "cohere.embed-english-v3",
      AI_SUMMARY_THRESHOLD: parseInt(process.env.AI_SUMMARY_THRESHOLD || "100000", 10),
      CRON_SECRET: process.env.CRON_SECRET || "",
      APPLE_TEAM_ID: process.env.APPLE_TEAM_ID || "",
      APP_BUNDLE_ID: process.env.APP_BUNDLE_ID || "com.example.app",
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "",
      SMS_PROVIDER: (process.env.SMS_PROVIDER as SmsProviderId | undefined) ?? "none",
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
      TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID,
      TWILIO_SANDBOX_MODE: process.env.TWILIO_SANDBOX_MODE === "1",
      TWILIO_SANDBOX_NUMBER: process.env.TWILIO_SANDBOX_NUMBER,
      SMTP_SANDBOX_MODE: process.env.SMTP_SANDBOX_MODE === "1",
      SMTP_SANDBOX_EMAIL: process.env.SMTP_SANDBOX_EMAIL,
    };
  }

  public getConfig(): EnvConfig {
    return this.config;
  }

  public getDatabaseUrl(): string {
    return this.config.DATABASE_URL;
  }

  public getPort(): number {
    return this.config.SERVER_PORT;
  }

  public getClientUrl(): string {
    return this.config.CLIENT_URL;
  }

  public getBetterAuthSecret(): string {
    return this.config.BETTER_AUTH_SECRET;
  }

  public getBetterAuthUrl(): string {
    return this.config.BETTER_AUTH_URL;
  }

  public getBlobConfig() {
    return {
      provider: this.config.BLOB_PROVIDER,
      vercelToken: this.config.BLOB_READ_WRITE_TOKEN,
    };
  }

  public getS3Config() {
    return {
      endpoint: this.config.S3_ENDPOINT,
      accessKeyId: this.config.AWS_ACCESS_KEY_ID,
      secretAccessKey: this.config.AWS_SECRET_ACCESS_KEY,
      region: this.config.AWS_REGION,
      bucket: this.config.S3_BUCKET,
    };
  }

  public getRedisUrl(): string {
    return this.config.REDIS_URL;
  }

  public getAIProvider(): AIProviderId {
    return this.config.AI_PROVIDER;
  }

  public getBedrockRegion(): string {
    return this.config.AWS_BEDROCK_REGION;
  }

  public isDev(): boolean {
    return this.config.IS_DEV;
  }

  public getAIDefaultModel(): string {
    return this.config.AI_DEFAULT_MODEL;
  }

  public getAIFastModel(): string {
    return this.config.AI_FAST_MODEL;
  }

  public getAIImageModel(): string {
    return this.config.AI_IMAGE_MODEL;
  }

  public getAIEmbeddingModel(): string {
    return this.config.AI_EMBEDDING_MODEL;
  }

  public getAISummaryThreshold(): number {
    return this.config.AI_SUMMARY_THRESHOLD;
  }

  public getAISystemPrompt(): string {
    return this.config.AI_SYSTEM_PROMPT;
  }

  public getCronSecret(): string {
    return this.config.CRON_SECRET;
  }

  public getAppleTeamId(): string {
    return this.config.APPLE_TEAM_ID;
  }

  public getAppBundleId(): string {
    return this.config.APP_BUNDLE_ID;
  }

  public getEncryptionKey(): string {
    return this.config.ENCRYPTION_KEY;
  }

  public getSmsProviderConfig(): SmsProviderConfig {
    return {
      provider: this.config.SMS_PROVIDER,
      accountSid: this.config.TWILIO_ACCOUNT_SID,
      authToken: this.config.TWILIO_AUTH_TOKEN,
      fromNumber: this.config.TWILIO_FROM_NUMBER,
      messagingServiceSid: this.config.TWILIO_MESSAGING_SERVICE_SID,
    };
  }

  public isTwilioSandboxMode(): boolean {
    return this.config.TWILIO_SANDBOX_MODE;
  }

  public getTwilioSandboxNumber(): string | undefined {
    return this.config.TWILIO_SANDBOX_NUMBER;
  }

  public isSmtpSandboxMode(): boolean {
    return this.config.SMTP_SANDBOX_MODE;
  }

  public getSmtpSandboxEmail(): string | undefined {
    return this.config.SMTP_SANDBOX_EMAIL;
  }
}
