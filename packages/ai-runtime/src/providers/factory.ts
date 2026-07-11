/**
 * AI Assistant — Provider factory (Milestone 1).
 *
 * Reads env vars and registers the providers that have credentials
 * present. The factory returns a {@link ModelRouter} with zero or
 * more providers. The runtime picks the first provider that supports
 * the requested tier; falls back to the rule-based planner if none.
 *
 * Env vars:
 *   - `ORVIX_AI_DEFAULT_PROVIDER` — the name of the provider to
 *     prefer (e.g. `openai`, `anthropic`, `gemini`, `openrouter`,
 *     `ollama`). Defaults to the first registered.
 *   - `ORVIX_OPENAI_API_KEY`         — OpenAI
 *   - `ORVIX_ANTHROPIC_API_KEY`      — Anthropic
 *   - `ORVIX_GEMINI_API_KEY`         — Google Gemini
 *   - `ORVIX_OPENROUTER_API_KEY`     — OpenRouter
 *   - `ORVIX_OLLAMA_BASE_URL`         — Ollama (defaults to
 *     http://127.0.0.1:11434 if unset)
 */

import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { OpenRouterProvider } from "./openrouter";
import { OllamaProvider } from "./ollama";
import { ModelRouter } from "./index";

export interface ProviderFactoryOptions {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  openrouterApiKey?: string;
  ollamaBaseUrl?: string;
  ollamaApiKey?: string;
  preferredProvider?: string;
  /** Override the fetch implementation. Per-provider overrides take a
   * `Partial<Record<ProviderName, typeof fetch>>` so tests can stub
   * one provider at a time. */
  fetchImpl?: Partial<Record<"openai" | "anthropic" | "gemini" | "openrouter" | "ollama", typeof fetch>>;
}

export function buildModelRouter(opts: ProviderFactoryOptions = {}): ModelRouter {
  const router = new ModelRouter();

  const openai = opts.openaiApiKey ?? process.env["ORVIX_OPENAI_API_KEY"];
  if (openai) {
    const providerOpts: { apiKey: string; fetchImpl?: typeof fetch } = {
      apiKey: openai,
    };
    if (opts.fetchImpl?.openai) providerOpts.fetchImpl = opts.fetchImpl.openai;
    router.register(new OpenAIProvider(providerOpts));
  }

  const anthropic = opts.anthropicApiKey ?? process.env["ORVIX_ANTHROPIC_API_KEY"];
  if (anthropic) {
    const providerOpts: { apiKey: string; fetchImpl?: typeof fetch } = {
      apiKey: anthropic,
    };
    if (opts.fetchImpl?.anthropic) providerOpts.fetchImpl = opts.fetchImpl.anthropic;
    router.register(new AnthropicProvider(providerOpts));
  }

  const gemini = opts.geminiApiKey ?? process.env["ORVIX_GEMINI_API_KEY"];
  if (gemini) {
    const providerOpts: { apiKey: string; fetchImpl?: typeof fetch } = {
      apiKey: gemini,
    };
    if (opts.fetchImpl?.gemini) providerOpts.fetchImpl = opts.fetchImpl.gemini;
    router.register(new GeminiProvider(providerOpts));
  }

  const openrouter = opts.openrouterApiKey ?? process.env["ORVIX_OPENROUTER_API_KEY"];
  if (openrouter) {
    const providerOpts: { apiKey: string; fetchImpl?: typeof fetch } = {
      apiKey: openrouter,
    };
    if (opts.fetchImpl?.openrouter) providerOpts.fetchImpl = opts.fetchImpl.openrouter;
    router.register(new OpenRouterProvider(providerOpts));
  }

  const ollamaBase = opts.ollamaBaseUrl ?? process.env["ORVIX_OLLAMA_BASE_URL"];
  if (ollamaBase) {
    const providerOpts: {
      apiKey?: string;
      baseUrl: string;
      fetchImpl?: typeof fetch;
    } = { baseUrl: ollamaBase };
    if (opts.ollamaApiKey) providerOpts.apiKey = opts.ollamaApiKey;
    if (opts.fetchImpl?.ollama) providerOpts.fetchImpl = opts.fetchImpl.ollama;
    router.register(new OllamaProvider(providerOpts));
  }

  // Reorder so the preferred provider is first.
  const preferred = opts.preferredProvider ?? process.env["ORVIX_AI_DEFAULT_PROVIDER"];
  if (preferred) {
    // The router keeps a flat list. Sort by preferred name.
    type Provider = { name: string };
    const providers = (router as unknown as { providers: Provider[] }).providers;
    providers.sort((a, b) => {
      if (a.name === preferred) return -1;
      if (b.name === preferred) return 1;
      return 0;
    });
  }

  return router;
}
