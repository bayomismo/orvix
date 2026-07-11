# ORVIX

> Adaptive Business Operating System.
> Monorepo · Next.js 15 · Prisma · PostgreSQL · TypeScript strict.

ORVIX is a multi-tenant business operations platform: a unified workspace for customers, deals, projects, tasks, conversations, documents, and requests — with a built-in AI layer for summaries, drafts, briefings, and automations. It is being built incrementally, with each milestone freezing a baseline that the next milestone extends.

This repository contains **Milestone 0 (Phase 0, visual baseline) + Milestone 1 (production readiness)**. The frozen v0.2 product spec is in [`/workspace/orvix-prd/`](../orvix-prd) (carried over from the planning phase). The full Milestone 1 status is in [`docs/MILESTONE-1-STATUS.md`](docs/MILESTONE-1-STATUS.md).

## Repository layout

```
orvix/
├── apps/
│   ├── web/                    Next.js 15 app (the user-facing product)
│   └── ai/                     Fastify AI service (rule-based runtime)
├── packages/
│   ├── ai-runtime/             Planner + automation executor + 5 AI providers
│   ├── config/                 Tailwind + shared tokens
│   ├── db/                     Prisma schema + repository (in-memory + Prisma)
│   ├── schemas/                Zod schemas shared across services
│   ├── storage/                S3-compatible file storage (S3 + local)
│   ├── types/                  Cross-cutting TS types
│   ├── ui/                     Shared UI components
│   └── utils/                  Shared utilities
├── docs/                       Architecture, status, RFCs, runbooks
├── tooling/                    Dev tooling config
├── scripts/                    One-off scripts (see below)
├── turbo.json                  Turborepo task graph
├── pnpm-workspace.yaml         Workspace definition
├── tsconfig.base.json          Strict TS config
└── package.json                Root manifest
```

## Prerequisites

- **Node.js 20+** (tested with 22.17)
- **pnpm 9+** (run `corepack enable` if not installed)
- **PostgreSQL 14+** (Neon recommended; any Postgres works)
- **Git** (to clone the repo)
- A S3-compatible bucket (or use the local file storage for dev)
- At least one AI provider API key (OpenAI, Anthropic, Gemini, OpenRouter, or Ollama running locally)

## Quick start (clean checkout)

```bash
# 1. Clone
git clone <repo-url> orvix
cd orvix

# 2. Install dependencies (uses pnpm workspaces; ~3–5 min on first run)
pnpm install

# 3. Configure the environment
#    See ENVIRONMENT.md for the full list.
#    Create the file: apps/web/.env.local
cat > apps/web/.env.local <<'EOF'
# Database (REQUIRED for any non-trivial work)
DATABASE_URL=postgresql://USER:PASS@HOST:PORT/neondb?sslmode=require
ORVIX_DB_BACKEND=prisma

# AI provider (at least one)
ORVIX_AI_DEFAULT_PROVIDER=openai
ORVIX_OPENAI_API_KEY=sk-...

# Dev-only API routes (Phase 0 + Milestone 1 dev)
ORVIX_ALLOW_DEV_BOOTSTRAP=1
EOF

# 4. Apply the schema
cd packages/db
npx prisma db push --schema=src/schema.prisma
# If the schema uses `uuid_generate_v7()`, install it (one-time per DB):
node scripts/install-v7.cjs
node scripts/install-v7.cjs  # idempotent re-install

# 5. Build everything (4 gates run in parallel via Turborepo)
cd ../..
pnpm -r typecheck
pnpm -r test
pnpm -r lint
pnpm -r build

# 6. Run the dev server
cd apps/web
pnpm dev
# → open http://localhost:3000
```

The first run takes ~5 min (Next.js compile + first build). Subsequent runs are instant.

## What's in Milestone 0 + Milestone 1

