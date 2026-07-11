"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * Button — ORVIX Design System v1.0.
 *
 * Five variants (primary, secondary, ghost, destructive, ai) plus
 * link. Five sizes (xs, sm, md, lg, icon). All states (default,
 * hover, focus, active, disabled, loading) are token-driven.
 *
 * Composition laws:
 *   - One icon + one label, or icon-only with `aria-label`.
 *   - Loading replaces the label with three dots; never a spinner.
 *   - Token colors only; hex literals are forbidden by ESLint.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium",
    "select-none",
    "transition-all duration-fast ease-out-quint",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-brand-accent text-text-on-accent shadow-1 hover:shadow-glow-accent rounded-md",
        secondary:
          "bg-surface-elevated text-text-primary border border-surface-divider hover:border-surface-divider-strong rounded-md",
        ghost:
          "bg-transparent text-text-primary hover:bg-surface-inset rounded-md",
        destructive:
          "bg-status-danger text-text-on-accent shadow-1 hover:shadow-2 rounded-md",
        link:
          "bg-transparent text-brand-accent underline-offset-4 hover:underline rounded-xs px-0 h-auto",
        ai:
          "bg-brand-ai text-text-on-accent shadow-1 hover:shadow-glow-ai rounded-md",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-5 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Three animated dots replace the label when true. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), loading && "cursor-wait", className)}
        disabled={disabled ?? loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span aria-hidden="true" className="inline-flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-current opacity-70 animate-pulse [animation-delay:0ms]" />
            <span className="h-1 w-1 rounded-full bg-current opacity-70 animate-pulse [animation-delay:120ms]" />
            <span className="h-1 w-1 rounded-full bg-current opacity-70 animate-pulse [animation-delay:240ms]" />
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
