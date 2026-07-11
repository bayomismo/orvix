"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../lib/cn";
import { ChevronRight } from "./icons";

/**
 * Navigation — ORVIX Design System v1.0.
 *
 * Three components:
 *   - Breadcrumb: inline, ellipsis after the 3rd level
 *   - Tabs: underline style, animated indicator (Radix-based)
 *   - Pagination: "Page X of Y" + prev/next
 */

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: ReadonlyArray<{ label: string; href?: string }>;
  /** Max segments before the middle is collapsed. Default 3. */
  maxSegments?: number;
}

export function Breadcrumb({ items, maxSegments = 3, className, ...props }: BreadcrumbProps) {
  const showEllipsis = items.length > maxSegments;
  const visible = showEllipsis
    ? [items[0]!, ...items.slice(items.length - (maxSegments - 1))]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5 min-w-0">
        {visible.map((item, i) => {
          const isLast = i === visible.length - 1;
          const showEllipsisHere = showEllipsis && i === 1;
          return (
            <React.Fragment key={`${item.label}-${i}`}>
              {i > 0 && !showEllipsisHere ? (
                <ChevronRight
                  size={12}
                  className="text-text-muted shrink-0"
                  aria-hidden="true"
                />
              ) : null}
              {showEllipsisHere ? (
                <>
                  <li className="text-text-muted" aria-hidden="true">…</li>
                  <ChevronRight
                    size={12}
                    className="text-text-muted shrink-0"
                    aria-hidden="true"
                  />
                </>
              ) : null}
              <li className="min-w-0">
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-fast ease-out-quint truncate"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(
                      "truncate",
                      isLast ? "text-text-primary font-medium" : "text-text-secondary",
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Tabs — underline style with animated indicator.
 * Token colors only.
 */
export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1 border-b border-surface-divider",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium",
      "text-text-secondary hover:text-text-primary",
      "transition-colors duration-fast ease-out-quint",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas rounded-xs",
      "data-[state=active]:text-text-primary",
      // The animated underline indicator.
      "after:absolute after:left-2 after:right-2 after:bottom-[-1px] after:h-px after:bg-brand-accent after:scale-x-0 after:origin-center after:transition-transform after:duration-default after:ease-out-quint",
      "data-[state=active]:after:scale-x-100",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas rounded-md",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/**
 * Pagination — "Page X of Y" + prev/next. No giant page-number grid.
 */
export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Visible label, e.g. "10 of 124". Default "Page X of Y". */
  formatLabel?: (page: number, totalPages: number) => string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  formatLabel,
}: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const label = formatLabel
    ? formatLabel(page, totalPages)
    : `Page ${page} of ${totalPages}`;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-between gap-2", className)}
    >
      <span className="text-xs text-text-secondary orvix-numeric">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className={cn(
            "inline-flex h-7 px-2.5 items-center gap-1 rounded-sm text-xs font-medium",
            "text-text-secondary hover:text-text-primary hover:bg-surface-inset",
            "transition-colors duration-fast ease-out-quint",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className={cn(
            "inline-flex h-7 px-2.5 items-center gap-1 rounded-sm text-xs font-medium",
            "text-text-secondary hover:text-text-primary hover:bg-surface-inset",
            "transition-colors duration-fast ease-out-quint",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
