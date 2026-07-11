/**
 * AI Assistant — Provider registry (Milestone 1).
 *
 * The `ModelProvider` interface is the contract. The `ModelRouter`
 * dispatches to the first provider that supports the requested tier;
 * the runtime calls `router.for(tier)`.
 *
 * Concrete providers in `./`:
 *   - OpenAIProvider       (OPENAI / ORVIX_OPENAI_API_KEY)
 *   - AnthropicProvider    (ANTHROPIC / ORVIX_ANTHROPIC_API_KEY)
 *   - GeminiProvider       (GEMINI / ORVIX_GEMINI_API_KEY)
 *   - OpenRouterProvider   (OPENROUTER / ORVIX_OPENROUTER_API_KEY)
 *   - OllamaProvider       (OLLAMA_BASE_URL / ORVIX_OLLAMA_BASE_URL)
 *
 * The Phase 0 runtime falls back to the deterministic rule-based
 * planner when no providers are registered.
 */

import type { AiRunModelTier } from "@orvix/schemas";

export interface ProviderRequest {
  systemPrompt: string;
  userInput: string;
  modelTier: AiRunModelTier;
  /** Optional JSON-mode output constraints. */
  jsonSchema?: unknown;
}

export interface ProviderResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  latencyMs: number;
}

export interface ModelProvider {
  readonly name: string;
  supports(tier: AiRunModelTier): boolean;
  complete(req: ProviderRequest): Promise<ProviderResponse>;
}

interface ProviderWithMeta {
  name: string;
  supports(tier: AiRunModelTier): boolean;
  complete(req: ProviderRequest): Promise<ProviderResponse>;
}

export class ModelRouter {
  // Internal list, exposed for the factory's reorder.
  readonly providers: ProviderWithMeta[] = [];

  register(p: ModelProvider): void {
    this.providers.push(p);
  }

  for(tier: AiRunModelTier): ModelProvider | undefined {
    return this.providers.find((p) => p.supports(tier));
  }
}

/** Phase 0: returns an empty router; the planner carries the demo. */
export function defaultModelRouter(): ModelRouter {
  return new ModelRouter();
}

export { OpenAIProvider } from "./openai";
export { AnthropicProvider } from "./anthropic";
export { GeminiProvider } from "./gemini";
export { OpenRouterProvider } from "./openrouter";
export { OllamaProvider } from "./ollama";
export { buildModelRouter } from "./factory";
