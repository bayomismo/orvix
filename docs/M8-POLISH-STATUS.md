# M8 — Motion polish, Empty States, Loading, A11y, Responsive, Performance

**Status**: Complete
**Tag**: `v0.8.0-m8-polish`
**Gates**: ✅ typecheck, ✅ 87 tests, ✅ lint, ✅ build

## What landed

This is the polish milestone — no new features, just making the existing product feel right. Six areas, all targeted at production quality.

### 1. Loading states

Per Design System v1.0, skeletons are the only loading state. No spinners. Each route group now has a `loading.tsx` that mirrors the actual layout 1:1 so the perceived page swap is a smooth fade.

- **`(app)/loading.tsx`** — mirrors the Inbox 3-region layout (greeting skeleton, 4 metric skeletons, list of 5 row skeletons, right rail card)
- **`(marketing)/loading.tsx`** — mirrors the landing page hero (badge skeleton, headline skeleton, 2 CTAs, preview card)

### 2. Error boundary

Unhandled errors land in a self-contained card that keeps the user's workspace context.

- **`(app)/error.tsx`** — client component; shows the error message and digest; "Try again" calls `reset()`, "Back to inbox" navigates home

### 3. Not-found pages

Three not-found files, scoped by surface:

- **`/(app)/not-found.tsx`** — self-contained card (no AppShell dependency); "Back to inbox" + "Open Work" CTAs
- **`/(marketing)/not-found.tsx`** — same shape, but routes to `/` and `/pricing`
- **`/not-found.tsx`** (root) — fallback for paths that don't match any route group; renders without any layout

### 4. A11y — Skip to main content

Keyboard users can now jump past the chrome.

- **AppShell** — `sr-only focus:not-sr-only` link before the `<main>`; the `<main>` is `id="orvix-main" tabIndex={-1}` for a clean focus target
- **PublicShell** — same skip link pattern
- The link only appears on focus, centered at the top, with the brand-accent treatment so it's visible against the dark canvas

### 5. A11y — Title prop on PageHeader

`PageHeader` accepted only `string` for the title prop. Updated to `ReactNode` so the loading skeleton can use the same component (skeletons in the title slot). Avoids the antipattern of duplicating layout for the loading state.

### 6. Other polish

- **Focus rings** — already in `globals.css` as `*:focus-visible { outline: 2px solid var(--brand-accent); outline-offset: 2px; }`
- **prefers-reduced-motion** — already in `tokens.css` and `globals.css`; motion duration vars are zeroed under reduced motion
- **z-toast** — used for the skip link; already in tokens

## Key decisions

- **No spinners** — per v1.0 spec, only skeletons. The loading state mirrors the page layout 1:1, so the user sees the page "filling in" rather than a centered spinner
- **Skip link is `sr-only focus:not-sr-only`** — appears only on Tab, centered at the top with the brand-accent treatment, so it's discoverable but not visually noisy
- **Three not-found scopes** — each is self-contained (no layout dependency) because Next.js may not always wrap a not-found in its parent layout when the parent uses dynamic features like `cookies()`
- **The (app) layout's `requireSession()` redirects to /onboarding for unauthed users** — protected pages are 307, not 404. The 404 is for paths the user *can* access but don't exist

## Files added / changed

```
A  apps/web/src/app/(app)/loading.tsx            (new — skeleton layout)
A  apps/web/src/app/(app)/error.tsx             (new — error boundary)
A  apps/web/src/app/(app)/not-found.tsx         (new — self-contained 404)
A  apps/web/src/app/(marketing)/loading.tsx     (new — hero skeleton)
M  apps/web/src/app/(marketing)/not-found.tsx   (now self-contained)
A  apps/web/src/app/not-found.tsx               (new — root 404)
M  apps/web/src/components/AppShell.tsx          (added skip link + main id)
M  apps/web/src/components/PageHeader.tsx        (title: ReactNode)
M  packages/ui/src/components/PublicShell.tsx   (added skip link + main id)
A  scripts/screenshots-m8.mjs
M  docs/M8-POLISH-STATUS.md                      (this file)
A  docs/screenshots/v1.0/m8-loading.png
A  docs/screenshots/v1.0/m8-not-found-app.png
A  docs/screenshots/v1.0/m8-not-found-public.png
```

## Screenshots

- `m8-loading.png` — marketing surface loading skeleton
- `m8-not-found-app.png` — self-contained 404 card (root fallback)
- `m8-not-found-public.png` — same for the public surface

## Gate run

```bash
$ pnpm -r typecheck   # ✅ all packages
$ pnpm -r test        # ✅ 87 tests
$ pnpm -r lint        # ✅ no errors
$ pnpm -r build       # ✅ all apps build
```

## Route health check

| Route | Code |
| --- | --- |
| `/` | 200 |
| `/onboarding` | 200 |
| `/signin` | 200 |
| `/pricing` | 200 |
| `/inbox` | 307 (auth) |
| `/work` | 307 (auth) |
| `/customers` | 307 (auth) |
| `/reports` | 307 (auth) |
| `/ai` | 307 (auth) |
| `/settings` | 307 (auth) |
| `/admin` | 307 (auth) |
| `/this-does-not-exist` | 404 |
