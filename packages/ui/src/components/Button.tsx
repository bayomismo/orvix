"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * Button — Phase 0 surface. Six variants, four sizes.
 *
 * Variants: `primary` / `secondary` / `ghost` / `destructive` / `link` / `ai`
 * Sizes:   `xs` / `sm` / `md` / `lg` / `icon`
 *
 * Composition laws (per PRD §07 §9):
 *   - Token-derived only; no hex values in feature code.
 *   - One icon + one label, or icon-only with `aria-label`.
 *   - `asChild` prop forwards to Radix Slot.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium",
    "transition-all duration-fast ease-snappy",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.985]",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-brand-accent text-text-on-accent hover:bg-brand-accent-hover shadow-1 hover:shadow-2 rounded-md",
        secondary:
          "bg-surface-elevated text-text-primary border border-surface-divider hover:bg-surface-inset hover:border-surface-divider-strong rounded-md",
        ghost:
          "bg-transparent text-text-primary hover:bg-surface-inset rounded-md",
        destructive:
          "bg-status-danger text-text-on-accent hover:bg-status-danger/90 shadow-1 rounded-md",
        link:
          "bg-transparent text-brand-accent underline-offset-4 hover:underline rounded-xs px-0 h-auto",
        ai:
          "bg-brand-ai text-text-on-accent hover:bg-brand-ai/90 shadow-1 hover:shadow-2 rounded-md",
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
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
