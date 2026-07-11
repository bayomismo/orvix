import type { FastifyInstance } from "fastify";

/**
 * DNA Engine — compose endpoint stub (Phase 0).
 *
 * Phase 0: returns a stub composition set. Phase 1 wires the
 * deterministic Composition Set producer that takes a verified DNA
 * and produces the workspace ops (role creates, AI Assistant seed,
 * nav, automations, etc).
 */

export async function dnaComposeRoute(app: FastifyInstance) {
  app.post("/compose", async (request, reply) => {
    void request;
    return reply.code(200).send({
      ok: true,
      compositionSet: {
        operations: [
          { kind: "role.create", roleKey: "owner" },
          { kind: "role.create", roleKey: "admin" },
          { kind: "role.create", roleKey: "member" },
          { kind: "workItemType.seed", key: "customer" },
          { kind: "workItemType.seed", key: "deal" },
          { kind: "workItemType.seed", key: "project" },
          { kind: "workItemType.seed", key: "task" },
          { kind: "workItemType.seed", key: "conversation" },
          { kind: "workItemType.seed", key: "document" },
          { kind: "workItemType.seed", key: "request" },
          { kind: "aiAssistant.configure", tonePreset: "warm_concise", autonomyLevel: "suggest_only" },
        ],
      },
    });
  });
}
