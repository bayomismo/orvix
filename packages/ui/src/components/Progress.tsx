"use client";

import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Stepper — 4-step onboarding progress bar.
 *
 * Layout:
 *   - `current` step is solid; future steps are muted; completed steps
 *     show a check.
 *   - Connecting lines fill in as the user progresses.
 *   - All driven by tokens, no hardcoded colors.
 */
export interface StepperProps {
  steps: readonly { key: string; label: string }[];
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol
      className={cn("flex w-full items-center gap-2", className)}
      aria-label="Onboarding progress"
    >
      {steps.map((s, i) => {
        const state =
          i < current ? "done" : i === current ? "current" : "future";
        return (
          <React.Fragment key={s.key}>
            <li className="flex shrink-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                  "transition-colors duration-base ease-snappy",
                  state === "done" &&
                    "bg-brand-accent text-text-on-accent",
                  state === "current" &&
                    "border border-brand-accent bg-brand-accent/10 text-brand-accent",
                  state === "future" &&
                    "border border-surface-divider bg-surface-canvas text-text-muted",
                )}
              >
                {state === "done" ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "text-sm font-medium tracking-tight",
                  "transition-colors duration-base ease-snappy",
                  state === "future" ? "text-text-muted" : "text-text-primary",
                )}
              >
                {s.label}
              </span>
            </li>
            {i < steps.length - 1 ? (
              <li
                aria-hidden="true"
                className={cn(
                  "h-px flex-1 transition-colors duration-base ease-snappy",
                  i < current ? "bg-brand-accent" : "bg-surface-divider",
                )}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
