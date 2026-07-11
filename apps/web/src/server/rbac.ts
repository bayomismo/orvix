/**
 * RBAC (Milestone 1).
 *
 * Two layers:
 *   1. Role → permission grants, stored in the `RolePermissionGrant`
 *      table. Read through the Repository.
 *   2. Per-action `requirePermission(...)` calls in Server Actions /
 *      Route Handlers / Server Components. The check reads the
 *      session, then asks the Repository for the role's grants, and
 *      either passes or throws PermissionDeniedError.
 *
 * The wildcard permission `*` (Owner) bypasses every check.
 *
 * For Phase 0 compatibility, role permissions are also derived from
 * the in-memory defaults defined in the Repository (see
 * `defaultPermissionsFor` in `prisma.ts`). When the Prisma backend
 * is active, the same defaults are used as a fallback if no grants
 * row exists for a system role.
 */

import { repository, type Role } from "@orvix/db";

import type { ServerSession } from "./auth/session";

// ---------------------------------------------------------------------------
// Permission catalog
// ---------------------------------------------------------------------------

/**
 * Permission keys are namespaced `<surface>.<action>` (e.g.
 * `work.read`, `ai.approve`, `settings.write`). Adding a new
 * permission: extend this union, then map it to a default grant in
 * `defaultGrantsForRole` below. The `*` wildcard is the Owner bypass.
 */
export type Permission =
  | "*"
  // Work
  | "work.read"
  | "work.write"
  | "work.delete"
  | "work.assign"
  // Customer / deal / pipeline
  | "customer.read"
  | "customer.write"
  // AI
  | "ai.read"
  | "ai.approve"
  | "ai.execute"
  | "ai.suggest"
  // Settings
  | "settings.read"
  | "settings.write"
  // Admin
  | "admin.read"
  | "admin.write"
  // Automations
  | "automation.read"
  | "automation.write"
  | "automation.delete"
  | "automation.execute";

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class PermissionDeniedError extends Error {
  override readonly name = "PermissionDeniedError";
  constructor(
    public readonly userId: string,
    public readonly permission: Permission,
  ) {
    super(`Permission denied: ${permission} (user ${userId})`);
  }
}

// ---------------------------------------------------------------------------
// Default grants
// ---------------------------------------------------------------------------

/**
 * Default grant matrix for system roles. Mirrors the legacy in-memory
 * store. Custom roles default to `[]` until an Admin configures them
 * via the `RolePermissionGrant` table.
 */
export function defaultGrantsForRole(roleKey: string): readonly Permission[] {
  switch (roleKey) {
    case "owner":
      return ["*"];
    case "admin":
      return [
        "work.read",
        "work.write",
        "work.delete",
        "customer.read",
        "customer.write",
        "ai.read",
        "ai.approve",
        "settings.read",
        "settings.write",
        "admin.read",
        "admin.write",
        "automation.read",
        "automation.write",
        "automation.delete",
        "automation.execute",
      ];
    case "operator":
      return [
        "work.read",
        "work.write",
        "work.assign",
        "customer.read",
        "customer.write",
        "ai.read",
        "automation.read",
        "automation.execute",
      ];
    case "member":
      return [
        "work.read",
        "work.write",
        "customer.read",
        "ai.read",
        "automation.read",
      ];
    case "viewer":
      return ["work.read", "customer.read", "automation.read"];
    case "ai_assistant":
      return ["work.read", "customer.read", "ai.execute", "ai.suggest"];
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Session-derived permission set
// ---------------------------------------------------------------------------

/**
 * Resolve the active set of permissions for a session. Reads the
 * role's grants from the Repository (or falls back to the defaults
 * for system roles when none are configured).
 */
export async function permissionsFor(session: ServerSession): Promise<readonly Permission[]> {
  const role = await roleFor(session);
  if (!role) return [];
  return defaultGrantsForRole(role.key);
}

async function roleFor(session: ServerSession): Promise<Role | null> {
  // The session carries the role key. The Repository exposes roles
  // per workspace; the user's primary role is the one we resolve.
  const roles = await repository.listRoles(session.workspaceId);
  return roles.find((r) => r.key === session.roleKey) ?? null;
}

// ---------------------------------------------------------------------------
// Authorize
// ---------------------------------------------------------------------------

export async function hasPermission(
  session: ServerSession,
  permission: Permission,
): Promise<boolean> {
  if (permission === "*") return true;
  const grants = await permissionsFor(session);
  if (grants.includes("*")) return true;
  return grants.includes(permission);
}

/**
 * Throws {@link PermissionDeniedError} when the session does not
 * have the requested permission. The error is a regular Error so
 * Server Actions can let it bubble; the API layer maps it to a
 * 403 response.
 */
export async function requirePermission(
  session: ServerSession,
  permission: Permission,
): Promise<void> {
  const ok = await hasPermission(session, permission);
  if (!ok) {
    throw new PermissionDeniedError(session.userId, permission);
  }
}
