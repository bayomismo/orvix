"use client";

import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Sidebar — ORVIX Design System v1.0.
 *
 * Phase 0 component; replaced by the floating glass sidebar in M3
 * (AppShell). This is a v1.0-token refresh so the existing routes
 * keep compiling during the M2 → M3 transition.
 */
export interface SidebarDestination {
  key: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  destinations: readonly SidebarDestination[];
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
                    "transition-colors duration-fast ease-out-quint",
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
