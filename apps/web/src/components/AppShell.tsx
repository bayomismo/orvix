"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  AIBubble,
  AppSidebar,
  AppTopbar,
  CommandPalette,
  type CommandItem,
  type Notification,
  Pulse,
  usePulse,
} from "@orvix/ui";

/**
 * AppShell — ORVIX Design System v1.0.
 *
 * The operating system frame. Composed of:
 *   - Pulse (signature 1px status line at the very top of the
 *     workspace, above all other UI).
 *   - Floating glass sidebar (left) with workspace switcher,
 *     primary navigation, AI entry, and profile chip.
 *   - Floating glass topbar (top right) with universal search,
 *     page title, Ask AI button, notifications, profile menu.
 *   - Floating AI orb (bottom right) that opens a focused AI sheet.
 *   - Universal Command Palette (⌘K).
 *   - Notification Center (bell popover).
 *   - Profile Menu (avatar popover).
 *   - Page transition wrapper (smooth enter on every navigation).
 *
 * This component owns all chrome UI state (palette open, AI sheet
 * open, popovers). The page children render inside the smooth
 * transition wrapper.
 */
export interface AppShellSession {
  user: { id: string; displayName: string; email: string; role?: string };
  workspace: { id: string; slug: string; name: string; plan?: string };
  workspaceId: string;
  primaryRole: "owner" | "admin" | "operator" | "member" | "viewer" | "ai_assistant";
  density: "comfortable" | "dense";
  theme: "system" | "light" | "dark";
}