| Capability | Status |
| --- | --- |
| Visual baseline (15 routes, 11 screenshots, indigo/purple brand) | ✅ Shipped |
| Work Engine (7 work-item types, status, priority, comments, attachments) | ✅ Shipped |
| Inbox + Today Feed + Activity Rail | ✅ Shipped |
| AI surfaces (summary, draft, briefing) | ✅ Shipped (deterministic) |
| Automations (rule editor + executor) | ✅ Shipped |
| Admin (users, roles, workspace, business DNA) | ✅ Shipped |
| Reports dashboard | ✅ Shipped |
| Settings, onboarding wizard | ✅ Shipped |
| Repository abstraction (Prisma + in-memory) | ✅ Shipped |
| Auth.js v5 (magic link, Google, Microsoft) | ✅ Wired (env-gated) |
| Session management (JWT + memory fallback) | ✅ Shipped |
| RBAC (18 permissions, 6 system roles) | ✅ Shipped |
| Workspace isolation (Prisma RLS + repo guards) | ✅ Wired |
| File storage (S3 + local adapters) | ✅ Shipped |
| AI provider abstraction (5 providers + router) | ✅ Shipped |
| Automation executor (event-driven, runs++) | ✅ Shipped |
| Test coverage: **81 tests** across 7 packages | ✅ Green |
| Build: 4 gates green (typecheck, test, lint, build) | ✅ Green |

The full breakdown is in [`docs/MILESTONE-1-STATUS.md`](docs/MILESTONE-1-STATUS.md).

## Architecture

The full architecture doc is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). One-paragraph version:

- **Frontend:** Next.js 15 App Router (React 19), Tailwind, Server Actions for mutations, Server Components for reads. The UI never sees the database directly.
- **Backend:** The web app calls the **Repository** interface (`@orvix/db`). The factory selects `InMemoryRepository` (dev/tests) or `PrismaRepository` (production, backed by Postgres + RLS) at startup based on `DATABASE_URL` + `ORVIX_DB_BACKEND`.
- **AI:** Web → Fastify (`apps/ai`, port 3001) → `ModelRouter` (5 providers) or deterministic Phase-0 planner. The planner is provider-aware but has a deterministic fallback so the system never breaks if a key is missing.
- **Storage:** `Storage` interface (`@orvix/storage`). S3-compatible adapter (raw fetch with AWS Sig V4 — no AWS SDK dep) for prod, local adapter for dev.
- **Auth:** Auth.js v5 with email, Google, Microsoft providers. JWT strategy, server-side re-validation on every privileged action. Memory session is the dev fallback.
- **RBAC:** 18 permission types × 6 system roles, with `defaultGrantsForRole()` matrix.

## Configuration

See [`ENVIRONMENT.md`](ENVIRONMENT.md) for the complete list of every environment variable, with required/optional status, defaults, and example values.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm -r typecheck` | Type-check all packages |
| `pnpm -r test` | Run all tests (81 total) |
| `pnpm -r lint` | Lint all packages |
| `pnpm -r build` | Build all packages and apps |
| `cd apps/web && pnpm dev` | Start the Next.js dev server (port 3000) |
| `cd apps/ai && pnpm dev` | Start the Fastify AI service (port 3001) |
| `cd packages/db && npx prisma db push --schema=src/schema.prisma` | Apply schema to the database |
| `cd packages/db && node scripts/install-v7.cjs` | Install `uuid_generate_v7()` (idempotent) |
| `cd packages/db && npx prisma generate --schema=src/schema.prisma` | Regenerate the Prisma client |
| `cd packages/db && npx prisma studio` | Browse the database in a GUI |

## Documentation

- [`docs/PHASE-0-STATUS.md`](docs/PHASE-0-STATUS.md) — what shipped in Phase 0
- [`docs/PHASE-0-VISUAL-REVIEW.md`](docs/PHASE-0-VISUAL-REVIEW.md) — visual review
- [`docs/MILESTONE-1-STATUS.md`](docs/MILESTONE-1-STATUS.md) — what shipped in M1
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture
- [`docs/TECH-DEBT.md`](docs/TECH-DEBT.md) — known issues + debt ledger
- [`docs/rfc/`](docs/rfc) — RFCs (in-progress proposals)
- [`docs/runbooks/`](docs/runbooks) — operational runbooks
- [`docs/screenshots/`](docs/screenshots) — visual evidence

## License

Proprietary. All rights reserved. See [`LICENSE`](LICENSE) (TBD by owner).
