import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";
import { AIAssistantBar } from "@/components/AIAssistantBar";
import { requireSession } from "@/server/auth";

/**
 * Authed app shell — the (app) route group.
 *
 * Real session via the in-memory store + cookie. `requireSession()`
 * redirects to /onboarding if no session is present. The contract
 * here is the same one Auth.js v5 (RFC-0001) will satisfy.
 *
 * The Geist font is loaded in the root layout; we don't re-import.
 */

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const s = await requireSession();

  const session = {
    user: {
      id: s.user.id,
      displayName: s.user.displayName,
      email: s.user.email,
    },
    workspace: {
      id: s.workspace.id,
      slug: s.workspace.id,
      name: s.workspace.name,
    },
    workspaceId: s.workspace.id,
    primaryRole: s.user.roleKey as "owner" | "admin" | "operator" | "member" | "viewer" | "ai_assistant",
    density: "comfortable" as const,
    theme: "system" as const,
  };

  return (
    <div className="flex min-h-screen w-full bg-surface-canvas">
      <AppShell session={session}>{children}</AppShell>
      <AIAssistantBar workspaceId={s.workspace.id} />
    </div>
  );
}
