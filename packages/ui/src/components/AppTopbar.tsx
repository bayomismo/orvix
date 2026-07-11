"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import { Bell, Search, Sparkles } from "./icons";

/**
 * AppTopbar — ORVIX Design System v1.0.
 *
 * Floating glass top bar. Sits to the right of the floating
 * sidebar. Hosts the universal search trigger (opens the command
 * palette), breadcrumbs slot, notifications, and profile menu.
 */
export interface AppTopbarProps {
  /** Trigger that opens the universal command palette. */
  onOpenCommandPalette?: () => void;
  /** Trigger that opens the notification center. */
  onOpenNotifications?: () => void;
  /** Number of unread notifications; renders a dot if > 0. */
  notificationCount?: number;
  /** Profile menu trigger. */
  onOpenProfile?: () => void;
  /** Page title (used in the breadcrumb area). */
  pageTitle?: string;
  /** Extra items rendered right-of-center, e.g. tabs, save status. */
  children?: React.ReactNode;
}

export function AppTopbar({
  onOpenCommandPalette,
  onOpenNotifications,
  notificationCount = 0,
  onOpenProfile,
  pageTitle,
  children,
}: AppTopbarProps) {
  return (
    <div
      className={cn(
        // Floating glass, sits to the right of the sidebar.
        "fixed right-3 top-3 z-sticky",
        "left-[268px]", // sidebar width 240 + gap 12*2 + 4
        "h-9 flex items-center gap-3",
        "rounded-xl border border-white/[0.06]",
        "bg-surface-elevated/85 backdrop-blur-glass",
        "shadow-2",
        "px-3",
      )}
    >
      {/* Left side — page title + extra */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {pageTitle && (
          <div className="text-sm font-medium text-text-primary tracking-tight truncate">
            {pageTitle}
          </div>
        )}
        {children}
      </div>

      {/* Center — universal search trigger */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        aria-label="Open command palette"
        className={cn(
          "group/search flex items-center gap-2 h-8 w-72 max-w-[36vw]",
          "rounded-md border border-surface-divider bg-surface-elevated/50",
          "px-2.5 text-xs text-text-muted",
          "hover:border-surface-divider-strong hover:bg-surface-elevated hover:text-text-secondary",
          "transition-all duration-fast ease-out-quint",
        )}
      >
        <Search size={13} aria-hidden="true" className="shrink-0" />
        <span className="flex-1 text-left truncate">Search or ask ORVIX…</span>
        <span className="inline-flex items-center gap-0.5">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      {/* Right side — actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Ask ORVIX"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5",
            "border border-brand-ai/30 bg-brand-ai/10",
            "text-xs font-medium text-brand-ai",
            "hover:bg-brand-ai/20 hover:border-brand-ai/50",
            "transition-all duration-fast ease-out-quint",
          )}
        >
          <Sparkles size={12} aria-hidden="true" />
          <span>Ask AI</span>
        </button>

        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={
            notificationCount > 0
              ? `Notifications (${notificationCount} unread)`
              : "Notifications"
          }
          className={cn(
            "relative inline-flex h-8 w-8 items-center justify-center rounded-md",
            "text-text-secondary hover:text-text-primary hover:bg-white/[0.06]",
            "transition-colors duration-fast ease-out-quint",
          )}
        >
          <Bell size={14} aria-hidden="true" />
          {notificationCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-accent shadow-glow-accent"
            />
          )}
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Open profile menu"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full",
            "bg-gradient-to-br from-brand-ai to-brand-accent text-2xs font-semibold text-text-on-accent",
            "ring-1 ring-white/10 hover:ring-white/20",
            "transition-all duration-fast ease-out-quint",
          )}
        >
          <ProfileAvatar />
        </button>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-surface-divider bg-surface-canvas/60 px-1 font-mono text-[10px] text-text-secondary">
      {children}
    </kbd>
  );
}

function ProfileAvatar() {
  // Renders initials "OR" or a glyph; we don't know the user here.
  return <span className="text-[10px]">OR</span>;
}
