# M6 — Work Details, Customer Profile, Reports (refresh)

**Status**: Complete
**Tag**: `v0.6.0-m6-details`
**Gates**: ✅ typecheck, ✅ 87 tests, ✅ lint, ✅ build

## What landed

### Work Details (`/work/[id]`)

The detail page for any work item. v1.0 refresh: M2 Breadcrumb, M2 icons, M2 Card with proper elevation, type-specific UI.

- **M2 Breadcrumb** — Work › Type › Title (or `#id` for non-customer types)
- **PageHeader** — title + status/priority badges + time-ago with M2 `Clock` icon + M2 type icon in a tinted badge
- **Status/Priority/Delete actions** — kept as WorkItemActions client component
- **Description card** — M2 `Card elevation="raised"`, prose styling
- **Related items** *(new for customers)* — up to 4 conversations/tasks/documents related to the customer
- **Comments section** — M2 Card with M2 Attach button, M2 Clock next to comment timestamps
- **AI Assistant** — M2 Card with Sparkles icon + "Live" badge + AISummaryButton
- **Activity** — M2 Card with timestamped activity log
- **Details** — M2 Card with all metadata (type/status/priority/assignee/dates)
- **CustomerProfileCard** *(new, customer only)* — see below

### Customer Profile (part of `/work/[id]` when type=customer)

A customer-specific block lives in the right rail of the Work Details page, above the generic Details card.

- **Stage badge** in the card header with stage-tone color
- **Company** name (prominent)
- **Deal value** with Won/Lost badge if applicable
- **Stage progress** — 5-segment progress bar showing Lead → Qualified → Proposal → Won → Lost, with current stage highlighted in brand-accent
- **Stage labels** with the current one bolded
- **Pipeline hint** — when in qualified/proposal, shows "Move to Proposal to start redlining" advice

### Reports (`/reports`)

The at-a-glance insight page. v1.0 refresh: 4 KPIs (added Closed won), M2 Card with floating elevation, M2 icons, work item mix bar, pipeline-by-stage breakdown, recent AI runs.

- **KPI strip** — 4 floating cards: Active work, Pipeline, Closed won, AI runs. Each card has a tone-tinted icon badge and a colored accent value
- **Work item mix** — M2 Card with horizontal stacked bar (color per type) + 6 legend chips with counts and percentages
- **Pipeline by stage** — M2 Card with 4 horizontal bars (Lead/Qualified/Proposal/Won) showing count + dollar value
- **Recent AI runs** — M2 Card with Sparkles header + run list with decision badges
- **People** — M2 Card with 4-stat grid: Owners, Automations, Inboxes, Comments
- **Empty state** — M2 EmptyState for "Charts come in Phase 1"

## Key decisions

- **Work Details is a detail view, not a separate customer page** — the v0.2 PRD treats customers as `type=customer` work items, so the detail view adapts (CustomerProfileCard shows up only for customers)
- **Related items are conversations/tasks/documents** — these are the surfaces that connect to a customer in Phase 0; deals/projects/tasks-for-this-customer would come in Phase 1
- **CustomerProfileCard lives in the right rail** so the customer's pipeline context reads before the generic metadata
- **Reports' work item mix is a stacked horizontal bar** (not pie chart) — works at any width, no SVG dependency, and the per-type legend chip gives exact counts and percentages
- **Stage progress uses 5 segments** (Lead, Qualified, Proposal, Won, Lost) — even though `Lost` is a terminal stage, it's a stage, so the progress bar is honest
- **KPI colors are semantic, not decorative** — Pipeline and Closed won are both `text-status-success` because that's what they mean, not because they should match

## Files added / changed

```
M  apps/web/src/app/(app)/work/[id]/page.tsx           (full rewrite — M2 Breadcrumb, related items, type-specific cards)
A  apps/web/src/app/(app)/work/[id]/CustomerProfileCard.tsx   (new)
M  apps/web/src/app/(app)/reports/page.tsx             (full rewrite — KPIs, work item mix, stage breakdown, AI runs, people)
A  scripts/screenshots-m6.mjs
M  docs/M6-DETAILS-PROFILE-REPORTS-STATUS.md           (this file)
M  docs/screenshots/v1.0/reports.png                   (refreshed canonical)
A  docs/screenshots/v1.0/m6-work-details.png
A  docs/screenshots/v1.0/m6-customer-profile.png
A  docs/screenshots/v1.0/m6-reports.png
```

## Screenshots

`docs/screenshots/v1.0/`:

- `m6-work-details.png` — Work Details for a Request type
- `m6-customer-profile.png` — Work Details for a Customer (CustomerProfileCard in the right rail)
- `m6-reports.png` — Reports (4 KPIs + work item mix + stage breakdown + AI runs + people)

## Gate run

```bash
$ pnpm -r typecheck   # ✅ all packages
$ pnpm -r test        # ✅ 87 tests
$ pnpm -r lint        # ✅ no errors
$ pnpm -r build       # ✅ all apps build
```

## What's next

**M7** — AI Assistant, Settings, Admin
