"use client";

import * as React from "react";
import { cn } from "../lib/cn";

/**
 * OptionCard — ORVIX Design System v1.0.
 *
 * Card-shaped radio button. Native input under the hood, custom
 * chrome. Selected state has accent border + soft bg + filled check.
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
          "group/option relative flex cursor-pointer items-start gap-3 rounded-md border p-3.5",
          "border-surface-divider bg-surface-raised",
          "transition-all duration-fast ease-out-quint",
          "hover:border-surface-divider-strong hover:bg-surface-inset",
          "has-[:checked]:border-brand-accent has-[:checked]:bg-highlight-1",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-canvas",
          className,
        )}
      >
        <input ref={ref} id={inputId} type="radio" className="peer sr-only" {...props} />
        {icon ? (
          <div
            aria-hidden="true"
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
              "bg-surface-inset text-text-secondary",
              "transition-colors duration-fast ease-out-quint",
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
            "transition-all duration-fast ease-out-quint",
            "group-has-[:checked]/option:border-brand-accent group-has-[:checked]/option:bg-brand-accent",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-text-on-accent transition-transform duration-fast ease-out-quint",
              "scale-0 group-has-[:checked]/option:scale-100",
            )}
          />
        </div>
      </label>
    );
  },
);
OptionCard.displayName = "OptionCard";

/**
 * Switch — ORVIX Design System v1.0.
 *
 * Pill switch with a 160ms spring transition. Uses `data-state`
 * for Radix compatibility, but is implemented natively to avoid
 * pulling in @radix-ui/react-switch for one component.
 */
export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md";
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      label,
      description,
      disabled,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : uncontrolledChecked;

    const dims =
      size === "sm"
        ? { track: "h-4 w-7", thumb: "h-3 w-3", translate: "translate-x-3" }
        : { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" };

    const id = React.useId();
    const content = (
      <>
        <span
          data-state={checked ? "checked" : "unchecked"}
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={description ? `${id}-desc` : undefined}
          ref={ref}
          tabIndex={disabled ? -1 : 0}
          onClick={(e) => {
            if (disabled) return;
            e.preventDefault();
            const next = !checked;
            if (!isControlled) setUncontrolledChecked(next);
            onCheckedChange?.(next);
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              const next = !checked;
              if (!isControlled) setUncontrolledChecked(next);
              onCheckedChange?.(next);
            }
          }}
          className={cn(
            "relative inline-flex shrink-0 cursor-pointer items-center rounded-full",
            "transition-colors duration-fast ease-out-quint",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
            "disabled:pointer-events-none disabled:opacity-40",
            dims.track,
            checked ? "bg-brand-accent" : "bg-surface-elevated border border-surface-divider-strong",
            className,
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full bg-text-on-accent shadow-1",
              "transition-transform duration-fast ease-out-quint",
              dims.thumb,
              checked ? dims.translate : "translate-x-0",
            )}
          />
        </span>
        {(label || description) && (
          <span className="flex flex-col gap-0.5 min-w-0">
            {label ? (
              <span id={`${id}-label`} className="text-sm text-text-primary leading-tight">
                {label}
              </span>
            ) : null}
            {description ? (
              <span id={`${id}-desc`} className="text-xs text-text-secondary leading-relaxed">
                {description}
              </span>
            ) : null}
          </span>
        )}
      </>
    );
    return label || description ? (
      <label htmlFor={id} className="inline-flex items-start gap-3 cursor-pointer">
        {content}
      </label>
    ) : (
      <>{content}</>
    );
  },
);
Switch.displayName = "Switch";
