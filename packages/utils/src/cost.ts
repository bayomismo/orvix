/**
 * Cost primitives — used by the AI runtime and by the cost telemetry
 * surface. Phase 0 ships the contract; Phase 1 wires this into a
 * dedicated time-series store (Prometheus, OTel metrics).
 *
 * The cost model is the source of truth — see PRD §17. This file
 * mirrors the relevant bits into code, so a Server Action can call
 * `recordInference(...)` consistently.
 */

import type { AiRunModelTier } from "@orvix/schemas";

/**
 * Estimated per-call cost in USD, by model tier. These are v0.2
 * *modeled* numbers; we'll measure against real usage in Phase 1+.
 *
 * Calibration matters: miscalibrated cost estimates cause us to
 * mis-cap the wrong tier of customer. We persist every call's actual
 * cost (`costUSD`) and recompute these periodically.
 */
export const costPerCallUSD: Record<AiRunModelTier, { low: number; high: number }> = {
  fast: { low: 0.0005, high: 0.005 },
  medium: { low: 0.01, high: 0.05 },
  heavy: { low: 0.1, high: 0.5 },
};

/** Conservative midpoint estimate for budget projections. */
export function estimateCostUSD(tier: AiRunModelTier): number {
  const r = costPerCallUSD[tier]!;
  return (r.low + r.high) / 2;
}

/**
 * Cost ceilings (mirrored from PRD §17 §5). Phase 0 hard-codes these;
 * Phase 1 reads from a config service.
 */
export const COST_CEILINGS = {
  free: {
    aiPerDay: 200,
    embeddingPerDay: 500,
  },
  pro: {
    aiPerDay: 5_000,
    embeddingPerDay: 25_000,
  },
  team: {
    aiPerDay: 50_000,
    embeddingPerDay: 250_000,
  },
} as const;

export type PricingTier = keyof typeof COST_CEILINGS;

export function capForTier(tier: PricingTier): {
  aiPerDay: number;
  embeddingPerDay: number;
} {
  return COST_CEILINGS[tier];
}

export interface InferenceRecord {
  workspaceId: string;
  tier: AiRunModelTier;
  modelTier: AiRunModelTier;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUSD: number;
  ts: Date;
}

export const inferenceRecordSchemaSymbol = Symbol("inference_record");

/**
 * A simple in-memory tally for Phase 0 tests. Phase 1 replaces this
 * with a Redis-backed counter + Prometheus metric exporter.
 */
export class InferenceTally {
  private perWorkspace = new Map<
    string,
    { totalCalls: number; totalCostUSD: number; ts: Date }
  >();

  record(rec: InferenceRecord): void {
    const existing = this.perWorkspace.get(rec.workspaceId);
    if (existing) {
      existing.totalCalls += 1;
      existing.totalCostUSD += rec.estimatedCostUSD;
      existing.ts = rec.ts;
    } else {
      this.perWorkspace.set(rec.workspaceId, {
        totalCalls: 1,
        totalCostUSD: rec.estimatedCostUSD,
        ts: rec.ts,
      });
    }
  }

  totalFor(workspaceId: string): { totalCalls: number; totalCostUSD: number } | undefined {
    const r = this.perWorkspace.get(workspaceId);
    if (!r) return undefined;
    return { totalCalls: r.totalCalls, totalCostUSD: r.totalCostUSD };
  }
}
