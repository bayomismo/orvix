import type { Config } from "tailwindcss";
import tokens from "../tokens/tokens.json" assert { type: "json" };
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Tailwind preset derived from design tokens (v0.3).
 *
 * Token-driven utility set: colors, type, spacing, radii, shadows,
 * motion. Hex literals in feature code are forbidden by ESLint.
 *
 * Composition law: every utility class resolves to a token via CSS
 * custom properties, so light/dark switching is a one-line theme
 * attribute change with no rebuild.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, "..", "..", "..");

// Helper: emit font-size rules with the full descriptor so Tailwind
// generates line-height, letter-spacing, and weight utilities.
function fs(token: {
  size: string;
  lineHeight: string;
  weight: string;
  letterSpacing?: string;
}) {
  const out: Record<string, string> = {
    fontSize: token.size,
    lineHeight: token.lineHeight,
    fontWeight: token.weight,
  };
  if (token.letterSpacing) out.letterSpacing = token.letterSpacing;
  return out;
}

const t = tokens.type;

const config: Config = {
  content: [
    `${monorepoRoot}/apps/web/src/**/*.{ts,tsx,mdx}`,
    `${monorepoRoot}/packages/ui/src/**/*.{ts,tsx}`,
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    // Override defaults so the only way to color things is via tokens.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      brand: {
        primary: "var(--brand-primary)",
        accent: "var(--brand-accent)",
        "accent-soft": "var(--brand-accent-soft)",
        ai: "var(--brand-ai)",
        "ai-soft": "var(--brand-ai-soft)",
      },
      neutral: {
        0: "var(--neutral-0)",
        50: "var(--neutral-50)",
        100: "var(--neutral-100)",
        150: "var(--neutral-150)",
        200: "var(--neutral-200)",
        300: "var(--neutral-300)",
        400: "var(--neutral-400)",
        500: "var(--neutral-500)",
        600: "var(--neutral-600)",
        700: "var(--neutral-700)",
        800: "var(--neutral-800)",
        900: "var(--neutral-900)",
        950: "var(--neutral-950)",
      },
      surface: {
        canvas: "var(--surface-canvas)",
        raised: "var(--surface-raised)",
        elevated: "var(--surface-elevated)",
        overlay: "var(--surface-overlay)",
        divider: "var(--surface-divider)",
        "divider-strong": "var(--surface-divider-strong)",
        inset: "var(--surface-inset)",
      },
      text: {
        DEFAULT: "var(--text-primary)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        subtle: "var(--text-subtle)",
        "on-accent": "var(--text-on-accent)",
        link: "var(--text-link)",
      },
      status: {
        success: "var(--status-success)",
        "success-soft": "var(--status-success-soft)",
        warning: "var(--status-warning)",
        "warning-soft": "var(--status-warning-soft)",
        danger: "var(--status-danger)",
        "danger-soft": "var(--status-danger-soft)",
        info: "var(--status-info)",
        "info-soft": "var(--status-info-soft)",
        neutral: "var(--status-neutral)",
        "neutral-soft": "var(--status-neutral-soft)",
      },
      highlight: {
        1: "var(--highlight-1)",
        2: "var(--highlight-2)",
        3: "var(--highlight-3)",
      },
    },
    fontFamily: {
      display: ["var(--font-display)", ...tokens.font.display.family.split(", ")],
      body: ["var(--font-body)", ...tokens.font.body.family.split(", ")],
      mono: ["var(--font-mono)", ...tokens.font.mono.family.split(", ")],
    },
    fontSize: {
      "3xs": [t["label-xs"].size, { lineHeight: t["label-xs"].lineHeight, letterSpacing: t["label-xs"].letterSpacing ?? "0" }],
      "2xs": [t["label-sm"].size, { lineHeight: t["label-sm"].lineHeight, letterSpacing: t["label-sm"].letterSpacing ?? "0" }],
      xs:   [t["label-md"].size, { lineHeight: t["label-md"].lineHeight, letterSpacing: t["label-md"].letterSpacing ?? "0" }],
      sm:   [t["body-sm"].size, { lineHeight: t["body-sm"].lineHeight }],
      base: [t["body-md"].size, { lineHeight: t["body-md"].lineHeight }],
      md:   [t["body-lg"].size, { lineHeight: t["body-lg"].lineHeight }],
      lg:   [t["title-sm"].size, { lineHeight: t["title-sm"].lineHeight, letterSpacing: t["title-sm"].letterSpacing ?? "0" }],
      xl:   [t["title-md"].size, { lineHeight: t["title-md"].lineHeight, letterSpacing: t["title-md"].letterSpacing ?? "0" }],
      "2xl":[t["title-lg"].size, { lineHeight: t["title-lg"].lineHeight, letterSpacing: t["title-lg"].letterSpacing ?? "0" }],
      "3xl":[t["display-sm"].size, { lineHeight: t["display-sm"].lineHeight, letterSpacing: t["display-sm"].letterSpacing ?? "0" }],
      "4xl":[t["display-md"].size, { lineHeight: t["display-md"].lineHeight, letterSpacing: t["display-md"].letterSpacing ?? "0" }],
      "5xl":[t["display-lg"].size, { lineHeight: t["display-lg"].lineHeight, letterSpacing: t["display-lg"].letterSpacing ?? "0" }],
      "6xl":[t["display-xl"].size, { lineHeight: t["display-xl"].lineHeight, letterSpacing: t["display-xl"].letterSpacing ?? "0" }],
      "7xl":[t["display-2xl"].size, { lineHeight: t["display-2xl"].lineHeight, letterSpacing: t["display-2xl"].letterSpacing ?? "0" }],
    },
    extend: {
      spacing: {
        "4.5": "18px",
        "5.5": "22px",
      },
      borderRadius: {
        none: "0",
        xs: tokens.radius.xs,
        sm: tokens.radius.sm,
        DEFAULT: tokens.radius.md,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        xl: tokens.radius.xl,
        "2xl": tokens.radius["2xl"],
        "3xl": tokens.radius["3xl"],
        full: tokens.radius.full,
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
        4: "var(--shadow-4)",
        focus: "var(--shadow-focus)",
        none: "none",
      },
      zIndex: tokens.z as unknown as Record<string, string>,
      transitionDuration: {
        instant: "0ms",
        fast: "120ms",
        DEFAULT: "180ms",
        base: "180ms",
        slow: "260ms",
        page: "360ms",
        spring: "420ms",
      },
      transitionTimingFunction: {
        snappy: "cubic-bezier(0.2, 0, 0, 1)",
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      ringColor: {
        DEFAULT: "var(--brand-accent)",
        accent: "var(--brand-accent)",
      },
      ringOffsetColor: {
        DEFAULT: "var(--surface-canvas)",
      },
    },
  },
  plugins: [],
};

export default config;
