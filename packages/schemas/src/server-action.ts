/**
 * Server Action schemas — v0.2 idempotency contract.
 *
 * Per ADR-15.19 / PRD §10 §2.2, every Server Action with a side effect
 * MUST accept a `clientRequestId` argument. The runtime persists the
 * id against the result; re-running with the same id returns the prior
 * result. Errors are NOT aliased; the retry runs again.
 *
 * This file exports:
 *   - `clientRequestIdSchema` — every input schema embeds this as the
 *     first field.
 *   - `sideEffectingInputSchema` — convenience that wraps a payload in
 *     a Zod schema that includes the id.
 *   - `actionResultSchema` — the standard output envelope.
 */

import { z } from "zod";

export const clientRequestIdSchema = z.string().uuid();

/** Wraps an inner payload schema, enforcing the clientRequestId field. */
export const sideEffectingInputSchema = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({
    clientRequestId: clientRequestIdSchema,
    payload: inner,
  });

/** Standard Server Action result envelope.
 * Successful results use this shape. Errors throw typed errors from
 * `@/lib/errors` (handled at the route layer). */
export const actionResultSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    ok: z.literal(true),
    data,
  });

/** Failure result envelope.
 * Successful paths use `actionResultSchema`; this is for the explicit
 * "graceful failure" path when an action wants to return an error
 * envelope rather than throw. */
export const actionErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().min(1).max(64),
    message: z.string().min(1).max(2_000),
    details: z.record(z.unknown()).optional(),
  }),
});

/**
 * Convenience: derive a Server Action input schema from a payload schema
 * by adding the required `clientRequestId` field. Used by every action
 * implementation.
 */
export function sideEffecting<T extends z.ZodTypeAny>(payload: T): z.ZodObject<{
  clientRequestId: z.ZodString;
  payload: T;
}> {
  return z.object({
    clientRequestId: clientRequestIdSchema,
    payload,
  });
}

/**
 * The `withIdempotency` server runtime helper relies on this schema
 * being the **first field** of any action input. Tests assert on it.
 */
export const idempotencyFieldName = "clientRequestId" as const;
