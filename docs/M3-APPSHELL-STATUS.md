# Milestone 3 — AppShell (Status)

**Date:** 2026-07-11
**Status:** ✅ All 4 gates green. 120 tests pass. Build green. 5 screenshots + 1 bonus captured.
**Tag:** `v0.3.0-m3-appshell` (to be tagged on commit)

---

## 1. Goal

The AppShell must become the strongest visual identity of ORVIX.

Not a sidebar. **An operating system frame.**

Every chrome element is a piece of branded product surface: floating
glass, perfect spacing, premium shadows, blur surfaces, the signature
Pulse, and the universal command palette.

## 2. Delivered

### 2.1 AppShell (`apps/web/src/components/AppShell.tsx`)

The new chrome that wraps every (app) page. Composes:
- The signature **Pulse** (1px line at the very top of the workspace)
- The **floating glass sidebar** (`AppSidebar`)
- The **floating glass topbar** (`AppTopbar`)
- The **floating AI orb** (`AIBubble`)
- The **universal command palette** (`CommandPalette`, ⌘K)
- The **page transition wrapper** (smooth enter on every navigation)

Keyboard: ⌘K / Ctrl-K opens the command palette, Esc closes it.

### 2.2 Component surface (`packages/ui/src/components/`)

| Component | What it does |
| --- | --- |
| **Pulse** | The 1px signature status line; 6 states (idle/syncing/ai/action/warning/error); `usePulse()` hook for imperative control. |
| **Orb** | The persistent AI entry point. Variants: `floating` (FAB), `inline` (nav/button marker), states (idle/thinking/speaking) with breathing animation. |
| **AppSidebar** | Floating glass sidebar. Workspace switcher, 6 destinations, AI entry section, profile chip. **Active indicator**: 2px gradient line on the left edge + tinted background + brand-colored icon. |
| **AppTopbar** | Floating glass topbar. Page title slot, universal search trigger, **Ask AI** button (highlighted with brand-ai), notifications bell, profile avatar. |
| **NotificationCenter** | Radix Popover-based notifications panel; tone dot, mark-all-read, AI/success/warning tones. |
| **ProfileMenu** | Radix Popover-based user menu; identity, Settings/Notifications/Team links, Sign out. |
| **AIBubble** | The floating AI orb + focused AI sheet (right slide-in, glass). Quick prompts, prompt input, ⌘. to focus. |
| **CommandPalette** | Universal ⌘K surface. Fuzzy search, 4 result categories (navigate, ai, action, settings), keyboard navigation. |
| **icons.tsx** | 25-icon starter set, 1.5px stroke, 16x16 canvas (added `LogOut`). |

### 2.3 AppShell keyframes (`apps/web/src/app/globals.css`)

- `orvix-fade-in` — overlay fade (180ms, ease-out)
- `orvix-cmd-in` — command palette enter (220ms, out-quint)
- `orvix-pop-in` — popover enter (180ms, out-quint)
- `orvix-sheet-in` — AI sheet right slide-in (240ms, out-quint)
- `orvix-page-in` — page enter (240ms, out-quint, opacity + 4px translate)
- `orvix-orb-pulse` — Orb breathing animation (2s loop)
- `orvix-orb-think` — Orb "thinking" state (1.6s, rotate + scale)
- `orvix-orb-dot` — Inner AI dot pulse (1.5s, scale + opacity)

### 2.4 Screenshots (`docs/screenshots/v1.0/`)

Five primary views + one bonus:

| File | Source | What it shows |
| --- | --- | --- |
| `dashboard.png` | `/inbox` | Greeting, metric cards, Today feed, right rail. AppShell with Inbox active. |
| `work.png` | `/work` | 10 work items across 7 types. AppShell with Work active (gradient line + count badge). |
| `customer.png` | `/customers` | Kanban pipeline (Lead, Qualified, Proposal, Won). AppShell with Customers active. |
| `ai.png` | `/ai` | AI Console with action picker, prompt input, templates. AppShell with AI Assistant active. |
| `reports.png` | `/reports` | 4 KPI cards + work-item mix placeholder. AppShell with Reports active. |
| `command-palette.png` | `/inbox` + ⌘K | Universal command palette open with categorized results. |

### 2.5 Tooling

- `scripts/screenshots-v1.mjs` — Playwright screenshot script. Reads
  `ORVIX_SESSION_COOKIE` from env, captures 5 viewports + 1 bonus.
