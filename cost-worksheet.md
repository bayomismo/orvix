# cost-worksheet.md

This file is a build-time mirror of the **Cost & Unit Economics
Worksheet** at `/workspace/orvix-prd/17-COST-WORKSHEET.md`.

**The PRD is the source of truth.** If this file ever drifts from the PRD
during Phase 1+, the PRD wins. The mirror exists so that cost discipline is
observable from any `git blame` and any `pnpm test` run.

For v0.2's full economic model — per-workspace AI cost at 100 / 1k / 10k /
100k paying workspaces, margin envelope, cost ceilings, pricing tier
definitions, sensitivity tables, and the `tenantClass` dashboard
implication — see the PRD document at `/workspace/orvix-prd/17-COST-WORKSHEET.md`.

This file should not be edited in place. Update the PRD and run
`pnpm run sync:cost-worksheet` (an M0.4 delivery) to refresh the mirror.
