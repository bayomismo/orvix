import * as React from "react";

import { cn } from "../lib/cn";
import { Button } from "./Button";

/**
 * EmptyState — ORVIX Design System v1.0.
 *
 * Four shapes:
 *   - `firstTime` — full empty state with optional illustration + CTA
 *   - `cleaned`   — calm "all clear" empty state
 *   - `filtered`  — empty state with "Clear filters" CTA
 *   - `inline`    — compact for inline empty areas
 *
 * Composition law: the CTA is an action, never "Learn more".
 * Every empty state must give the user a next step.
 */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The v1.0 names. "empty" is preserved as an alias for "inline"
   * for backward compatibility with v0.3 call sites.
   */
  shape?: "firstTime" | "cleaned" | "filtered" | "inline" | "empty";
  icon?: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function EmptyState({
  shape = "firstTime",
  icon,
  title,
  description,
  ctaLabel,
  onCta,
  secondaryLabel,
  onSecondary,
  className,
  ...props
}: EmptyStateProps) {
  // "empty" was the v0.3 alias for the compact inline shape.
  if (shape === "inline" || shape === "empty") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center gap-1.5 px-2 py-6",
          className,
        )}
        {...props}
      >
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description ? (
          <p className="text-xs text-text-secondary max-w-sm">{description}</p>
        ) : null}
      </div>
    );
  }

  const isFiltered = shape === "filtered";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-4",
        "rounded-md border border-dashed border-surface-divider bg-surface-canvas/50 p-10",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-elevated border border-surface-divider text-text-muted shadow-1"
        >
          {icon}
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h3>
        {description ? (
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        ) : null}
      </div>
      {(ctaLabel && onCta) || (secondaryLabel && onSecondary) ? (
        <div className="flex items-center gap-2">
          {ctaLabel && onCta ? (
            <Button variant={isFiltered ? "secondary" : "primary"} onClick={onCta}>
              {ctaLabel}
            </Button>
          ) : null}
          {secondaryLabel && onSecondary ? (
            <Button variant="ghost" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
