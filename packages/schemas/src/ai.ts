/**
 * AI Assistant runtime schemas (v0.2).
 *
 * Covers:
 *   - AI Assistant run requests
 *   - Tool call payloads
 *   - Verifier verdicts
 *   - Approval envelopes
 *   - Memory layers
 *
 * The runtime never trusts the planner alone; every auto-acted action
 * must be approved by a verifier second signal.
 */

import { z } from "zod";

export const aiRoleSchema = z.enum([
  "ceo",
  "sales",
  "support",
  "finance",
  "hr",
  "operations",
  "marketing",
  "legal",
]);

export type AIRole = z.infer<typeof aiRoleSchema>;

export const aiTonePresetSchema = z.enum([
  "warm_concise",
  "concise_direct",
  "warm_empathetic",
]);

export const aiAutonomyLevelSchema = z.enum([
  "suggest_only",
  "suggest_and_act_low_risk",
  // "autonomous_low_risk" reserved for v2 (per PRD §11 / ADR-15.18)
]);

export const aiRunKindSchema = z.enum([
  "suggestion",
  "draft",
  "action",
  "summary",
  "briefing",
  "inference",
]);
export type AIRunKind = z.infer<typeof aiRunKindSchema>;

export const aiRunModelTierSchema = z.enum(["fast", "medium", "heavy"]);
export type AiRunModelTier = z.infer<typeof aiRunModelTierSchema>;

export const aiRunStatusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
  "denied_by_policy",
  "awaiting_approval",
]);

/** The verifier returns one of three verdicts — the second signal. */
export const verifierVerdictSchema = z.enum(["agree", "disagree", "uncertain"]);
export type VerifierVerdict = z.infer<typeof verifierVerdictSchema>;

/** Verifier verdict plus confidence; both fields are explicit. */
export const verifierResultSchema = z.object({
  verdict: verifierVerdictSchema,
  confidence: z.number().int().min(0).max(100),
  rationale: z.string().max(2_000).optional(),
});
export type VerifierResult = z.infer<typeof verifierResultSchema>;

/**
 * Display label for AI confidence — the labels called for by
 * Review MUST #6 / PRD §11. We never show raw 0..1 values in the UI.
 * The mapping is conservative so we don't mislead the human in the loop:
 *   high:    both signals agree with high confidence
 *   medium:  one signal is medium or below
 *   low:     either signal is low OR they disagree
 */
export type ConfidenceLabel = "high" | "medium" | "low";

export function labelConfidence(
  plannerConfidence: number,
  verifier: VerifierVerdict,
  verifierConfidence: number,
): ConfidenceLabel {
  if (verifier === "disagree") return "low";
  if (plannerConfidence >= 80 && verifierConfidence >= 80) return "high";
  return "medium";
}

/** AI run request — what the runtime receives. */
export const aiRunRequestSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  aiAssistantId: z.string().uuid().optional(),
  routingProfile: aiRoleSchema,
  workItemId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  kind: aiRunKindSchema,
  /** Free-text prompt or structured request, depending on `kind`. */
  payload: z.record(z.unknown()),
  /** v0.2: idempotency. Linked to audit_logs.requestId. */
  clientRequestId: z.string().uuid().optional(),
});

export type AIRunRequest = z.infer<typeof aiRunRequestSchema>;

/** Approval envelope — what the human-in-the-loop returns. */
export const aiApprovalDecisionSchema = z.object({
  clientRequestId: z.string().uuid(),
  /** Identifier of the AIRun row being decided. */
  runId: z.string().uuid(),
  decision: z.enum(["approve", "edit", "reject"]),
  editedPayload: z.record(z.unknown()).optional(),
  reason: z.string().max(2_000).optional(),
});

export type AIApprovalDecision = z.infer<typeof aiApprovalDecisionSchema>;

/** Memory entry. v0.2 governance is read-only at the workspace level. */
export const aiMemoryEntrySchema = z.object({
  layer: z.enum(["short_term", "long_term", "organizational"]),
  scope: z.string().min(1).max(120),
  key: z.string().min(1).max(120),
  value: z.unknown(),
  ttlSeconds: z.number().int().positive().optional(),
});

export type AIMemoryEntry = z.infer<typeof aiMemoryEntrySchema>;

/** AI Assistant configuration update — admin only. */
export const aiAssistantConfigUpdateSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  tonePreset: aiTonePresetSchema.optional(),
  autonomyLevel: aiAutonomyLevelSchema.optional(),
  /** Per-profile overrides; the runtime still picks a default for unsupplied profiles. */
  routingProfileOverrides: z
    .record(
      aiRoleSchema,
      z
        .object({
          enabled: z.boolean().optional(),
          tone: z.string().max(64).optional(),
          toolAllowList: z.array(z.string().max(64)).optional(),
          autonomyOverride: aiAutonomyLevelSchema.optional(),
        })
        .partial(),
    )
    .optional(),
  clientRequestId: z.string().uuid().optional(),
});

export type AIAssistantConfigUpdate = z.infer<typeof aiAssistantConfigUpdateSchema>;

/** Cost telemetry — every run yields a row in this shape.
 * Persisted into the AIRun row alongside model_tier / verifier_used /
 * verifier_result so we can monitor cost + calibration. */
export const aiCostTelemetrySchema = z.object({
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  costUSD: z.number().nonnegative(),
  latencyMs: z.number().int().nonnegative(),
  modelTier: aiRunModelTierSchema,
  verifierUsed: z.boolean(),
});

export type AICostTelemetry = z.infer<typeof aiCostTelemetrySchema>;
