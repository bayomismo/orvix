"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import Link from "next/link";

import { cn } from "../lib/cn";
import { Settings, LogOut, Users, Bell } from "./icons";

/**
 * ProfileMenu — ORVIX Design System v1.0.
 *
 * Anchored to the avatar in the AppTopbar. Shows:
 *   - User identity (name, email, role)
 *   - Quick links (Settings, Notifications)
 *   - Workspace switcher hint
 *   - Sign out
 */
export interface ProfileMenuProps {
  user: { displayName: string; email: string; role?: string };
  onSignOut?: () => void;
}

export function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
  const initials = user.displayName
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Open profile menu"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full",
            "bg-gradient-to-br from-brand-ai to-brand-accent text-2xs font-semibold text-text-on-accent",
            "ring-1 ring-white/10 hover:ring-white/20",
            "transition-all duration-fast ease-out-quint",
          )}
        >
          {initials}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-popover w-[280px]",
            "orvix-glass rounded-xl border border-white/[0.08]",
            "shadow-4 p-2",
            "data-[state=open]:animate-[orvix-pop-in_180ms_var(--motion-ease-out-quint)]",
          )}
        >
          <div className="flex items-center gap-3 px-2 py-2.5">
            <div
              aria-hidden="true"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                "bg-gradient-to-br from-brand-ai to-brand-accent text-xs font-semibold text-text-on-accent",
              )}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-text-primary truncate">
                {user.displayName}
              </div>
              <div className="text-2xs text-text-muted truncate">{user.email}</div>
              {user.role && (
                <div className="text-2xs text-text-secondary capitalize mt-0.5">
                  {user.role}
                </div>
              )}
            </div>
          </div>
          <div className="h-px bg-surface-divider my-1" />
          <MenuItemLink href="/settings" icon={<Settings size={13} />}>
            Settings
          </MenuItemLink>
          <MenuItemLink href="/settings/notifications" icon={<Bell size={13} />}>
            Notifications
          </MenuItemLink>
          <MenuItemLink href="/settings/team" icon={<Users size={13} />}>
            Team
          </MenuItemLink>
          <div className="h-px bg-surface-divider my-1" />
          <button
            type="button"
            onClick={onSignOut}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5",
              "text-sm text-text-secondary hover:text-status-danger hover:bg-status-danger/10",
              "transition-colors duration-fast ease-out-quint",
            )}
          >
            <LogOut size={13} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function MenuItemLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5",
        "text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06]",
        "transition-colors duration-fast ease-out-quint",
      )}
    >
      <span aria-hidden="true" className="text-text-muted">
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}
