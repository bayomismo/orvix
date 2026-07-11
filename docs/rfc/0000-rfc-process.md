# RFC Process — ORVIX

> **Once implementation begins, every change to the architecture, scope,
> or PRD is an RFC.** Code-only refactors do not require an RFC; design
> changes do.

## What is an RFC

An RFC (Request for Comments) is a short document that proposes a
material change to ORVIX. Material changes include:

- New packages or removal of existing ones in the monorepo.
- Schema changes (Prisma additions, RLS policy changes, migration
  expansions).
- AI runtime contract changes (planner, verifier, approver).
- API surface changes (Server Action signature, REST endpoint
  additions or breaking changes).
- Workflow or governance changes (DNA fields, autonomy levels,
  cost ceilings).
- New destinations at the IA level (changes to PRD §04).
- New vertical templates (changes to PRD §03 §4).

Cosmetic changes (renames within a module, internal refactors with no
behavior change) do NOT require an RFC.

## How to file

1. Create a numbered file: `docs/rfc/0001-short-title.md`.
2. Use the template at `docs/rfc/0000-rfc-template.md`.
3. Open a PR titled `RFC: short title`.
4. Wait for CODEOWNERS to approve (see `CODEOWNERS`).

## How decisions are made

| Role | Approves |
|------|----------|
| Founding CTO | Final gate on architectural change |
| Founding PM | Scope / roadmap / persona change |
| Founding Designer | IA / component / design token change |
| Founding Engineer (App) | APIs / folder structure / packages |
| Founding Engineer (Data/Platform) | DB / RLS / migrations / security |
| Founding AI Engineer | AI runtime / DNA Engine / cost model |

Two approvals minimum: the role(s) the change primarily affects + the
Founding CTO as final gate.

## The contract

- No RFC, no change.
- An RFC is the audit trail for every architectural decision.
- An RFC carries forward as a *supersedes* link when replaced.
- Code that contradicts an approved RFC must be reverted or filed
  against a new RFC.

## The first RFCs

Two are likely to be filed in Phase 0–Phase 1:

- **Real Auth.js wiring** (replaces the `requireSession` stub in
  `apps/web/src/server/auth.ts`). Trivial, but does touch the API surface.
- **Real Postgres migrations in CI** (replaces the manual
  `psql -f migration.sql` step). The current `ci.yml` is honest about its
  Phase 0 shape.

Both are welcome as RFCs.
