/**
 * AI Assistant — Google Gemini provider (Milestone 1).
 *
 * REST adapter for `generativelanguage.googleapis.com`. Slots into the
 * same ModelProvider contract as OpenAI / Anthropic.
 *
 * Tier → model mapping:
 *   - fast    → gemini-2.0-flash
 *   - medium  → gemini-2.0-pro
 *   - heavy   → gemini-2.0-ultra
 *
 * Auth: `GEMINI_API_KEY` env var.
 */

import type { AiRunModelTier } from "@orvix/schemas";
import type { ModelProvider, ProviderRequest, ProviderResponse } from "./index";

export interface GeminiProviderOptions {
  apiKey: string;
  models?: Partial<Record<AiRunModelTier, string>>;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

const DEFAULTS: Record<AiRunModelTier, string> = {
  fast: "gemini-2.0-flash",
  medium: "gemini-2.0-pro",
  heavy: "gemini-2.0-ultra",
};

export class GeminiProvider implements ModelProvider {
  readonly name = "gemini";
  private readonly models: Record<AiRunModelTier, string>;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: GeminiProviderOptions) {
    this.apiKey = opts.apiKey;
    this.models = { ...DEFAULTS, ...(opts.models ?? {}) };
    this.baseUrl = opts.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  }

  supports(tier: AiRunModelTier): boolean {
    return Boolean(this.models[tier]);
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const model = this.models[req.modelTier];
    const start = Date.now();
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: req.userInput }] }],
        generationConfig: {
          responseMimeType: req.jsonSchema ? "application/json" : "text/plain",
        },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err}`);
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
      };
    };
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
      "";
    const inputTokens = data.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
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
  if (model.includes("flash")) {
    return (input * 0.075 + output * 0.3) / 1_000_000;
  }
  if (model.includes("pro")) {
    return (input * 1.25 + output * 5) / 1_000_000;
  }
  if (model.includes("ultra")) {
    return (input * 7 + output * 21) / 1_000_000;
  }
  return 0;
}
