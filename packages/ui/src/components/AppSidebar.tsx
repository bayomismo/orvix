"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "../lib/cn";
import { OrbInline } from "./Orb";

/**
 * AppSidebar — ORVIX Design System v1.0.
 *
 * Floating glass sidebar. NOT a fixed full-height panel. Sits
 * 16px from the viewport edge, with:
 *   - Brand mark + workspace switcher
 *   - Primary navigation (7 destinations)
 *   - AI entry section
 *   - Footer (help)
 *
 * The active navigation indicator is the **v1.0 detail**:
 *   - Subtle gradient highlight on the active row
 *   - A 2px accent line on the left edge
 *   - The orb dot is also shown next to AI-themed items
 */

export interface SidebarDestination {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  /** Show the AI orb dot next to this destination. */
  aiHint?: boolean;
  /** Counter (notifications, badges). */
  count?: number;
}

export interface AppSidebarProps {
  destinations: SidebarDestination[];
  workspace: {
    name: string;
    plan?: string;
  };
  user: {
    displayName: string;
    email: string;
  };
  onOpenCommandPalette?: () => void;
  onOpenAI?: () => void;
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar({
  destinations,
  workspace,
  user,
  onOpenCommandPalette,
  onOpenAI,
}: AppSidebarProps) {
  const pathname = usePathname();
  const initials = user.displayName
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      aria-label="Primary"
      className={cn(
        // Position: floating glass
        "fixed left-3 top-3 bottom-3 z-sticky",
        "w-[240px] flex flex-col",
        "rounded-2xl",
        "border border-white/[0.06]",
        "bg-surface-elevated/85 backdrop-blur-glass",
        "shadow-3",
        "transition-transform duration-default ease-out-quint",
      )}
    >
      {/* Brand + workspace switcher */}
      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Switch workspace"
          className={cn(
            "group/ws flex w-full items-center gap-2 rounded-lg px-2.5 py-2",
            "bg-surface-elevated/40 border border-surface-divider",
            "hover:bg-surface-elevated hover:border-surface-divider-strong",
            "transition-all duration-fast ease-out-quint",
          )}
        >
          <div
            aria-hidden="true"
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
              "bg-gradient-to-br from-brand-accent via-brand-ai to-brand-ai/70",
              "shadow-glow-accent text-text-on-accent text-[11px] font-bold tracking-tight",
            )}
          >
            {workspace.name[0]?.toUpperCase() ?? "O"}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-semibold text-text-primary truncate tracking-tight">
              {workspace.name}
            </div>
            {workspace.plan && (
              <div className="text-2xs text-text-muted uppercase tracking-wider">
                {workspace.plan}
              </div>
            )}
          </div>
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-muted shrink-0 transition-transform duration-fast group-hover/ws:translate-y-0.5"
            aria-hidden="true"
          >
            <path d="M3 6l5 5 5-5" />
          </svg>
        </button>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1" aria-label="Primary">
        <ul role="list" className="flex flex-col gap-0.5">
          {destinations.map((d) => {
            const active = isActive(pathname, d.href);
            return (
              <li key={d.key}>
                <Link
                  href={d.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group/snav relative flex items-center gap-2.5 rounded-md pl-3 pr-2.5 py-2 text-sm",
                    "transition-colors duration-fast ease-out-quint",
                    active
                      ? "text-text-primary font-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
                  )}
                >
                  {/* The active indicator — gradient line on the left edge. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full",
                      "transition-all duration-default ease-out-quint",
                      active
                        ? "bg-gradient-to-b from-brand-accent to-brand-ai opacity-100"
                        : "bg-transparent opacity-0",
                    )}
                  />
                  {/* The active row background — subtle gradient. */}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-md bg-gradient-to-r from-brand-accent/15 via-brand-accent/8 to-transparent"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-1 inline-flex h-4 w-4 items-center justify-center transition-colors",
                      active
                        ? d.aiHint
                          ? "text-brand-ai"
                          : "text-brand-accent"
                        : "text-text-muted group-hover/snav:text-text-secondary",
                    )}
                  >
                    {d.icon}
                  </span>
                  <span className="relative z-1 flex-1 truncate">{d.label}</span>
                  {d.aiHint && !active && (
                    <span className="relative z-1">
                      <OrbInline />
                    </span>
                  )}
                  {d.count !== undefined && d.count > 0 && (
                    <span
                      className={cn(
                        "relative z-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5",
                        "text-[10px] font-semibold tabular-nums",
                        active
                          ? "bg-text-primary text-text-on-accent"
                          : "bg-surface-elevated text-text-secondary",
                      )}
                    >
                      {d.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* AI entry section */}
      <div className="px-3 pt-2 pb-2">
        <div className="rounded-lg border border-surface-divider bg-gradient-to-br from-brand-ai/8 via-brand-accent/4 to-transparent p-2.5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="orvix-ai-dot h-1.5 w-1.5 rounded-full bg-brand-ai" />
            <span className="text-2xs uppercase tracking-wider text-text-muted font-semibold">
              ORVIX AI
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-2">
            Ask anything about your work, customers, or reports.
          </p>
          <button
            type="button"
            onClick={onOpenAI}
            className={cn(
              "w-full inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5",
              "bg-brand-ai/15 text-brand-ai border border-brand-ai/30",
              "text-xs font-medium",
              "hover:bg-brand-ai/25 hover:border-brand-ai/50",
              "transition-all duration-fast ease-out-quint",
            )}
          >
            Open AI Assistant
            <svg
              viewBox="0 0 16 16"
              width="10"
              height="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="2" y1="8" x2="13" y2="8" />
              <polyline points="9 4 13 8 9 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer — profile chip + help */}
      <div className="px-3 pb-3 pt-1">
        <button
          type="button"
          className={cn(
            "group/user flex w-full items-center gap-2.5 rounded-md px-2 py-1.5",
            "hover:bg-white/[0.04]",
            "transition-colors duration-fast ease-out-quint",
          )}
        >
          <div
            aria-hidden="true"
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              "bg-gradient-to-br from-brand-ai to-brand-accent text-2xs font-semibold text-text-on-accent",
            )}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-medium text-text-primary truncate">
              {user.displayName}
            </div>
            <div className="text-2xs text-text-muted truncate">{user.email}</div>
          </div>
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-muted shrink-0"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M6 7a2 2 0 014 0c0 1-2 1.5-2 2.5M8 11.5h.01" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
