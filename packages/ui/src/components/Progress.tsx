"use client";

import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Stepper — ORVIX Design System v1.0.
 *
 * Used in onboarding and other multi-step flows. Token colors,
 * out-quint easing, accessible.
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
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold orvix-numeric",
                  "transition-colors duration-default ease-out-quint",
                  state === "done" && "bg-brand-accent text-text-on-accent",
                  state === "current" && "border border-brand-accent bg-brand-accent/10 text-brand-accent",
                  state === "future" && "border border-surface-divider bg-surface-canvas text-text-muted",
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
                  "transition-colors duration-default ease-out-quint",
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
                  "h-px flex-1 transition-colors duration-default ease-out-quint",
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
