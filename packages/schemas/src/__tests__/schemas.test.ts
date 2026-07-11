import { describe, expect, it } from "vitest";

import {
  BUILT_IN_WORK_ITEM_TYPES,
  customerExtensionSchema,
  dealExtensionSchema,
  extensionForType,
  workItemCreateInputSchema,
  workItemRelationCreateInput,
  sideEffecting,
  clientRequestIdSchema,
  aiAssistantConfigUpdateSchema,
  aiRunRequestSchema,
  verifierVerdictSchema,
  labelConfidence,
  businessDnaDocumentSchema,
} from "../index";
import { fieldsPendingVerification } from "../dna";

describe("@orvix/schemas", () => {
  describe("work-item", () => {
    it("exposes 7 built-in types", () => {
      expect(BUILT_IN_WORK_ITEM_TYPES).toEqual([
        "customer",
        "deal",
        "project",
        "task",
        "conversation",
        "document",
        "request",
      ]);
    });

    it("extensionForType resolves for built-ins and returns null for unknown", () => {
      expect(extensionForType("customer")).toBe(customerExtensionSchema);
      expect(extensionForType("deal")).toBe(dealExtensionSchema);
      expect(extensionForType("not-a-type")).toBeNull();
    });

    it("customer extension enforces legalName minimum length", () => {
      const result = customerExtensionSchema.safeParse({ legalName: "" });
      expect(result.success).toBe(false);
    });

    it("workItemCreateInputSchema accepts a minimal valid input", () => {
      const result = workItemCreateInputSchema.safeParse({
        typeKey: "task",
        title: "Ship Phase 0",
        status: "open",
      });
      expect(result.success).toBe(true);
    });

    it("workItemRelationCreateInput rejects self-links", () => {
      const result = workItemRelationCreateInput.safeParse({
        sourceId: "00000000-0000-0000-0000-000000000000",
        targetId: "00000000-0000-0000-0000-000000000000",
        relation: "blocks",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("server-action idempotency", () => {
    it("clientRequestIdSchema is a UUID", () => {
      const ok = clientRequestIdSchema.safeParse("00000000-0000-0000-0000-000000000000");
      expect(ok.success).toBe(true);
      const bad = clientRequestIdSchema.safeParse("not-a-uuid");
      expect(bad.success).toBe(false);
    });

    it("sideEffecting wrapper puts clientRequestId FIRST", () => {
      const t = sideEffecting(workItemCreateInputSchema);
      // ts-expect-error: deliberately malformed — see that it errors on inner field
      const result = t.safeParse({
        clientRequestId: "00000000-0000-0000-0000-000000000000",
        payload: { typeKey: "", title: "", status: "" },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("AI", () => {
    it("aiAssistantConfigUpdate rejects unknown routing profile role", () => {
      const result = aiAssistantConfigUpdateSchema.safeParse({
        routingProfileOverrides: {
          // ts-expect-error: spoof role
          unknown: {} as never,
        },
      });
      expect(result.success).toBe(false);
    });

    it("aiRunRequestSchema enforces routingProfile enum", () => {
      const result = aiRunRequestSchema.safeParse({
        workspaceId: "00000000-0000-0000-0000-000000000000",
        routingProfile: "ceo",
        kind: "summary",
        payload: {},
      });
      expect(result.success).toBe(true);
    });

    it("verifierVerdictSchema enumerates agree/disagree/uncertain", () => {
      expect(verifierVerdictSchema.options).toEqual(["agree", "disagree", "uncertain"]);
    });

    it("labelConfidence: disagree → low regardless of planner", () => {
      expect(labelConfidence(99, "disagree", 99)).toBe("low");
    });

    it("labelConfidence: agree at low numeric → medium", () => {
      expect(labelConfidence(55, "agree", 55)).toBe("medium");
    });

    it("labelConfidence: agree at high → high", () => {
      expect(labelConfidence(85, "agree", 85)).toBe("high");
    });
  });

  describe("DNA field-confidence gate", () => {
    const baseDoc = {
      $schema: "https://orvix.com/schemas/dna.v1.json",
      version: 1 as const,
      workspaceId: "00000000-0000-0000-0000-000000000000",
      inferredAt: new Date().toISOString(),
      confidence: {
        industry: 90,
        businessModel: 90,
        companySize: 90,
        growthStage: 90,
        tone: 90,
        tonePreset: 90,
        autonomyLevel: 90,
      },
      inputs: { telemetryDaysObserved: 0 },
      identity: {
        industry: "agency",
        businessModel: "B2B_services_retainer",
        companySize: { headcount: 32, stage: "early_growth" as const },
        geography: ["US"],
        growthStage: "early_growth",
        communicationStyle: {
          tone: "casual_warm",
          cadence: "async_first",
          preferredChannels: ["slack"],
          writingRegister: "conversational",
        },
      },
      structure: {
        departments: [],
        employeeRoles: [],
        approvalHierarchy: { type: "two_tier" as const, tiers: [] },
      },
      aiAssistant: {
        tonePreset: "warm_concise" as const,
        autonomyLevel: "suggest_only" as const,
        routingProfilesEnabled: ["ceo" as const, "sales" as const],
      },
      crossTenantLearning: { enabled: false },
    };

    it("passes schema validation with required fields populated", () => {
      const result = businessDnaDocumentSchema.safeParse(baseDoc);
      expect(result.success).toBe(true);
    });

    it("fieldsPendingVerification flags low-confidence required fields", () => {
      const doc = {
        ...baseDoc,
        confidence: { ...baseDoc.confidence, industry: 30 },
      };
      const pending = fieldsPendingVerification(doc);
      expect(pending).toContain("industry");
    });
  });
});
