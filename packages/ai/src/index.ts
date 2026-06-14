import { createBedrockModels } from "./providers/bedrock.js";
import { createCloudflareModels } from "./providers/cloudflare.js";
import type { AIModels, AIProviderConfig } from "./types.js";

export type { AIModels, AIProviderConfig, AIProviderId } from "./types.js";

export function createAIModels(config: AIProviderConfig): AIModels {
  switch (config.provider) {
    case "cloudflare":
      return createCloudflareModels(config);
    case "bedrock":
      return createBedrockModels(config);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}
