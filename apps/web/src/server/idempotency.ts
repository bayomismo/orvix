/**
 * Server Action idempotency helper (v0.2 — Review MUST #8 / ADR-15.19).
 *
 * Every side-effecting Server Action MUST call `withIdempotency` with
 * a `clientRequestId`. The runtime:
 *   1. Generates a Redis key from `clientRequestId`.
 *   2. Looks up the prior result (TTL = 24h).
 *   3. If found, returns it verbatim — no double execution.
 *   4. If not found, runs the action and persists the result.
 *
 * Error responses are NOT aliased. A retry runs the action again.
 *
 * Phase 0 ships the contract + the in-memory implementation used in
 * tests. Phase 1 replaces the storage with Redis (Upstash or Vercel
 * KV) keyed by request id.
 */

import { randomUUID } from "node:crypto";

interface IdempotencyEntry<T> {
  result: T;
  ts: number;
  ttlMs: number;
}

const TTL_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Phase 0 in-memory store. Phase 1 replaces with Redis.
 *
 * Replay-only design: only successful results are aliased. Errors
 * are not cached, so a transient failure followed by a retry runs
 * the action again.
 */
class InMemoryIdempotencyStore {
  private readonly entries = new Map<string, IdempotencyEntry<unknown>>();
  private readonly inflight = new Map<string, Promise<unknown>>();

  get<T>(clientRequestId: string): T | undefined {
    const e = this.entries.get(clientRequestId);
    if (!e) return undefined;
    if (Date.now() - e.ts > e.ttlMs) {
      this.entries.delete(clientRequestId);
      return undefined;
    }
    return e.result as T;
  }

  put<T>(clientRequestId: string, result: T): void {
    this.entries.set(clientRequestId, {
      result,
      ts: Date.now(),
      ttlMs: TTL_MS,
    });
  }

  inflightKey(clientRequestId: string): Promise<unknown> | undefined {
    return this.inflight.get(clientRequestId);
  }

  setInflight(clientRequestId: string, p: Promise<unknown>): void {
    this.inflight.set(clientRequestId, p);
  }

  clearInflight(clientRequestId: string): void {
    this.inflight.delete(clientRequestId);
  }
}

const store = new InMemoryIdempotencyStore();

/**
 * Idempotency middleware for Server Actions.
 *
 * Use:
 *
 *   export async function createCustomer(input: CreateCustomerInput) {
 *     return withIdempotency(input.clientRequestId, () =>
 *       doCreateCustomer(input)
 *     );
 *   }
 */
export async function withIdempotency<T>(
  clientRequestId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = store.get<T>(clientRequestId);
  if (cached !== undefined) {
    return cached;
  }

  // Concurrent retry handling: if a second retry arrives while the
  // first is still executing, the second awaits the first.
  const inflight = store.inflightKey(clientRequestId);
  if (inflight) {
    return (await inflight) as T;
  }

  const result = fn();
  store.setInflight(clientRequestId, result as Promise<unknown>);
  try {
    const value = await result;
    store.put(clientRequestId, value);
    return value;
  } finally {
    store.clearInflight(clientRequestId);
  }
}

/** Helper: produce a UUID v4 clientRequestId at the call site. */
export function newClientRequestId(): string {
  return randomUUID();
}
