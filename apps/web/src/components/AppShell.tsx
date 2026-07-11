"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@orvix/ui/lib/cn";

/**
 * AppShell — Phase 0 chrome.
 *
 * Layout:
 *   - Fixed left sidebar (collapsed icon rail, expand on hover)
 *   - Top bar with workspace switcher + global search + user
 *   - Main content area with breadcrumbs
 *
 * v0.2: the 7 destinations, in the canonical order.
 */

const DESTINATIONS = [
  { key: "inbox",      label: "Inbox",     href: "/inbox",      icon: "M3 8l9 6 9-6 M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8" },
  { key: "work",       label: "Work",      href: "/work",       icon: "M3 7l9-4 9 4-9 4v10l-9 4-9-4V7z" },
  { key: "customers",  label: "Customers", href: "/customers",  icon: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { key: "ai",         label: "AI",        href: "/ai",         icon: "M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4z M5 12a7 7 0 0114 0v3a3 3 0 01-3 3H8a3 3 0 01-3-3v-3z" },
  { key: "reports",    label: "Reports",   href: "/reports",    icon: "M3 3h18v18H3z M3 9h18 M9 21V9" },
  { key: "settings",   label: "Settings",  href: "/settings",   icon: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h.1a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v.1a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" },
  { key: "admin",      label: "Admin",     href: "/admin",      icon: "M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" },
] as const;

interface PhaseZeroSession {
  user: { id: string; displayName: string; email: string };
  workspace: { id: string; slug: string; name: string };
  workspaceId: string;
  primaryRole: "owner" | "admin" | "operator" | "member" | "viewer" | "ai_assistant";
  density: "comfortable" | "dense";
  theme: "system" | "light" | "dark";
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({
  session,
  children,
}: {
  session: PhaseZeroSession;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const initials = session.user.displayName
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex min-h-screen w-full bg-surface-canvas">
      <Sidebar pathname={pathname} />
      <div className="flex flex-1 min-w-0 flex-col">
        <Topbar session={session} initials={initials} />
        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-[1280px] px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string | null }) {
  return (
    <aside
      aria-label="Primary"
      className="sticky top-0 flex h-screen w-[224px] shrink-0 flex-col border-r border-surface-divider bg-surface-canvas"
    >
      <div className="flex h-14 items-center gap-2 border-b border-surface-divider px-4">
        <div
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-md bg-text-primary text-text-on-accent text-xs font-bold tracking-tight"
        >
          O
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-text-primary">
            ORVIX
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul role="list" className="flex flex-col gap-0.5">
          {DESTINATIONS.map((d) => {
            const active = isActive(pathname, d.href);
            return (
              <li key={d.key}>
                <Link
                  href={d.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group/snav flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm",
                    "transition-colors duration-fast ease-snappy",
                    active
                      ? "bg-surface-elevated text-text-primary font-medium shadow-1"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={cn(
                      "shrink-0",
                      active ? "text-brand-accent" : "text-text-muted group-hover/snav:text-text-secondary",
                    )}
                  >
                    <path d={d.icon} />
                  </svg>
                  <span className="truncate">{d.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-surface-divider p-3">
        <Link
          href="/onboarding"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
          <span>Help & shortcuts</span>
        </Link>
      </div>
    </aside>
  );
}

function Topbar({
  session,
  initials,
}: {
  session: PhaseZeroSession;
  initials: string;
}) {
  return (
    <div className="sticky top-0 z-sticky flex h-14 items-center justify-between border-b border-surface-divider bg-surface-canvas/85 px-8 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          className="group/team flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-elevated"
        >
          <span
            aria-hidden="true"
            className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-gradient-to-br from-brand-accent to-brand-ai text-[10px] font-bold text-text-on-accent"
          >
            {session.workspace.name[0]}
          </span>
          <span className="tracking-tight">{session.workspace.name}</span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="group/search flex items-center gap-2 rounded-md border border-surface-divider bg-surface-elevated px-2.5 py-1.5 text-xs text-text-muted transition-all hover:border-surface-divider-strong hover:bg-surface-raised"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span>Search</span>
          <span className="ml-1 hidden rounded border border-surface-divider bg-surface-canvas px-1 py-0 font-mono text-[10px] text-text-muted sm:inline-block">
            ⌘K
          </span>
        </button>
        <div
          aria-hidden="true"
          className="mx-1 h-5 w-px bg-surface-divider"
        />
        <button
          type="button"
          className="flex items-center gap-2 rounded-md p-0.5 transition-colors hover:bg-surface-elevated"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-ai to-brand-accent text-2xs font-semibold text-text-on-accent">
            {initials}
          </span>
        </button>
      </div>
    </div>
  );
}
