import type { FastifyInstance } from "fastify";
import { z } from "zod";

/**
 * DNA Engine — infer endpoint stub (Phase 0).
 *
 * Phase 0: returns a stub DNA document. Phase 1 wires the model call,
 * the verifier second signal, and the schema validation.
 */

const Body = z.object({
  workspaceId: z.string().uuid(),
  conversationId: z.string().min(1).max(128),
});

export async function dnaInferRoute(app: FastifyInstance) {
  app.post("/infer", async (request, reply) => {
    const parsed = Body.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        ok: false,
        error: { code: "validation_failed", details: parsed.error.flatten() },
      });
    }
    return reply.code(200).send({
      ok: true,
      document: {
        version: 1,
        workspaceId: parsed.data.workspaceId,
        inferredAt: new Date().toISOString(),
        confidence: { industry: 70, businessModel: 70, companySize: 70, growthStage: 70 },
      },
    });
  });
}
