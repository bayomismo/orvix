"use client";

import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Pulse — ORVIX Design System v1.0.
 *
 * The signature 1px status line that sits at the top of every
 * workspace. Six states (idle, syncing, ai, action, warning, error).
 *
 * The most distinctive moment is the **Action Pulse** — a line that
 * travels from a button to the right edge after a successful
 * action. To trigger it, call `pulse("action")` and the Pulse will
 * run its 400ms exit animation, then return to idle.
 *
 * Usage:
 *   - <Pulse /> — passive, mounts with `data-state="idle"`
 *   - <Pulse state="syncing" /> — controlled state
 *   - usePulse() hook — imperative: `pulse("action")` to fire and
 *     reset, or `setState("syncing")` to hold a state.
 */
export type PulseState = "idle" | "syncing" | "ai" | "action" | "warning" | "error";

export interface PulseProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: PulseState;
  /** Render a thicker variant (2px) for emphasis. */
  thick?: boolean;
}

export const Pulse = React.forwardRef<HTMLDivElement, PulseProps>(
  ({ className, state = "idle", thick, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label="Workspace status"
      data-state={state}
      className={cn("orvix-pulse", thick && "orvix-pulse--thick", className)}
      {...props}
    />
  ),
);
Pulse.displayName = "Pulse";

/**
 * usePulse — imperative control over a Pulse instance.
 *
 * Returns an object with `pulse(state, durationMs?)` for one-shot
 * actions and `setState(state)` for held states.
 */
export function usePulse() {
  const [state, setState] = React.useState<PulseState>("idle");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const pulse = React.useCallback((next: PulseState, durationMs = 800) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setState(next);
    if (next === "action" || next === "warning" || next === "error") {
      timerRef.current = setTimeout(() => setState("idle"), durationMs);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { state, pulse, setState } as const;
}
