/**
 * AI Assistant — Ollama provider (Milestone 1).
 *
 * Local on-device / on-network model server. The Ollama REST API is
 * a subset of OpenAI's, so we reuse the same request shape.
 *
 * Tier → default model mapping:
 *   - fast    → llama3.2:3b
 *   - medium  → llama3.1:8b
 *   - heavy   → qwen2.5:32b
 *
 * Auth: none (Ollama is local by default). For remote Ollama behind
 * a proxy, set `ORVIX_OLLAMA_API_KEY` and `headers`.
 */

import type { AiRunModelTier } from "@orvix/schemas";
import type { ModelProvider, ProviderRequest, ProviderResponse } from "./index";

export interface OllamaProviderOptions {
  /** Base URL of the Ollama server. Defaults to http://127.0.0.1:11434. */
  baseUrl?: string;
  models?: Partial<Record<AiRunModelTier, string>>;
  /** Optional bearer token (for proxied deployments). */
  apiKey?: string;
  fetchImpl?: typeof fetch;
}

const DEFAULTS: Record<AiRunModelTier, string> = {
  fast: "llama3.2:3b",
  medium: "llama3.1:8b",
  heavy: "qwen2.5:32b",
};

export class OllamaProvider implements ModelProvider {
  readonly name = "ollama";
  private readonly models: Record<AiRunModelTier, string>;
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: OllamaProviderOptions) {
    this.models = { ...DEFAULTS, ...(opts.models ?? {}) };
    this.baseUrl = opts.baseUrl ?? "http://127.0.0.1:11434";
    if (opts.apiKey !== undefined) this.apiKey = opts.apiKey;
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  }

  supports(tier: AiRunModelTier): boolean {
    return Boolean(this.models[tier]);
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const model = this.models[req.modelTier];
    const start = Date.now();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    const res = await this.fetchImpl(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: req.systemPrompt },
          { role: "user", content: req.userInput },
        ],
        stream: false,
        ...(req.jsonSchema ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama ${res.status}: ${err}`);
    }
    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const text = data.choices[0]?.message.content ?? "";
    return {
      text,
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
      costUSD: 0,
      latencyMs: Date.now() - start,
    };
  }
}
