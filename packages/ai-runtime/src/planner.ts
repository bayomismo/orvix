/**
 * AI Assistant — Planner (Milestone 1).
 *
 * When a {@link ModelRouter} is provided, the planner dispatches to
 * the matching provider. When no router is present, the deterministic
 * Phase 0 rule-based planner runs. The contract — the returned
 * `PlannerOutput` shape — is identical either way.
 *
 * The runtime (`runtime.ts`) decides whether to use a real provider.
 * Tests and offline mode continue to use the rule-based fallback.
 */

import type { AIRunRequest } from "@orvix/schemas";

import type { ModelRouter } from "./providers";
import { selectModelTier } from "./approver";

export interface PlannerOutput {
  proposedPayload: Record<string, unknown>;
  confidence: number;
  toolCalls: PlannerToolCall[];
  traceId: string;
}

export interface PlannerToolCall {
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export interface PlannerOptions {
  router?: ModelRouter;
}

const SYSTEM_PROMPTS: Record<AIRunRequest["kind"], string> = {
  summary:
    "You are an Orvix AI Assistant. Summarize the work item into a one-paragraph briefing.",
  draft:
    "You are an Orvix AI Assistant. Draft the requested artifact. Stay in the user's voice and tone.",
  briefing:
    "You are an Orvix AI Assistant. Produce a tight 3–5 bullet briefing.",
  inference: "You are an Orvix AI Assistant. Read the signal and infer the relevant Business DNA attribute.",
  action: "You are an Orvix AI Assistant. Propose the next action; mark reversibility + impact + scope.",
  suggestion: "You are an Orvix AI Assistant. Suggest the most relevant next step for the workspace owner.",
};

/**
 * Phase 0 fallback: deterministic, rule-based. Returns a structured
 * proposed payload derived from the request kind. Used in tests and
 * as the offline fallback when no model providers are configured.
 */
function planDeterministic(request: AIRunRequest): PlannerOutput {
  const traceId = cryptoRandom();
  const explicitPayload = request.payload?.["proposedPayload"] as
    | Record<string, unknown>
    | undefined;
  const rawConfidence = request.payload?.["confidence"];
  const explicitConfidence =
    typeof rawConfidence === "number" ? rawConfidence : undefined;

  switch (request.kind) {
    case "summary":
      return {
        proposedPayload: explicitPayload ?? {
          target: { scope: "internal", impact: "low", reversibility: "reversible" },
          text: `Summary for work item ${request.workItemId ?? "(none)"} — Phase 0 placeholder.`,
        },
        confidence: explicitConfidence ?? 90,
        toolCalls: [],
        traceId,
      };
    case "draft":
      return {
        proposedPayload: explicitPayload ?? {
          target: { scope: "internal", impact: "low", reversibility: "reversible" },
          text: `Draft for kind=${request.kind} — Phase 0 placeholder.`,
        },
        confidence: explicitConfidence ?? 85,
        toolCalls: [],
        traceId,
      };
    case "briefing":
      return {
        proposedPayload: explicitPayload ?? {
          target: { scope: "internal", impact: "low", reversibility: "reversible" },
          bullets: ["Phase 0 placeholder bullet — replace with Phase 1 implementation."],
        },
        confidence: explicitConfidence ?? 80,
        toolCalls: [],
        traceId,
      };
    case "inference":
      return {
        proposedPayload: explicitPayload ?? {
          target: { scope: "internal", impact: "low", reversibility: "reversible" },
          proposedDNA: null,
        },
        confidence: explicitConfidence ?? 70,
        toolCalls: [],
        traceId,
      };
    case "action":
    case "suggestion":
    default:
      return {
        proposedPayload: explicitPayload ?? {
          target: { scope: "internal", impact: "low", reversibility: "reversible" },
          kind: request.kind,
        },
        confidence: explicitConfidence ?? 75,
        toolCalls: [],
        traceId,
      };
  }
}

export async function plan(
  request: AIRunRequest,
  options: PlannerOptions = {},
): Promise<PlannerOutput> {
  const { router } = options;
  if (!router) {
    return planDeterministic(request);
  }
  // Pick the tier from the approver so the planner + verifier agree.
  // We use 75 as a placeholder confidence until the model returns.
  const tier = selectModelTier(request.kind, 75);
  const provider = router.for(tier);
  if (!provider) {
    return planDeterministic(request);
  }
  const traceId = cryptoRandom();
  try {
    const res = await provider.complete({
      modelTier: tier,
      systemPrompt: SYSTEM_PROMPTS[request.kind] ?? SYSTEM_PROMPTS.suggestion,
      userInput:
        request.payload?.["prompt"] as string ??
        request.payload?.["text"] as string ??
        JSON.stringify(request.payload ?? {}),
    });
    return {
      proposedPayload: {
        target: { scope: "internal", impact: "low", reversibility: "reversible" },
        text: res.text,
      },
      confidence: 80, // Provider-issued output; calibrated in Phase 1.
      toolCalls: [],
      traceId,
    };
  } catch {
    // Provider failure — fall back to the deterministic planner so
    // the runtime always produces a PlannerOutput.
    return planDeterministic(request);
  }
}

function cryptoRandom(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex
    .slice(8, 10)
    .join("")}-${hex.slice(10, 16).join("")}`;
}
