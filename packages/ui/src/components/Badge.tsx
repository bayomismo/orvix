import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * Badge — categorical chip.
 *
 * Tone = meaning, not decoration. "ai" is reserved for AI involvement
 * (per PRD §07). Status tones use soft surface + colored text + matching
 * border for at-a-glance legibility on both light and dark.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral:
          "bg-status-neutral-soft text-text-secondary border border-status-neutral-soft",
        success:
          "bg-status-success-soft text-status-success border border-status-success/20",
        warning:
          "bg-status-warning-soft text-status-warning border border-status-warning/20",
        danger:
          "bg-status-danger-soft text-status-danger border border-status-danger/20",
        info: "bg-status-info-soft text-status-info border border-status-info/20",
        accent:
          "bg-brand-accent-soft text-brand-accent border border-brand-accent/20",
        ai: "bg-brand-ai-soft text-brand-ai border border-brand-ai/20",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0",
        md: "text-2xs px-2 py-0.5",
        lg: "text-xs px-2.5 py-0.5",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  /** Render a small dot before the label (status indicator). */
  dot?: boolean;
}

export function Badge({ className, tone, size, icon, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "success" && "bg-status-success",
            tone === "warning" && "bg-status-warning",
            tone === "danger" && "bg-status-danger",
            tone === "info" && "bg-status-info",
            tone === "accent" && "bg-brand-accent",
            tone === "ai" && "bg-brand-ai",
            tone === "neutral" && "bg-text-muted",
          )}
        />
      ) : null}
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
}
