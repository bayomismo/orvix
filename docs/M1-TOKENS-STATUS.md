# Milestone 1 — Design Tokens (Status)

**Status:** Complete
**Gates:** typecheck ✓ · test ✓ (96 = 81 + 15 new) · lint ✓ · build ✓
**Design system:** v1.0 (Direction A — Conductor)

---

## What landed in M1

### 1. Tokens (the source of truth)

**`packages/config/tokens/tokens.css`** — every CSS custom property the app consumes.

- **Brand** — `--brand-primary`, `--brand-accent` (Electric Indigo #5046E5), `--brand-ai` (purple-violet), and their `-soft` variants.
- **Neutrals** — 13 steps from `--neutral-0` to `--neutral-950`, in both light and dark.
- **Surfaces** — canvas, raised, elevated, overlay, divider, divider-strong, inset, **glass** (new).
- **Text** — primary, secondary, muted, subtle, on-accent, link, **inverse** (new).
- **Status** — success, warning, danger, info, neutral (each with a `-soft` variant for tinted backgrounds).
- **Highlights** — `--highlight-1/2/3` for the accent; new `--highlight-ai-1/2/3` for the AI layer (kept separate per spec).
- **Pulse (signature)** — new tokens: `--pulse-color`, `--pulse-glow`, `--pulse-ai-glow`, `--pulse-thickness`. The line color, animation, and glow are all tokenized.
- **AI** — `--ai-dot-size`, `--ai-glow-blur`, `--ai-glow-opacity`, `--ai-border-opacity`.
- **Spacing** — the 8px grid per spec: `space-0` through `space-12` (`space-3 = 8px`, `space-5 = 16px`, `space-7 = 24px`, `space-8 = 32px`, `space-9 = 48px`, `space-10 = 64px`, `space-11 = 96px`, `space-12 = 128px`).
- **Radius** — 7 tokens per spec: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `full`.
- **Motion** — 4 durations (`instant 80ms`, `fast 160ms`, `default 240ms`, `slow 400ms`) + 5 easings (`out-quint`, `in-out-quart`, `out-back`, `in-cubic`, `linear`).
- **Z-index** — `dropdown 10`, `sticky 20`, `overlay 30`, `modal 40`, `toast 50`, `palette 60`, **`pulse 70`** (new).
- **Glass** — `--glass-blur 24px`, `--glass-saturate 180%`, `--glass-bg`, `--glass-border`.
- **Shadows** — `1`, `2`, `3`, `4` (4 elevation levels), `focus`, **`glow-accent`**, **`glow-ai`** (new).
- **Reduced motion** — every duration collapses to 0ms when `prefers-reduced-motion: reduce` is set.

**`packages/config/tokens/tokens.json`** — the JSON source-of-truth used by the Tailwind preset. Every value here is a CSS custom property reference, not a raw color.

### 2. Tailwind preset

**`packages/config/tailwind/tailwind.config.ts`** — re-derived to consume the new tokens.

- **Colors**: `brand`, `neutral`, `surface`, `text`, `status`, `highlight`, **`ai`** (new), **`pulse`** (new).
- **Font sizes**: `2xs`, `xs`, `sm`, `base`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, plus `data-sm`, `data-md`, `data-lg` for numerics (mono).
- **Spacing**: 0–12 mapped to `var(--space-N)`. Legacy v0.3 spacing kept as `0.5` and `1.5` during the migration.
- **Radius**: 7 tokens per spec.
- **Box-shadow**: 1, 2, 3, 4, focus, `glow-accent`, `glow-ai`, none.
- **Transition duration**: `instant 80ms`, `fast 160ms`, `default 240ms`, `slow 400ms`. Legacy v0.3 (`base`, `page`, `spring`) kept during the migration.
- **Transition timing**: `out-quint` (default), `in-out-quart`, `out-back`, `in-cubic`, `linear`. Legacy `snappy`, `smooth`, `spring` kept.
- **Backdrop blur / saturate**: `backdrop-blur-glass` (24px), `backdrop-saturate-glass` (180%).
- **Z-index**: from the tokens file.
- **Ring color**: `accent`, `ai`.

### 3. App entry point

**`apps/web/src/app/globals.css`** — re-derived.

- Imports the new `tokens.css` (the v1.0 source of truth).
- Sets `color-scheme: dark` on `html` by default; `html[data-theme="light"]` switches to light.
- Defines the **Pulse** component class `.orvix-pulse` with 6 states (idle, syncing, ai, warning, error, action) and the corresponding keyframes.
- Defines the **AI** helpers: `.orvix-ai-dot` (4px dot with glow), `.orvix-ai-glow`, `.orvix-ai-border`.
- Defines the **Glass** surface: `.orvix-glass` with the 24px blur / 180% saturate.
- Re-defines the **Card** components to use the new radius (`md` = 6px) and `out-quint` easing.
- Preserves all v0.3 component classes (`orvix-card`, `orvix-card-hover`, `orvix-card-interactive`, `orvix-focus-ring`, `orvix-numeric`, `bg-hero-glow`, `text-balance`) so the rest of the app keeps compiling.

**`apps/web/src/app/layout.tsx`** — sets `data-theme="dark"` on `<html>` so the Conductor direction is the default.

### 4. Tests

**`packages/config/__tests__/tokens.test.ts`** — 15 conformance tests that guard the design system:

- `version` is `1.0.0`
- Every brand token has a `light` and `dark` value, both 6-digit hex
- Brand accent is Electric Indigo (`#5046E5`)
- AI color is purple-violet, separate from accent
- All 13 neutral steps present in both themes
- All 5 status tokens have `light`/`dark`/`-soft` pair
- AI highlights present (separate from accent)
- Type scale includes all 13 v1.0 tokens
- Type scale descends monotonically
- Radius has the 7 spec tokens
- Motion has 4 durations (80, 160, 240, 400ms) and 5 easings
- Pulse tokens are present (thickness, glow, per-state colors)
- Z-index scale includes `pulse > palette > toast`
- Agent rules: no raw hex in feature code, use only CSS vars, AI color reserved for AI

These tests are the **contract** between the design system and the codebase. If anyone changes a token, the test that depends on the spec value fails, and we know immediately.

---

## What's NOT in M1 (deferred to later milestones)

- The **Pulse component** itself (a `<Pulse />` React component with the click-to-status interaction). The CSS exists in M1; the React component lands in M3.
- The **AI orb**, **command palette**, **sidebar**, **top bar** — all M3 (AppShell).
- The **custom icon set** — M3.
- The **illustration library** — M3.
- The **component library** (buttons, inputs, cards, tables, dialogs, forms, nav) — M2.
- The **AI inline patterns** (per-surface AI chips, AI dialog corner, etc.) — M2.
- The **reduced motion** prefers-reduced-motion media query is in the tokens file; component-level handling comes in M8.

---

## Files changed

| File | Change |
| --- | --- |
| `packages/config/tokens/tokens.css` | Full rewrite to v1.0 spec |
| `packages/config/tokens/tokens.json` | Full rewrite to v1.0 spec |
| `packages/config/tailwind/tailwind.config.ts` | Re-derived from v1.0 tokens |
| `packages/config/package.json` | Added `test` script + `vitest` devDep |
| `packages/config/vitest.config.ts` | New — drives the token test |
| `packages/config/tsconfig.json` | Includes test files, adds vitest types |
| `packages/config/__tests__/tokens.test.ts` | New — 15 conformance tests |
| `apps/web/src/app/globals.css` | Re-derived; new Pulse, AI, glass classes; preserves v0.3 utilities |
| `apps/web/src/app/layout.tsx` | Sets `data-theme="dark"` on `<html>` |

**Total: 9 files changed, 1 file added (the test). No code paths to backend, AI runtime, or business logic touched.**

---

## Verification

```
$ pnpm -r typecheck    →  Done
$ pnpm -r test         →  96 tests, 96 passed
   (was 81; +15 from the new token conformance suite)
$ pnpm -r lint         →  Done
$ pnpm -r build        →  Done, 15 web routes, 103 kB First Load JS
```

The 4 gates are green. The design system is in place. M2 (Component Library) can begin.

---

**Ready for M2 approval. Awaiting user signal.**
