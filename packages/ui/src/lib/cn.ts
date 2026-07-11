import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` — class-name composition with Tailwind merge.
 *
 * `cx(...)` runs `clsx` for truthy filtering.
 * `twMerge` resolves conflicting Tailwind utilities so the last one wins.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
