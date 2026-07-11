import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Skeleton — Phase 0. Loading-state primitive.
 *
 * Per PRD §08 §10:
 *   - < 200ms: do nothing
 *   - 200–1000ms: skeleton, no spinner
 *   - 1–5s: skeleton + progress label
 *   - > 5s: progress label + cancel option
 *
 * Phase 0 ships the shape; specific label / cancel UI lives in the
 * composition layer.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: boolean;
}

export function Skeleton({
  className,
  width,
  height,
  rounded,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-canvas animate-pulse",
        rounded ? "rounded-full" : "rounded-xs",
        className,
      )}
      style={{ width, height }}
      {...props}
    />
  );
}
