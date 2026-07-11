import type { FastifyInstance } from "fastify";
import { z } from "zod";

/**
 * DNA Engine — intake endpoint stub (Phase 0).
 *
 * Phase 0 accepts 4 onboarding answers and returns a stub DNA document.
 * Phase 1 wires the real Intake → Infer → Compose → Verify → Live
 * pipeline (see PRD §03).
 */

const Body = z.object({
  workspaceId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().min(1).max(64),
      answer: z.string().min(1).max(2_000),
    }),
  ).min(1).max(12),
});

export async function dnaIntakeRoute(app: FastifyInstance) {
  app.post("/intake", async (request, reply) => {
    const parsed = Body.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        ok: false,
        error: { code: "validation_failed", details: parsed.error.flatten() },
      });
    }
    return reply.code(200).send({
      ok: true,
      conversationId: `conv_${Date.now()}`,
      questionsAsked: parsed.data.answers.length,
    });
  });
}
