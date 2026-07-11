"use client";

import * as React from "react";
import { cn } from "../lib/cn";

/**
 * OptionCard — a card-shaped, keyboard-friendly radio for "pick one of N".
 * Used in the onboarding wizard for industry / size / structure / goal.
 *
 * Behavior:
 *   - Native radio input under the hood; visible button-like card on top.
 *   - Enter / Space toggle via the underlying input.
 *   - Selection animation: 150ms border + bg shift.
 */
export interface OptionCardProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export const OptionCard = React.forwardRef<HTMLInputElement, OptionCardProps>(
  ({ className, label, description, icon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "group/option relative flex cursor-pointer items-start gap-3 rounded-lg border p-3.5",
          "border-surface-divider bg-surface-raised",
          "transition-all duration-fast ease-snappy",
          "hover:border-surface-divider-strong hover:bg-surface-inset",
          "has-[:checked]:border-brand-accent has-[:checked]:bg-brand-accent-soft",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-canvas",
          className,
        )}
      >
        <input ref={ref} id={inputId} type="radio" className="peer sr-only" {...props} />
        {icon ? (
          <div
            aria-hidden="true"
            className={cn(
              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              "bg-surface-inset text-text-secondary",
              "transition-colors duration-fast ease-snappy",
              "group-has-[:checked]/option:bg-surface-elevated group-has-[:checked]/option:text-brand-accent group-has-[:checked]/option:shadow-1",
            )}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-text-primary tracking-tight">
            {label}
          </div>
          {description ? (
            <div className="mt-0.5 text-xs text-text-secondary leading-relaxed">
              {description}
            </div>
          ) : null}
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
            "border-surface-divider-strong bg-surface-raised",
            "transition-all duration-fast ease-snappy",
            "group-has-[:checked]/option:border-brand-accent group-has-[:checked]/option:bg-brand-accent",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-text-on-accent transition-transform duration-fast ease-snappy",
              "scale-0 group-has-[:checked]/option:scale-100",
            )}
          />
        </div>
      </label>
    );
  },
);
OptionCard.displayName = "OptionCard";
