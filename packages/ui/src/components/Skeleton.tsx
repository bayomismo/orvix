import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Skeleton — ORVIX Design System v1.0.
 *
 * Per spec, skeletons are the only loading state. No spinners.
 * Mirror the actual layout 1:1.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: boolean;
  /** Use a circle (e.g. avatar). */
  circle?: boolean;
}

export function Skeleton({
  className,
  width,
  height,
  rounded,
  circle,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-elevated",
        "animate-pulse",
        circle ? "rounded-full" : rounded ? "rounded-md" : "rounded-xs",
        className,
      )}
      style={{ width, height }}
      {...props}
    />
  );
}
