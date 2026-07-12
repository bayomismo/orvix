# M4 — Landing, Auth, Onboarding

**Status**: Complete
**Tag**: `v0.4.0-m4-public`
**Gates**: ✅ typecheck, ✅ 87 tests, ✅ lint, ✅ build

## What landed

### PublicShell (`packages/ui/src/components/PublicShell.tsx`)

The chrome for the unauthed surface, mirroring the AppShell's visual language.

- **Top nav** — fixed, floating glass; brand monogram + "ORVIX · ADAPTIVE BUSINESS OS"; Product / Pricing / Docs links; "Sign in" link + "Get started" CTA (brand-accent)
- **Footer** — 3-column; monospace links; brand monogram + tagline on the left; built-with caption on the right
- **Tokens** — same color/spacing/typography as AppShell; `bg-surface-elevated/85 backdrop-blur-glass shadow-2 rounded-2xl`
- **`current` prop** — `product` / `pricing` / `docs` highlights the active top nav link

### Routes

| Route | Group | Source |
| --- | --- | --- |
| `/` | (root) | `apps/web/src/app/page.tsx` — full landing |
| `/onboarding` | `(marketing)` | `apps/web/src/app/(marketing)/onboarding/page.tsx` — wizard |
| `/signin` | `(marketing)` | `apps/web/src/app/(marketing)/signin/page.tsx` |
| `/pricing` | `(marketing)` | `apps/web/src/app/(marketing)/pricing/page.tsx` |

The `(marketing)` route group layout (`apps/web/src/app/(marketing)/layout.tsx`) wraps every page in `<PublicShell>`. Pages do **not** wrap themselves — that would double the chrome.

### Landing (`/`)

- **Hero** — "Adaptive Business OS" badge, "The conductor for **your business**." headline (gradient on "your business"), subhead about one-workspace / one-Assistant, two CTAs ("Set up your workspace" primary, "Open the demo" secondary), "FREE DURING THE V0.3 PILOT · NO CREDIT CARD" caption
- **HeroMock** — AppShell preview with sidebar (Acme Studio, Inbox/Work/Customers/AI/Reports), topbar (search, ⌘K, Ask AI, OR avatar), and four gradient KPI cards (6 needs attention, 5 in progress, 2 in review, 0 AI runs)
- **Section 1** — "The inbox that gets you." with three callout cards: Approve the new pricing matrix / Reply: re-scoping the Q3 plan / Draft: customer win-back — each with status dot, owner, and `open` chip
- **Section 2** — "Work, but it flows." with "7 work item types" and a kanban-style preview (Lead / Qualified / Won columns with deal cards)
- **Section 3** — "Bounded AI." three columns: Propose · You Verify · Ship
- **PricingTeaser** — 3 tiers (Solo $0, Team $24/seat, Scale Custom) with feature lists and CTAs

### Signin (`/signin`)

- Centered glass card on dark background
- Brand monogram at the top (gradient OR pill, large)
- "Welcome back" headline + "Sign in to your workspace" subhead
- Email field (placeholder `you@yourcompany.com`)
- "Send magic link" button (brand-accent)
- Divider with "OR"
- Google + Microsoft OAuth buttons (with letter badges)
- "Don't have an account? Create one" link
- `Phase 0 · Magic link is mocked until Phase 1.` status caption

### Pricing (`/pricing`)

- "Pricing" pill above headline
- "Three tiers. Same engine." (v1.0 headline scale)
- "Start free. Add a team when you outgrow it. Move to Scale when you need SOC 2, SSO, and audit." subhead
- 3 cards:
  - **Solo** — $0/month, 1 workspace, 7 work item types, ORVIX AI (suggest-only), community support
  - **Team** — $24/seat/month, "MOST POPULAR" badge, unlimited workspaces, Roles & RBAC (18 permissions), ORVIX AI (propose + verify), automations, email support
  - **Scale** — Custom, SOC 2 / audit / SSO, dedicated runtime, custom data residency, priority support
- FAQ section below (collapsible)
- Each card has a CTA: `Start free` / `Start 14-day trial` / `Talk to us`

### Onboarding (`/onboarding`)

- PublicShell wraps the 4-step Wizard
- Authed users are redirected to `/inbox` (server-side check)
- **Step 1 — Identity** — workspace name + your name + email
- **Step 2 — Industry** — select (3-card chooser)
- **Step 3 — Shape** — 7 work item types toggle (default 5 on)
- **Step 4 — Goal** — primary goal radio
- Stepper (numbered, with active ring) at the top
- Card-based step body with Back / Next / Finish

## Key decisions

- **PublicShell as the chrome** — the marketing surfaces get the same dark-first treatment as the AppShell, so the product feels continuous from `/` → `/onboarding` → `/inbox`
- **Single source of truth for the chrome** — only the `(marketing)` layout wraps; pages render their content only
- **Magic link is mocked** in the Phase 0 signin flow — clicking "Send magic link" doesn't dispatch an email; the UI shows the form so the visual flow is complete
- **Pricing tiers are a frozen PRD artifact** — the 3 tiers, prices, and feature lists come directly from the v0.2 PRD
- **Landing HeroMock is static** — the four KPI cards are hardcoded for the marketing surface (real data lives in the AppShell)

## Files added / changed

```
M  apps/web/src/app/(marketing)/layout.tsx
M  apps/web/src/app/(marketing)/onboarding/page.tsx     (removed double-wrap)
M  apps/web/src/app/(marketing)/onboarding/Wizard.tsx   (removed double brand row)
M  apps/web/src/app/(marketing)/signin/page.tsx
M  apps/web/src/app/(marketing)/pricing/page.tsx
M  apps/web/src/app/page.tsx                            (full landing rewrite)
A  apps/web/src/app/(marketing)/landing/_components/HeroMock.tsx
A  apps/web/src/app/(marketing)/landing/_components/PricingTeaser.tsx
A  scripts/screenshots-m4.mjs
A  scripts/screenshot-onboarding.mjs
M  packages/ui/src/components/PublicShell.tsx          (created in M3 setup, finalized in M4)
M  packages/ui/src/components/index.ts                 (export publicshell)
M  docs/M4-LANDING-AUTH-ONBOARDING-STATUS.md           (this file)
```

## Screenshots

`docs/screenshots/v1.0/`:

- `landing.png` — hero + AppShell preview
- `landing-2.png` — scrolled to Section 1 (inbox callouts) + Section 2 (work kanban)
- `signin.png` — centered glass card with magic link + OAuth
- `pricing.png` — 3-tier pricing (Solo/Team/Scale)
- `onboarding.png` — Step 1 (Identity) of the wizard, captured with cleared session

## Gate run

```bash
$ pnpm -r typecheck   # ✅ all packages
$ pnpm -r test        # ✅ 87 tests across 8 packages
$ pnpm -r lint        # ✅ no errors
$ pnpm -r build       # ✅ all apps build
```

## What's next

**M5** — Inbox (full), Work (refresh), Customers (refresh)
