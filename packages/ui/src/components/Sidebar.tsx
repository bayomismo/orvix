"use client";

import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Sidebar — Phase 0 stable navigation shell.
 *
 * Per PRD §04 §3 (v0.2 reversal): the sidebar shows the *same 7*
 * destinations, in the *same order*, every session. Smart nav lives
 * in ⌘K, not here.
 *
 * Phase 0 accepts a list of destinations and renders them as
 * straightforward links. Phase 1 adds the active-state highlight,
 * keyboard navigation, and persisted collapsed-state.
 */
export interface SidebarDestination {
  key: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  /** v0.2: optional badge for unread / pending. */
  badge?: number | string;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  destinations: readonly SidebarDestination[];
  /** Active route key — used for aria-current and visual highlight. */
  activeKey?: string;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ destinations, activeKey, className, ...props }, ref) => (
    <aside
      ref={ref}
      aria-label="Primary"
      className={cn(
        "flex flex-col gap-1 p-3 border-r border-surface-divider bg-surface-canvas",
        "w-60 min-h-screen",
        className,
      )}
      {...props}
    >
      <div className="px-2 py-3 text-xs uppercase tracking-wider text-text-muted">
        ORVIX
      </div>
      <nav>
        <ul role="list" className="flex flex-col gap-0.5">
          {destinations.map((d) => {
            const isActive = d.key === activeKey;
            return (
              <li key={d.key}>
                <a
                  href={d.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 rounded-sm text-sm",
                    "transition-colors duration-fast ease-snappy",
                    isActive
                      ? "bg-surface-elevated text-text-primary"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
                  )}
                >
                  {d.icon && <span aria-hidden="true">{d.icon}</span>}
                  <span className="flex-1 truncate">{d.label}</span>
                  {d.badge !== undefined && (
                    <span className="text-2xs text-text-muted">{d.badge}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  ),
);
Sidebar.displayName = "Sidebar";