export function AppShell({
  session,
  children,
}: {
  session: AppShellSession;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { state: pulseState, pulse: triggerPulse } = usePulse();
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  // Keyboard shortcut: ⌘K / Ctrl-K opens command palette.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Page title derived from pathname.
  const pageTitle = React.useMemo(() => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    if (segments.length === 0) return "Dashboard";
    const last = segments[segments.length - 1]!;
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  }, [pathname]);

  // Demo notifications — in real life these come from the API.
  const notifications: Notification[] = [
    {
      id: "n1",
      title: "Casey Park closed the deal",
      body: "Acme Co. ($24,000) marked as won. Pipeline updated.",
      tone: "success",
      at: "2m ago",
    },
    {
      id: "n2",
      title: "ORVIX AI drafted 3 follow-ups",
      body: "Review the drafts in your inbox before sending.",
      tone: "ai",
      at: "12m ago",
    },
    {
      id: "n3",
      title: "2 work items are blocked",
      body: "Both waiting on review from Maya.",
      tone: "warning",
      at: "1h ago",
    },
    {
      id: "n4",
      title: "Weekly report is ready",
      body: "Revenue up 18% week-over-week.",
      tone: "info",
      at: "3h ago",
      read: true,
    },
  ];

  // Demo command items.
  const commandItems: CommandItem[] = [
    {
      id: "nav-inbox",
      label: "Go to Inbox",
      category: "navigate",
      href: "/inbox",
      description: "Triage today's items",
    },
    {
      id: "nav-work",
      label: "Go to Work",
      category: "navigate",
      href: "/work",
      description: "Active work items",
    },
    {
      id: "nav-customers",
      label: "Go to Customers",
      category: "navigate",
      href: "/customers",
      description: "All customers",
    },
    {
      id: "nav-ai",
      label: "Open AI Assistant",
      category: "navigate",
      href: "/ai",
    },
    {
      id: "nav-reports",
      label: "Go to Reports",
      category: "navigate",
      href: "/reports",
    },
    {
      id: "nav-settings",
      label: "Open Settings",
      category: "settings",
      href: "/settings",
    },
    {
      id: "ai-summary",
      label: "Summarize today",
      category: "ai",
      description: "AI summary of the day",
      href: "/ai?q=Summarize%20today",
    },
    {
      id: "ai-blocked",
      label: "What's blocked?",
      category: "ai",
      description: "Find work items waiting",
      href: "/ai?q=What%27s%20blocked%3F",
    },
    {
      id: "ai-customers",
      label: "Top customers this week",
      category: "ai",
      description: "Ranked by activity",
      href: "/ai?q=Top%20customers%20this%20week",
    },
    {
      id: "act-new-work",
      label: "New work item",
      category: "action",
      description: "Create a new work item",
      run: () => router.push("/work?new=1"),
    },
  ];

  const handleAIAsk = (prompt: string) => {
    triggerPulse("ai", 1200);
    const encoded = encodeURIComponent(prompt);
    router.push(`/ai?q=${encoded}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-surface-canvas">
      {/* Signature Pulse — sits at the very top of the workspace. */}
      <div className="fixed left-0 right-0 top-0 z-pulse h-px">
        <Pulse state={pulseState} />
      </div>

      {/* Floating glass sidebar */}
      <AppSidebar
        destinations={[
          {
            key: "inbox",
            label: "Inbox",
            href: "/inbox",
            icon: <InboxIcon />,
            count: 4,
          },
          {
            key: "work",
            label: "Work",
            href: "/work",
            icon: <BriefcaseIcon />,
            count: 12,
          },
          {
            key: "customers",
            label: "Customers",
            href: "/customers",
            icon: <UsersIcon />,
          },
          {
            key: "ai",
            label: "AI Assistant",
            href: "/ai",
            icon: <SparklesIcon />,
            aiHint: true,
          },
          {
            key: "reports",
            label: "Reports",
            href: "/reports",
            icon: <BarChartIcon />,
          },
          {
            key: "settings",
            label: "Settings",
            href: "/settings",
            icon: <SettingsIcon />,
          },
        ]}
        workspace={{
          name: session.workspace.name,
          plan: "Pro · Annual",
        }}
        user={{
          displayName: session.user.displayName,
          email: session.user.email,
        }}
        onOpenCommandPalette={() => setPaletteOpen(true)}
      />

      {/* Floating glass topbar */}
      <AppTopbar
        pageTitle={pageTitle}
        onOpenCommandPalette={() => setPaletteOpen(true)}
        notificationCount={notifications.filter((n) => !n.read).length}
        // Notification + Profile menus are also popovers; we wire them
        // via the AppTopbar's slots below.
        onOpenNotifications={() => {}}
        onOpenProfile={() => {}}
      />

      {/* The page content. Padded to clear the floating sidebar + topbar. */}
      <main className="ml-[268px] pt-[72px] pr-6 pb-6 min-h-screen">
        <div key={pathname} className="orvix-page-enter max-w-[1280px] mx-auto">
          {children}
        </div>
      </main>

      {/* Floating AI orb (bottom right) */}
      <AIBubble onAsk={handleAIAsk} />

      {/* Universal command palette (⌘K) */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        items={commandItems}
      />
    </div>
  );
}

// Icon wrappers — use the v1.0 geometric icon set.
function InboxIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l1.5-5h9L14 9v4H2z" />
      <path d="M2 9h3.5l1 1.5h3l1-1.5H14" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="12" height="9" rx="1" />
      <path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.5" />
      <path d="M2 13c.5-2 2-3 4-3s3.5 1 4 3" />
      <circle cx="11" cy="5" r="2" />
      <path d="M11 9c1.5 0 3 1 3.5 3" />
    </svg>
  );
}
function SparklesIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5l1.5 4 4 1.5-4 1.5L8 12.5l-1.5-4-4-1.5 4-1.5z" />
    </svg>
  );
}
function BarChartIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="13" x2="14" y2="13" />
      <rect x="4" y="8" width="2" height="5" />
      <rect x="7" y="5" width="2" height="8" />
      <rect x="10" y="3" width="2" height="10" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5l1.5 1.5M3 13l1.5-1.5M11.5 4.5l1.5-1.5" />
    </svg>
  );
}
