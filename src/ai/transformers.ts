import { pipeline, type TextGenerationPipeline } from "@xenova/transformers";
import type { AIModel, ChatMessage, GenerationOptions } from "./types";

export class TransformersEngine implements AIModel {
  private pipe: TextGenerationPipeline | null = null;
  private currentModelId: string | null = null;

  async load(modelId: string, progressCallback?: (progress: number) => void): Promise<void> {
    if (this.currentModelId === modelId && this.pipe) return;

    this.pipe = await pipeline("text-generation", modelId, {
        progress_callback: (report: any) => {
            if (progressCallback && report.status === 'progress') {
                progressCallback(report.progress);
            }
        }
    }) as TextGenerationPipeline;

    this.currentModelId = modelId;
  }

  async generate(messages: ChatMessage[], options?: GenerationOptions): Promise<string> {
    if (!this.pipe) throw new Error("Pipeline not loaded");

    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n') + '\nassistant:';

    const result = await this.pipe(prompt, {
      max_new_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.7
    });

    if (Array.isArray(result)) {
        return (result[0] as any).generated_text.replace(prompt, '').trim();
    }
    return (result as any).generated_text.replace(prompt, '').trim();
  }

  async unload(): Promise<void> {
    this.pipe = null;
    this.currentModelId = null;
  }
}
