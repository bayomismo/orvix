import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Card — ORVIX Design System v1.0.
 *
 * Four elevations (ghost, flat, raised, floating). Token colors
 * only. `interactive` adds the hover lift; reserved for actionable
 * cards.
 *
 * Composition law: no nested Cards. Restructure if you need a card
 * inside a card — the design language reads as noise otherwise.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "ghost" | "flat" | "raised" | "floating";
  interactive?: boolean;
  /** Use the glass surface treatment. */
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation = "flat", interactive, glass, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-md bg-surface-elevated transition-all duration-fast ease-out-quint",
        elevation === "ghost" && "border border-dashed border-surface-divider bg-surface-canvas",
        elevation === "flat" && "border border-surface-divider",
        elevation === "raised" && "border border-surface-divider shadow-1",
        elevation === "floating" && "shadow-2",
        interactive && "hover:-translate-y-px hover:border-surface-divider-strong hover:shadow-2",
        glass && "orvix-glass",
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

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-md font-semibold tracking-tight text-text-primary", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-secondary leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";
