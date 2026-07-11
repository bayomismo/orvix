/**
 * Provider tests.
 *
 * Each provider is verified against a fetch mock that records the
 * request and returns a synthetic OpenAI-compatible / Anthropic /
 * Gemini response. No network calls.
 */

import { describe, it, expect } from "vitest";

import { OpenAIProvider } from "../openai";
import { AnthropicProvider } from "../anthropic";
import { GeminiProvider } from "../gemini";
import { OpenRouterProvider } from "../openrouter";
import { OllamaProvider } from "../ollama";
import { buildModelRouter } from "../factory";

function mockFetch(responses: Array<{ status: number; body: string }>) {
  let i = 0;
  const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
  const fn = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: typeof url === "string" ? url : url.toString(), init });
    const r = responses[i++] ?? { status: 200, body: "" };
    return new Response(r.body, { status: r.status });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

describe("OpenAIProvider", () => {
  it("sends a chat completion request", async () => {
    const { fn, calls } = mockFetch([
      {
        status: 200,
        body: JSON.stringify({
          choices: [{ message: { content: "hello" } }],
          usage: { prompt_tokens: 4, completion_tokens: 7 },
        }),
      },
    ]);
    const p = new OpenAIProvider({ apiKey: "sk-test", fetchImpl: fn });
    const r = await p.complete({
      modelTier: "fast",
      systemPrompt: "you are orvix",
      userInput: "hi",
    });
    expect(r.text).toBe("hello");
    expect(r.inputTokens).toBe(4);
    expect(r.outputTokens).toBe(7);
    expect(calls[0]?.init?.method).toBe("POST");
    expect((calls[0]?.init?.headers as Record<string, string>)?.Authorization).toBe(
      "Bearer sk-test",
    );
  });

  it("throws on 4xx/5xx with body", async () => {
    const { fn } = mockFetch([{ status: 401, body: "Unauthorized" }]);
    const p = new OpenAIProvider({ apiKey: "sk-test", fetchImpl: fn });
    await expect(
      p.complete({ modelTier: "fast", systemPrompt: "s", userInput: "u" }),
    ).rejects.toThrow(/OpenAI 401/);
  });
});

describe("AnthropicProvider", () => {
  it("calls the Messages endpoint with x-api-key", async () => {
    const { fn, calls } = mockFetch([
      {
        status: 200,
        body: JSON.stringify({
          content: [{ type: "text", text: "world" }],
          usage: { input_tokens: 5, output_tokens: 3 },
        }),
      },
    ]);
    const p = new AnthropicProvider({ apiKey: "sk-ant", fetchImpl: fn });
    const r = await p.complete({
      modelTier: "medium",
      systemPrompt: "you are orvix",
      userInput: "hi",
    });
    expect(r.text).toBe("world");
    expect(calls[0]?.url).toContain("/v1/messages");
    expect((calls[0]?.init?.headers as Record<string, string>)?.["x-api-key"]).toBe(
      "sk-ant",
    );
  });
});

describe("GeminiProvider", () => {
  it("calls the generateContent endpoint with ?key=", async () => {
    const { fn, calls } = mockFetch([
      {
        status: 200,
        body: JSON.stringify({
          candidates: [
            { content: { parts: [{ text: "gemini says hi" }] } },
          ],
          usageMetadata: { promptTokenCount: 11, candidatesTokenCount: 9 },
        }),
      },
    ]);
    const p = new GeminiProvider({ apiKey: "gk", fetchImpl: fn });
    const r = await p.complete({
      modelTier: "fast",
      systemPrompt: "s",
      userInput: "u",
    });
    expect(r.text).toBe("gemini says hi");
    expect(calls[0]?.url).toContain(":generateContent?key=gk");
  });
});

describe("OpenRouterProvider", () => {
  it("includes the HTTP-Referer header", async () => {
    const { fn, calls } = mockFetch([
      {
        status: 200,
        body: JSON.stringify({
          choices: [{ message: { content: "via openrouter" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1 },
        }),
      },
    ]);
    const p = new OpenRouterProvider({ apiKey: "ork", fetchImpl: fn });
    const r = await p.complete({
      modelTier: "fast",
      systemPrompt: "s",
      userInput: "u",
    });
    expect(r.text).toBe("via openrouter");
    const h = calls[0]?.init?.headers as Record<string, string>;
    expect(h["HTTP-Referer"]).toBe("https://orvix.com");
    expect(h["X-Title"]).toBe("Orvix");
  });
});

describe("OllamaProvider", () => {
  it("hits /v1/chat/completions", async () => {
    const { fn, calls } = mockFetch([
      {
        status: 200,
        body: JSON.stringify({
          choices: [{ message: { content: "local" } }],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        }),
      },
    ]);
    const p = new OllamaProvider({ baseUrl: "http://localhost:11434", fetchImpl: fn });
    const r = await p.complete({
      modelTier: "fast",
      systemPrompt: "s",
      userInput: "u",
    });
    expect(r.text).toBe("local");
    expect(calls[0]?.url).toContain("/v1/chat/completions");
  });

  it("sends bearer token when apiKey is provided", async () => {
    const { fn, calls } = mockFetch([
      {
        status: 200,
        body: JSON.stringify({
          choices: [{ message: { content: "x" } }],
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        }),
      },
    ]);
    const p = new OllamaProvider({
      baseUrl: "http://localhost:11434",
      apiKey: "secret",
      fetchImpl: fn,
    });
    await p.complete({ modelTier: "fast", systemPrompt: "s", userInput: "u" });
    const h = calls[0]?.init?.headers as Record<string, string>;
    expect(h.Authorization).toBe("Bearer secret");
  });
});

describe("buildModelRouter", () => {
  it("registers only the providers with credentials", async () => {
    const { fn } = mockFetch([
      { status: 200, body: '{"choices":[{"message":{"content":"ok"}}]}' },
    ]);
    const router = buildModelRouter({
      openaiApiKey: "sk-test",
      openrouterApiKey: "or-test",
      ollamaBaseUrl: "http://localhost:11434",
      fetchImpl: { openai: fn, openrouter: fn, ollama: fn } as never,
    });
    // We don't expose providers directly; check via for().
    expect(router.for("fast")?.name).toMatch(/openai|openrouter|ollama/);
  });
});
