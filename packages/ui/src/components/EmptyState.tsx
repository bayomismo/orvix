import * as React from "react";

import { cn } from "../lib/cn";
import { Button } from "./Button";

/**
 * EmptyState — Phase 0.
 *
 * Three shapes per PRD §08 §10:
 *   - `firstTime` (with illustration placeholder, inviting tone)
 *   - `cleaned` (plain "All clear")
 *   - `filtered` (with "Clear filters" CTA)
 *   - `empty` (compact — for inline empty areas like a comment list)
 *
 * Composition law: the CTA is an action, never "Learn more".
 */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: "firstTime" | "cleaned" | "filtered" | "empty";
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
  if (shape === "empty") {
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
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-4",
        "rounded-lg border border-dashed border-surface-divider bg-surface-canvas/50 p-10",
        className,
      )}
      {...props}
    >
      {shape === "firstTime" ? (
        icon ?? (
          <div
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated border border-surface-divider text-text-muted shadow-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        )
      ) : null}
      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        ) : null}
      </div>
      {(ctaLabel && onCta) || (secondaryLabel && onSecondary) ? (
        <div className="flex items-center gap-2">
          {ctaLabel && onCta ? (
            <Button variant={shape === "filtered" ? "secondary" : "primary"} onClick={onCta}>
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
