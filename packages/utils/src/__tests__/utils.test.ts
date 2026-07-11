import { describe, expect, it } from "vitest";

import { formatUSD, formatRelativeTime, formatCompact } from "../format";
import { ok, err, isOk, isErr, map, unwrap, type Result } from "../result";
import { ValidationError, statusFor, codeFor } from "../errors";
import { estimateCostUSD, COST_CEILINGS, InferenceTally } from "../cost";

describe("format", () => {
  it("formatUSD handles fractional cents correctly", () => {
    expect(formatUSD(100)).toBe("$1.00");
    expect(formatUSD(123_45)).toBe("$123.45");
    expect(formatUSD(0)).toBe("$0.00");
  });

  it("formatUSD returns em-dash for non-finite input", () => {
    expect(formatUSD(Number.NaN)).toBe("—");
  });

  it("formatRelativeTime: just now / minutes / hours / days", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    expect(formatRelativeTime(now, now)).toBe("just now");
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60_000), now)).toBe("5m ago");
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 60 * 60_000), now)).toBe("3h ago");
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 24 * 60 * 60_000), now)).toBe("2d ago");
  });

  it("formatCompact: 1.2k / 3.4M", () => {
    expect(formatCompact(1_234)).toMatch(/1\.2/);
    expect(formatCompact(3_400_000)).toMatch(/3\.4/);
  });
});

describe("Result", () => {
  it("ok and err", () => {
    expect(isOk(ok(42))).toBe(true);
    expect(isErr(err("nope"))).toBe(true);
  });

  it("unwrap throws on err", () => {
    expect(() => unwrap(err(new Error("boom")))).toThrowError("boom");
    expect(unwrap(ok(7))).toBe(7);
  });

  it("map composes values", () => {
    const r2: Result<number, never> = ok(2);
    const r3: Result<number, never> = map(r2, (v) => v * 3);
    expect(unwrap(r3)).toBe(6);
  });
});

describe("errors", () => {
  it("ValidationError has status 400 and code validation_failed", () => {
    const e = new ValidationError("field x is required");
    expect(statusFor(e)).toBe(400);
    expect(codeFor(e)).toBe("validation_failed");
  });

  it("statusFor maps unknown to 500", () => {
    expect(statusFor(new Error("oops"))).toBe(500);
    expect(codeFor(new Error("oops"))).toBe("internal_error");
  });
});

describe("cost primitives", () => {
  it("estimateCostUSD is positive for every tier", () => {
    expect(estimateCostUSD("fast")).toBeGreaterThan(0);
    expect(estimateCostUSD("medium")).toBeGreaterThan(0);
    expect(estimateCostUSD("heavy")).toBeGreaterThan(0);
  });

  it("Free tier AI cap is 200 / day", () => {
    expect(COST_CEILINGS.free.aiPerDay).toBe(200);
  });

  it("InferenceTally accumulates per workspace", () => {
    const t = new InferenceTally();
    const ts = new Date();
    t.record({ workspaceId: "ws_A", tier: "fast", modelTier: "fast", inputTokens: 10, outputTokens: 5, estimatedCostUSD: 0.001, ts });
    t.record({ workspaceId: "ws_A", tier: "fast", modelTier: "fast", inputTokens: 10, outputTokens: 5, estimatedCostUSD: 0.001, ts });
    const r = t.totalFor("ws_A");
    expect(r?.totalCalls).toBe(2);
    expect(r?.totalCostUSD).toBeCloseTo(0.002, 6);
  });
});