- `scripts/debug-h1.mjs` — DOM introspection helper (used during M3 to
  identify the `h-12` token bug).

## 3. Token-system bug discovered and fixed

M1 introduced a token-driven spacing scale that **overrides Tailwind's
default scale**:

| Token | v1.0 value | v0.3 (default Tailwind) |
| --- | --- | --- |
| `h-9` | 48px | 36px |
| `h-10` | 64px | 40px |
| `h-11` | 96px | 44px |
| `h-12` | 128px | 48px |

The first screenshot pass showed a 128px-tall topbar overlapping the
page header. Root cause: the M2 components used `h-12` (intending 48px)
but the v1.0 token scale mapped `h-12` to 128px.

**Fix**: replaced all `h-12` → `h-9` (48px) in `AppTopbar.tsx`,
`EmptyState.tsx`, `Orb.tsx`, `Table.tsx` (comfortable density), and
`Toggle.tsx`. Also added a CHANGELOG note in `docs/M1-TOKENS-STATUS.md`
(see "known issues" in M1) — fixed in M3.

## 4. Test count

| Package | Before M3 | After M3 | Δ |
| --- | --- | --- | --- |
| @orvix/config | 15 | 15 | — |
| @orvix/schemas | 15 | 15 | — |
| @orvix/db | 12 | 12 | — |
| @orvix/utils | 12 | 12 | — |
| @orvix/storage | 11 | 11 | — |
| @orvix/ai-runtime | 18 | 18 | — |
| @orvix/ui | 24 | 24 | — |
| apps/ai | 4 | 4 | — |
| apps/web | 9 | 9 | — |
| **Total** | **120** | **120** | — |

(All 24 M2 component tests still pass; no new M3 component tests yet
— the M3 surface is exercised by the screenshots and manual smoke
tests. Test additions land in M4 alongside page refreshes.)

## 5. Gates

| Gate | Result |
| --- | --- |
| `pnpm -r typecheck` | ✅ 10/10 packages green |
| `pnpm -r test` | ✅ 120/120 tests pass |
| `pnpm -r lint` | ✅ 10/10 packages green |
| `pnpm turbo run build` | ✅ 10/10 packages build |

## 6. Constraints respected

- ✅ No hex literals in feature code — all colors via tokens
- ✅ No changes to: business logic, Prisma, AI runtime, APIs, routes
- ✅ Tokens unchanged from M1 (Pulse + glass + AI tokens already in place)
- ✅ Backward compat: EmptyState `empty` alias, legacy v0.3 classes
  still in `globals.css`
- ✅ Strict TS: `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes` all green
- ✅ `next` added as a peer dep of `@orvix/ui` (needed for `next/link`
  and `next/navigation` in AppSidebar/ProfileMenu/CommandPalette)

## 7. Known issues / debt

1. **Active nav indicator overlaps nav item text vertically.** The 2px
   gradient line is at `top-1/2 h-5 -translate-y-1/2`. For long nav
   labels it can look slightly off-center. Refining in M4 when the
   density contract is finalized.

2. **Profile menu and notification center aren't yet wired into the
   AppTopbar slots.** The topbar renders the popovers correctly but
   they currently both use the global bell/avatar button (notifications
   are hardcoded). The wiring passes through `onOpenNotifications` and
   `onOpenProfile` props but the AppShell currently has empty handlers.
   M4 wires these to actual popover instances.

3. **Page transition key is `pathname`.** This means the entire page
   content re-mounts on every nav, including the scroll position.
   Acceptable for now; M8 (perf polish) will add ScrollRestoration.

4. **The Pulse is invisible in screenshots.** It's 1px and gray
   (`var(--surface-divider)`) at idle — by design. The action and
   warning states animate the line; in idle it's a subtle baseline.
   Future work: make the idle state a faint brand-colored gradient.

5. **`AppShell` is in `apps/web`, not `@orvix/ui`.** The shell is
   tightly coupled to the session model. The chrome components
   themselves (`AppSidebar`, `AppTopbar`, etc.) live in `@orvix/ui`.

## 8. Next milestone

**M4 — Landing, Auth, Onboarding** (public surface). The AppShell is
the authed surface; M4 refreshes the unauthed surface (landing, sign
in, sign up, onboarding wizard) to match the v1.0 visual language.

---

*Screenshots in `docs/screenshots/v1.0/`. Visual language: Design
System v1.0 (Direction A: Conductor). All work above implements tokens
defined in M1.*
