/**
 * ORVIX AI service — Phase 0.
 *
 * Hosts the planner → verifier → approver runtime behind two surfaces:
 *   - HTTP/SSE: `POST /v1/runs` (one-shot) + `POST /v1/runs/stream` (SSE)
 *   - gRPC: typed inference contract (defined in /proto, generated in
 *     Phase 1 once the protobuf schema is committed).
 *
 * Phase 0 ships the HTTP/SSE surface with a deterministic stub planner.
 * The runtime is real code (see @orvix/ai-runtime) — only the model
 * providers are stubbed.
 */

import Fastify from "fastify";
import { z } from "zod";

import { aiRunRequestSchema, verifierResultSchema } from "@orvix/schemas";
import { InferenceTally } from "@orvix/utils";

import { dnaIntakeRoute } from "./routes/intake";
import { dnaInferRoute } from "./routes/infer";
import { dnaComposeRoute } from "./routes/compose";
import { runRoute } from "./routes/run";
import { streamRoute } from "./routes/stream";

const PORT = Number(process.env["PORT"] ?? 3001);
const HOST = process.env["HOST"] ?? "127.0.0.1";

const app = Fastify({
  logger: {
    level: process.env["LOG_LEVEL"] ?? "info",
  },
});

const tally = new InferenceTally();
app.decorate("inferenceTally", tally);

app.get("/health", async () => ({ ok: true, ts: new Date().toISOString() }));

app.register(dnaIntakeRoute, { prefix: "/v1/dna" });
app.register(dnaInferRoute, { prefix: "/v1/dna" });
app.register(dnaComposeRoute, { prefix: "/v1/dna" });
app.register(runRoute, { prefix: "/v1/runs" });
app.register(streamRoute, { prefix: "/v1/runs" });

// OpenAPI surface for the AI service.
app.get("/openapi.json", async () => {
  // Phase 0 returns a minimal stub; Phase 1 fills it from the Zod
  // schemas via zod-to-openapi.
  return {
    openapi: "3.1.0",
    info: { title: "ORVIX AI Service", version: "0.0.1" },
    paths: {},
  };
});

app
  .listen({ port: PORT, host: HOST })
  .then((address) => {
    app.log.info(`ORVIX AI service listening on ${address}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });

// Re-export aiRunRequestSchema and verifierResultSchema so that the
// compiler does not strip them — these are imported by the route
// plugins below.
void aiRunRequestSchema;
void verifierResultSchema;
void z;
