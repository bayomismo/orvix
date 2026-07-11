/**
 * AI Assistant — Runtime (v0.2).
 *
 * Orchestrates the planner → verifier → approver sequence for a single
 * AI run. Streams the result back to the caller.
 *
 * Phase 0 provides the orchestration; the model providers, tool
 * implementations, and persistence to AIRun/AIAssistantConfig rows come
 * in Phase 1.
 */

import type {
  AIRunRequest,
  VerifierResult,
  ConfidenceLabel,
} from "@orvix/schemas";
import { labelConfidence } from "@orvix/schemas";

import { plan, type PlannerOutput } from "./planner";
import { runVerifier, classifyAction } from "./verifier";
import { approve, type ApproverOutput } from "./approver";
import type { ModelRouter } from "./providers";

export interface RunInput {
  request: AIRunRequest;
  /**
   * Optional {@link ModelRouter} used by the planner. When omitted,
   * the deterministic Phase 0 planner runs.
   */
  router?: ModelRouter;
  /** Optional budget / autonomy state from the workspace. */
  costMeter?: {
    usedUSD: number;
    capUSD: number;
    autonomyLevel: "suggest_only" | "suggest_and_act_low_risk";
  };
  /** Optional callbacks so the orchestrator can persist state. */
  callbacks?: {
    onPlannerStart?: () => Promise<void> | void;
    onPlannerDone?: (out: PlannerOutput) => Promise<void> | void;
    onVerifierDone?: (verifier: VerifierResult) => Promise<void> | void;
    onApprover?: (decision: ApproverOutput) => Promise<void> | void;
  };
}

export interface RunResult {
  /** Outcome for the caller. */
  decision: ApproverOutput["decision"];
  /** Verifier verdict + confidence (always present). */
  verifier: VerifierResult;
  /** Confidence label we surface to the user. */
  confidenceLabel: ConfidenceLabel;
  /** Planner's self-reported confidence. */
  plannerConfidence: number;
  /** Rationale (auditable). */
  rationale: string;
  /** Sanitized proposed payload (returned for the queue/inspector). */
  proposedPayload: Record<string, unknown>;
  /** Trace identifier. */
  traceId: string;
}

/**
 * The single entry point used by both `apps/web` (via Server Actions)
 * and `apps/ai` (via gRPC). The runtime is pure: it takes a request
 * and returns a disposition; persistence is the caller's job.
 */
export async function run(input: RunInput): Promise<RunResult> {
  const { request, router, costMeter, callbacks } = input;

  // 1. Plan.
  await callbacks?.onPlannerStart?.();
  const plannerOutput = await plan(request, { ...(router ? { router } : {}) });
  await callbacks?.onPlannerDone?.(plannerOutput);

  // 2. Verifier (action class derived from planner output).
  const actionClass = classifyAction(request, plannerOutput.proposedPayload);
  const verifierOutput = await runVerifier({
    request,
    proposedPayload: plannerOutput.proposedPayload,
    actionClass,
  });
  const verifier: VerifierResult = {
    verdict: verifierOutput.verdict,
    confidence: verifierOutput.confidence,
    ...(verifierOutput.rationale !== undefined ? { rationale: verifierOutput.rationale } : {}),
  };
  await callbacks?.onVerifierDone?.(verifier);

  // 3. Approver.
  const decision = approve({
    request,
    plannerConfidence: plannerOutput.confidence,
    verifier,
    ...(costMeter !== undefined && { costMeter }),
  });
  await callbacks?.onApprover?.(decision);

  // 4. Surface the labeled confidence — never raw 0..1 in the UI.
  const confidenceLabel = labelConfidence(
    plannerOutput.confidence,
    verifier.verdict,
    verifier.confidence,
  );

  return {
    decision: decision.decision,
    verifier,
    confidenceLabel,
    plannerConfidence: plannerOutput.confidence,
    rationale: decision.rationale,
    proposedPayload: plannerOutput.proposedPayload,
    traceId: plannerOutput.traceId,
  };
}
