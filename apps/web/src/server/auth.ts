/**
 * Auth facade (Milestone 1).
 *
 * This file is the single import for everything that needs to read
 * the current session. Internally it dispatches to either:
 *   - the in-memory cookie session (Phase 0 dev mode, default)
 *   - the Auth.js v5 JWT session (production, when env is configured)
 *
 * The legacy `db`-based in-memory store is kept as the default; the
 * Repository abstraction owns the in-memory implementation.
 *
 * @deprecated prefer importing directly from "@/server/auth/session".
 *   This shim is kept for backward compatibility with code that has
 *   not yet been migrated.
 */

import { repository, type Session } from "@orvix/db";

import {
  createMemorySession,
  getServerSession,
  requireServerSession,
  setMemorySessionCookie,
  clearMemorySessionCookie,
  type ServerSession,
} from "./auth/session";

export type ActiveSession = ServerSession;

export { getServerSession, requireServerSession };

// Legacy names — keep the v0.2 API surface working while callers
// migrate to the new facade.
export const getSession = getServerSession;
export const requireSession = requireServerSession;

/**
 * Legacy `setSessionCookie` keeps the same name as the original
 * implementation. The new flow uses {@link setMemorySessionCookie}
 * for the in-memory backend and Auth.js sets its own cookie for the
 * production backend.
 */
export async function setSessionCookie(session: Session): Promise<void> {
  await setMemorySessionCookie(session);
}

export async function clearSessionCookie(): Promise<void> {
  await clearMemorySessionCookie();
}

export { createMemorySession as createSession };

/**
 * Used by the bootstrap route to write a session row through the
 * repository, regardless of which backend is active.
 */
export async function createRepositorySession(
  userId: string,
  workspaceId: string,
): Promise<Session> {
  if (repository.kind === "memory") {
    return createMemorySession(userId, workspaceId);
  }
  return repository.createSession(userId, workspaceId);
}
