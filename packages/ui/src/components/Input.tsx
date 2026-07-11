"use client";

import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Inputs — ORVIX Design System v1.0.
 *
 * `Input` (single-line), `Textarea` (multiline), `Select` (native).
 * All share the same border + focus ring + 6px radius.
 *
 * Premium details: invalid state has a 1px danger border + soft
 * ring; focus state is 2px ring (no offset jump); disabled is
 * 40% opacity; placeholder is muted; monospace option for data.
 */
const baseControlClass = cn(
  "flex w-full items-center rounded-md border bg-surface-raised",
  "transition-all duration-fast ease-out-quint",
  "focus-within:ring-2 focus-within:ring-brand-accent/30",
  "disabled:pointer-events-none disabled:opacity-40",
);

function controlBorder(invalid?: boolean) {
  return invalid
    ? "border-status-danger focus-within:border-status-danger"
    : "border-surface-divider hover:border-surface-divider-strong focus-within:border-brand-accent";
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
  /** Use Geist Mono for numeric / data inputs. */
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, invalid, leadingIcon, trailingIcon, inputSize = "md", mono, ...props },
    ref,
  ) => {
    const sizeClass =
      inputSize === "sm" ? "h-8 text-xs" : inputSize === "lg" ? "h-11 text-base" : "h-9 text-sm";
    return (
      <div className={cn(baseControlClass, controlBorder(invalid), className)}>
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className="pl-2.5 text-text-muted [&_svg]:h-4 [&_svg]:w-4"
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          className={cn(
            "w-full bg-transparent px-3 text-text-primary placeholder:text-text-muted",
            "focus:outline-none",
            sizeClass,
            leadingIcon && "pl-2",
            trailingIcon && "pr-2",
            mono && "orvix-numeric",
          )}
          {...props}
        />
        {trailingIcon ? (
          <span
            aria-hidden="true"
            className="pr-2.5 text-text-muted [&_svg]:h-4 [&_svg]:w-4"
          >
            {trailingIcon}
          </span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

/**
 * Textarea — same border, multiline, auto-resize capable.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[88px] w-full rounded-md border bg-surface-raised px-3 py-2 text-sm text-text-primary",
        "placeholder:text-text-muted resize-y",
        "transition-all duration-fast ease-out-quint",
        "focus:outline-none focus:ring-2 focus:ring-brand-accent/30",
        "disabled:pointer-events-none disabled:opacity-40",
        controlBorder(invalid),
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

/**
 * Select — native, styled. The chevron is an inline SVG via
 * background-image so we don't ship an icon dependency.
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className={cn(baseControlClass, controlBorder(invalid), className)}>
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none bg-transparent px-3 pr-9 text-sm text-text-primary",
          "focus:outline-none disabled:opacity-50",
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2396969F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          ...((props.style as React.CSSProperties) ?? {}),
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  ),
);
Select.displayName = "Select";

/**
 * Checkbox — 16x16, custom-drawn check via stroke-dashoffset.
 */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <label
        htmlFor={inputId}
        className={cn("group/checkbox inline-flex items-start gap-2.5 cursor-pointer", className)}
      >
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer absolute inset-0 cursor-pointer opacity-0"
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              "h-4 w-4 rounded-sm border bg-surface-raised",
              "transition-colors duration-fast ease-out-quint",
              "peer-checked:bg-brand-accent peer-checked:border-brand-accent",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-canvas",
              "peer-disabled:opacity-40 peer-disabled:cursor-not-allowed",
              "border-surface-divider-strong group-hover/checkbox:border-brand-accent",
            )}
          >
            <svg
              viewBox="0 0 16 16"
              className="h-full w-full p-0.5 text-text-on-accent opacity-0 peer-checked:opacity-100 transition-opacity duration-fast ease-out-quint"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 8 7 12 13 4" />
            </svg>
          </span>
        </span>
        {(label || description) && (
          <span className="flex flex-col gap-0.5 min-w-0">
            {label ? (
              <span className="text-sm text-text-primary leading-tight">{label}</span>
            ) : null}
            {description ? (
              <span className="text-xs text-text-secondary leading-relaxed">{description}</span>
            ) : null}
          </span>
        )}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
