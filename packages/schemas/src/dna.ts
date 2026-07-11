/**
 * Business DNA schema (v0.2).
 *
 * The DNA document is the contract between Inference and Composition.
 * Append-only versions. Confidence is required per-field.
 *
 * This file is the canonical TypeScript+Zod definition. The JSON Schema
 * mirror (`/src/json/dna.v1.json`) is generated from this at build time.
 */

import { z } from "zod";

/** Confidence is reported per field, not as a global score. */
export const confidenceSchema = z.number().int().min(0).max(100);

export const dnaIdentitySchema = z.object({
  industry: z.string().min(1).max(120),
  businessModel: z.string().min(1).max(120),
  companySize: z.object({
    headcount: z.number().int().nonnegative(),
    stage: z.enum(["pre_seed", "seed", "early_growth", "growth", "scale", "mature"]),
  }),
  geography: z.array(z.string().max(8)).default([]),
  growthStage: z.string().max(60),
  communicationStyle: z.object({
    tone: z.string().max(64),
    cadence: z.string().max(64),
    preferredChannels: z.array(z.string().max(32)).default([]),
    writingRegister: z.string().max(64),
  }),
});

export const dnaStructureSchema = z.object({
  departments: z
    .array(
      z.object({
        id: z.string().max(64),
        name: z.string().min(1).max(120),
        headcount: z.number().int().nonnegative(),
        responsibilities: z.array(z.string().max(120)).default([]),
      }),
    )
    .default([]),
  employeeRoles: z
    .array(
      z.object({
        id: z.string().max(64),
        title: z.string().min(1).max(120),
        permissions: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  approvalHierarchy: z.object({
    type: z.enum(["single_tier", "two_tier", "matrix"]),
    tiers: z
      .array(
        z.object({
          tier: z.number().int().positive(),
          thresholdUSD: z.number().nonnegative(),
          approverRole: z.string().max(64),
        }),
      )
      .default([]),
  }),
});

export const dnaProcessesSchema = z.object({
  sales: z
    .object({
      stages: z
        .array(
          z.object({
            id: z.string().max(64),
            name: z.string().min(1).max(120),
            exitsWhen: z.string().max(280),
          }),
        )
        .default([]),
      medianCycleDays: z.number().int().nonnegative().optional(),
    })
    .optional(),
  support: z
    .object({
      channels: z.array(z.string().max(64)).default([]),
      tiers: z
        .array(
          z.object({
            tier: z.string().max(32),
            respondsWithin: z.string().max(64),
            resolves: z.array(z.string()).default([]),
          }),
        )
        .default([]),
      tone: z.string().max(64).optional(),
    })
    .optional(),
  recruitment: z
    .object({
      stages: z.array(z.string().max(120)).default([]),
      evaluationRubric: z.array(z.string().max(280)).default([]),
    })
    .optional(),
  clientDelivery: z
    .object({
      cadence: z.string().max(64).optional(),
      templates: z.array(z.string().max(120)).default([]),
      approvers: z.array(
        z.object({
          for: z.string().max(120),
          role: z.string().max(64),
        }),
      ).default([]),
    })
    .optional(),
});

/**
 * AI Assistant surface as encoded in the DNA record.
 * Internal routing profiles map directly onto the role enum used by
 * AI run requests.
 */
export const dnaAiAssistantSchema = z.object({
  tonePreset: z.enum(["warm_concise", "concise_direct", "warm_empathetic"]),
  autonomyLevel: z.enum(["suggest_only", "suggest_and_act_low_risk"]),
  routingProfilesEnabled: z
    .array(
      z.enum(["ceo", "sales", "support", "finance", "hr", "operations", "marketing", "legal"]),
    )
    .default([]),
});

/** v0.2: explicit cross-tenant pattern opt-in at onboarding. */
export const dnaCrossTenantLearningSchema = z.object({
  enabled: z.boolean().default(false),
  consentTimestamp: z.string().datetime().nullable().optional(),
  consentSurface: z.enum(["onboarding", "settings"]).optional(),
});

/** Field-level confidence — output of the verifier-aware inference. */
const dnaFieldConfidence = z.record(confidenceSchema);

export const businessDnaDocumentSchema = z.object({
  $schema: z.string().optional(),
  version: z.literal(1),
  workspaceId: z.string().uuid(),
  inferredAt: z.string().datetime(),
  confidence: dnaFieldConfidence,
  inputs: z.object({
    onboardingConversationId: z.string().uuid().optional(),
    telemetryDaysObserved: z.number().int().nonnegative().default(0),
  }),
  identity: dnaIdentitySchema,
  structure: dnaStructureSchema,
  objects: z
    .object({
      products: z
        .array(
          z.object({
            id: z.string().max(64),
            name: z.string().min(1).max(120),
            kind: z.enum(["service", "physical", "digital", "subscription"]),
            pricing: z.string().max(64),
          }),
        )
        .default([]),
      services: z.array(z.string().max(120)).default([]),
      customerSegments: z
        .array(
          z.object({
            id: z.string().max(64),
            name: z.string().min(1).max(120),
            avgDealSizeUSD: z.number().nonnegative().optional(),
            lifecycleWeeks: z.number().nonnegative().optional(),
          }),
        )
        .default([]),
    })
    .optional(),
  processes: dnaProcessesSchema.optional(),
  kpis: z
    .object({
      primary: z
        .array(
          z.object({
            id: z.string().max(64),
            name: z.string().min(1).max(120),
            unit: z.string().max(32),
            target: z.number(),
          }),
        )
        .default([]),
    })
    .optional(),
  goals: z
    .object({
      now: z.array(z.string().max(280)).default([]),
      next: z.array(z.string().max(280)).default([]),
      watch: z.array(z.string().max(280)).default([]),
    })
    .optional(),
  painPoints: z
    .array(
      z.object({
        id: z.string().max(64),
        description: z.string().min(1).max(280),
        severity: z.enum(["low", "med", "high"]),
      }),
    )
    .default([])
    .optional(),
  aiAssistant: dnaAiAssistantSchema,
  crossTenantLearning: dnaCrossTenantLearningSchema,
  permissions: z
    .object({
      defaultRole: z.enum(["member", "viewer", "operator"]),
      visibility: z.enum(["org_internal_only", "scoped_external"]),
      guestAccess: z.enum(["none", "scoped_per_work_item"]),
    })
    .optional(),
});

export type BusinessDnaDocument = z.infer<typeof businessDnaDocumentSchema>;

/**
 * Field confidence gate at v0.2: any required field below 50 is
 * marked `pending_verification` in the verifier output, not silently
 * allowed. This mirrors the Approver's verifier second signal.
 */
export const DNA_REQUIRED_FIELDS = [
  "industry",
  "businessModel",
  "companySize",
  "growthStage",
  "communicationStyle.tone",
  "aiAssistant.tonePreset",
  "aiAssistant.autonomyLevel",
] as const;

export const DNA_CONFIDENCE_THRESHOLD = 50;

/**
 * Validate that all required fields meet the threshold. Returns a list
 * of fields that need verification.
 */
export function fieldsPendingVerification(
  doc: BusinessDnaDocument,
): readonly string[] {
  const out: string[] = [];
  for (const path of DNA_REQUIRED_FIELDS) {
    const parts = path.split(".");
    let current: unknown = doc;
    let value: unknown = undefined;
    for (const p of parts) {
      if (current && typeof current === "object") {
        value = (current as Record<string, unknown>)[p];
        current = value;
      }
    }
    if (value === undefined) {
      out.push(path);
      continue;
    }
    const leaf = parts[parts.length - 1]!;
    const conf = (doc.confidence as Record<string, number | undefined>)[leaf];
    if (conf === undefined || conf < DNA_CONFIDENCE_THRESHOLD) {
      out.push(path);
    }
  }
  return out;
}
