"use client";

import * as React from "react";
import { cn } from "../lib/cn";

/**
 * TextInput — token-driven, accessible.
 *
 * Premium inputs have no harsh borders. A 1px surface-divider border
 * transitions to surface-divider-strong on hover and a focused ring
 * for keyboard users.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Render a leading icon. */
  leadingIcon?: React.ReactNode;
  /** Render a trailing icon (e.g. status indicator). */
  trailingIcon?: React.ReactNode;
  /** Field size. */
  inputSize?: "sm" | "md" | "lg";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, leadingIcon, trailingIcon, inputSize = "md", ...props }, ref) => {
    const sizeClass =
      inputSize === "sm" ? "h-8 text-xs" : inputSize === "lg" ? "h-11 text-base" : "h-9 text-sm";
    return (
      <div
        className={cn(
          "group/input relative flex w-full items-center rounded-md border bg-surface-raised transition-all duration-fast ease-snappy",
          invalid
            ? "border-status-danger focus-within:border-status-danger"
            : "border-surface-divider hover:border-surface-divider-strong focus-within:border-brand-accent",
          "focus-within:ring-2 focus-within:ring-brand-accent/20",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {leadingIcon ? (
          <span aria-hidden="true" className="pl-2.5 text-text-muted [&_svg]:h-4 [&_svg]:w-4">
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          className={cn(
            "w-full bg-transparent px-3 text-text-primary placeholder:text-text-muted",
            "focus:outline-none disabled:opacity-50",
            sizeClass,
            leadingIcon && "pl-2",
            trailingIcon && "pr-2",
            className,
          )}
          {...props}
        />
        {trailingIcon ? (
          <span aria-hidden="true" className="pr-2.5 text-text-muted [&_svg]:h-4 [&_svg]:w-4">
            {trailingIcon}
          </span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

/**
 * Textarea — same look, multiline.
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
        "transition-all duration-fast ease-snappy",
        "focus:outline-none focus:ring-2 focus:ring-brand-accent/20",
        "disabled:pointer-events-none disabled:opacity-50",
        invalid ? "border-status-danger" : "border-surface-divider hover:border-surface-divider-strong focus-within:border-brand-accent",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

/**
 * Select — native, styled.
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div
      className={cn(
        "group/select relative flex w-full items-center rounded-md border bg-surface-raised transition-all duration-fast ease-snappy",
        invalid ? "border-status-danger" : "border-surface-divider hover:border-surface-divider-strong focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent/20",
        className,
      )}
    >
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none bg-transparent px-3 pr-9 text-sm text-text-primary",
          "focus:outline-none disabled:opacity-50",
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
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
