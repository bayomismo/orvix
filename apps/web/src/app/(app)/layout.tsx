import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/server/auth";

/**
 * Authed app shell — the (app) route group.
 *
 * v1.0 AppShell owns all chrome:
 *   - Pulse signature status line
 *   - Floating glass sidebar + topbar
 *   - Universal command palette (⌘K)
 *   - Floating AI orb + sheet
 *   - Notification center + profile menu
 *
 * Real session via the in-memory store + cookie. `requireSession()`
 * redirects to /onboarding if no session is present.
 */

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const s = await requireSession();

  const session = {
    user: {
      id: s.user.id,
      displayName: s.user.displayName,
      email: s.user.email,
      ...(s.user.roleKey ? { role: s.user.roleKey } : {}),
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
    <AppShell session={session}>{children}</AppShell>
  );
}
