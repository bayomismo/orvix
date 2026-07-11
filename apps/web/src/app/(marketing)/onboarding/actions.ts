"use server";

import { redirect } from "next/navigation";

import { withIdempotency } from "@/server/idempotency";
import { createMemorySession, setMemorySessionCookie } from "@/server/auth/session";
import { repository, type CompanySize, type Industry, type PrimaryGoal, type TeamStructure } from "@orvix/db";

export type OnboardingInput = {
  /** step 1 */
  workspaceName: string;
  ownerName: string;
  ownerEmail: string;
  /** step 2 */
  industry: Industry;
  companySize: CompanySize;
  /** step 3 */
  teamStructure: TeamStructure;
  /** step 4 */
  primaryGoal: PrimaryGoal;
};

export type OnboardingResult =
  | { ok: true; workspaceId: string }
  | { ok: false; error: string };

/**
 * Server Action — completes the onboarding wizard.
 *
 * Idempotent by `clientRequestId`. On success, sets a session cookie
 * and returns the workspaceId; the client navigates to /inbox.
 */
export async function completeOnboarding(
  input: OnboardingInput,
  clientRequestId: string,
): Promise<OnboardingResult> {
  // Validate server-side. Client validation is a courtesy, never the
  // authority. The store doesn't enforce these so the server must.
  const ws = input.workspaceName?.trim();
  const owner = input.ownerName?.trim();
  const email = input.ownerEmail?.trim().toLowerCase();
  if (!ws || ws.length < 2) return { ok: false, error: "Workspace name is too short." };
  if (!owner || owner.length < 2) return { ok: false, error: "Your name is too short." };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Email looks invalid." };
  }
  const validIndustries: Industry[] = ["agency","saas","ecommerce","consulting","manufacturing","education","healthcare","finance","realestate","media","nonprofit","other"];
  const validSizes: CompanySize[] = ["solo","2-10","11-50","51-200","201-1000","1000+"];
  const validStructures: TeamStructure[] = ["flat","functional","divisional","matrix","pod"];
  const validGoals: PrimaryGoal[] = ["ship-faster","win-clients","deliver-on-time","grow-revenue","reduce-overhead","build-product","manage-team","stay-compliant"];
  if (!validIndustries.includes(input.industry)) return { ok: false, error: "Pick an industry." };
  if (!validSizes.includes(input.companySize)) return { ok: false, error: "Pick a company size." };
  if (!validStructures.includes(input.teamStructure)) return { ok: false, error: "Pick a team structure." };
  if (!validGoals.includes(input.primaryGoal)) return { ok: false, error: "Pick a primary goal." };

  const result = await withIdempotency(clientRequestId, async () => {
    // If this email already owns a workspace, reuse the existing one
    // so a re-submit doesn't double-bootstrap.
    const existing = await repository.findUserByEmail(email);
    if (existing) {
      const s = createMemorySession(existing.id, existing.workspaceId);
      await setMemorySessionCookie(s);
      return { workspaceId: existing.workspaceId };
    }
    const { workspace, session } = await repository.bootstrapWorkspace({
      name: ws,
      industry: input.industry,
      companySize: input.companySize,
      teamStructure: input.teamStructure,
      primaryGoal: input.primaryGoal,
      ownerEmail: email,
      ownerName: owner,
    });
    await setMemorySessionCookie(session);
    return { workspaceId: workspace.id };
  });

  return { ok: true, workspaceId: result.workspaceId };
}

export async function goToInbox(): Promise<never> {
  redirect("/inbox");
}
