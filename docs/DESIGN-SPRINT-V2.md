# ORVIX Design System v1.0 — *Conductor*

> **Status:** Frozen, awaiting final approval
> **Direction:** A — Conductor
> **Scope:** 100% presentation layer. No backend, no architecture, no APIs, no business logic, no routes touched.
> **Benchmark:** Products shown on the homepages of Linear, Vercel, Notion, Stripe, Arc, Apple, Raycast — used as reference for *quality*, not for *style*.
> **Goal:** ORVIX gets its own iconic visual identity. Premium, handcrafted, never generic.

---

## Change log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-07-11 | Initial document. 7 sections, three directions. |
| 0.2 | 2026-07-11 | Direction A — Conductor approved. Signature + AI language + marketing + illustration system added. |
| **1.0** | **2026-07-11** | **Frozen. Awaiting final approval.** |

---

## Part 1 — Design Philosophy

### 1.1 The intent

ORVIX is the operating system for adaptive business. Not a CRM, not a project tool, not an inbox. The system where customer work, deal work, project work, and conversation work converge, with an AI that lives in the substrate.

**The UI should feel like a great instrument.**

You don't think about Linear when you use it. You don't think about Stripe when you read a dashboard. They disappear into the work. The user moves with speed, the system responds with grace, the data is at the right density, and the AI helps without intruding.

ORVIX must reach that bar. When a user opens the app, the interface should feel inevitable — like it was always supposed to be this way.

### 1.2 The principles

Every decision is checked against these six principles. If it fails one, it doesn't ship.

| # | Principle | Test |
| --- | --- | --- |
| 1 | **One job per surface** | Can a new user describe this screen in one sentence? If not, split it. |
| 2 | **Density without clutter** | Can a power user scan this in 2 seconds? If not, remove decoration. |
| 3 | **Motion with meaning** | Does every animation explain a state change? If it doesn't, cut it. |
| 4 | **Keyboard parity** | Can every action be done without a mouse? If not, add the shortcut. |
| 5 | **The AI is a layer, not a page** | Does the AI feel native to the surface it's working on? If it feels bolted-on, redesign. |
| 6 | **Premium is in the details** | Are the 1px borders, the 8ms timing curves, the focus rings, the empty states all correct? If not, fix them. |

### 1.3 What we are not

- **Not** an admin template. No sidebar + content layout that could be swapped into any product.
- **Not** Bootstrap / Material / shadcn defaults. Every component is custom.
- **Not** generic SaaS. No "Pricing", "Features", "Customers" page template language.
- **Not** default Tailwind. No slate-100, gray-900, blue-500. The palette is ORVIX.
- **Not** cluttered. Every pixel earns its place.

### 1.4 The four surfaces

ORVIX has four primary surfaces. The design must treat each as a distinct environment, not a route:

1. **The Workspace** — the application surface where work happens. Inbox, work, customers, AI.
2. **The Inbox** — a focused reading surface. Email-like, but for all the things that need attention.
3. **The Canvas** — a record surface. Customer profile, work item detail. Deep, dense, scannable.
4. **The Dialogue** — a transient surface. AI conversation, command palette, quick actions.

Each surface has its own visual rhythm, its own motion vocabulary, and its own density target.

---

## Part 2 — Visual Identity

### 2.1 The name

**ORVIX** is a constructed name, six letters, two syllables, three phonemes (`or-viks`). It has the rhythm of a precision instrument brand — like a Leica, a Bang & Olufsen, or a Teenage Engineering product.

### 2.2 The wordmark

