"use client";

import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Field — label + description + control wrapper. Token-driven, accessible.
 */
export const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { tone?: "default" | "muted" }
>(({ className, tone = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-1.5",
      tone === "muted" && "opacity-80",
      className,
    )}
    {...props}
  />
));
Field.displayName = "Field";

export const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-text-primary tracking-tight",
      className,
    )}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-text-secondary leading-relaxed", className)}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

export const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-status-danger font-medium", className)}
    {...props}
  />
));
FieldError.displayName = "FieldError";
