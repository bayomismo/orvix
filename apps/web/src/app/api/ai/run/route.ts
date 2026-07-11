import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSession } from "@/server/auth";
import { aiRunRequestSchema } from "@orvix/schemas";
import { repository } from "@orvix/db";

/**
 * POST /api/ai/run — proxy to the AI service.
 *
 * The web app talks to the Fastify AI service (port 3001) using the
 * workspaceId from the session (never the client). The contract here
 * is the production shape; in Phase 0 the AI service is a local Fastify
 * instance running the rule-based runtime.
 */

const AI_URL = process.env["ORVIX_AI_URL"] ?? "http://127.0.0.1:3001";

const Body = z.object({
  kind: z.enum(["summary", "draft", "briefing", "inference", "action", "suggestion"]),
  workItemId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  routingProfile: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;

  // Build a real aiRunRequest and POST it to the AI service.
  const request = aiRunRequestSchema.parse({
    workspaceId: s.workspace.id,
    routingProfile: body.routingProfile ?? "general",
    kind: body.kind,
    workItemId: body.workItemId,
    payload: {
      ...(body.payload ?? {}),
      ...(body.title ? { title: body.title } : {}),
      ...(body.description ? { description: body.description } : {}),
    },
  });

  try {
    const res = await fetch(`${AI_URL}/v1/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request }),
      // 5s budget — fail fast and let the UI show a graceful empty state
      signal: AbortSignal.timeout(5_000),
    });
    const data = (await res.json()) as {
      ok: boolean;
      result?: unknown;
      error?: { code?: string; details?: unknown };
    };
    // Record the run for the audit log + AI surface
    if (data.ok && data.result) {
      const r = data.result as { decision?: string; rationale?: string };
      const decision = (r.decision ?? "queue_for_approval") as
        | "execute"
        | "queue_for_approval"
        | "block"
        | "cooldown";
      const rationale = r.rationale ?? "";
      await repository.createAIRun({
        workspaceId: s.workspace.id,
        routingProfile: request.routingProfile,
        kind: request.kind,
        decision,
        rationale,
      });
      if (body.workItemId) {
        await repository.createActivity({
          workspaceId: s.workspace.id,
          workItemId: body.workItemId,
          actorId: s.user.id,
          kind: "ai_summarized",
          payload: { kind: request.kind },
        });
      }
    }
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "ai_unreachable",
          message: e instanceof Error ? e.message : "AI service is unreachable.",
        },
      },
      { status: 503 },
    );
  }
}
