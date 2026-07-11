# ORVIX — Technical Debt Register (Phase 0 closeout)

This is a snapshot of items that **build green, test green, and
lint green** today, but are known to be:
  (a) stubs that production cannot ship with, or
  (b) deliberately deferred features with a future RFC, or
  (c) low-severity ergonomics issues that compound over time.

The canonical version of this list lives at the bottom of
`docs/PHASE-0-STATUS.md` §7. This file is a more verbose copy
with mitigation notes and triggers.

---

## Severity: BLOCKER for production

### T1. Real Auth.js v5 with KMS-versioned Argon2id pepper
- **Where**: `apps/web/src/server/auth.ts` (Phase 0 stub).
- **What ships today**: a hard-coded test session for development.
  `requireSession()` returns the same `{ userId, workspaceId, roleId, expiresAt }`
  every call.
- **Why it's debt**: production cannot boot with a stub. Session
  lifecycle, magic-link emails, OAuth providers, and password
  reset all flow through this layer.
- **Mitigation**: `RFC-0001`. Tracked in `PHASE-0-STATUS.md` §8.
  Interface preserved — no call site changes.
- **Trigger to fix**: before any external traffic (alpha).

### T2. Real model providers behind the AI runtime
- **Where**: `packages/ai-runtime/src/planner.ts`,
  `packages/ai-runtime/src/verifier.ts`.
- **What ships today**: deterministic rule-based Planner + Verifier.
  Same interface, no LLM.
- **Why it's debt**: the Verifier is meant to be an independent
  LLM with a different prompt than the Planner. Today both are
  rule-based — they agree by construction, which defeats the
  purpose of dual-signal verification.
- **Mitigation**: `RFC-0002`. The swap is local: `runPlanner()`
  and `runVerifier()` are the only entry points.
- **Trigger to fix**: before any real "AI Employee"-style autonomy
  is granted to a workspace.

### T3. Idempotency store: in-memory → Redis
- **Where**: `apps/web/src/server/idempotency.ts`.
- **What ships today**: `Map<string, IdempotencyEntry>`. TTL = 24h,
  replay-only (errors are not aliased). The contract is correct;
  the storage is per-process.
- **Why it's debt**: horizontal scaling will produce inconsistent
  idempotency behavior across replicas. A retried request could
  land on a different replica and re-execute.
- **Mitigation**: `RFC-0003`. Use Upstash or Vercel KV; the helper
  signature is unchanged.
- **Trigger to fix**: before any Vercel deployment with > 1 region.

### T4. Audit log writer: in-memory Merkle chain → Postgres
- **Where**: `apps/web/src/server/audit.ts`.
- **What ships today**: the writer computes `rootHash` correctly but
  holds the chain in memory. A process restart loses the chain.
- **Why it's debt**: PRD §11 mandates that audit rows are
  *notarized* — a row's `rootHash` is invalid if the prior
  `rootHash` cannot be reconstructed.
- **Mitigation**: `RFC-0004`. Persist the chain in `AuditLog.rootHash`
  (column already exists in `schema.prisma`).
- **Trigger to fix**: before any external traffic (alpha).

### T5. Postgres RLS migration must run in production
- **Where**: `packages/db/src/migrations/0001_foundations/migration.sql`
  + `packages/db/src/with-workspace.ts`.
- **What ships today**: the SQL is in the repo, the Prisma extension
  enforces the contract at the app layer, and CI spins up a Postgres
  16 service container to apply the migration. **Phase 0 has no
  live `DATABASE_URL`**, so the integration test against real RLS
  is gated on user-provided credentials.
- **Why it's debt**: the app-layer guard is necessary but not
  sufficient. RLS is the hard guarantee. Without it, a single
  miscoded `prisma.$queryRaw` could leak across tenants.
- **Mitigation**: `RFC-0004` (paired with T4). Apply via Neon
  console or `psql -f migration.sql` after provisioning.
- **Trigger to fix**: before any external traffic (alpha).

---

## Severity: MEDIUM (degrades before it breaks)

### T6. Live RLS test against real Postgres
- **Where**: `packages/db/src/__tests__/tenant-isolation.test.ts`.
- **What ships today**: a mock that mirrors the Prisma extension's
  contract. The mock proves the app layer is correct; it does not
  prove RLS itself.
- **Why it's debt**: we want a CI step that creates two workspaces
  in real Postgres, sets `app.workspace_id = A`, and asserts that
  reads of `Workspace B` rows return zero.
- **Mitigation**: extend the CI workflow with a real-DB integration
  step (the Postgres service already exists; need a `DATABASE_URL`
  and a seed script).
- **Trigger to fix**: same as T5.

### T7. AI cost ceiling persistence
- **Where**: `packages/utils/src/cost.ts`, `InferenceTally`.
- **What ships today**: math is correct; the tally is a per-process
  in-memory map. The `cooldown` decision is enforced; the running
  total is not.
- **Why it's debt**: a per-workspace daily cap is the contract.
  Without persistence, a process restart resets the tally and
  the workspace can spend past the cap.
- **Mitigation**: `RFC-0007`. Aggregate from `AIRun.estimatedCostUsd`
  at decision time.
- **Trigger to fix**: before `Free` plan is exposed to external
  traffic.

### T8. Custom Work Item types — Zod enforcement at write time
- **Where**: `WorkItemType.schema` (JSONB) + `WorkItem.customFields`
  (JSONB) in `packages/db/src/schema.prisma`.
- **What ships today**: the schema column is there; the engine
  accepts any `customFields` shape.
- **Why it's debt**: a malformed `customFields` is silently
  accepted. The Work Item will be queryable but its custom fields
  are unverifiable.
