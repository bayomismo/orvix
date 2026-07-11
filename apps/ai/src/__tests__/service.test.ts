import { describe, expect, it } from "vitest";

import { run } from "@orvix/ai-runtime/runtime";
import { aiRunRequestSchema } from "@orvix/schemas";

describe("@orvix/ai service — runtime integration", () => {
  it("aiRunRequestSchema accepts a valid workspace request", () => {
    const result = aiRunRequestSchema.safeParse({
      workspaceId: "00000000-0000-0000-0000-000000000001",
      routingProfile: "sales",
      kind: "summary",
      payload: {},
    });
    expect(result.success).toBe(true);
  });

  it("runtime returns a structured disposition for a low-risk draft", async () => {
    const result = await run({
      request: {
        workspaceId: "00000000-0000-0000-0000-000000000001",
        routingProfile: "sales",
        kind: "draft",
        payload: {},
      },
    });
    expect(["execute", "queue_for_approval", "block", "cooldown"]).toContain(
      result.decision,
    );
  });

  it("runtime: irreversible action is blocked", async () => {
    const result = await run({
      request: {
        workspaceId: "00000000-0000-0000-0000-000000000001",
        routingProfile: "sales",
        kind: "action",
        payload: {
          proposedPayload: {
            target: {
              scope: "external",
              impact: "high",
              reversibility: "irreversible",
            },
          },
        },
      },
    });
    expect(result.decision).toBe("block");
  });

  it("runtime: financial action above $100 is queued for approval", async () => {
    const result = await run({
      request: {
        workspaceId: "00000000-0000-0000-0000-000000000001",
        routingProfile: "sales",
        kind: "action",
        payload: {
          proposedPayload: {
            target: {
              scope: "financial",
              impact: "high",
              reversibility: "reversible",
              amountUSD: 5_000,
            },
          },
        },
      },
    });
    expect(result.decision).toBe("queue_for_approval");
  });
});
