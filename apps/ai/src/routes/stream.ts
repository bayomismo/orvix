import type { FastifyInstance } from "fastify";

/**
 * POST /v1/runs/stream — Server-Sent Events.
 *
 * Per Review Finding 2.10, streaming is exposed by the AI service
 * directly (NOT Server Actions — they were rejected as fragile).
 * Phase 0 returns a stub stream; Phase 1 wires the planner's token
 * stream from the model provider.
 */

export async function streamRoute(app: FastifyInstance) {
  app.post("/stream", async (request, reply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.writeHead(200);

    // Phase 0 stub: one token "hello", then close.
    reply.raw.write(`data: ${JSON.stringify({ token: "(stream placeholder)\n" })}\n\n`);
    reply.raw.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    reply.raw.end();
    return reply;
  });
}
