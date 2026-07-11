import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { run } from "@orvix/ai-runtime/runtime";
import { aiRunRequestSchema } from "@orvix/schemas";
import type { InferenceTally } from "@orvix/utils";

/**
 * POST /v1/runs — single-shot AI run.
 *
 * Phase 0: returns the runtime's disposition. Phase 1 persists an
 * AIRun row with model_tier, verifier_used, verifier_result,
 * clientRequestId linkage to audit_logs.requestId.
 */

const Body = z.object({
  request: aiRunRequestSchema,
  costMeter: z
    .object({
      usedUSD: z.number().nonnegative(),
      capUSD: z.number().positive(),
      autonomyLevel: z.enum(["suggest_only", "suggest_and_act_low_risk"]),
    })
    .optional(),
});

declare module "fastify" {
  interface FastifyInstance {
    inferenceTally: InferenceTally;
  }
}

export async function runRoute(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const parsed = Body.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        ok: false,
        error: { code: "validation_failed", details: parsed.error.flatten() },
      });
    }
    const { request: aiRequest, costMeter } = parsed.data;

    try {
      const result = await run({
        request: aiRequest,
        ...(costMeter !== undefined && { costMeter }),
        callbacks: {
          onApprover: (decision) => {
            // Phase 0 just logs. Phase 1 persists to AIRun.
            app.log.info({ decision }, "approver-decided");
          },
        },
      });
      // Phase 0 cost telemetry: every accepted run is tallied.
      app.inferenceTally.record({
        workspaceId: aiRequest.workspaceId,
        tier: result.verifier.verdict === "agree" ? "fast" : "medium",
        modelTier: result.verifier.verdict === "agree" ? "fast" : "medium",
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUSD: 0.001,
        ts: new Date(),
      });
      return reply.code(200).send({ ok: true, result });
    } catch (e) {
      app.log.error(e);
      return reply
        .code(500)
        .send({ ok: false, error: { code: "internal_error", message: String(e) } });
    }
  });
}
