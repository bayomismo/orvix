/**
 * @orvix/db — withWorkspace Prisma client extension (v0.2)
 *
 * The load-bearing tenant isolation layer (Layer 1).
 *
 * Why this exists:
 *   PRD §06 §3 mandates a two-layer tenant isolation model:
 *     Layer 1 — Prisma client extension requires `workspaceId` on every
 *     Layer 2 — Postgres RLS enforces at the row level (see migration)
 *
 * The application middleware layer (the v0.1 `withTenant`) is removed.
 * `withWorkspace` is the single point at which a request gets bound to a
 * tenant: the call site provides the workspace, and the extension enforces
 * it on every subsequent query.
 *
 * Usage:
 *
 *   import { prisma, withWorkspace } from "@orvix/db";
 *
 *   const customers = await withWorkspace(prisma, workspaceId, async (tx) =>
 *     tx.customer.findMany()
 *   );
 *
 * The extension checks models that have a `workspaceId` column. If the
 * caller issues a query against such a model without an explicit
 * `workspaceId` filter, the extension throws.
 */

import type { PrismaClient } from "@prisma/client";

/** Models that carry a tenant boundary. Keep in sync with `schema.prisma`.
 *
 * IMPORTANT: Prisma's `$extends` callback exposes model names in the
 * *camelCase / first-letter-lowercase* form (e.g. `WorkItem` becomes
 * `"workItem"`, `BusinessDnaVersion` becomes `"businessDnaVersion"`).
 * Use that form here.
 */
export const TENANT_BOUND_MODELS: ReadonlySet<string> = new Set([
  "workspace",
  "user",
  "role",
  "rolePermissionGrant",
  "session",
  "businessDnaVersion",
  "workItemType",
  "workItem",
  "workItemCustomer",
  "workItemDeal",
  "workItemProject",
  "workItemTask",
  "workItemConversation",
  "workItemDocument",
  "workItemRequest",
  "activity",
  "comment",
  "commentMention",
  "attachment",
  "attachmentReview",
  "workItemRelation",
  "aIAssistantConfig",
  "aIRoutingProfile",
  "aIRun",
  "aIMemoryEntry",
  "automation",
  "automationRun",
  "auditLog",
]);

/**
 * Identity-side guard: a property whose name is a tenant-scoped FK or
 * a unique field that includes workspace_id and thus implies a tenant.
 */
const TENANT_KEYS: ReadonlySet<string> = new Set(["workspaceId", "workspace_id"]);

export class TenantIsolationError extends Error {
  override readonly name = "TenantIsolationError";

  constructor(model: string, op: string) {
    super(
      `Tenant isolation violation: a query against "${model}" did not specify workspaceId. ` +
        `All tenant-scoped queries must run within withWorkspace(prisma, workspaceId, fn). ` +
        `Operation attempted: ${op}.`,
    );
  }
}

type ReadOp =
  | "findMany"
  | "findFirst"
  | "findFirstOrThrow"
  | "findUnique"
  | "findUniqueOrThrow"
  | "count"
  | "aggregate"
  | "groupBy";
type WriteOp =
  | "create"
  | "createMany"
  | "update"
  | "updateMany"
  | "upsert"
  | "delete"
  | "deleteMany";

const READ_OPS: ReadonlySet<string> = new Set<ReadOp>([
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
]);

const WRITE_OPS: ReadonlySet<string> = new Set<WriteOp>([
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
]);

/**
 * Inspect a `where` clause and decide whether `workspaceId` is present.
 * Accepts both camelCase and snake_case keys, and compound uniques whose
 * sub-objects include `workspaceId`.
 */
function hasWorkspaceIdInWhere(where: unknown): boolean {
  if (!where || typeof where !== "object") return false;
  const rec = where as Record<string, unknown>;
  if (TENANT_KEYS.has("workspaceId") && "workspaceId" in rec) {
    return rec["workspaceId"] !== undefined;
  }
  if ("workspace_id" in rec) {
    return rec["workspace_id"] !== undefined;
  }
  // Compound unique: walk sub-objects and look for tenant scope.
  return Object.values(rec).some(
    (v) =>
      v &&
      typeof v === "object" &&
      ("workspaceId" in (v as Record<string, unknown>) ||
        "workspace_id" in (v as Record<string, unknown>)),
  );
}

function hasTenantKeyInData(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const rec = data as Record<string, unknown>;
  return "workspaceId" in rec || "workspace_id" in rec;
}

function hasTenantKeyInAllDataItems(data: unknown): boolean {
  if (!Array.isArray(data)) return false;
  return data.every((d) => hasTenantKeyInData(d));
}

/**
 * Apply the Prisma client extension. This wraps the client so that:
 *   - any query against a tenant-scoped model without an explicit
 *     workspaceId filter throws TenantIsolationError.
 *   - any mutation missing workspaceId in data throws TenantIsolationError.
 *
 * Implementation strategy: we use the Prisma `$extends` API with
 * `query.$allModels.$allOperations` to inspect every operation. The
 * type of the callback is intentionally loose; the application tests
 * (see `__tests__/tenant-isolation.test.ts`) cover the behavior.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrismaClient = any;

export function applyTenantIsolation(
  client: AnyPrismaClient,
): AnyPrismaClient {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations(params: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          model?: any;
          operation: string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          query: (a: unknown) => Promise<unknown>;
        }) {
          const { model, operation, args, query } = params;
          if (!model) {
            return query(args) as Promise<unknown>;
          }
          if (!TENANT_BOUND_MODELS.has(model)) {
            return query(args) as Promise<unknown>;
          }
          const op = operation;
          if (READ_OPS.has(op)) {
            const where = (args as { where?: unknown })["where"];
            if (!hasWorkspaceIdInWhere(where)) {
              throw new TenantIsolationError(model, op);
            }
            return query(args) as Promise<unknown>;
          }
          if (WRITE_OPS.has(op)) {
            const data = (args as { data?: unknown })["data"];
            const dataHasTenant =
              hasTenantKeyInData(data) || hasTenantKeyInAllDataItems(data);
            if (!dataHasTenant) {
              throw new TenantIsolationError(model, `${op} (data missing workspaceId)`);
            }
            return query(args) as Promise<unknown>;
          }
          return query(args) as Promise<unknown>;
        },
      },
    },
  });
}

/**
 * withWorkspace — bind a workspaceId to a Prisma transaction.
 *
 * This is the *application*-side gate. The Prisma extension above
 * enforces tenant isolation for queries; this gate ensures every
 * call site has been explicit.
 */
export async function withWorkspace<T>(
  prisma: PrismaClient,
  workspaceId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (tx: any) => Promise<T>,
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.$transaction(async (tx: any) => {
    // Bind `app.workspace_id` for the duration of this transaction so
    // that Postgres RLS evaluates against this tenant. This is the
    // *only* direct SET LOCAL permitted for tenant binding.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (tx as any).$executeRawUnsafe(
      `SET LOCAL app.workspace_id = '${workspaceId.replace(/'/g, "''")}'`,
    );
    return fn(tx);
  });
}
