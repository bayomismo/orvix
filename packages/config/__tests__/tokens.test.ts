/**
 * Tokens v1.0 conformance test.
 *
 * The design system is the source of truth. Every public token must
 * be present, with the right shape, and the right value range. If
 * this test fails, either the design system changed (update the
 * test) or the token file drifted (fix the token file).
 */
import tokens from "../tokens/tokens.json" with { type: "json" };

describe("ORVIX Design System v1.0 — Tokens", () => {
  test("version is 1.0.0", () => {
    expect(tokens.version).toBe("1.0.0");
  });

  describe("Color tokens", () => {
    test("brand tokens have light + dark values", () => {
      for (const key of ["primary", "accent", "accent_soft", "ai", "ai_soft"] as const) {
        const t = tokens.color.brand[key];
        expect(t.light).toMatch(/^#[0-9A-F]{6}$/i);
        expect(t.dark).toMatch(/^#[0-9A-F]{6}$/i);
      }
    });

    test("brand accent is Electric Indigo (matches spec)", () => {
      expect(tokens.color.brand.accent.light).toBe("#5046E5");
      expect(tokens.color.brand.accent.dark).toBe("#5046E5");
    });

    test("AI color is purple-violet (separate from accent)", () => {
      expect(tokens.color.brand.ai.light).toBe("#8B5CF6");
      expect(tokens.color.brand.ai.dark).toBe("#8B85F0");
      expect(tokens.color.brand.ai.light).not.toBe(tokens.color.brand.accent.light);
    });

    test("neutrals span 0–950 with both themes", () => {
      const neutralKeys = ["0", "50", "100", "150", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
      for (const k of neutralKeys) {
        expect(tokens.color.neutral[k]).toBeDefined();
        expect(tokens.color.neutral[k].light).toMatch(/^#[0-9A-F]{6}$/i);
        expect(tokens.color.neutral[k].dark).toMatch(/^#[0-9A-F]{6}$/i);
      }
    });

    test("status tokens have light + dark + soft pair", () => {
      for (const k of ["success", "warning", "danger", "info", "neutral"] as const) {
        expect(tokens.color.status[k].light).toBeDefined();
        expect(tokens.color.status[k].dark).toBeDefined();
        expect(tokens.color.status[`${k}_soft`].light).toBeDefined();
        expect(tokens.color.status[`${k}_soft`].dark).toBeDefined();
      }
    });

    test("AI highlights are present (separate from accent)", () => {
      expect(tokens.color.highlight.ai_1).toBeDefined();
      expect(tokens.color.highlight.ai_2).toBeDefined();
      expect(tokens.color.highlight.ai_3).toBeDefined();
    });
  });

  describe("Type scale", () => {
    test("type scale includes all 13 v1.0 tokens", () => {
      const required = [
        "display-2xl",
        "display-xl",
        "display-lg",
        "display-md",
        "display-sm",
        "text-lg",
        "text-md",
        "text-sm",
        "text-xs",
        "text-2xs",
        "data-lg",
        "data-md",
        "data-sm",
      ] as const;
      for (const k of required) {
        expect(tokens.type[k]).toBeDefined();
        expect(tokens.type[k].size).toMatch(/^[\d.]+rem$/);
        expect(tokens.type[k].lineHeight).toBeDefined();
        expect(tokens.type[k].weight).toMatch(/^[1-9]00$/);
      }
    });

    test("type scale descends monotonically", () => {
      const sizes = [
        tokens.type["display-2xl"].size,
        tokens.type["display-xl"].size,
        tokens.type["display-lg"].size,
        tokens.type["display-md"].size,
        tokens.type["display-sm"].size,
        tokens.type["text-lg"].size,
        tokens.type["text-md"].size,
        tokens.type["text-sm"].size,
        tokens.type["text-xs"].size,
        tokens.type["text-2xs"].size,
      ];
      const rems = sizes.map((s) => parseFloat(s ?? "0"));
      for (let i = 1; i < rems.length; i++) {
        expect(rems[i]).toBeLessThanOrEqual(rems[i - 1] as number);
      }
    });
  });

  describe("Radius", () => {
    test("radius has 7 tokens (per spec)", () => {
      expect(Object.keys(tokens.radius).sort()).toEqual(
        ["full", "lg", "md", "none", "sm", "xl", "xs"].sort(),
      );
    });
  });

  describe("Motion", () => {
    test("4 durations per spec (80, 160, 240, 400)", () => {
      expect(tokens.motion.instant.duration).toBe("80ms");
      expect(tokens.motion.fast.duration).toBe("160ms");
      expect(tokens.motion.default.duration).toBe("240ms");
      expect(tokens.motion.slow.duration).toBe("400ms");
    });

    test("5 easings per spec", () => {
      expect(tokens.motion.ease_out_quint).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
      expect(tokens.motion.ease_in_out_quart).toBe("cubic-bezier(0.76, 0, 0.24, 1)");
      expect(tokens.motion.ease_out_back).toBe("cubic-bezier(0.34, 1.56, 0.64, 1)");
      expect(tokens.motion.ease_in_cubic).toBe("cubic-bezier(0.32, 0, 0.67, 0)");
      expect(tokens.motion.ease_linear).toBe("linear");
    });
  });

  describe("Pulse (signature)", () => {
    test("pulse has thickness, glow, and per-state color tokens", () => {
      expect(tokens.pulse.thickness).toBe("1px");
      expect(tokens.pulse.active.color).toBeDefined();
      expect(tokens.pulse.ai.color).toBeDefined();
      expect(tokens.pulse.warning.color).toBeDefined();
      expect(tokens.pulse.error.color).toBeDefined();
    });
  });

  describe("Z-index", () => {
    test("z scale includes pulse layer (above palette)", () => {
      const z = tokens.z as Record<string, number>;
      expect(z.pulse).toBeGreaterThan(z.palette as number);
      expect(z.toast as number).toBeLessThan(z.pulse as number);
    });
  });

  describe("Agent rules", () => {
    test("rules forbid raw hex in feature code", () => {
      expect(tokens.agentRules.noRawHexInFeatureCode).toBe(true);
      expect(tokens.agentRules.useOnlyTokensViaCssVars).toBe(true);
      expect(tokens.agentRules.aiColorReservedFor).toBe("AI involvement only");
    });
  });
});
