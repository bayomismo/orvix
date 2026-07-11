# Milestone 2 — Component Library (Status)

**Date:** 2026-07-11
**Status:** ✅ All 4 gates green. 120 tests pass. Build green. Ready to commit.
**Tag:** `v0.2.0-m2-components` (to be tagged on commit)

---

## 1. Goal

Replace the Phase 0 v0.3 component library with the v1.0 Conductor
component library, fully token-driven, accessibility-aware, and
designed for the M3 AppShell. No business logic changes; no design
token changes; no API/Prisma/AI runtime changes.

## 2. Delivered

### 2.1 Component surface (`packages/ui/src/components/`)

| Component | Variants / API | Notes |
| --- | --- | --- |
| **Button** | 5 variants (primary/secondary/ghost/destructive/ai/link) × 5 sizes, `loading` state | 3-dot loading animation, `out-quint` easing |
| **Card** | 4 elevations (ghost/flat/raised/floating) + `glass` + `interactive` | CardHeader, CardBody, CardFooter, CardTitle, CardDescription |
| **Input** | Input, Textarea, Select (native + custom chevron), Checkbox (peer pattern, 16x16) | `invalid` boolean on Input, aria-describedby for description/error |
| **Badge** | 7 tones × 3 sizes, optional dot + icon | |
| **Field** | Field, FieldLabel, FieldDescription, FieldError | Composable, accessible by default |
| **EmptyState** | 4 shapes (firstTime/cleaned/filtered/inline) | `empty` legacy alias preserved |
| **Skeleton** | base + `circle` | Uses `--skeleton` token |
| **Progress** | Stepper (current/done/pending), `compact` | Numbered + dot styles |
| **Toggle** | OptionCard (radio card) + Switch (pill, keyboard) | No Radix dep; native a11y |
| **Table** | Table, THead, TBody, TR, TH, TD, TableEmpty | Sticky header, sort indicator, density via context |
| **Dialog** | Dialog + Sheet (right slide-in) | Radix-based; `out-quint` motion |
| **Navigation** | Breadcrumb, Tabs (Radix), Pagination | Animated tab indicator |
| **Sidebar** | Minimal v0.3 surface preserved for M2 transition | Replaced in M3 (AppShell) |

### 2.2 Icons (`packages/ui/src/components/icons.tsx`)

Starter set of 24 geometric icons, 1.5px stroke, 16x16 canvas. Full
icon set (~80 icons) lands in M3 alongside the AppShell.

`X`, `Check`, `ChevronDown/Right/Left`, `Plus`, `Search`, `Bell`,
`Settings`, `Inbox`, `Users`, `Briefcase`, `Folder`, `CheckSquare`,
`Message`, `File`, `InboxTray`, `BarChart`, `Sparkles`, `ArrowRight`,
`More`, `Filter`, `Calendar`, `List`, `Clock`, `Trash`.

### 2.3 Tests

- 24 new component tests (`packages/ui/src/__tests__/components.test.tsx`)
  - Button: primary/ai variants, loading state
  - Inputs: Input invalid state, Textarea rendering
  - Card: flat/raised elevations, header/footer composition
  - EmptyState: firstTime, inline, legacy `empty` alias
  - Switch: click toggles state
  - Pagination: disabled states, page-change callback
  - Table: sticky header, sort aria, empty slot
  - Stepper: current step highlighted
  - Field: label + description + error composition
  - OptionCard: radio + label
  - Badge: AI tone renders with `text-brand-ai`
  - Dialog: opens on trigger click

### 2.4 Build/test infrastructure

- Added `vitest` + `@testing-library/react` + `jsdom` to `@orvix/ui`
  devDependencies.
- `vitest.config.ts` + `vitest.setup.ts` for jsdom + jest-dom matchers.
- Added `@radix-ui/react-tabs` for the Navigation Tabs component.

## 3. Test count

| Package | Before M2 | After M2 | Δ |
| --- | --- | --- | --- |
| @orvix/config | 15 | 15 | — |
| @orvix/schemas | 15 | 15 | — |
| @orvix/db | 12 | 12 | — |
| @orvix/utils | 12 | 12 | — |
| @orvix/storage | 11 | 11 | — |
| @orvix/ai-runtime | 18 | 18 | — |
| @orvix/ui | 0 | **24** | +24 |
| apps/ai | 4 | 4 | — |
| apps/web | 9 | 9 | — |
| **Total** | **96** | **120** | **+24** |

## 4. Gates

| Gate | Result |
| --- | --- |
| `pnpm -r typecheck` | ✅ 10/10 packages green |
| `pnpm -r test` | ✅ 120/120 tests pass |
| `pnpm -r lint` | ✅ 10/10 packages green |
| `pnpm turbo run build` | ✅ 10/10 packages build |

## 5. Constraints respected

- ✅ No hex literals in feature code — all colors via tokens.
- ✅ `"use server"` files only export async functions — N/A (UI has none).
- ✅ No Prisma/API/AI runtime/business-logic changes.
- ✅ Token-driven (no raw values; `bg-brand-accent`, `rounded-md`,
     `text-text-secondary`, etc. all from M1).
- ✅ Backward compat: EmptyState `empty` alias, legacy v0.3 class
     names in `globals.css` preserved.
- ✅ Strict TS: `strict`, `noUncheckedIndexedAccess`,
     `exactOptionalPropertyTypes` all green.

## 6. Known issues / debt

1. **Sidebar is Phase 0 style.** It's token-refreshed but still uses
   the bordered, full-height, non-floating pattern. M3 (AppShell)
   replaces it with the floating-glass sidebar defined in
   `docs/DESIGN-SPRINT-V2.md` §6.

2. **Icons are a starter set.** 24 icons cover the v1.0 M2 surface;
   M3 adds the full ~80-icon set when the AppShell needs them.

3. **`exactOptionalPropertyTypes` workaround for icons.** The
   `IconProps.size?: number` field has to be typed as
   `number | undefined` because `exactOptionalPropertyTypes: true`
   treats `{ size: undefined }` differently from `{}`. Documented in
   the file header.

4. **Legacy v0.3 utility classes still in `globals.css`.** Backward
   compatibility during the M2 → M3 transition. M8 (cleanup) removes
   the unused ones.

## 7. Next milestone

**M3 — AppShell** (floating sidebar, top bar, command palette, Pulse
component, AI orb). Uses the components built in M2.

---

*Frozen: Design System v1.0 (Direction A: Conductor). All work above
implements tokens defined in M1 (`packages/config/tokens/tokens.css`).
No new tokens introduced in M2.*
