/**
 * Shared types — no runtime. Re-exports types from feature packages
 * that need to be referenced across apps without pulling the runtime
 * code.
 */

export type WorkspaceSlug = string & { readonly __brand: "WorkspaceSlug" };
export type WorkspaceId = string & { readonly __brand: "WorkspaceId" };
export type UserId = string & { readonly __brand: "UserId" };
export type AIAssistantId = string & { readonly __brand: "AIAssistantId" };
export type WorkItemId = string & { readonly __brand: "WorkItemId" };
export type DnaVersion = number & { readonly __brand: "DnaVersion" };

/** Theme preference. */
export type Theme = "system" | "light" | "dark";
/** Per-user density preference. */
export type Density = "comfortable" | "dense";
