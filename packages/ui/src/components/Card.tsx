import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Card — Phase 0.
 *
 * Three elevations via `elevation` prop:
 *   - "flat"  (default) — bordered, no shadow
 *   - "raised"           — bordered, subtle shadow
 *   - "floating"         — shadow, no border
 *
 * Composition law: no nested Cards. If you need a card inside a card,
 * restructure — the design language reads as noise otherwise.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "flat" | "raised" | "floating" | "ghost";
  /** Add a hover lift. Use on interactive cards only. */
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation = "flat", interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg bg-surface-elevated transition-all duration-fast ease-snappy",
        elevation === "flat" && "border border-surface-divider",
        elevation === "raised" && "border border-surface-divider shadow-1",
        elevation === "floating" && "shadow-2",
        elevation === "ghost" && "border border-dashed border-surface-divider bg-surface-canvas",
        interactive && "hover:-translate-y-px hover:border-surface-divider-strong hover:shadow-2",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-5 py-4 border-b border-surface-divider", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
));
CardBody.displayName = "CardBody";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-5 py-3.5 border-t border-surface-divider", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
