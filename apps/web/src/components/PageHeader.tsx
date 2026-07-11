import * as React from "react";

/**
 * PageHeader — v0.3.
 *
 * Tiered type system:
 *   - Display title (display-md, semibold, tight tracking)
 *   - Optional kicker (eyebrow, label-xs, muted, uppercase)
 *   - Optional subtitle (body-md, secondary)
 *   - Optional actions / metadata on the right
 */
export interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  /** Compact mode for sub-pages and detail pages. */
  compact?: boolean;
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  metadata,
  actions,
  compact,
}: PageHeaderProps) {
  return (
    <header
      className={
        "flex flex-col gap-1.5 " +
        (compact ? "mb-5" : "mb-7")
      }
    >
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          {kicker ? (
            <div className="mb-1 text-2xs font-medium uppercase tracking-[0.08em] text-text-muted">
              {kicker}
            </div>
          ) : null}
          <h1
            className={
              "font-display font-semibold tracking-tight text-text-primary text-balance " +
              (compact ? "text-2xl" : "text-3xl")
            }
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-base text-text-secondary leading-relaxed text-balance">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {metadata ? <div className="flex items-center gap-2 text-xs text-text-muted">{metadata}</div> : null}
    </header>
  );
}
