import { describe, expect, it } from "vitest";

import { run } from "../runtime";
import type { AIRunRequest } from "@orvix/schemas";
import { defaultToolRegistry } from "../tools";

const baseRequest: AIRunRequest = {
  workspaceId: "00000000-0000-0000-0000-000000000001",
  routingProfile: "sales",
  kind: "summary",
  payload: {},
};

describe("@orvix/ai-runtime v0.2 runtime", () => {
  it("runs the planner → verifier → approver sequence and returns an execute decision", async () => {
    const res = await run({ request: baseRequest });
    expect(res.decision).toBe("queue_for_approval"); // default autonomy is suggest_only
    expect(res.verifier.verdict).toBeDefined();
    expect(res.confidenceLabel).toBeDefined();
    expect(res.traceId.length).toBeGreaterThan(0);
  });

  it("blocks irreversible actions even when planner is confident", async () => {
    const request: AIRunRequest = {
      ...baseRequest,
      kind: "action",
      payload: {
        proposedPayload: {
          target: {
            scope: "internal",
            impact: "high",
            reversibility: "irreversible",
          },
        },
      },
    };
    const res = await run({ request });
    expect(res.decision).toBe("block");
    expect(res.verifier.verdict).toBe("disagree");
  });

  it("queues low-risk-internal suggestions under suggest_only (default)", async () => {
    const request: AIRunRequest = {
      ...baseRequest,
      kind: "draft",
      routingProfile: "operations",
      payload: {},
    };
    const res = await run({ request });
    expect(res.decision).toBe("queue_for_approval");
    expect(res.rationale).toContain("suggest_only");
  });

  it("executes low-risk-internal under suggest_and_act_low_risk", async () => {
    const res = await run({
      request: baseRequest,
      costMeter: {
        usedUSD: 0,
        capUSD: 5,
        autonomyLevel: "suggest_and_act_low_risk",
      },
    });
    expect(res.decision).toBe("execute");
    expect(res.confidenceLabel).toBe("high");
  });

  it("cools down when the cost cap is reached", async () => {
    const res = await run({
      request: baseRequest,
      costMeter: {
        usedUSD: 5,
        capUSD: 5,
        autonomyLevel: "suggest_and_act_low_risk",
      },
    });
    expect(res.decision).toBe("cooldown");
  });
});

describe("tool registry authorization", () => {
  it("refuses a tool call from a routing profile that isn't on its allow-list", () => {
    const r = defaultToolRegistry();
    expect(() => r.assertAuthorized("create.work_item", "ceo")).toThrowError(
      /not authorized/,
    );
  });

  it("allows a tool call from an authorized routing profile", () => {
    const r = defaultToolRegistry();
    expect(() => r.assertAuthorized("create.work_item", "sales")).not.toThrow();
  });
});
