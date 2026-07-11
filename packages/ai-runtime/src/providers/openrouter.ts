/**
 * AI Assistant — OpenRouter provider (Milestone 1).
 *
 * OpenRouter is an OpenAI-compatible gateway that fronts hundreds of
 * models from many providers. The implementation is identical to
 * OpenAI's REST shape, with the base URL pointed at openrouter.ai
 * and an `HTTP-Referer` header set (OpenRouter attribution).
 *
 * Tier → default model mapping:
 *   - fast    → openai/gpt-4o-mini
 *   - medium  → anthropic/claude-3.5-sonnet
 *   - heavy   → anthropic/claude-3-opus
 *
 * Auth: `OPENROUTER_API_KEY` env var.
 */

import type { AiRunModelTier } from "@orvix/schemas";
import type { ModelProvider, ProviderRequest, ProviderResponse } from "./index";

export interface OpenRouterProviderOptions {
  apiKey: string;
  models?: Partial<Record<AiRunModelTier, string>>;
  /** OpenRouter attribution — required by their ToS. */
  appName?: string;
  appUrl?: string;
  fetchImpl?: typeof fetch;
}

const DEFAULTS: Record<AiRunModelTier, string> = {
  fast: "openai/gpt-4o-mini",
  medium: "anthropic/claude-3.5-sonnet",
  heavy: "anthropic/claude-3-opus",
};

export class OpenRouterProvider implements ModelProvider {
  readonly name = "openrouter";
  private readonly models: Record<AiRunModelTier, string>;
  private readonly apiKey: string;
  private readonly appName: string;
  private readonly appUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: OpenRouterProviderOptions) {
    this.apiKey = opts.apiKey;
    this.models = { ...DEFAULTS, ...(opts.models ?? {}) };
    this.appName = opts.appName ?? "Orvix";
    this.appUrl = opts.appUrl ?? "https://orvix.com";
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  }

  supports(tier: AiRunModelTier): boolean {
    return Boolean(this.models[tier]);
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const model = this.models[req.modelTier];
    const start = Date.now();
    const res = await this.fetchImpl("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": this.appUrl,
        "X-Title": this.appName,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: req.systemPrompt },
          { role: "user", content: req.userInput },
        ],
        ...(req.jsonSchema ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${err}`);
    }
    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number };
    };
    const text = data.choices[0]?.message.content ?? "";
    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    return {
      text,
      inputTokens,
      outputTokens,
      costUSD: data.usage?.cost ?? 0,
      latencyMs: Date.now() - start,
    };
  }
}
