import type { EmbeddingModel, ImageModel, LanguageModel } from "ai";

export type AIProviderId = "bedrock" | "cloudflare";

export interface AIProviderConfig {
  provider: AIProviderId;

  defaultModel: string;
  fastModel: string;
  imageModel: string;
  embeddingModel: string;

  // Bedrock-specific
  bedrockRegion?: string;

  // Cloudflare-specific — binding is resolved lazily at request time
  cloudflareBinding?: () => unknown;
}

export interface AIModels {
  defaultModel: LanguageModel;
  fastModel: LanguageModel;
  imageModel: ImageModel;
  embeddingModel: EmbeddingModel;
}
