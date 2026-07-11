"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "../lib/cn";
import { Bell, Check } from "./icons";

/**
 * NotificationCenter — ORVIX Design System v1.0.
 *
 * Triggered from the AppTopbar's bell. Floats down as a glass
 * panel anchored to the trigger.
 */
export type NotificationTone = "info" | "success" | "warning" | "ai";

export interface Notification {
  id: string;
  title: string;
  body?: string;
  tone?: NotificationTone;
  /** When this was emitted; rendered as a relative time. */
  at: string;
  read?: boolean;
  href?: string;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAllRead?: () => void;
  onOpen?: (id: string) => void;
}

const toneDotClass: Record<NotificationTone, string> = {
  info: "bg-brand-accent",
  success: "bg-status-success",
  warning: "bg-status-warning",
  ai: "bg-brand-ai shadow-glow-ai",
};

export function NotificationCenter({
  notifications,
  onMarkAllRead,
  onOpen,
}: NotificationCenterProps) {
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={
            unread > 0 ? `Notifications (${unread} unread)` : "Notifications"
          }
          className={cn(
            "relative inline-flex h-8 w-8 items-center justify-center rounded-md",
            "text-text-secondary hover:text-text-primary hover:bg-white/[0.06]",
            "transition-colors duration-fast ease-out-quint",
          )}
        >
          <Bell size={14} aria-hidden="true" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-accent shadow-glow-accent"
            />
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-popover w-[380px]",
            "orvix-glass rounded-xl border border-white/[0.08]",
            "shadow-4",
            "data-[state=open]:animate-[orvix-pop-in_180ms_var(--motion-ease-out-quint)]",
          )}
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-surface-divider">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
              <p className="text-2xs text-text-muted mt-0.5">
                {unread > 0 ? `${unread} unread` : "All caught up"}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="inline-flex items-center gap-1 text-2xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <Check size={11} aria-hidden="true" />
                Mark all read
              </button>
            )}
          </header>
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-text-muted">
                Nothing here. Quiet is good.
              </div>
            ) : (
              <ul role="list" className="divide-y divide-surface-divider">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onOpen?.(n.id)}
                      className={cn(
                        "group flex w-full items-start gap-3 px-4 py-3 text-left",
                        "hover:bg-white/[0.04]",
                        "transition-colors duration-fast ease-out-quint",
                        !n.read && "bg-brand-accent/[0.04]",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-1 h-2 w-2 shrink-0 rounded-full",
                          toneDotClass[n.tone ?? "info"],
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="text-2xs uppercase tracking-wider text-brand-accent font-semibold">
                              new
                            </span>
                          )}
                        </div>
                        {n.body && (
                          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-0.5">
                            {n.body}
                          </p>
                        )}
                        <p className="text-2xs text-text-muted mt-1">{n.at}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
