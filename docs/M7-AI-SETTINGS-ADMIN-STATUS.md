# M7 — AI Assistant, Settings, Admin (refresh)

**Status**: Complete
**Tag**: `v0.7.0-m7-ai-settings-admin`
**Gates**: ✅ typecheck, ✅ 87 tests, ✅ lint, ✅ build

## What landed

### AI Assistant (`/ai`)

The AI's workspace. v1.0 refresh: M2 Tabs, M2 Card throughout, M2 icons, 4-stat strip at the top.

- **PageHeader** — "Your AI Assistant" with Sparkles icon + suggest_only badge
- **4-stat strip** — Runs / Executed / Awaiting you / Blocked (M2 Card elevation=floating with tone-tinted icon badges: info / success / warning / danger)
- **M2 Tabs** (animated underline) — Console / Activity / Approvals / Memory / Automations
- **Console** (kept existing AIConsole) — OptionCard-based kind picker, prompt composer, side panel of suggestions + templates
- **Activity** — M2 Card with status dot + decision badge per run
- **Approvals** — M2 Card with warning border, Block/Approve actions with M2 X / Check icons
- **Memory** — 3 M2 Card with M2 icons (Users, Briefcase, Settings), state badge (On/Opt-in)
- **Automations** — M2 Card with Sparkles icon + "Open Automations" link with M2 ArrowRight

### Settings (`/settings`)

6-tab settings page (Profile / Workspace / Engine / Security / Notifications / Theme).

- **M2 Tabs** at the top (URL-based query)
- **Profile panel** — name, email, time zone, notification channel
- **Workspace panel** — workspace name, industry, members, created (with Active badge)
- **Engine panel** — 2 cards side-by-side: Engine (departments/roles/types/AI) + AI Runtime (mode/profiles/memory/verifiers with Live badge)
- **Security panel** — auth, 2FA, SSO, tenant isolation, audit log (with Phase 1 / Operational badges)
- **Notifications panel** — 2 cards: Channels (In-app/Email/Push with M2 Switch) + What notifies you (4 M2 Switches)
- **Theme panel** — Mode chips (Dark active, Light/System disabled) + Accent chips (Indigo/Violet/Emerald/Amber with color dots) + Phase 1 note

### Admin (`/admin`)

The admin grid. v1.0 refresh: M2 Card with elevation=floating, M2 icons, M2 EmptyState for Phase 1 sections.

- **6 section cards** (3-column grid) — Automations / Users / Departments / Roles / Work item types / Audit log, each with a tone-tinted M2 icon badge, count, and arrow (if linked)
- **Audit at a glance** card with 8-stat grid (Users, Departments, Roles, Types, Automations, Comments, AI runs, Inbox)
- M2 Card with raised elevation and Bell icon header

## Key decisions

- **AI stats are read-only counts, not KPIs** — they show lifetime behavior, not targets. Different color logic (info / success / warning / danger) reflects the decision state, not achievement
- **Settings is a 6-tab page, not a 4-card grid** — phase 1 will deepen each panel; the tabs make the page navigable without scroll
- **Theme is dark-only in Phase 0** — the Light/System chips are visible but disabled, and the Phase 1 note explains why. The accent chips show the future of theme customization
- **Notifications has Channels (where) and Triggers (what)** — two distinct mental models, two cards
- **Admin cards are linkable when there's a destination, plain when there isn't** — the arrow icon only appears when href is set; Phase 1 sections get a "coming in Phase 1" line

## Files added / changed

```
M  apps/web/src/app/(app)/ai/page.tsx                 (full rewrite — Tabs, stats, M2 Card)
M  apps/web/src/app/(app)/settings/page.tsx           (full rewrite — 6-tab Settings)
M  apps/web/src/app/(app)/admin/page.tsx              (full rewrite — section grid + audit)
M  packages/ui/src/components/icons.tsx               (added CheckCircle, XCircle)
A  scripts/screenshots-m7.mjs
M  docs/M7-AI-SETTINGS-ADMIN-STATUS.md                (this file)
M  docs/screenshots/v1.0/{ai,settings,admin}.png      (refreshed canonicals)
A  docs/screenshots/v1.0/m7-{ai,ai-activity,ai-approvals,ai-memory,settings,settings-engine,settings-notifications,settings-theme,admin}.png
```

## Screenshots

`docs/screenshots/v1.0/`:

- `m7-ai.png` — AI Assistant default tab (Console)
- `m7-ai-memory.png` — AI Assistant Memory tab (3 tier cards)
- `m7-settings.png` — Settings Profile tab
- `m7-settings-engine.png` — Settings Engine tab (Engine + AI runtime)
- `m7-settings-notifications.png` — Notifications (Channels + Triggers with M2 Switch)
- `m7-settings-theme.png` — Theme (Mode + Accent chips)
- `m7-admin.png` — Admin (6 section grid + Audit at a glance)

## Gate run

```bash
$ pnpm -r typecheck   # ✅ all packages
$ pnpm -r test        # ✅ 87 tests
$ pnpm -r lint        # ✅ no errors
$ pnpm -r build       # ✅ all apps build
```

## What's next

**M8** — Motion polish, Empty States, Loading, A11y, Responsive, Performance
