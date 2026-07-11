import type { Config } from "tailwindcss";
import tokens from "../tokens/tokens.json" assert { type: "json" };
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Tailwind preset derived from design tokens (ORVIX Design System v1.0
 * — Direction A: Conductor).
 *
 * Token-driven utility set: colors, type, spacing, radii, shadows,
 * motion, AI marks, Pulse. Hex literals in feature code are forbidden
 * by ESLint.
 *
 * Composition law: every utility class resolves to a token via CSS
 * custom properties, so dark/light switching is a one-line theme
 * attribute change with no rebuild.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, "..", "..", "..");

// Helper: emit font-size rules with the full descriptor so Tailwind
// generates line-height, letter-spacing, and weight utilities.
function fs(
  token: { size: string; lineHeight: string; weight: string; letterSpacing?: string },
  family: "display" | "body" | "mono" = "body",
): { fontSize: string; lineHeight: string; fontWeight: string; letterSpacing?: string; fontFamily?: string[] } {
  const out: { fontSize: string; lineHeight: string; fontWeight: string; letterSpacing?: string; fontFamily?: string[] } = {
    fontSize: token.size,
    lineHeight: token.lineHeight,
    fontWeight: token.weight,
  };
  if (token.letterSpacing) out.letterSpacing = token.letterSpacing;
  if (family === "mono") out.fontFamily = ["var(--font-mono)", "Geist Mono"];
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
        glass: "var(--surface-glass)",
      },
      text: {
        DEFAULT: "var(--text-primary)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        subtle: "var(--text-subtle)",
        "on-accent": "var(--text-on-accent)",
        link: "var(--text-link)",
        inverse: "var(--text-inverse)",
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
        "ai-1": "var(--highlight-ai-1)",
        "ai-2": "var(--highlight-ai-2)",
        "ai-3": "var(--highlight-ai-3)",
      },
      ai: {
        DEFAULT: "var(--brand-ai)",
        soft: "var(--brand-ai-soft)",
        glow: "var(--shadow-glow-ai)",
      },
      pulse: {
        DEFAULT: "var(--brand-accent)",
        ai: "var(--brand-ai)",
        warning: "var(--status-warning)",
        danger: "var(--status-danger)",
      },
    },
    fontFamily: {
      display: ["var(--font-display)", ...tokens.font.display.family.split(", ")],
      body: ["var(--font-body)", ...tokens.font.body.family.split(", ")],
      mono: ["var(--font-mono)", ...tokens.font.mono.family.split(", ")],
    },
    fontSize: {
      "2xs":  [t["text-2xs"].size, { lineHeight: t["text-2xs"].lineHeight, letterSpacing: t["text-2xs"].letterSpacing ?? "0" }],
      xs:    [t["text-xs"].size,  { lineHeight: t["text-xs"].lineHeight }],
      sm:    [t["text-sm"].size,  { lineHeight: t["text-sm"].lineHeight }],
      base:  [t["text-md"].size,  { lineHeight: t["text-md"].lineHeight, letterSpacing: t["text-md"].letterSpacing ?? "0" }],
      md:    [t["text-lg"].size,  { lineHeight: t["text-lg"].lineHeight, letterSpacing: t["text-lg"].letterSpacing ?? "0" }],
      lg:    [t["display-sm"].size, { lineHeight: t["display-sm"].lineHeight, letterSpacing: t["display-sm"].letterSpacing ?? "0" }],
      xl:    [t["display-md"].size, { lineHeight: t["display-md"].lineHeight, letterSpacing: t["display-md"].letterSpacing ?? "0" }],
      "2xl": [t["display-lg"].size, { lineHeight: t["display-lg"].lineHeight, letterSpacing: t["display-lg"].letterSpacing ?? "0" }],
      "3xl": [t["display-xl"].size, { lineHeight: t["display-xl"].lineHeight, letterSpacing: t["display-xl"].letterSpacing ?? "0" }],
      "4xl": [t["display-2xl"].size, { lineHeight: t["display-2xl"].lineHeight, letterSpacing: t["display-2xl"].letterSpacing ?? "0" }],
      // Data / numerics (mono) — kept as separate sizes for components.
      "data-sm": [t["data-sm"].size, { lineHeight: t["data-sm"].lineHeight }],
      "data-md": [t["data-md"].size, { lineHeight: t["data-md"].lineHeight }],
      "data-lg": [t["data-lg"].size, { lineHeight: t["data-lg"].lineHeight }],
    },
    extend: {
      spacing: {
        "0":  "var(--space-0)",
        "1":  "var(--space-1)",
        "2":  "var(--space-2)",
        "3":  "var(--space-3)",
        "4":  "var(--space-4)",
        "5":  "var(--space-5)",
        "6":  "var(--space-6)",
        "7":  "var(--space-7)",
        "8":  "var(--space-8)",
        "9":  "var(--space-9)",
        "10": "var(--space-10)",
        "11": "var(--space-11)",
        "12": "var(--space-12)",
        // Legacy v0.3 spacing kept for components in the middle of migration.
        "0.5": "var(--space-0_5)",
        "1.5": "var(--space-1_5)",
      },
      borderRadius: {
        none: tokens.radius.none,
        xs: tokens.radius.xs,
        sm: tokens.radius.sm,
        DEFAULT: tokens.radius.md,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        xl: tokens.radius.xl,
        full: tokens.radius.full,
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
        4: "var(--shadow-4)",
        focus: "var(--shadow-focus)",
        "glow-accent": "var(--shadow-glow-accent)",
        "glow-ai": "var(--shadow-glow-ai)",
        none: "none",
      },
      zIndex: tokens.z as unknown as Record<string, string>,
      transitionDuration: {
        "0": "0ms",
        instant: "80ms",
        fast: "160ms",
        DEFAULT: "240ms",
        default: "240ms",
        slow: "400ms",
        // Legacy v0.3 duration tokens kept during the M1 migration.
        base: "180ms",
        page: "360ms",
        spring: "420ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quint": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
        "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "in-cubic": "cubic-bezier(0.32, 0, 0.67, 0)",
        linear: "linear",
        // Legacy v0.3 timing tokens kept during the M1 migration.
        snappy: "cubic-bezier(0.2, 0, 0, 1)",
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      ringColor: {
        DEFAULT: "var(--brand-accent)",
        accent: "var(--brand-accent)",
        ai: "var(--brand-ai)",
      },
      ringOffsetColor: {
        DEFAULT: "var(--surface-canvas)",
      },
      backdropBlur: {
        glass: "24px",
      },
      backdropSaturate: {
        glass: "180%",
      },
      ringWidth: {
        DEFAULT: "1px",
        0: "0",
        1: "1px",
        2: "2px",
        3: "3px",
        4: "4px",
        focus: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
