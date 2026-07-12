# M5 — Inbox, Work (refresh), Customers (refresh)

**Status**: Complete
**Tag**: `v0.5.0-m5-surfaces`
**Gates**: ✅ typecheck, ✅ 87 tests, ✅ lint, ✅ build

## What landed

### Inbox (`/inbox`)

The action surface. Three-region layout with the new **Needs your decision** panel that elevates blocked + high-priority items above the metric strip.

- **Greeting + subtitle** — time-of-day aware ("Good morning, Casey")
- **Primary CTA** — "Resolve" button for the most urgent item, or "Open Work →" when nothing is blocking
- **BlockedPanel** *(new)* — Sparkles-tinted card showing up to 4 items needing human decision; rationale sentence from the Assistant; danger-soft tinted type icons; high-priority items highlighted
- **Metric strip** — Needs attention / In progress / In review / AI runs (M2 `Card elevation="floating"`)
- **Today feed** — M2 `Card` + M2 `Users`/`Briefcase`/`Folder`/`CheckSquare`/`Message`/`File`/`InboxTray` icons
- **AI briefing** — last 5 AI runs, M2 `Clock` icon next to time-ago, M2 `Card elevation="flat"`
- **Quick actions** — three one-click creates (Task, Deal, Customer)
- **ActivityRail** — Inbox card + need-help card on the right

### Work (`/work`)

The list of all work items, filtered by type and status.

- **M2 Tabs** *(new)* — type filter row (All / Customer / Deal / Project / Task / Conversation / Document / Request) with animated underline and per-tab count badge
- **Status filter** *(new)* — right-aligned chip row (Open / Done / All) with counts
- **"Showing N items [in Type]"** caption above the list
- **M2 Card list** — items rendered inside an M2 `Card elevation="flat"` with M2 type icons
- **Empty state** — M2 `EmptyState shape="firstTime"` with type-specific copy

### Customers (`/customers`)

The pipeline kanban. Stage columns with stage-colored dots and refined card hover.

- **Header** — pipeline value + won value + create button
- **Kanban columns** — Lead / Qualified / Proposal / Won (with stage-colored dots: info, brand-accent, warning, success)
- **M2 CustomerCard** *(refined)* — M2 `Users` icon in a tinted badge, hover state lifts and tints the border to brand-accent
- **Empty columns** — dashed drop hint per stage
- **Empty state** — M2 `EmptyState shape="firstTime"`

## Key decisions

- **Inbox is a "decision" surface** — the BlockedPanel elevates the items that need the user's hand, so the day opens with a clear "here's what only you can do" rather than a metrics parade
- **Work's Tabs use Radix `data-state`** — the active tab gets the brand-accent underline from Radix; the URL stays the source of truth (so the page is shareable, bookmarkable, and back-button works)
- **Status filter is chip-style, not Tabs** — it's a quick toggle, not a navigation
- **Customers' stage dots are semantic colors** — Lead=info (blue), Qualified=brand-accent (indigo), Proposal=warning (amber), Won=success (green). At a glance you can read pipeline health
- **No new types of components** — every M5 surface uses the same M2 primitives (Card, Badge, EmptyState, icons) so the design system is the only source of truth

## Files added / changed

```
M  apps/web/src/app/(app)/inbox/page.tsx            (BlockedPanel + M2 polish)
A  apps/web/src/app/(app)/inbox/BlockedPanel.tsx    (new)
M  apps/web/src/app/(app)/inbox/TodayFeed.tsx       (M2 Card + icons)
M  apps/web/src/app/(app)/work/page.tsx             (M2 Tabs + status filter)
M  apps/web/src/app/(app)/customers/page.tsx        (M2 Card + Users icon + stage dots)
A  scripts/screenshots-m5.mjs
M  docs/M5-INBOX-WORK-CUSTOMERS-STATUS.md           (this file)
M  docs/screenshots/v1.0/dashboard.png              (refreshed)
M  docs/screenshots/v1.0/work.png                   (refreshed)
M  docs/screenshots/v1.0/customer.png               (refreshed)
A  docs/screenshots/v1.0/m5-inbox.png
A  docs/screenshots/v1.0/m5-work.png
A  docs/screenshots/v1.0/m5-work-tasks.png
A  docs/screenshots/v1.0/m5-customers.png
```

## Screenshots

`docs/screenshots/v1.0/`:

- `dashboard.png` / `m5-inbox.png` — Inbox with BlockedPanel
- `work.png` / `m5-work.png` — Work with M2 Tabs and status filter
- `m5-work-tasks.png` — Work filtered to Task type
- `customer.png` / `m5-customers.png` — Customers kanban with M2 Card

## Gate run

```bash
$ pnpm -r typecheck   # ✅ all packages
$ pnpm -r test        # ✅ 87 tests across 8 packages
$ pnpm -r lint        # ✅ no errors
$ pnpm -r build       # ✅ all apps build
```

## What's next

**M6** — Work Details, Customer Profile, Reports (refresh)
