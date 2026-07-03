import type { AIModel, ModelConfig, ModelType } from "../ai/types";

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "Llama-3-8B-Instruct-v0.1-q4f32_1-MLC",
    name: "Llama 3 (WebLLM)",
    type: "web-llm",
    description: "High performance Llama 3 model running via WebLLM."
  },
  {
    id: "Xenova/phi-1_5",
    name: "Phi 1.5 (Transformers.js)",
    type: "transformers",
    description: "Lightweight Phi 1.5 model running via Transformers.js."
  }
];

class ModelManager {
  private engines: Map<ModelType, AIModel> = new Map();
  private activeEngine: AIModel | null = null;
  private activeModelConfig: ModelConfig | null = null;

  private async getOrInitEngine(type: ModelType): Promise<AIModel> {
    let engine = this.engines.get(type);
    if (!engine) {
      if (type === 'web-llm') {
        const { WebLLMEngine } = await import("../ai/web-llm");
        engine = new WebLLMEngine();
      } else {
        const { TransformersEngine } = await import("../ai/transformers");
        engine = new TransformersEngine();
      }
      this.engines.set(type, engine);
    }
    return engine;
  }

  async loadModel(modelId: string, progressCallback?: (progress: number) => void) {
    const config = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (!config) throw new Error("Model config not found");

    if (this.activeModelConfig?.id === modelId) return;

    const engine = await this.getOrInitEngine(config.type);

    if (this.activeEngine && this.activeEngine !== engine) {
        await this.activeEngine.unload();
    }

    await engine.load(modelId, progressCallback);
    this.activeEngine = engine;
    this.activeModelConfig = config;
  }

  getEngine() {
    return this.activeEngine;
  }

  getActiveModel() {
    return this.activeModelConfig;
  }
}

export const modelManager = new ModelManager();
