"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import { Sparkles } from "./icons";

/**
 * Orb — ORVIX Design System v1.0.
 *
 * The persistent AI entry point. A small floating button with a
 * signature radial gradient and breathing animation.
 *
 * Variants:
 *   - "floating" — bottom-right FAB, used in the AppShell.
 *   - "inline" — small circular indicator, used inside nav items,
 *     buttons, badges, and headers.
 *   - "pulse" — "thinking" state with stronger glow + slow rotation.
 */
export interface OrbProps extends React.HTMLAttributes<HTMLButtonElement> {
  state?: "idle" | "thinking" | "speaking";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  ariaLabel?: string;
}

const sizeMap: Record<NonNullable<OrbProps["size"]>, string> = {
  sm: "h-6 w-6",
  md: "h-9 w-9",
  lg: "h-9 w-9",
};

export const Orb = React.forwardRef<HTMLButtonElement, OrbProps>(
  ({ state = "idle", size = "md", className, ariaLabel, ...props }, ref) => {
    const isThinking = state === "thinking";
    const isSpeaking = state === "speaking";
    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel ?? "Open AI Assistant"}
        data-state={state}
        className={cn(
          "orvix-ai-orb group/orb relative inline-flex items-center justify-center rounded-full",
          "transition-transform duration-default ease-out-quint active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ai focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
          sizeMap[size],
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br from-brand-accent via-brand-ai to-brand-ai/60",
            "shadow-glow-ai",
            isThinking && "animate-[orvix-orb-pulse_2s_ease-in-out_infinite]",
            isSpeaking && "animate-[orvix-orb-think_1.6s_ease-in-out_infinite]",
          )}
        />
        <span
          aria-hidden="true"
          className="orvix-ai-dot absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        />
        {size !== "sm" && (
          <Sparkles
            size={size === "lg" ? 18 : 14}
            className="relative z-1 text-white"
            aria-hidden="true"
          />
        )}
      </button>
    );
  },
);
Orb.displayName = "Orb";

/**
 * OrbInline — small dot indicator for use inside nav items,
 * buttons, and badges. Not interactive; visual cue only.
 */
export function OrbInline({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "orvix-ai-dot relative inline-flex h-1.5 w-1.5 rounded-full",
        "bg-gradient-to-br from-brand-ai to-brand-accent",
        "shadow-glow-ai",
        className,
      )}
    />
  );
}
