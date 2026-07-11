/**
 * Result<T, E> — explicit success/failure union without throwing.
 *
 * Use for Server Action returns when the caller wants to handle
 * failure structurally (e.g., UI for graceful "Looks good / Request
 * changes") rather than via thrown errors.
 */

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok;
}

export function isErr<T, E>(r: Result<T, E>): r is { ok: false; error: E } {
  return !r.ok;
}

export function map<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return r.ok ? (ok(fn(r.value)) as Result<U, E>) : (r as Result<U, E>);
}

export function mapErr<T, E, F>(r: Result<T, E>, fn: (e: E) => F): Result<T, F> {
  return r.ok ? (r as unknown as Result<T, F>) : (err(fn(r.error)) as Result<T, F>);
}

export function unwrap<T, E>(r: Result<T, E>): T {
  if (r.ok) return r.value;
  throw r.error instanceof Error ? r.error : new Error(String(r.error));
}
