/**
 * AI Assistant — OpenAI provider (Milestone 1).
 *
 * Thin REST adapter for the OpenAI Chat Completions API. Returns the
 * `ProviderResponse` shape that the runtime and verifier consume.
 *
 * Tier → model mapping:
 *   - fast    → gpt-4o-mini
 *   - medium  → gpt-4o
 *   - heavy   → o1-preview
 *
 * Auth: `OPENAI_API_KEY` env var.
 */

import type { AiRunModelTier } from "@orvix/schemas";
import type { ModelProvider, ProviderRequest, ProviderResponse } from "./index";

export interface OpenAIProviderOptions {
  apiKey: string;
  /** Override the model mapping per tier. */
  models?: Partial<Record<AiRunModelTier, string>>;
  /** Override the OpenAI base URL (for Azure / openrouter gateways). */
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

const DEFAULTS: Record<AiRunModelTier, string> = {
  fast: "gpt-4o-mini",
  medium: "gpt-4o",
  heavy: "o1-preview",
};

export class OpenAIProvider implements ModelProvider {
  readonly name = "openai";
  private readonly models: Record<AiRunModelTier, string>;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: OpenAIProviderOptions) {
    this.apiKey = opts.apiKey;
    this.models = { ...DEFAULTS, ...(opts.models ?? {}) };
    this.baseUrl = opts.baseUrl ?? "https://api.openai.com/v1";
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  }

  supports(tier: AiRunModelTier): boolean {
    return Boolean(this.models[tier]);
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const model = this.models[req.modelTier];
    const start = Date.now();
    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: req.systemPrompt },
        { role: "user", content: req.userInput },
      ],
    };
    if (req.jsonSchema) {
      body["response_format"] = { type: "json_object" };
    }
    const res = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI ${res.status}: ${err}`);
    }
    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const text = data.choices[0]?.message.content ?? "";
    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    const costUSD = estimateOpenAICost(model, inputTokens, outputTokens);
    return {
      text,
      inputTokens,
      outputTokens,
      costUSD,
      latencyMs: Date.now() - start,
    };
  }
}

function estimateOpenAICost(model: string, input: number, output: number): number {
  // Phase 0 placeholder rates — the runtime doesn't gate on these.
  // Phase 1 will read pricing from a per-model config table.
  if (model.includes("gpt-4o-mini")) {
    return (input * 0.15 + output * 0.6) / 1_000_000;
  }
  if (model.includes("gpt-4o")) {
    return (input * 5 + output * 15) / 1_000_000;
  }
  if (model.includes("o1")) {
    return (input * 15 + output * 60) / 1_000_000;
  }
  return 0;
}
