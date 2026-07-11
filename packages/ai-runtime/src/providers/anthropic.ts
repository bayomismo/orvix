/**
 * AI Assistant — Anthropic provider (Milestone 1).
 *
 * Thin REST adapter for the Anthropic Messages API. Implements the
 * `ModelProvider` interface so it slots into the same runtime that
 * drives OpenAI, Gemini, etc.
 *
 * Tier → model mapping:
 *   - fast    → claude-3-5-haiku-latest
 *   - medium  → claude-3-5-sonnet-latest
 *   - heavy   → claude-3-opus-latest
 *
 * Auth: `ANTHROPIC_API_KEY` env var.
 */

import type { AiRunModelTier } from "@orvix/schemas";
import type { ModelProvider, ProviderRequest, ProviderResponse } from "./index";

export interface AnthropicProviderOptions {
  apiKey: string;
  models?: Partial<Record<AiRunModelTier, string>>;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

const DEFAULTS: Record<AiRunModelTier, string> = {
  fast: "claude-3-5-haiku-latest",
  medium: "claude-3-5-sonnet-latest",
  heavy: "claude-3-opus-latest",
};

export class AnthropicProvider implements ModelProvider {
  readonly name = "anthropic";
  private readonly models: Record<AiRunModelTier, string>;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: AnthropicProviderOptions) {
    this.apiKey = opts.apiKey;
    this.models = { ...DEFAULTS, ...(opts.models ?? {}) };
    this.baseUrl = opts.baseUrl ?? "https://api.anthropic.com/v1";
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  }

  supports(tier: AiRunModelTier): boolean {
    return Boolean(this.models[tier]);
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const model = this.models[req.modelTier];
    const start = Date.now();
    const res = await this.fetchImpl(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: req.systemPrompt,
        messages: [{ role: "user", content: req.userInput }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic ${res.status}: ${err}`);
    }
    const data = (await res.json()) as {
      content: Array<{ type: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const text =
      data.content.find((c) => c.type === "text")?.text ?? "";
    const inputTokens = data.usage?.input_tokens ?? 0;
    const outputTokens = data.usage?.output_tokens ?? 0;
    return {
      text,
      inputTokens,
      outputTokens,
      costUSD: estimateCost(model, inputTokens, outputTokens),
      latencyMs: Date.now() - start,
    };
  }
}

function estimateCost(model: string, input: number, output: number): number {
  if (model.includes("haiku")) {
    return (input * 0.8 + output * 4) / 1_000_000;
  }
  if (model.includes("sonnet")) {
    return (input * 3 + output * 15) / 1_000_000;
  }
  if (model.includes("opus")) {
    return (input * 15 + output * 75) / 1_000_000;
  }
  return 0;
}
