import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import type { AIModels, AIProviderConfig } from "../types.js";

export function createBedrockModels(config: AIProviderConfig): AIModels {
  const bedrock = createAmazonBedrock({
    region: config.bedrockRegion ?? "us-east-1",
  });

  return {
    defaultModel: bedrock(config.defaultModel),
    fastModel: bedrock(config.fastModel),
    imageModel: bedrock.image(config.imageModel),
    embeddingModel: bedrock.embeddingModel(config.embeddingModel),
  };
}
