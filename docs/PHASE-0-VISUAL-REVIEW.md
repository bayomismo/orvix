# Phase 0 — Visual Review (v0.3)

The visual design of the Phase 0 surface has been reworked to ship the
"Less UI. More clarity." doctrine at a Linear / Stripe / Vercel tier. This
doc captures the final state, the rationale, and the trade-offs.

## North star

> Less UI. More clarity.
> Less decoration. More hierarchy.
> Less noise. More focus.

Every choice in the redesign serves one of those. If a pixel does not carry
weight, it gets cut. If a label does not change the next action, it is
demoted to metadata. If an empty state does not tell the user the next
click, it is not shipped.

## System

- **Type:** Geist (local font, `next/font/local`) with a 5-weight scale
  (300/400/500/600/700). Geist Mono for the rare inline code.
- **Color:** a 12-step neutral scale (`0`–`950`), `brand-accent` indigo
  (`#5046E5`) for the application chrome, `brand-ai` purple (`#8B5CF6`)
  reserved for AI-only surfaces. Status uses soft tones that pair
  color with text (no color-only signals).
- **Type scale:** `display-2xl` → `label-xs`. Tabular numerals for any
  number that counts.
- **Motion:** micro (`120ms`), base (`180ms`), slow (`260ms`), page
  (`360ms`), spring (`420ms`). All `prefers-reduced-motion` aware.
- **Surfaces:** `surface-canvas` (page) → `surface-elevated` (cards) →
  `surface-inset` (selected/hovered). Borders are `surface-divider`;
  dividers on the same.

## Destinations

Every destination goes through the same chrome: sticky left sidebar (7
destinations + active state), top bar (workspace switcher + ⌘K + user),
PageHeader (kicker → display title → subtitle → actions), and the
AI Assistant bar at the bottom.

### 1. Landing `/`
A single statement, centered, with a soft glow. The logo is a small
gradient mark. The hero pairs "Less UI." (primary) with "More clarity."
(secondary) — the only place we use weight contrast as a statement.

### 2. Onboarding `/onboarding`
4-step wizard (Identity → Industry → Shape → Goal) with AnimatePresence
transitions. Each step has a kicker label, a single h2, a 1-sentence
context line, and a 2- or 4-card grid of OptionCards. The user always
sees one decision at a time.

### 3. Inbox `/inbox` (Dashboard)
Three-region layout. Top: greeting + focus summary. Center: 4
MetricCards (needs attention / in progress / in review / AI runs) →
Today feed → AI briefing → Quick actions. Right rail: inbox items +
need-help card with ⌘K. One CTA (Resolve) appears at the top when
something is blocked.

### 4. Work `/work`
Type tabs (`All / Customer / Deal / Project / Task / Conversation /
Document / Request`) with counts. Divided list of rows: type icon, title,
`type · #id · updated 5m ago`, status badge, optional priority badge,
right arrow. Hover gives a soft surface tint.

### 5. Work detail `/work/[id]`
Breadcrumb, title, status + priority + updated time, inline selectors
(status, priority, delete). Two-column: description + comments +
comment composer (⌘↩) + attachments on the left; Details / AI Assistant
/ Activity on the right.

### 6. Customers `/customers`
Premium kanban. KPI row at the top (Pipeline + Won). Five columns
(Lead / Qualified / Proposal / Won / Lost). Each column shows the
count + total value at the top. Cards have name, company, deal value,
right arrow. Empty columns show "Drag a customer to {stage}".

### 7. AI `/ai`
The Assistant's workspace. Tabs: Console / Activity / Approvals /
Memory / Automations. Console has: 5 kind cards (Summarize / Draft /
Briefing / Infer DNA / Action), a routing profile selector, a big
prompt textarea with a footer (⌘↩ + Run), and a result card. Right
rail: 5 starter prompts + 2 templates.

### 8. Reports `/reports`
4 KPI cards (active work, pipeline, AI runs, automations). Phase 1
placeholder for charts.

### 9. Settings `/settings`
4 info cards (Workspace, Engine, Security, Profile). Phase 1 placeholders
marked with soft `Phase 1` chips.

### 10. Admin `/admin`
6 navigation cards (Automations, Users, Departments, Roles, Work item
types, Audit log). Automations is a real link to `/admin/automations`.

### 11. Automations `/admin/automations`
Trigger → condition → action rules. Each rule is a card with toggle,
name, on/off status pill, chips for the trigger / condition / action
pipeline, and a red delete affordance.

## How we kept the bar

- **No raw hex literals in feature code** — an ESLint rule forbids it.
  Every color comes from a design token.
- **Color is always paired with text** — status indicators say
  `Blocked`, not just "red". The AI badge says `Live`, not just "purple".
- **Microcopy is honest.** "Nothing blocking. A good moment to start
  something new." beats "Welcome to your dashboard!".
- **Hovers are tiny.** `translate-y-px` + a stronger border. No
  scaling, no shadow explosion, no surprise.
- **Empty states carry a CTA.** "No work yet" → "Create your first work
  item". No blank panels anywhere.
- **Animation is sub-second** and respects `prefers-reduced-motion`.

## Trade-offs we accepted

- We do not render rich charts in Phase 0. Reports carries KPI cards
  and a `Phase 1` placeholder. The chart grammar is RFC territory.
- The Customers kanban does not have drag-and-drop in Phase 0. The
  pipeline stages are moved via the work item's status dropdown. Drag
  is on the Phase 1 list (RFC-0003).
- The AI Assistant Bar at the bottom is a persistent shortcut to the
  AI Console. In Phase 1 it grows into a real command palette.
- The "Today" feed is a per-inbox view; per-department and per-role
  views are Phase 1.
- Dark mode is wired (tokens flip via `[data-theme="dark"]`) but the
  screenshots in this doc are light-only. The flip is a one-line
  change in user settings.

## Verified

All 11 routes captured in `docs/screenshots/v0.3/`:
- `01-landing.png`
- `02-onboarding.png`
- `03-inbox.png`
- `04-work-list.png`
- `05-customers.png`
- `06-ai.png`
- `07-reports.png`
- `08-settings.png`
- `09-admin.png`
- `10-admin-automations.png`
- `11-work-detail.png`

The screenshot script lives at `scripts/screenshot.mjs` and uses a
dev-only API (`/api/dev/bootstrap`, `/api/dev/seed`) to set up a
session and sample data without depending on the wizard's
React-onChange timing under Playwright.
