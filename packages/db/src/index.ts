/**
 * @orvix/db — main entry
 *
 * Exposes the typed Prisma client, the withWorkspace tenant scoping
 * helper, the applied tenant-isolation extension, the type re-exports,
 * and the Repository abstraction (Milestone 1).
 */

export {
  prisma,
  prismaRaw,
  applyTenantIsolation,
  withWorkspace,
} from "./client";
export { cuid } from "./repository/cuid";
// Re-export schema-side type aliases under their existing names so
// external callers (e.g., `import type { ... } from "@orvix/db"`) keep
// working. The Repository layer has its own UI-shaped aliases; the
// `* as` rename below avoids the export-name collision.
export type {
  TenantClass,
  WorkspaceStatus as WorkspaceSchemaStatus,
  DnaStatus,
  AiAutonomyLevel,
  AiTonePreset,
  AiMemoryLayer,
  AiRunKind,
  AiRunModelTier,
  AiRunStatus,
  WorkItemPriority as WorkItemSchemaPriority,
  RoleKey as RoleSchemaKey,
} from "./types";
export * from "./repository";
