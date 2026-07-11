/**
 * AI Assistant — Approver (v0.2).
 *
 * The deterministic policy engine that decides the final disposition of
 * an AI Assistant action after the planner and verifier have produced
 * their outputs.
 *
 * Outcomes:
 *   - `execute`           — auto-execute; no human approval required.
 *   - `queue_for_approval` — queue in the Approvals tab + daily digest.
 *   - `block`              — never execute; logged with reason.
 *   - `cooldown`           — wait for cost cap or rate limit to ease.
 *
 * The Approver is the *only* function allowed to make that call. The
 * runtime asks the Approver, and the runtime executes whatever the
 * Approver says.
 */

import type { AIRunRequest, AIRunKind, AiRunModelTier } from "@orvix/schemas";
import type { VerifierOutput } from "./verifier";

export type ApproverDecision = "execute" | "queue_for_approval" | "block" | "cooldown";

export interface ApproverInput {
  request: AIRunRequest;
  plannerConfidence: number; // 0..100
  verifier: VerifierOutput;
  /** Workspace-level budget & per-role cap data. Implementation in
   * Phase 1; Phase 0 uses the model only. */
  costMeter?: {
    /** Cost used today in USD. */
    usedUSD: number;
    /** Cap in USD for this assistant. */
    capUSD: number;
    /** Per-profile autonomy level. */
    autonomyLevel: "suggest_only" | "suggest_and_act_low_risk";
  };
}

export interface ApproverOutput {
  decision: ApproverDecision;
  /** Confidence label we surface to the user. */
  confidenceLabel: "high" | "medium" | "low";
  /** A short rationale (audit-logged). */
  rationale: string;
}

/**
 * Map planner + verifier signals to an Approver decision.
 *
 * v0.2 rule order (highest precedence first):
 *   1. verifier=disagree  → block OR queue_for_approval depending on
 *      configurability. Default: block low-trust, queue_for_approval
 *      for tracker-able items.
 *   2. verifier=uncertain → queue_for_approval (regardless of planner
 *      confidence — a MUST for the trust contract).
 *   3. planner<low_threshold AND verifier=agree → check the action class:
 *        - low_risk_internal + autonomy suggests-and-act → execute
 *        - otherwise → queue_for_approval
 *   4. costMeter over cap → cooldown
 */
export function approve(input: ApproverInput): ApproverOutput {
  const { plannerConfidence, verifier, costMeter } = input;

  // 1. verifier disagreed.
  if (verifier.verdict === "disagree") {
    return {
      decision: "block",
      confidenceLabel: "low",
      rationale:
        verifier.rationale ??
        "Verifier disagreed with the planner — action blocked.",
    };
  }

  // 2. verifier uncertain → queue (MUST).
  if (verifier.verdict === "uncertain") {
    return {
      decision: "queue_for_approval",
      confidenceLabel: "medium",
      rationale:
        verifier.rationale ??
        "Verifier was uncertain — action queued for human review.",
    };
  }

  // 3. verifier agreed. Now check planner confidence + autonomy.
  if (plannerConfidence < 60 || verifier.confidence < 60) {
    return {
      decision: "queue_for_approval",
      confidenceLabel: "medium",
      rationale:
        "Both signals agreed but at moderate confidence — queued for review.",
    };
  }

  // 4. cost cap cooldown.
  if (costMeter && costMeter.usedUSD >= costMeter.capUSD) {
    return {
      decision: "cooldown",
      confidenceLabel: "high",
      rationale: `Workspace AI cost cap reached (${costMeter.usedUSD.toFixed(2)} / ${costMeter.capUSD.toFixed(2)} USD).`,
    };
  }

  // 5. Autonomy gating: only `suggest_and_act_low_risk` allows execute
  // on internal low-risk. Otherwise queue.
  const autonomy = costMeter?.autonomyLevel ?? "suggest_only";
  if (autonomy === "suggest_only") {
    return {
      decision: "queue_for_approval",
      confidenceLabel: "high",
      rationale:
        "Workspace autonomy is `suggest_only` — execute requires `suggest_and_act_low_risk`.",
    };
  }

  return {
    decision: "execute",
    confidenceLabel: "high",
    rationale: `Verifier agreed; planner @ ${plannerConfidence}%, verifier @ ${verifier.confidence}%; ` +
      `workspace autonomy permits execution.`,
  };
}

/** Tier selection. Cheap/fast for low-stakes; heavy for inference, contracts, anomalies. */
export function selectModelTier(
  kind: AIRunKind,
  plannerConfidence: number,
): AiRunModelTier {
  if (kind === "inference") return "heavy";
  if (kind === "action" && plannerConfidence < 50) return "heavy";
  if (kind === "summary") return "medium";
  if (kind === "draft") return "medium";
  return "fast";
}
