import { createWorkersAI } from "workers-ai-provider";
import type { AIModels, AIProviderConfig } from "../types.js";

export function createCloudflareModels(config: AIProviderConfig): AIModels {
  if (!config.cloudflareBinding) {
    throw new Error("cloudflareBinding is required for Cloudflare AI provider");
  }

  const binding = config.cloudflareBinding();
  const workersai = createWorkersAI({ binding: binding as never });

  return {
    defaultModel: workersai(config.defaultModel),
    fastModel: workersai(config.fastModel),
    imageModel: workersai.image(config.imageModel),
    embeddingModel: workersai.textEmbedding(config.embeddingModel),
  };
}
