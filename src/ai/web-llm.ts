import * as webLLM from "@mlc-ai/web-llm";
import type { AIModel, ChatMessage, GenerationOptions } from "./types";

export class WebLLMEngine implements AIModel {
  private engine: webLLM.MLCEngineInterface | null = null;
  private currentModelId: string | null = null;

  async load(modelId: string, progressCallback?: (progress: number) => void): Promise<void> {
    if (this.currentModelId === modelId && this.engine) return;

    this.engine = await webLLM.CreateMLCEngine(modelId, {
      initProgressCallback: (report) => {
        if (progressCallback) {
          progressCallback(report.progress * 100);
        }
      },
    });
    this.currentModelId = modelId;
  }

  async generate(messages: ChatMessage[], options?: GenerationOptions): Promise<string> {
    if (!this.engine) throw new Error("Engine not loaded");

    const completion = await this.engine.chat.completions.create({
      messages: messages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      stream: !!options?.onUpdate,
    });

    if (options?.onUpdate && 'on' in (completion as any)) {
      let fullText = "";
      for await (const chunk of completion as any) {
        const delta = chunk.choices[0]?.delta?.content || "";
        fullText += delta;
        options.onUpdate(delta);
      }
      return fullText;
    } else {
      const result = completion as webLLM.ChatCompletion;
      return result.choices[0].message.content || "";
    }
  }

  async unload(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      this.currentModelId = null;
    }
  }
}
