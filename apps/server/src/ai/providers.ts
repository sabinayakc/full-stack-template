import type { AIModels } from "@repo/ai";
import { createAIModels } from "@repo/ai";
import { ConfigService } from "@/config/config-service";

let _models: AIModels | null = null;

function getModels(): AIModels {
  if (!_models) {
    const config = ConfigService.getInstance();
    _models = createAIModels({
      provider: config.getAIProvider(),
      defaultModel: config.getAIDefaultModel(),
      fastModel: config.getAIFastModel(),
      imageModel: config.getAIImageModel(),
      embeddingModel: config.getAIEmbeddingModel(),
      bedrockRegion: config.getBedrockRegion(),
      cloudflareBinding: () =>
        (globalThis as Record<string, unknown>).__cfEnv &&
        ((globalThis as Record<string, unknown>).__cfEnv as Record<string, unknown>).AI,
    });
  }
  return _models;
}

export function getDefaultModel() {
  return getModels().defaultModel;
}

export function getFastModel() {
  return getModels().fastModel;
}

export function getImageModel() {
  return getModels().imageModel;
}

export function getEmbeddingModel() {
  return getModels().embeddingModel;
}
