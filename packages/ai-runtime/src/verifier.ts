/**
 * AI Assistant — Verifier (v0.2).
 *
 * The verifier is the second-signal gate on every AI Assistant action.
 * An independent, smaller model classifies the planner's proposed action
 * against the rules of the relevant routing profile and returns one of
 *   - agree
 *   - disagree
 *   - uncertain
 *
 * `approvePlanForExecution(...)` is the single decision point the
 * Approver uses. Calling it returns whether the planner's action may
 * auto-execute, must queue for human approval, or must be blocked.
 *
 * v0.2 specifics:
 *   - Verifier always runs for any non-zero-impact action.
 *   - Disagreement forces queueing regardless of planner confidence.
 *   - The verifier model runs against a fast model tier (cost).
 *   - Calibration monitoring (a Phase 1 dashboard) relies on
 *     AIRun.verifierResult being persisted on every run.
 */

import type {
  VerifierVerdict,
  AIRunRequest,
} from "@orvix/schemas";

/** Inputs the verifier sees. We pass a minimal, structurally-typed shape
 * so the verifier stays decoupled from rich Prisma types. */
export interface VerifierInput {
  request: AIRunRequest;
  /** The planner's proposed outcome. */
  proposedPayload: Record<string, unknown>;
  /** The action class — drives which rules apply. */
  actionClass: ActionClass;
  /** Optional, opaque context from the planner's tool sequence. */
  context?: Record<string, unknown>;
}

export type ActionClass =
  /** Reversible, internal, low-impact. */
  | "low_risk_internal"
  /** Reversible, external (e.g., email-in to non-tenant user). */
  | "low_risk_external"
  /** Reversible, medium-impact internal. */
  | "medium_risk_internal"
  /** Any action involving a deleted / archived entity. */
  | "deleted_or_archived"
  /** Above $100 default threshold, or any payment. */
  | "financial_above_threshold"
  /** Any irreversible / privacy-affecting action. */
  | "irreversible"
  /** Anything not classified — default to queue. */
  | "unclassified";

/**
 * Verifier verdict envelope. Confidence is the verifier's own confidence
 * (0..100), not derived from the planner.
 */
export interface VerifierOutput {
  verdict: VerifierVerdict;
  confidence: number;
  rationale?: string | undefined;
}

/**
 * classifyAction — derives an action class from the request and proposed
 * payload. The Approver consumes this + the verifier's verdict.
 *
 * The mapping is intentionally conservative: anything ambiguous falls
 * into `unclassified`, which forces a queue.
 */
export function classifyAction(
  request: AIRunRequest,
  proposedPayload: Record<string, unknown>,
): ActionClass {
  const kind = request.kind;
  const target = (proposedPayload["target"] ?? {}) as Record<string, unknown>;
  const scope = target["scope"];
  const impact = target["impact"];
  const reversibility = target["reversibility"];
  const amountUSD = Number(target["amountUSD"] ?? 0);

  // Default threshold from PRD §11 — Owner-configurable in v1.x.
  const FINANCIAL_THRESHOLD_USD = 100;

  if (kind === "action") {
    if (reversibility === "irreversible") return "irreversible";
    if (scope === "external") return "low_risk_external";
    if (scope === "financial" || amountUSD > FINANCIAL_THRESHOLD_USD) {
      return "financial_above_threshold";
    }
    if (impact === "medium") return "medium_risk_internal";
    if (impact === "high") return "medium_risk_internal";
    if (impact === "low" && scope === "internal") return "low_risk_internal";
  }

  // Drafts and summaries default to safe.
  if (kind === "draft" || kind === "summary" || kind === "briefing") {
    if (scope === "external") return "low_risk_external";
    return "low_risk_internal";
  }

  return "unclassified";
}

/**
 * runVerifier — local rule implementation. Phase 0 uses a deterministic
 * rule-based classifier in lieu of an LLM verifier; Phase 1 swaps in a
 * small fast-tier LLM with the same interface.
 *
 * The contract is what matters: every action runs through this, every
 * result is logged. The implementation can be upgraded without touching
 * callers.
 */
export async function runVerifier(input: VerifierInput): Promise<VerifierOutput> {
  // Simple, transparent rules. Easy to audit. Easy to extend in v1.
  const cls = input.actionClass;

  if (cls === "irreversible") {
    return {
      verdict: "disagree",
      confidence: 99,
      rationale: "Action is irreversible — never auto-execute.",
    };
  }

  if (cls === "financial_above_threshold") {
    return {
      verdict: "uncertain",
      confidence: 75,
      rationale:
        "Financial action above Owner-configurable threshold — human approval required.",
    };
  }

  if (cls === "deleted_or_archived") {
    return {
      verdict: "disagree",
      confidence: 99,
      rationale: "Action targets a deleted/archived entity.",
    };
  }

  if (cls === "unclassified") {
    return {
      verdict: "uncertain",
      confidence: 50,
      rationale: "Action class is unclassified — default to queue.",
    };
  }

  if (cls === "low_risk_external") {
    return {
      verdict: "uncertain",
      confidence: 70,
      rationale: "External-scope action — queue for human review.",
    };
  }

  if (cls === "medium_risk_internal") {
    return {
      verdict: "uncertain",
      confidence: 65,
      rationale: "Medium-impact internal action — queue for human review.",
    };
  }

  // cls === 'low_risk_internal'
  return {
    verdict: "agree",
    confidence: 85,
    rationale: "Low-risk internal action.",
  };
}

/** Compose verifier input from raw request + proposed outcome. */
export function verifierInputFromRequest(
  request: AIRunRequest,
  proposedPayload: Record<string, unknown>,
): VerifierInput {
  const actionClass = classifyAction(request, proposedPayload);
  return { request, proposedPayload, actionClass };
}
