# Runbook — Tenant Isolation Tests

> **Phase 0 exit criteria.** Per-tenant isolation tests must be green in
> CI before any Phase 0 milestone is called complete.

## What's tested

`packages/db/src/__tests__/tenant-isolation.test.ts` exercises:

1. Cross-tenant reads: workspace A cannot see workspace B's rows.
2. Bypass attempts: a query without `workspaceId` filter throws
   `TenantIsolationError`.
3. Writes missing `workspaceId` in `data` throw.
4. `withWorkspace` binding: a write inside the transaction requires
   the bound `workspaceId` to be on the row.
5. The audit-log chain helper exists (Phase 1 wires it real).

## Running locally

```bash
# With a Postgres test database reachable on $DATABASE_URL.
pnpm --filter @orvix/db db:generate
pnpm --filter @orvix/db test
```

Without a live Postgres, the in-package unit tests use mocked Prisma
clients. They cover the same shape as the live tests but cannot detect
RLS misconfiguration — only the cross-tenant guard logic. CI runs the
real database.

## CI configuration

`ci.yml` boots Postgres 16 in a service, applies the 0001 migration,
then runs vitest. PRs that fail to maintain green isolation tests are
blocked from merge.

## If a test fails

1. **TenantIsolationError in production logs.** A code path is calling
   the Prisma client without `workspaceId`. Find the call site; add the
   guard.
2. **A test sees rows from another tenant.** Either the Prisma extension
   is misbehaving (missing model check, casing mismatch) or the
   `withWorkspace` helper isn't being called. Both are obvious.
3. **Audit log chain test fails.** Phase 0 stubbed; not blocking.
