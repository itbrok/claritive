export type ModelType = 'web-llm' | 'transformers';

export interface ModelConfig {
  id: string;
  name: string;
  type: ModelType;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  onUpdate?: (chunk: string) => void;
}

export interface AIModel {
  generate(messages: ChatMessage[], options?: GenerationOptions): Promise<string>;
  load(modelId: string, progressCallback?: (progress: number) => void): Promise<void>;
  unload(): Promise<void>;
}
