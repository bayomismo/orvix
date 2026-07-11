import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createMemorySession, setMemorySessionCookie } from "@/server/auth/session";
import { repository } from "@orvix/db";

/**
 * POST /api/dev/bootstrap — Phase 0 only.
 *
 * Creates a fully bootstrapped workspace and sets a session cookie.
 * Used by the screenshot script to avoid the multi-step wizard race
 * with React onChange timing. In production this route would be
 * removed; the canonical path is `completeOnboarding`.
 */

const Body = z.object({
  workspaceName: z.string().min(2),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  industry: z.enum(["agency","saas","ecommerce","consulting","manufacturing","education","healthcare","finance","realestate","media","nonprofit","other"]),
  companySize: z.enum(["solo","2-10","11-50","51-200","201-1000","1000+"]),
  teamStructure: z.enum(["flat","functional","divisional","matrix","pod"]),
  primaryGoal: z.enum(["ship-faster","win-clients","deliver-on-time","grow-revenue","reduce-overhead","build-product","manage-team","stay-compliant"]),
});

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env["ORVIX_ALLOW_DEV_BOOTSTRAP"] !== "1") {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const body = (await req.json().catch(() => null)) as z.infer<typeof Body> | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") }, { status: 400 });
  }

  const input = parsed.data;
  const email = input.ownerEmail.toLowerCase();

  // Reuse existing user with this email if any (idempotent for the script).
  const existing = await repository.findUserByEmail(email);
  if (existing) {
    const s = createMemorySession(existing.id, existing.workspaceId);
    await setMemorySessionCookie(s);
    return NextResponse.json({ ok: true, workspaceId: existing.workspaceId, userId: existing.id });
  }

  const { workspace, owner, session } = await repository.bootstrapWorkspace({
    name: input.workspaceName,
    industry: input.industry,
    companySize: input.companySize,
    teamStructure: input.teamStructure,
    primaryGoal: input.primaryGoal,
    ownerEmail: email,
    ownerName: input.ownerName,
  });
  await setMemorySessionCookie(session);
  return NextResponse.json({ ok: true, workspaceId: workspace.id, userId: owner.id });
}