- **Default:** ORVIX, all caps, in Geist Sans Bold, tracking +40, weight 700.
- **Compact:** ORVIX, lowercase, in Geist Sans Medium, tracking +20, for monogram use.
- **Monogram:** The `O` becomes a load-bearing shape — a perfect circle with a single 1px line bisecting the right edge (the **conductor's mark**). This monogram is the favicon, the loading state, the AI indicator, and the empty-state anchor.

### 2.3 The brand personality

ORVIX is:

- **Calm, not energetic.** We never shout. We never use exclamation marks in the UI.
- **Precise, not playful.** The product is for people who value their time.
- **Considered, not maximalist.** We earn every element. We don't decorate.
- **Quietly intelligent, not boastful.** The AI is helpful. It doesn't need to tell you it's helpful.
- **Confident, not arrogant.** The product assumes you know what you're doing.

### 2.4 What makes ORVIX recognizable

In any one of the three directions, the following must be true:

- The **first screen** has a single, dominant, focused element — never a dashboard grid of cards.
- The **active state** is unmistakable. There is no ambiguity about where you are.
- The **motion** is choreographed. Things don't appear, they arrive.
- The **AI** is present without being loud. A subtle glow, a small mark, a single line of context.
- The **data** is honest. Numbers use tabular figures. Colors carry meaning, not decoration.
- The **typography** is consistent. There is a font for UI, a font for data, a font for the AI. No more.

---

## Part 3 — Design System

### 3.1 Color philosophy

We use **eight colors** total. Not twelve. Not twenty. Eight.

- **3 neutrals** — for surfaces, text, borders
- **1 brand accent** — for identity, primary actions, the active state
- **1 success** — for "done", "positive", "on track"
- **1 warning** — for "blocked", "attention", "stale"
- **1 error** — for "failed", "critical", "must fix"
- **1 ai** — for the AI layer; a separate hue family from the brand accent

The neutrals do the heavy lifting. The accents are used sparingly, always carrying meaning.

### 3.2 Type scale

| Token | Size / Line | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| `display-2xl` | 72 / 80 | 600 | -0.04 | Marketing hero only |
| `display-xl` | 56 / 64 | 600 | -0.04 | Empty states, onboarding |
| `display-lg` | 44 / 52 | 600 | -0.03 | Page titles |
| `display-md` | 32 / 40 | 600 | -0.02 | Section titles |
| `display-sm` | 24 / 32 | 600 | -0.02 | Card titles, dialogs |
| `text-lg` | 16 / 24 | 500 | -0.01 | Lead paragraphs |
| `text-md` | 14 / 22 | 400 | -0.005 | Body (the default) |
| `text-sm` | 13 / 20 | 400 | 0 | Dense UI, table cells |
| `text-xs` | 12 / 18 | 500 | +0.01 | Labels, captions |
| `text-2xs` | 10 / 14 | 600 | +0.04 | UPPERCASE labels, tags |
| `data-lg` | 18 / 24 | 500 mono | 0 | Large numbers (KPI cards) |
| `data-md` | 14 / 20 | 500 mono | 0 | Table numerics |
| `data-sm` | 12 / 16 | 500 mono | 0 | Small numerics |

All UI text uses **Geist Sans** with `font-feature-settings: "ss01", "cv11"` for the premium cut.
All data uses **Geist Mono** for tabular alignment.
Marketing/hero can use a serif (GT Sectra, Newsreader) for the human touch.

### 3.3 Spacing

The 8px grid is non-negotiable. Every margin, padding, gap, and inset must resolve to a multiple of 4px (with 8px as the canonical step).

| Token | Value | Common use |
| --- | --- | --- |
| `space-0` | 0 | Reset |
| `space-1` | 2px | Micro adjustments (1px borders) |
| `space-2` | 4px | Inside a chip, between icons and labels |
| `space-3` | 8px | Default tight padding |
| `space-4` | 12px | Default between related elements |
| `space-5` | 16px | Standard card padding |
| `space-6` | 20px | Between list items |
| `space-7` | 24px | Card to card |
| `space-8` | 32px | Section to section |
| `space-9` | 48px | Major section break |
| `space-10` | 64px | Page-level vertical rhythm |
| `space-11` | 96px | Hero / onboarding only |
| `space-12` | 128px | Marketing only |

### 3.4 Radius

| Token | Value | Use |
| --- | --- | --- |
| `radius-none` | 0 | Tables, code, monospace |
| `radius-xs` | 2px | Buttons (default) |
| `radius-sm` | 4px | Inputs, chips |
| `radius-md` | 6px | Cards, dialogs |
| `radius-lg` | 10px | Sheets, modals |
| `radius-xl` | 16px | Surface containers (rare) |
| `radius-full` | 9999px | Pills, avatars |

**The rule:** the larger the surface, the larger the radius. Buttons and inputs use small radius (snappy). Cards and dialogs use medium (premium). Sheets use large (open, welcoming).

### 3.5 Elevation

We use **three elevation levels**, plus a top layer. Each has a specific role.

| Level | Use | Visual cue |
| --- | --- | --- |
| `0 — base` | The page background | The darkest or lightest tone |
| `1 — surface` | Cards, list items, panels | Subtle elevation via brightness/shadow |
| `2 — overlay` | Dropdowns, popovers | More shadow, optional 1px border |
| `3 — modal` | Dialogs, sheets | Maximum shadow, may use backdrop blur |
| `top — toaster` | Toasts, command palette | Full backdrop blur, large shadow |

Shadows are **layered, not single**. Each elevation is a stack of two shadows: one ambient (broad, low opacity), one direct (tight, mid opacity). This is what makes the UI feel like real depth, not a flat drop shadow.

### 3.6 Borders

1px borders are the primary structural element. They are subtle, never black-on-white, never decorative.

| Token | Use |
| --- | --- |
| `border-subtle` | Default divider, card edge |
| `border-default` | Card, input, button outline |
| `border-strong` | Active input, focused card |
| `border-accent` | Active state, primary action |

Border colors are always at **6%–12% opacity of the foreground**, never solid. This is what makes the UI feel premium — the borders disappear until you need them.

### 3.7 Icons

Custom icon set, drawn at 20px on a 24px grid, 1.5px stroke, with a single fill mode. We do not use any third-party icon library (no Lucide, no Tabler, no Heroicons). The icon set is ORVIX — sharp, geometric, considered.

**Three weights:** outline (default), filled (active/selected), duo-tone (AI surfaces).

### 3.8 States

Every interactive element has six states, designed deliberately:

| State | Visual |
| --- | --- |
| `default` | The base, at rest |
| `hover` | +1 elevation, +5% brightness, 1px border, 120ms transition |
| `focus` | 2px ring (brand accent at 30% opacity), no offset, persistent until blur |
| `active` | −1 elevation, +10% brightness, 80ms transition |
| `disabled` | 40% opacity, no hover effect, `cursor: not-allowed` |
| `loading` | Skeleton shimmer (never spinner), or brand-accent pulse for buttons |

### 3.9 Accessibility

- **Contrast:** All text/background pairs meet WCAG AA (4.5:1 body, 3:1 large text).
- **Focus:** Visible 2px ring on every focusable element. Never removed.
- **Keyboard:** Every action has a shortcut. Tab order matches visual order.
- **Screen reader:** ARIA labels on every interactive element. Live regions for AI streaming.
- **Motion:** `prefers-reduced-motion` disables non-essential animation.
- **Color:** Never the only signal. Status icons + text accompany color.

### 3.10 Tokens

All values above are exposed as **CSS custom properties** with semantic names, NOT as raw color/spacing values. For example:

```css
:root {
  --color-bg-base: 0 0% 4%;
  --color-bg-surface: 0 0% 7%;
  --color-fg-default: 0 0% 96%;
  --color-fg-muted: 0 0% 60%;
  --color-accent: 244 76% 60%;
  --radius-md: 6px;
  --space-5: 16px;
  --shadow-overlay: 0 4px 12px rgb(0 0 0 / 0.3), 0 1px 2px rgb(0 0 0 / 0.2);
}
```

Components consume `--color-bg-surface`, never `rgb(20, 20, 22)`. This lets us swap themes instantly, and lets the three directions share the same component code with different token values.

---

## Part 4 — Component Library

The component library is **28 components**, each handcrafted. Every component is described below; the implementation lives in `apps/web/src/components/ui/`.

### 4.1 Buttons

Five variants, three sizes, six states each.

- **Primary:** Brand accent bg, white text. Used for the one primary action per surface.
- **Secondary:** Surface bg, 1px border, default text. Default for actions.
- **Ghost:** No bg, no border, default text. For inline actions, toolbars.
- **Destructive:** Red bg, white text. For deletes, irreversible actions.
- **AI:** Brand-AI gradient bg (subtle, from accent to AI hue), AI icon. Reserved for AI actions.

Sizes: `sm` (28px), `md` (32px), `lg` (40px).

**Premium details:** the press animation is a 2px translateY on the 80ms ease. The focus ring is a soft 4px glow. The loading state replaces the label with three animated dots (never a spinner).

### 4.2 Inputs

- **Text input:** 32px tall, 6px padding, 1px border, floating label that animates from inside the field to above on focus.
- **Textarea:** Auto-growing, max 8 rows visible.
- **Select:** Custom dropdown (not native). Searchable when options > 8.
- **Combobox:** Typeahead + async list. Used for assignee, customer, etc.
- **Date picker:** Three-column view (day/week/month), keyboard-first, with quick-pick chips for common ranges.
- **Toggle:** Pill switch with a 120ms spring transition.
- **Checkbox:** Custom 16x16, with an animated check that draws via stroke-dashoffset.
- **Radio:** Custom, with an inner dot that scales in.

**Premium details:** invalid state has a 1px error border and a one-line message below. The label never disappears — it floats up. The focus ring is on the input, not the wrapper.

### 4.3 Tables

The work surface. This is where density meets clarity.

- **Sticky header**, 1px bottom border, optional sort indicator.
- **Resizable columns** via right-edge drag handle (8px hit area).
- **Row hover:** 1px subtle bg change, no border.
- **Row selection:** checkbox column, `cmd+click` for range, `shift+click` for multi.
- **Bulk actions:** appear in a floating bar at the bottom of the table when 1+ rows selected. Slides in with motion.
- **Filters:** chip row above the table. Click to open a popover with filter logic. Active filters have a count badge.
- **Sorting:** click the header to sort, shift+click for multi-sort, with priority indicator.
- **Empty state:** centered illustration + single sentence + one primary action.
- **Loading:** 8-row skeleton, identical to the real row layout.

### 4.4 Cards

Three types:

- **Stat card:** A label, a large number (data-lg), a delta indicator, a sparkline. Used on dashboards.
- **Record card:** An avatar, a title, two lines of metadata, a status pill, a right-side action. Used in lists.
- **Container card:** A section with a header (title + optional action) and a body. Used to group related content.

**Premium details:** cards have a 1px border + 1 elevation, never both alone. Hover increases to 2 elevation. Click is detected by an internal press animation, not a global click handler.

### 4.5 Dialogs and sheets

- **Dialog (modal):** Centered, max 560px wide, 1 elevation + 1px border, 200ms scale-in from 0.96.
- **Sheet (side panel):** Right side, 480px wide, 2 elevation, 240ms slide-in.
- **Drawer (bottom):** Mobile only, drag-to-dismiss, snaps to half/full/closed.

All three share a backdrop: 1px border + 8 elevation + backdrop blur (12px).

### 4.6 Navigation

- **Sidebar:** Floating, glass, 240px expanded / 56px collapsed. See Part 6 for full concept.
- **Top bar:** Floating, 56px tall, holds search, workspace, breadcrumb, actions, profile.
- **Breadcrumb:** Inline, with overflow ellipsis after the 3rd level.
- **Tabs:** Underline style, 1px active indicator that animates between tabs.
- **Pagination:** "Page X of Y" + prev/next, no giant page-number grid.

### 4.7 Command palette

- Triggered by `Cmd+K` from anywhere.
- Centered, max 640px wide, 12px radius.
- Search input at the top, large (40px), with a placeholder that hints at the context.
- Results grouped by type: **Actions**, **Records**, **AI**, **Settings**.
- Each result has an icon, a title, a subtitle, and a keyboard hint.
- AI section is always present, ready to take a prompt.
- Arrow keys to navigate, enter to execute, escape to close.
- The palette is the AI entry point for everything — see Part 6.5.

### 4.8 Toasts and notifications

- Bottom-right, stacked, 4 elevation + backdrop blur.
- 4 variants: info, success, warning, error.
- Auto-dismiss in 4s, hover pauses the timer, click expands.
- Unread notifications show a 1px accent dot.

### 4.9 Avatars and presence

- Circular, 24/32/40/56px sizes, 1px border.
- Presence: 1px ring on the bottom-right (online: success, away: warning, offline: muted).
- Stacks: 24px with a 2px gap, last avatar shows a "+N" chip.

### 4.10 Status pills

- 6 status types: backlog, in progress, blocked, in review, done, archived.
- Each is a 1px border + tinted bg, with a 6px dot prefix.
- The text is uppercase 2xs, weight 600.

### 4.11 Empty states

- Centered, 240px wide.
- Custom illustration (geometric, not cartoony) OR a single bold typographic statement.
- One sentence of context, one primary action.
- No "lorem ipsum", no clipart, no gradients.

### 4.12 Loading skeletons

- 8px radius, subtle shimmer from left to right.
- 1.4s duration, infinite, eases at the edges.
- Mirrors the actual layout 1:1 — same widths, same heights.

---

## Part 5 — Motion Language

Motion is the soul of the interface. We use **Framer Motion** with a strict choreography.

### 5.1 The four durations

| Token | Duration | Use |
| --- | --- | --- |
| `motion-instant` | 80ms | Press, toggle, micro state change |
| `motion-fast` | 160ms | Hover, focus, tooltip |
| `motion-default` | 240ms | Open dialog, expand panel, route transition |
| `motion-slow` | 400ms | Page transition, sheet, onboarding step |

### 5.2 The five easings

| Token | Curve | Use |
| --- | --- | --- |
| `ease-out-quint` | `cubic-bezier(0.16, 1, 0.3, 1)` | The default for entering elements |
| `ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` | Resizing, expanding |
| `ease-out-back` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bounce for notifications |
| `ease-in-cubic` | `cubic-bezier(0.32, 0, 0.67, 0)` | Leaving elements |
| `ease-linear` | `linear` | Shimmer, pulse, indefinite loops |

### 5.3 Choreography

- **Staggered lists:** 30ms between items, max 8 items animated, the rest appear instantly.
- **Shared layout:** the same component moving between two positions uses `layoutId` and a 240ms `ease-out-quint`. Used for the active sidebar item morphing into the page content.
- **Route transitions:** outgoing fades 80ms, incoming slides up 8px over 240ms, both `ease-out-quint`.
- **Modal/dialog:** scale from 0.96 to 1, opacity 0 to 1, 200ms `ease-out-quint`. Backdrop fades in 160ms.
- **Sheet:** slide from right, 280ms `ease-in-out-quart`, with a 2px shadow that grows during the slide.
- **Command palette:** scale from 0.96 to 1, opacity 0 to 1, 200ms. No backdrop, the page dims behind it.
- **AI streaming:** text appears character by character (or word by word for longer), 16ms per token, no caret. The user knows it's live.
- **Hover:** never a 200ms fade. Hover transitions are 120ms with `ease-out-quint`. The UI feels responsive.

### 5.4 What never animates

- Layout changes (column widths, panel sizes) — these are instant unless the user is dragging.
- Loading spinners — we use skeletons, period.
- Color changes on focus — focus rings are instant, not faded in.
- The scrollbar.
- The page title in the top bar.

### 5.5 Reduced motion

When `prefers-reduced-motion: reduce`, all motion uses the 80ms instant token. No shared layout transitions. No pulses. The UI is still premium, just static.

---

## Part 6 — AppShell Concept

The AppShell is the operating system's identity. It must feel like a precision instrument, not a website chrome.

### 6.1 The floating sidebar

The sidebar is **floating**, not docked. It lives 16px from the top, 16px from the left, with a 16px gap to the content on its right. It's 240px wide expanded, 56px wide collapsed.

**Expanded state:**
- Glass surface: `backdrop-filter: blur(24px) saturate(180%)` on a tinted surface.
- 1px border at 6% opacity.
- The brand monogram (the **O** with the conductor's mark) sits at the top, 32px tall, with the wordmark next to it.
- Below the brand: a **workspace switcher** — a single clickable row with the current workspace name, a chevron, and a color dot.
- Below the workspace: **navigation groups** (Workspace, Personal, AI). Each group has a 2xs uppercase label, 8px letter-spacing, 16px below the group.
- Each nav item: 32px tall, 8px horizontal padding, 6px radius. Icon on the left (20px), label in the middle, optional badge on the right.
- The active item: brand accent bg at 12% opacity, 1px border at the same color, brand accent text, brand accent icon. A **1px line on the left edge** that is 16px tall, vertically centered, also brand accent.
- Below the nav: the user menu, pinned to the bottom. Avatar + name + role. Hover reveals a popover.

**Collapsed state:**
- The sidebar collapses to 56px wide with a 200ms `ease-in-out-quart` animation.
- Icons remain. Labels disappear. Tooltips appear on hover after 400ms.
- The active state indicator (the 1px line) remains — it's the most important visual.

**Animation on toggle:**
- The width animates, and the labels fade out 80ms before the width finishes animating.
- The icons re-center via a `layout` animation.
- The page content area animates its left margin to fill the freed space.

### 6.2 The floating top bar

The top bar is **floating**, 56px tall, 16px below the top, 16px from the right (matching the sidebar). It has the same glass surface as the sidebar.

**Left to right:**
- A **breadcrumb** of the current page. Hover on a segment reveals a popover with the parent's children.
- A **search trigger** — a button that says "Search…" with a `Cmd+K` hint, 240px wide. Click opens the command palette.
- A spacer (flex-1).
- **Quick actions:** a single icon button (the "+" for create). On hover, a popover with the recent types: Work item, Customer, Document, Project, Conversation.
- A **notifications bell** with a count badge if there are unread.
- The **AI entry point** — a small, distinctive pill button with the brand-AI gradient. Always present. Hover reveals "Ask ORVIX" tooltip. Click opens the command palette with the AI prompt already focused.
- A **divider** (1px vertical, 12px tall).
- The **profile avatar** — 32px, with a name tooltip on hover and a popover menu on click.

### 6.3 The workspace switcher

Click the workspace row in the sidebar to open a popover anchored to that row.

- A search input at the top (filtered list of workspaces).
- Each row: workspace color dot, workspace name, role badge.
- "Create new workspace" at the bottom.

When you switch workspaces, the sidebar items below the workspace switcher animate out (160ms `ease-in-cubic`) and the new workspace's items animate in (160ms `ease-out-quint`, 30ms stagger).

### 6.4 The command palette

Already described in Part 4.7. To summarize in the AppShell context:

- Triggered by `Cmd+K` (or `Ctrl+K` on Windows/Linux) from anywhere.
- Triggered by clicking the search trigger in the top bar.
- Triggered by clicking the AI entry point in the top bar (with the AI section pre-focused).
- The palette is the **universal search** of the OS. It searches across all surfaces.

### 6.5 The AI entry point — the floating orb

Beyond the command palette, the AI has a **floating orb** in the bottom-right corner of every screen. 48px diameter, brand-AI gradient, the **O** monogram in white. Hover: scales 1.05, the gradient intensifies, a tooltip says "Ask ORVIX". Click: opens the command palette in AI mode, focused on the input.

The orb is the persistent, ever-present, never-in-the-way representation of the AI. It breathes (a 2s pulse, 5% scale) when the AI has new information. It stops breathing when you've read the suggestion.

### 6.6 Empty states

Each surface has a handcrafted empty state:

- **Inbox empty:** centered geometric illustration (a stylized inbox with a single letter inside), one line ("Nothing needs you right now."), one action ("Open Today").
- **Work empty:** centered illustration (a stylized kanban with no cards), one line ("Your work is clear."), one action ("Create a work item").
- **Customers empty:** centered illustration (a stylized hand reaching toward an empty space), one line ("Add your first customer."), one action.
- **AI empty:** centered illustration (the **O** monogram with a single ring around it), one line ("Ask ORVIX anything about your work."), and a few sample prompts as chips.

---

## Part 7 — Three Visual Directions

Each direction is a complete, shippable visual language. The components and motion language are shared. The palette, surface treatment, and personality are different.

Choose **one** of A, B, or C.

---

### Direction A — "Conductor"

**The feel:** A control room for work. Dark, electric, precise. Like a synthesizer, like a flight deck, like the inside of a beautiful instrument.

**Inspiration:** Linear, Raycast, Vercel, the dark mode of Arc.

**Audience:** Sophisticated power users. Teams that value speed and precision. Devs and designers.

**Light or dark:** Dark by default. Optional system-follow.

**Palette (HSL):**

| Token | Value | Use |
| --- | --- | --- |
| `bg-base` | 240 6% 4% | Page background, deepest |
| `bg-surface` | 240 5% 8% | Cards, panels, sidebar |
| `bg-elevated` | 240 4% 11% | Inputs, popovers, modals |
| `fg-default` | 0 0% 96% | Primary text |
| `fg-muted` | 0 0% 60% | Secondary text, labels |
| `fg-subtle` | 0 0% 38% | Tertiary, hints |
| `border-subtle` | 240 5% 14% | Dividers, card edges |
| `border-default` | 240 5% 18% | Inputs, default borders |
| `border-strong` | 240 5% 24% | Hover, focused |
| `accent` | 244 76% 60% | **Electric Indigo** — primary accent |
| `accent-soft` | 244 76% 60% / 0.12 | Tinted bg, hover state |
| `success` | 142 70% 45% | Done, positive |
| `warning` | 38 95% 55% | Blocked, attention |
| `error` | 0 75% 60% | Failed, critical |
| `ai` | 268 85% 65% | **AI layer** — purple-violet |

**Surfaces:**
- Glass effect: 24px blur, 180% saturation, on a 4%-opacity white tint.
- Subtle 1px borders (12% opacity white).
- Layered shadows: ambient 0 8px 32px rgb(0 0 0 / 0.4), direct 0 1px 2px rgb(0 0 0 / 0.3).
- A **1px pulse line** in the brand accent appears on active items, breathing every 4s. This is the signature.

**Typography:** Geist Sans, Geist Mono for data. No serifs. The default is weight 400, with 500 for emphasis. Letter-spacing -0.01em for body, -0.02em for display.

**AI treatment:** the AI is the **conductor's baton** — a flowing electric purple-violet line. When the AI is processing, a 1px line animates from left to right across the active surface, brand-AI gradient. When the AI speaks, the text appears in a dedicated stream with the brand-AI color, never in the accent.

**Stand-out moments:**
- The sidebar's active state with the 1px pulse line on the left edge.
- The command palette opens with a scale-in animation, monospace placeholder.
- The orb in the bottom-right is electric, with the brand-AI gradient.
- The inbox cards have a 1px left border in their status color.
- The work item cards use the active item's pulse line to indicate focus.

**When to pick A:** if you want ORVIX to feel like a precision instrument, for power users who want speed and density, in a tone that says "serious tool, premium product, no apologies."

---

### Direction B — "Atelier"

**The feel:** A high-end studio. Light, considered, human. Like opening a beautifully-bound book. Like the practice-management software of a top-tier design agency. Apple in the best moments.

**Inspiration:** Notion (the paper feel), Apple (the calm), Stripe (the data), Linear's marketing site (the type).

**Audience:** Founders, agencies, design-conscious teams, anyone who values craft and humanity.

**Light or dark:** Light by default. Optional system-follow.

**Palette (HSL):**

| Token | Value | Use |
| --- | --- | --- |
| `bg-base` | 35 18% 96% | Page background, warm paper |
| `bg-surface` | 0 0% 100% | Cards, panels, sidebar |
| `bg-elevated` | 0 0% 100% | Inputs, popovers, modals |
| `fg-default` | 30 8% 12% | Primary text, deep ink |
| `fg-muted` | 30 6% 38% | Secondary text |
| `fg-subtle` | 30 4% 58% | Tertiary, hints |
| `border-subtle` | 35 12% 88% | Dividers, card edges |
| `border-default` | 35 10% 78% | Inputs, default borders |
| `border-strong` | 35 8% 60% | Hover, focused |
| `accent` | 18 78% 42% | **Burnt Sienna** — primary accent, warm and saturated |
| `accent-soft` | 18 78% 42% / 0.08 | Tinted bg, hover state |
| `success` | 145 55% 38% | Done, positive |
| `warning` | 32 90% 50% | Blocked, attention |
| `error` | 0 65% 48% | Failed, critical |
| `ai` | 220 65% 30% | **AI layer** — deep ink-blue |

**Surfaces:**
- Warm off-white background, like a quality book page.
- White cards with a 1px warm-tinted border.
- Soft, warm shadows: ambient 0 4px 16px rgb(60 50 40 / 0.06), direct 0 1px 2px rgb(60 50 40 / 0.04).
- A **mark**, like a small typographic flourish, appears on the active item. A 1px underline that extends 16px past the label on the right, with a serif drop-cap or a small horizontal rule.

**Typography:** Geist Sans for UI. **GT Sectra** (or Newsreader) for hero, marketing, and the AI's "voice". A single line of GT Sectra in a dialog carries the warmth. Default weight 400, with 500 for emphasis. Generous line-height (1.65 for body).

**AI treatment:** the AI is a **thoughtful assistant**. AI-generated text is rendered in GT Sectra, slightly italicized. The AI button uses a small serif "A" with a thin underline, like a handwritten annotation. AI suggestions appear as soft cards with a 1px ink-blue border and a subtle warm bg.

**Stand-out moments:**
- The inbox cards look like little letters, with a serif date and a sans-serif title.
- The command palette opens with a serif placeholder: "What are you looking for?"
- The orb in the bottom-right is a 1px outlined circle with a small serif "A" inside, like a printer's mark.
- The customer profile page has a quiet, editorial feel — like a magazine spread.
- Tables are calm, with generous row height (52px), warm dividers, and the burnt sienna accent only on hover.

**When to pick B:** if you want ORVIX to feel like a considered, premium product for a thoughtful audience. For products where craft and humanity are differentiators. For the team that wants to feel like they're using a tool that respects their time and their eye.

---

### Direction C — "Strata"

**The feel:** A precision data instrument. Light by default, dense, professional. Like Bloomberg Terminal reimagined for the modern SaaS era. Like the Stripe Dashboard in its best moments. Like Linear in its sharpest light mode.

**Inspiration:** Stripe Dashboard, Linear (light), Vercel (the data feel), Notion (the multi-layer surfaces).

**Audience:** Sales teams, ops teams, finance-adjacent, anyone who lives in data.

**Light or dark:** Light by default. Optional dark.

**Palette (HSL):**

| Token | Value | Use |
| --- | --- | --- |
| `bg-base` | 220 16% 97% | Page background, cool gray |
| `bg-surface` | 0 0% 100% | Cards, panels, sidebar |
| `bg-elevated` | 0 0% 100% | Popovers, modals, sheets |
| `fg-default` | 220 18% 12% | Primary text, near-black |
| `fg-muted` | 220 8% 38% | Secondary text |
| `fg-subtle` | 220 6% 58% | Tertiary, hints |
| `border-subtle` | 220 12% 90% | Dividers, card edges |
| `border-default` | 220 10% 82% | Inputs, default borders |
| `border-strong` | 220 8% 70% | Hover, focused |
| `accent` | 158 64% 35% | **Forest** — primary accent, deep and serious |
| `accent-soft` | 158 64% 35% / 0.08 | Tinted bg, hover state |
| `success` | 158 64% 35% | Same as accent (success is the brand) |
| `warning` | 32 90% 50% | Blocked, attention |
| `error` | 0 72% 50% | Failed, critical |
| `ai` | 32 90% 50% | **AI layer** — amber, the only warm color |

**Surfaces:**
- Cool light gray base, white cards. Each surface has its own shadow that suggests depth.
- Multi-layer shadows: ambient 0 1px 3px rgb(15 20 25 / 0.04), 0 4px 12px rgb(15 20 25 / 0.06); direct 0 1px 2px rgb(15 20 25 / 0.06). Two distinct elevation levels.
- A **strata line** — a 1px vertical rule in the accent color, on the left edge of every card that has data, like a geological layer.

**Typography:** Geist Sans for UI. **JetBrains Mono** (or Geist Mono) for all numerics, with tabular figures everywhere. The default body is 14px / 20px, dense. Tables use 13px / 18px.

**AI treatment:** the AI is a **side panel**. When you trigger an AI action, a 400px-wide sheet slides in from the right (280ms `ease-in-out-quart`), showing a conversation. The AI button in the top bar is amber — the only warm color in the entire palette — making it the unmistakable AI entry point. AI suggestions appear inline in the table, with a 1px amber underline and an "AI" prefix.

**Stand-out moments:**
- Charts are first-class. Custom chart components, no defaults. Forest green for positive deltas, red for negative, gray for neutral.
- The KPI cards on the dashboard are dense: a label, a number (data-lg), a delta with a tiny sparkline.
- The sidebar is dense: 56px collapsed by default, expanded on hover.
- The orb in the bottom-right is amber, with a small triangle (the "play" symbol) inside.
- Tables are the heroes. Sticky header, resizable, sort indicators everywhere, filters as chips.

**When to pick C:** if you want ORVIX to feel like a data-first product, for teams that work in numbers and tables, in a tone that says "we respect your time and your data."

---

## Decision matrix

| Criterion | A — Conductor | B — Atelier | C — Strata |
| --- | --- | --- | --- |
| **Speed of scanning** | ★★★★★ | ★★★ | ★★★★★ |
| **Density of information** | ★★★★★ | ★★★ | ★★★★★ |
| **Premium feel** | ★★★★★ | ★★★★★ | ★★★★ |
| **Humanity** | ★★★ | ★★★★★ | ★★★ |
| **Data-forward** | ★★★★ | ★★★ | ★★★★★ |
| **AI feels native** | ★★★★★ | ★★★★ | ★★★★ |
| **Power-user feel** | ★★★★★ | ★★★ | ★★★★★ |
| **Founder/agency feel** | ★★★ | ★★★★★ | ★★★ |
| **Sales/ops feel** | ★★★★ | ★★★ | ★★★★★ |
| **Mobile-first** | ★★★★ | ★★★★★ | ★★★ |
| **Onboarding warmth** | ★★★ | ★★★★★ | ★★★ |
| **"Shown on Vercel homepage"** | ✓ | ✓ | ✓ |
| **"Shown on Stripe homepage"** | ✓ | ✓ | ✓ |
| **"Shown on Linear homepage"** | ✓ | ~ | ✓ |
| **"Shown on Apple homepage"** | ~ | ✓ | ~ |

**My recommendation:** **A — Conductor**. It's the most distinctive, the most premium, and the one that ages best. It maps to the linear/raycast/vercel benchmark most directly, but with ORVIX's own dark-graphite + electric-indigo personality. The AI is a true layer (not a page), the command palette is the universal search, and the orb is a signature element that doesn't exist on any reference product.

If the audience is more agency / design / founder-oriented, pick **B — Atelier**. If the audience is more sales / ops / finance, pick **C — Strata**.

---

## Part 8 — The Signature: The Pulse

> One unmistakable interaction that becomes part of ORVIX's identity. Original to ORVIX; not a copy of any reference.

**The Pulse** is a single 1px horizontal line that lives at the top of every workspace surface, just below the top bar, full-width, 16px below the top bar's bottom edge. It is **always present** in the workspace, never loud, never decorative. It is the system's heartbeat.

### 8.1 Anatomy

```
 ┌─────────────────────────────────────────────────────────┐ ← page edge
 │  [top bar — glass, 56px tall]                            │
 ├─────────────────────────────────────────────────────────┤
 │  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ │ ← THE PULSE (1px)
 ├─────────────────────────────────────────────────────────┤
 │                                                          │
 │  [main content area]                                     │
 │                                                          │
```

The Pulse is 1px tall. Above the line is a 2px transparent zone where the line's glow appears when active. Below the line is 0px gap to the content. The line spans the full content width (from sidebar's right edge to viewport's right edge).

### 8.2 The six states

The Pulse conveys state through three signals: **color**, **animation**, and **glow**.

| State | Color | Animation | Glow | Triggered by |
| --- | --- | --- | --- | --- |
| **Idle** | `border-default` | Static | None | Default state. The system is at rest but alive. |
| **Syncing** | `accent` | Left-to-right gradient flow, 2s loop, 200px wavelength | None | Data is loading (route transition, query refetch, sync). |
| **AI Active** | `ai` (purple-violet) | Continuous left-to-right flow, 1.6s loop | 2px above, AI color, 30% opacity, 8px blur | The AI is processing. Stops when the response streams complete. |
| **Action Pulse** | `accent` | Single 1px pulse travels from the action point to the right edge in 400ms, then fades | None | Any successful user action (click, save, send). |
| **Notification** | `warning` | Pulses (opacity 1.0 ↔ 0.4) for 3 seconds, then settles to `border-default` | 2px above, warning color, 30% opacity | A new notification arrives. |
| **Error** | `error` | Static, persistent | 2px above, error color, 30% opacity, persistent | A critical error or a must-fix alert. |

The Pulse is **always visible** in some state. It is never absent. Its presence is what makes it a signature.

### 8.3 The interaction

The Pulse is hoverable and clickable.

- **Hover** (anywhere on the line): a 4px-tall hit area activates. A tooltip appears after 300ms, anchored above the line, with the current state and a one-line description. Example: "Syncing 3 records", "AI is drafting a reply", "12 new notifications".
- **Click**: opens the **Status Panel** — a popover anchored to the line, 320px wide, 1 elevation, with the current system status, recent activity (last 5 events), and quick actions (Dismiss all, Pause AI, View history).

The Pulse is also the **entry point for system-level operations**:
- Sync state: the popover shows what's syncing and offers "Force refresh".
- AI state: the popover shows what's the AI is doing and offers "Pause AI for 5 minutes".
- Notification state: the popover shows the unread count and offers "Mark all as read".

### 8.4 Surface-specific behavior

On certain surfaces, the Pulse takes on additional meaning:

- **Inbox**: the Pulse is segmented by inbox items. Each segment is a different status color (urgent = error, normal = accent, low = muted). The widths are proportional to the item's priority. Clicking a segment jumps to that item.
- **Work (list)**: the Pulse is segmented by work items, sized proportionally to priority.
- **Customer Profile**: the Pulse is a single segment in the customer's status color. The line color reflects the customer's health.
- **Reports**: the Pulse is a sparkline of the page's primary metric, with brand-colored peaks and muted valleys.
- **AI surfaces**: the Pulse is in the AI color at all times, with a stronger glow.

### 8.5 What the Pulse is not

- **Not** the Dynamic Island (a shape that morphs). The Pulse is a single line; it doesn't change form.
- **Not** the Raycast Command Palette (a modal). The Pulse is a passive element you can interact with but never replaces the content.
- **Not** the Linear active indicator (a left-edge bar). The Pulse is horizontal, at the top, full-width.
- **Not** a progress bar. The Pulse is a state indicator; when it's not actively flowing, it's not a "loading bar."
- **Not** a status bar (in the macOS sense). The Pulse is a system heartbeat, not a system info panel.

### 8.6 The signature moment

The most distinctive use of the Pulse is the **Action Pulse**: when you click save, send a message, create a work item, or complete any action, a 1px line in the brand accent travels from the action point (e.g., a button's center) to the right edge of the screen in 400ms, then fades. This is the system's way of saying *I heard you.*

This is the moment users will tell their friends about. *"Did you see that? When I clicked save, the line at the top acknowledged it."* It's small, subtle, and unmistakable.

---

## Part 9 — AI Interaction Language

The AI is **a layer**, not a page. It exists in every surface, in three forms: **inline**, **ambient**, and **on-demand**. The AI never has its own route.

### 9.1 The three forms

| Form | Description | Where it appears |
| --- | --- | --- |
| **Inline** | AI-generated text appears in the content area, marked with the AI dot, in the AI color. | Suggestions, summaries, drafts, completions. |
| **Ambient** | A subtle presence, the AI dot or a glow, indicating AI is "there" without speaking. | The Pulse line, the orb, the AI status in headers. |
| **On-demand** | The user explicitly invokes the AI, via the command palette, a button, or a keyboard shortcut. | The command palette, the floating orb, the per-context AI buttons. |

### 9.2 The AI visual language

- **The AI dot**: a 4px circle, filled in the AI color, with a 1px AI-color ring at 30% opacity. This is the universal AI mark. Every AI element has it.
- **The AI color**: `ai` (purple-violet, HSL `268 85% 65%`). Never the brand accent. Never a neutral.
- **The AI glow**: 4px outer glow in the AI color at 12% opacity, 8px blur. Reserved for active AI states.
- **The AI text style**: when AI speaks in a stream, the text appears word-by-word (16ms per token), in a dedicated column or row, with a 1px AI-color left border. No caret.
- **The AI font**: Geist Sans, same as the rest of the UI, but **italic** for AI-suggested content (suggestions, drafts) and **regular** for AI-confirmed content (summaries, insights).

### 9.3 AI in every surface

#### Inbox

- **Per-item AI chip**: on each inbox item, a small AI chip on the right edge: "AI can reply", "AI can categorize", "AI can extract action items". One-tap to invoke. The chip has the AI dot prefix and a 1px AI-color border.
- **Header summary**: the inbox header shows: "12 items, AI can help with 8 of them" — a single line, with the "8 of them" being an AI-suggested batch action chip.
- **Action suggestion**: when hovering an inbox item, an AI-suggested reply appears as a faded inline text in the item, marked with the AI dot. Click to expand into a full draft.

#### Work

- **Work item status**: each work item has an AI status field (if applicable). Examples: "AI drafted 3 tasks", "AI flagged as urgent", "AI summarized the discussion". Shown as a small chip in the work item card.
- **Detail page header**: the work item detail page has an AI summary card at the top: 2-3 lines of what the AI knows about this work item. The summary is in italic Geist Sans, with the AI dot prefix.
- **AI suggestions inline**: when relevant, AI suggestions appear in the work item as ghost text (suggested title, suggested next action, suggested assignee). One-tap to accept.

#### Customer Profile

- **Header AI card**: the customer profile header has an AI summary card: 2-3 lines of what the AI knows about this customer (last activity, deal stage, recent wins, risks). The card has a 1px AI-color border and a subtle AI glow.
- **Timeline AI entries**: AI-generated entries (e.g., "AI categorized the email as urgent", "AI scheduled a follow-up") appear in the timeline with the AI dot prefix.
- **Notes AI suggestions**: AI-suggested notes appear in italic, marked with the AI dot. Click to convert to a permanent note.
- **Next actions**: the "Next actions" section has AI-suggested actions, with one-tap accept.

#### Reports

- **Dashboard AI briefing**: the dashboard has an AI briefing at the top: "Today's top 3 things to know". Each item is a single line with a small data point and an AI-suggested action.
- **Per-chart AI insight**: each chart has a small "AI insight" chip on the top-right. Click to expand a popover with the AI's explanation of the chart.
- **AI explain this**: any data point in any chart can be right-clicked (or `Cmd+click`ed) to "AI explain this". The AI returns a 1-2 sentence explanation in a small popover.

#### Settings

- **AI recommendations**: each setting has an AI recommendation chip when relevant. "AI recommends enabling this for workspaces with 5+ users." The chip is dismissable (per workspace, per user).
- **Settings search**: the settings page has an AI-powered natural language search at the top. "Find the setting that lets me change my password" → returns the relevant setting.

#### Admin

- **Admin summary**: the admin dashboard has an AI summary at the top: "This workspace has 3 users, 2 roles, 4 automations. AI recommends: 1 automation has been failing repeatedly."
- **Audit log AI flags**: suspicious events in the audit log have an AI flag with a one-line explanation. Click for the full AI analysis.
- **Permissions AI suggest**: the permissions page has an AI suggest for least-privilege review. "AI noticed this user has both `customer.write` and `admin.write`. Consider splitting for least privilege."

#### Dialogs

- **Dialog AI corner chip**: every dialog has a small AI chip in the top-right corner: "Ask ORVIX". Click to open a small popover with AI suggestions for the current form (auto-fill, validate, suggest fields).
- **AI auto-fill**: any field can be auto-filled by the AI. A small AI icon appears next to the field on hover. Click to invoke.
- **AI validation**: the AI can validate the form before submission. A small "AI check" button at the bottom of the form, before the primary action.

#### Command Palette

- **Dedicated AI section**: the command palette has a dedicated AI section, always present at the bottom, separated from the regular results by a 1px divider.
- **AI input**: the AI section has its own input field, visually distinct (italicized placeholder, AI-color border). The user types their prompt directly.
- **AI streaming**: AI responses stream in word-by-word (16ms per token), in a dedicated column, with a 1px AI-color left border. No caret.
- **AI actions**: the AI can take actions in the workspace ("Mark Casey Rivera as active", "Create a task called 'Review the proposal'"). Before executing, the AI shows a one-line confirmation: "I'll mark Casey Rivera as active. Confirm?". The user clicks "Confirm" or "Cancel".
- **AI history**: the last 5 AI conversations are accessible from the top of the AI section.

### 9.4 The AI Entry Point — the floating orb

The orb is the **persistent, ever-present, never-in-the-way** representation of the AI. It lives in the bottom-right corner of every screen.

- **Size**: 48px diameter.
- **Visual**: a circle filled with a subtle gradient from `accent` to `ai`, with the **O** monogram in white in the center. 1px border at 12% opacity white.
- **Idle**: gentle 2s breathing animation (5% scale, opacity 1.0 ↔ 0.95).
- **Hover**: scales to 1.05, the gradient intensifies, a tooltip says "Ask ORVIX (⌘K)".
- **Click**: opens the command palette in AI mode, with the AI input focused.
- **Processing**: the orb's gradient shifts to solid `ai`, with a 4px outer glow at 30% opacity. The breathing animation stops; instead, a 1s rotation of the gradient.
- **New info**: the orb's border brightens to 100% opacity, and a 1px dot in the `ai` color appears at the top-right of the orb. The user has unread AI suggestions. Clicking the orb clears the unread state.

### 9.5 What the AI is not

- **Not** a chatbot. There is no "AI conversation" page. AI is a layer, not a destination.
- **Not** a pop-up. The AI never opens a separate window that the user has to manage.
- **Not** loud. The AI never uses red, never shouts, never demands attention.
- **Not** intrusive. The AI never blocks the user. AI suggestions can always be dismissed.
- **Not** autonomous. The AI never takes an action without user confirmation.

---

## Part 10 — Marketing & Landing Design System

The public website is the application, just bigger and more theatrical. The marketing site and the application share **the same tokens, the same fonts, the same colors, the same motion**. There is no separate "marketing design system."

### 10.1 Landing page

The landing page is a single, continuous scroll, with a clear hierarchy:

#### Hero (above the fold)
- **Display heading**: 56–72px, Geist Sans Bold, tracking -0.04em. Single sentence that names the problem ORVIX solves.
- **Subheading**: 18–20px, Geist Sans Regular, max 560px wide, single sentence.
- **Two CTAs**: primary (brand accent) and secondary (ghost). Side by side, 8px gap.
- **Product surface**: a 1:1 screenshot of the application below the CTAs, 1px border, 12px radius, 2 elevation. The Pulse line is visible in the screenshot, animating once on page load.

#### Section 1 — "The inbox that gets you"
- Large display heading (44px), one paragraph, the AI inline.
- Below: a 1:1 screenshot of the inbox with the AI suggestions visible.

#### Section 2 — "Work, but it flows"
- Same structure, with the work surface screenshot.

#### Section 3 — "The AI, in the system"
- Same structure, with the AI panel screenshot.

#### Section 4 — "Pricing"
- Embedded pricing card (see below).

#### Footer
- Three columns: Product, Company, Resources. Monospace. Muted.
- The brand monogram + wordmark on the left.
- The current year on the right.

### 10.2 Pricing

- **Three tiers** in a row, max-width 1080px.
- Each tier: card, 1px border, 12px radius, 1 elevation. The middle tier is highlighted: 1px brand-accent border, a "Most popular" tag at the top.
- Tier card contents: tier name (24px bold), price (44px bold, data-lg), one-line description (text-md), feature list (text-sm, with check icons), CTA button (primary or secondary).
- All three cards animate in on scroll, with a 30ms stagger.

### 10.3 Documentation

- **Three-column layout**: sidebar (240px, fixed), content (centered, max 720px), TOC (right, 200px, sticky).
- **Sidebar**: list of doc sections, with the current section highlighted. Collapsible groups.
- **Content**: extended type scale — `display-md` for h1, `display-sm` for h2, `text-lg` for h3, `text-md` for body. Generous line-height (1.7).
- **Code blocks**: 1px border, monospace, with a copy button. Inline code: 1px border, 4px padding, monospace, no background.
- **TOC**: a list of the current page's headings, sticky on scroll. Click to jump.
- **Footer of the content**: "Next" and "Previous" links, large, with hover underline.

### 10.4 Authentication

- **Centered card**, max 400px wide, 1 elevation, glass surface, 12px radius.
- **Brand monogram** at the top, 48px tall, with the wordmark below.
- **One email field**, 40px tall, large placeholder "Your email address".
- **Magic link button** (primary, full width).
- **Divider**: "or" in monospace, with two 1px lines on either side.
- **OAuth buttons**: Google and Microsoft, full width, secondary style.
- **Footer link**: "Don't have an account? Sign up." (or vice versa).

### 10.5 Empty marketing pages

Three empty states for the marketing site, each handcrafted:

- **404**: centered illustration (a stylized compass with a single point), one line "This page doesn't exist.", one button "Back home".
- **Maintenance**: centered illustration (a stylized hourglass with the conductor's mark), one line "We're tuning the orchestra.", one button "Try again".
- **Coming soon**: centered illustration (a stylized stage curtain with a single line of light), one line "This is coming.", one button "Notify me" (which opens an email field).

All three use the same illustrations style as the application empty states (see Part 11), scaled up 2x.

### 10.6 The marketing-app continuity

The rule: **a user who lands on the marketing site and then signs in should feel like they've never left**. The same:

- Fonts (Geist Sans for UI, GT Sectra for marketing hero, Geist Mono for data)
- Colors (Dark Graphite base, Electric Indigo accent, AI purple for AI surfaces)
- Motion (240ms default, the Pulse in headers, the orb in the bottom-right)
- Spacing (8px grid, generous whitespace)
- Components (buttons, inputs, cards, all from the same component library)
- Voice (calm, precise, considered)

The marketing site is not a different product. It is ORVIX, in a bigger room.

---

## Part 11 — Illustration & Iconography System

### 11.1 Icon grid

- **Canvas**: 24x24px.
- **Live area**: 20x20px, centered (2px padding on all sides).
- **Stroke**: 1.5px, sharp corners (no rounded line caps by default; 1px round caps for organic shapes).
- **Style**: geometric, not organic. No facial features, no characters, no gradients.
- **Two weights**:
  - **Outline** (default): 1.5px stroke, no fill. Used in the sidebar, lists, toolbars.
  - **Filled** (active/selected): solid fill in the foreground color, no stroke. Used for the active sidebar item, selected chips.
- **Two color modes**:
  - **Default**: stroke or fill in `--fg-default`.
  - **Muted**: stroke or fill in `--fg-muted`. Used for disabled, secondary.
- **The AI mark**: any icon that represents an AI action has a **4px dot** in the AI color at the top-right corner. This dot is the universal "AI" indicator.

### 11.2 Stroke widths

| Token | Value | Use |
| --- | --- | --- |
| `stroke-fine` | 1px | The Pulse line, divider lines, table cell separators |
| `stroke-default` | 1.5px | All outline icons |
| `stroke-bold` | 2px | Emphasis icons, the conductor's mark in the monogram, focused-state outlines |

### 11.3 Corner radius

| Token | Value | Use |
| --- | --- | --- |
| `icon-radius-none` | 0 | Most icons (sharp, geometric) |
| `icon-radius-xs` | 1px | A few select icons where subtle rounding aids legibility (e.g., the doc icon) |
| `container-radius` | see Part 3.4 | Buttons, cards, dialogs, sheets |

Icons are mostly **sharp** (no rounding). Containers are **rounded** (per Part 3.4). This contrast is what makes the system feel like a precision instrument.

### 11.4 Illustration style

All illustrations in ORVIX — empty states, onboarding, marketing, loading — share a single style:

- **Geometric, not cartoony.** No faces, no characters, no anthropomorphized objects.
- **1.5px strokes on all shapes.** Consistent with the icons.
- **Two colors only** per illustration: the brand accent (`accent`) and the AI color (`ai`). One is the primary, the other is the accent. The background is the page's `bg-base` (or transparent).
- **Maximum 5 shapes** per illustration. Anything more is a chart, not an illustration.
- **Sharp corners** (1px radius max). The illustrations should feel like a diagram, not a sketch.
- **No gradients** beyond a single soft glow around the primary shape (the AI color, 30% opacity, 8px blur).

### 11.5 Empty-state illustrations

Each empty state has its own custom illustration, not a generic "empty box." All illustrations are 240x240px, centered in the empty state.

| Empty state | Illustration |
| --- | --- |
| **Inbox empty** | A stylized inbox tray with a single letter inside. The letter is a 1px outline rectangle, the tray is a 1px outline trapezoid. Brand color. |
| **Work empty** | A stylized kanban with three columns and no cards. Each column is a 1px outline rectangle. Brand color. |
| **Customers empty** | A stylized handshake outline, two interlocking chevrons. Brand color. |
| **AI empty** | The **O** monogram with a 1px ring around it, with one short line extending outward. AI color. |
| **Search empty** | A stylized magnifying glass, with a 1px horizontal line through it (the "nothing found" indicator). Muted color. |
| **Reports empty** | A stylized bar chart with no bars — just the axes. Brand color. |
| **Settings empty** | (Not used; settings always have content.) |
| **Admin empty** | A stylized shield with no inner shape. Brand color. |

### 11.6 AI illustrations

AI-specific illustrations are always in the AI color, with the O monogram as a recurring motif:

- **AI panel empty**: the O monogram with a 1px ring, with a single line extending rightward.
- **AI processing**: the O monogram with a rotating 1px ring (4px outside the O). The ring rotates 360° in 2s, indicating the AI is "thinking."
- **AI suggestion**: a 1px outline of a card, with a small AI dot at the top-right corner.
- **AI error**: the O monogram with a 1px crack through it. AI color.
- **AI success**: the O monogram with a 1px checkmark inside. AI color.

### 11.7 Brand assets

The ORVIX brand kit, defined and frozen in v1.0:

- **The O monogram**: a perfect circle (24x24px in the icon, 48x48px in the brand kit) with a single 1px line bisecting the right edge (the **conductor's mark**). The mark is positioned at 0° (right edge), 1px from the outer edge, 8px tall. In dark mode, the O is white; in light mode, the O is the brand accent color.
- **The wordmark**: ORVIX, all caps, Geist Sans Bold, weight 700, tracking +40, color = foreground default. Min size 16px, max size 96px.
- **The compact wordmark**: ORVIX, lowercase, Geist Sans Medium, weight 500, tracking +20. Used in the auth card, the command palette, the floating orb.
- **The Pulse**: a 1px line in the brand accent color, 16px tall (in the brand kit, for display). Animated left-to-right in 2s. This is the only animated brand asset.
- **App icon**: the O monogram in a rounded square (iOS-style 22% radius), in the brand accent color, with the conductor's mark in white. 1024x1024px for the App Store, scaled down for use.
- **Favicon**: the O monogram alone, 32x32px, in the brand accent color.
- **Loading state**: the O monogram with a rotating 1px ring, as described in 11.6.

### 11.8 Illustration rules

- **No clip art.** No stock illustrations. No generic "people at desks."
- **No faces.** ORVIX illustrations are about systems, not people.
- **No gradients beyond a single glow.** The illustrations are flat, with one optional soft glow.
- **No randomness.** Every illustration is handcrafted, intentional, named in the codebase (`EmptyInbox`, `EmptyWork`, `AIProcessing`).
- **Same canvas size** (240x240px) for all empty states. The illustration always sits in the same vertical position in the empty state, 32px above the text.

---

## What happens after you approve

Once you pick a direction, the implementation plan is:

1. **Token layer (Day 1):** install the chosen palette, typography, and motion tokens as CSS custom properties + Tailwind config. No component changes.
2. **Component library (Day 2–3):** rebuild all 28 components to the new standard. Custom icon set. Custom focus rings. Custom shadows.
3. **AppShell (Day 4):** floating sidebar, floating top bar, command palette, AI orb. The signature elements.
4. **Surfaces (Day 5–8):** rebuild each route (landing, onboarding, inbox, work, customers, AI, reports, settings, admin, work-detail) in the chosen direction.
5. **Polish (Day 9–10):** empty states, loading states, micro-interactions, focus rings, keyboard shortcuts. Lighthouse 95+.
6. **Screenshots (Day 11):** capture all 11 v0.3 screens in the new direction. Update `docs/screenshots/`.

Total: ~11 working days of focused implementation. All 4 gates (typecheck, test, lint, build) stay green throughout. No backend, no architecture, no APIs, no business logic, no routes touched.

---

**Which direction do you want — A, B, or C?**
