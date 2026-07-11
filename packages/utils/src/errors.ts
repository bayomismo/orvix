/**
 * Typed domain errors. Mapped to HTTP status codes by the REST layer.
 * Server Actions throw these directly; the Next.js error boundary
 * converts them into user-visible messages that never leak internals.
 */

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("validation_failed", message, 400, details);
    this.name = "ValidationError";
  }
}

export class AuthError extends DomainError {
  constructor(message = "Authentication required", details?: Record<string, unknown>) {
    super("unauthenticated", message, 401, details);
    this.name = "AuthError";
  }
}

export class PermissionError extends DomainError {
  constructor(message = "Not permitted", details?: Record<string, unknown>) {
    super("not_permitted", message, 403, details);
    this.name = "PermissionError";
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Resource not found", details?: Record<string, unknown>) {
    super("not_found", message, 404, details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends DomainError {
  constructor(message = "Resource conflict", details?: Record<string, unknown>) {
    super("conflict", message, 409, details);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends DomainError {
  constructor(message = "Rate limit exceeded", details?: Record<string, unknown>) {
    super("rate_limited", message, 429, details);
    this.name = "RateLimitError";
  }
}

export class IdempotencyError extends DomainError {
  /**
   * v0.2: when an action with the same `clientRequestId` previously
   * resulted in an error, the runtime refuses to alias the retry —
   * it lets the action run again. So this class is rarely thrown; it's
   * here for the case where two concurrent retries race and one of
   * them needs to lose.
   */
  constructor(message = "Idempotency check failed", details?: Record<string, unknown>) {
    super("idempotency_conflict", message, 409, details);
    this.name = "IdempotencyError";
  }
}

/**
 * Map a domain error class to an HTTP status code. Used by the REST
 * boundary (Route Handlers).
 */
export function statusFor(err: unknown): number {
  if (err instanceof DomainError) return err.statusCode;
  return 500;
}

/** Map an error to a stable envelope `code` for public responses. */
export function codeFor(err: unknown): string {
  if (err instanceof DomainError) return err.code;
  return "internal_error";
}
