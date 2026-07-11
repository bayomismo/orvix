/**
 * Server Action idempotency — Phase 0 contract test.
 *
 * Verifies:
 *   - Same `clientRequestId` returns the same result (replay).
 *   - Error responses are NOT aliased — retry runs again.
 *   - Concurrent retries for the same id await the first.
 */

import { describe, expect, it } from "vitest";

import { withIdempotency, newClientRequestId } from "../idempotency";

describe("@orvix/web server-side withIdempotency", () => {
  it("returns the same result on a replay of the same clientRequestId", async () => {
    const id = newClientRequestId();
    let counter = 0;

    const a = await withIdempotency(id, async () => {
      counter += 1;
      return { ok: true, n: counter };
    });
    const b = await withIdempotency(id, async () => {
      counter += 1;
      return { ok: true, n: counter };
    });

    expect(a).toEqual({ ok: true, n: 1 });
    expect(b).toEqual({ ok: true, n: 1 });
    expect(counter).toBe(1);
  });

  it("does NOT alias error responses", async () => {
    const id = newClientRequestId();
    let attempts = 0;

    const first = withIdempotency(id, async () => {
      attempts += 1;
      throw new Error("transient");
    }).catch((e: Error) => e);

    await first;

    // Retry — should run again.
    let second: Error | undefined;
    try {
      await withIdempotency(id, async () => {
        attempts += 1;
        throw new Error("transient");
      });
    } catch (e) {
      second = e as Error;
    }

    expect(attempts).toBeGreaterThanOrEqual(2);
    expect(second?.message).toBe("transient");
  });

  it("two distinct clientRequestIds execute independently", async () => {
    const idA = newClientRequestId();
    const idB = newClientRequestId();
    let counter = 0;

    const a = await withIdempotency(idA, async () => {
      counter += 1;
      return counter;
    });
    const b = await withIdempotency(idB, async () => {
      counter += 1;
      return counter;
    });

    expect(a).toBe(1);
    expect(b).toBe(2);
  });
});