- **Mitigation**: `RFC-0008`. Look up the `WorkItemType.schema`,
  compile it to a Zod schema (cached), and validate in the
  Server Action before write.
- **Trigger to fix**: before the **Custom Work Item Type** UI ships.

---

## Severity: LOW (housekeeping)

### T9. ESLint v9 flat config migration
- **Where**: `.eslintrc.cjs` (legacy), `tooling/eslint/index.cjs`,
  `packages/config/eslint/index.cjs` (flat).
- **What ships today**: the root config wraps the flat config in a
  legacy-compatible shape; the per-package scripts set
  `ESLINT_USE_FLAT_CONFIG=false`. Works, but emits a deprecation
  warning per package.
- **Why it's debt**: ESLint v10 will drop the legacy format. The
  warning is noise today; it will be a hard break tomorrow.
- **Mitigation**: `RFC-0006`. Migrate to `eslint.config.js` across
  the workspace.
- **Trigger to fix**: next major ESLint bump, or before
  `next lint` deprecation hits in Next 16.

### T10. ESLint peer warning (eslint-config-next 15.5.20 vs
@typescript-eslint/parser ^7.18.0 — wants ^8.63.0)
- **Where**: root `pnpm install` warning.
- **What ships today**: tolerated; lint passes.
- **Why it's debt**: a future `@typescript-eslint` rule may
  require parser v8.
- **Mitigation**: bump `@typescript-eslint/*` to v8 in the root
  `package.json` devDependencies.
- **Trigger to fix**: when convenient (low-priority).

### T11. Tailwind content-detection warning in `apps/web` build
- **Where**: `apps/web` build output.
- **What ships today**: "No utility classes were detected in your
  source files." — true, because the 7 destination pages are
  placeholders. Tailwind still works at runtime; the JIT just
  emits nothing.
- **Why it's debt**: misleading log noise. Will resolve as
  features land and pages start using utility classes.
- **Mitigation**: none required. If we want a one-line fix, add a
  single utility class to a page (e.g. `className="p-4"` somewhere)
  to silence the warning.
- **Trigger to fix**: when convenient.

### T12. `exactOptionalPropertyTypes` ergonomics
- **Where**: `tsconfig.base.json` (strict) + Zod 3.x.
- **What ships today**: a few modules use `T? | undefined` explicitly
  (e.g. `packages/ai-runtime/src/verifier.ts`'s `rationale` field,
  and a couple of `idempotency.ts` shapes) to thread through Zod's
  `.optional()` output.
- **Why it's debt**: the pattern is correct but not documented.
  Future contributors will trip on this and either disable the
  flag (wrong) or rewrite the type (probably wrong).
- **Mitigation**: add a "Type Conventions" note to
  `docs/CONTRIBUTING.md` once that doc exists.
- **Trigger to fix**: before the team grows past 1-2 contributors.

### T13. `experimental.typedRoutes` → `typedRoutes` migration
- **Where**: `apps/web/next.config.ts`.
- **What ships today**: Next.js 15.5.20 deprecation warning.
- **Why it's debt**: warning noise; will be a hard error in
  Next 16.
- **Mitigation**: move `typedRoutes` out of `experimental`.
- **Trigger to fix**: when convenient.

### T14. No dev-server boot smoke test
- **Where**: CI.
- **What ships today**: `pnpm -r build` produces a buildable
  artifact, but the dev server is not booted in CI.
- **Why it's debt**: a build artifact can fail to start at
  runtime (port conflict, missing env, broken Server Action
  registration).
- **Mitigation**: add a `pnpm dev` smoke step to CI that
  hits `/` and `/api/healthz`. Requires `DATABASE_URL` etc.
- **Trigger to fix**: paired with T5.

---

## Severity: DEFERRED (planned for later phases, not Phase 0)

### T15. Email + Slack webhooks
- **Where**: ApprovalQueue notifications (PRD §08).
- **Why deferred**: Phase 0's approval surface is in-app only.
- **Mitigation**: `RFC-0005`.
- **Trigger**: post-MVP.

### T16. Daily CEO briefing
- **Where**: PRD §10 (deferred to v3).
- **Why deferred**: PRD v0.2 §10 defers this to v3; the v0.2
  stand-in is the "Today" bullet list in `/inbox`.
- **Mitigation**: none in v1.
- **Trigger**: v3.

### T17. One vertical template (agency)
- **Where**: PRD v0.2 §12.
- **Why deferred**: v1 deliverable; Phase 0 ships the engine
  but no templates.
- **Mitigation**: `RFC-0009`.
- **Trigger**: v1.

### T18. Cross-tenant pattern use
- **Where**: PRD v0.2 §07.
- **Why deferred**: default OFF; explicit onboarding consent
  required. The `cross_tenant_learning` column exists on
  `Workspace` in the schema.
- **Mitigation**: `RFC-0010` once we have a customer asking.
- **Trigger**: first customer request.

### T19. Dev-only bootstrap + seed API routes
- **Where**: `apps/web/src/app/api/dev/{bootstrap,seed}/route.ts`.
- **What ships today**: two POST routes that bypass the wizard
  (bootstrap) and seed sample work items (seed). Used by the
  screenshot script.
- **Why it's debt**: any non-production deployment must
  remember to set `ORVIX_ALLOW_DEV_BOOTSTRAP=0` (or omit it
  entirely). The default in production is 404, but the routes
  still exist in the bundle.
- **Mitigation**: gate via a `process.env.NODE_ENV === "production"`
  guard, which is already in place. Future cleanup: move the
  routes under `apps/web/src/app/api/_dev/` (the `_` prefix
  keeps them out of route discovery in production builds).
- **Trigger**: when the screenshot script is integrated into
  CI, or when an external team picks up the repo.
