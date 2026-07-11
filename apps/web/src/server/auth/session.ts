/**
 * Session facade (Milestone 1).
 *
 * Single import for everything that needs the current session:
 *
 *   import { getServerSession, requireServerSession } from
 *     "@/server/auth/session";
 *
 * The facade picks the right backend:
 *
 *   - When Auth.js is configured (`AUTH_SECRET` + at least one
 *     provider) the session is sourced from `next-auth`'s JWT cookie.
 *   - When Auth.js is not configured (Phase 0 dev mode), the
 *     session is sourced from the cookie-backed in-memory store.
 *
 * Both paths return the same shape:
 *
 *   {
 *     userId: string;
 *     workspaceId: string;
 *     roleKey: RoleKey;
 *     expiresAt: string;
 *   }
 *
 * The legacy `apps/web/src/server/auth.ts` is kept as the in-memory
 * implementation; this file orchestrates the choice.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { repository, type Session, type User, type Workspace } from "@orvix/db";

const COOKIE = "orvix_session";
const TTL_MS = 24 * 60 * 60 * 1000;

/** Detect whether Auth.js is wired (env present). */
function isAuthJsConfigured(): boolean {
  return Boolean(
    process.env["AUTH_SECRET"] &&
      (process.env["EMAIL_SERVER"] ||
        process.env["GOOGLE_CLIENT_ID"] ||
        process.env["MICROSOFT_CLIENT_ID"]),
  );
}

export interface ServerSession {
  userId: string;
  workspaceId: string;
  roleKey: string;
  expiresAt: string;
  user: User;
  workspace: Workspace;
  source: "auth.js" | "memory";
}

// ---------------------------------------------------------------------------
// Memory backend
// ---------------------------------------------------------------------------

/**
 * The memory backend talks to the in-memory part of the Repository
 * abstraction. The InMemoryRepository implementation keeps session
 * rows alongside the other maps.
 */
function memorySessions(): {
  get(id: string): Session | undefined;
  set(id: string, s: Session): void;
  delete(id: string): void;
} {
  const repo = repository;
  if (repo.kind !== "memory") {
    throw new Error("memory backend requested but the active repository is not in-memory");
  }
  return {
    get: (id) => (repo as unknown as { sessions: Map<string, Session> }).sessions.get(id),
    set: (id, s) => (repo as unknown as { sessions: Map<string, Session> }).sessions.set(id, s),
    delete: (id) => (repo as unknown as { sessions: Map<string, Session> }).sessions.delete(id),
  };
}

export function createMemorySession(userId: string, workspaceId: string): Session {
  const session: Session = {
    id: cryptoRandomId(),
    userId,
    workspaceId,
    expiresAt: new Date(Date.now() + TTL_MS).toISOString(),
  };
  memorySessions().set(session.id, session);
  return session;
}

export async function setMemorySessionCookie(session: Session): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: TTL_MS / 1000,
  });
}

export async function clearMemorySessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

async function getMemorySession(): Promise<ServerSession | null> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  const sessions = memorySessions();
  const session = sessions.get(id);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    sessions.delete(id);
    return null;
  }
  const user = await repository.findUserById(session.userId);
  const workspace = await repository.getWorkspace(session.workspaceId);
  if (!user || !workspace) return null;
  return {
    userId: user.id,
    workspaceId: workspace.id,
    roleKey: user.roleKey,
    expiresAt: session.expiresAt,
    user,
    workspace,
    source: "memory",
  };
}

// ---------------------------------------------------------------------------
// Auth.js backend
// ---------------------------------------------------------------------------

async function getAuthJsSession(): Promise<ServerSession | null> {
  // `auth` from next-auth v5 is a route-handler factory. We can't
  // call it with no args to read the session; we read the JWT cookie
  // directly via the `getToken` helper. This avoids importing the
  // full handler and keeps the call site server-only.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getToken } = require("next-auth/jwt") as typeof import("next-auth/jwt");
  const { headers: nextHeaders } = await import("next/headers");
  const hdrs = await nextHeaders();
  const req = { headers: hdrs } as unknown as Parameters<typeof getToken>[0]["req"];
  const token = await getToken({
    req,
    secret: process.env["AUTH_SECRET"] ?? "phase-0-dev-secret-do-not-ship",
    salt: "authjs.session-token",
  }).catch(() => null);
  if (!token) return null;
  const userId =
    (token as { userId?: string }).userId ?? (token.sub as string | undefined) ?? null;
  if (!userId) return null;
  const user = await repository.findUserById(userId);
  if (!user) return null;
  const workspace = await repository.getWorkspace(user.workspaceId);
  if (!workspace) return null;
  return {
    userId: user.id,
    workspaceId: workspace.id,
    roleKey: (token as { roleKey?: string }).roleKey ?? user.roleKey,
    expiresAt: new Date(Date.now() + TTL_MS).toISOString(),
    user,
    workspace,
    source: "auth.js",
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns the current session, or null if unauthenticated. */
export async function getServerSession(): Promise<ServerSession | null> {
  if (isAuthJsConfigured()) {
    return getAuthJsSession();
  }
  return getMemorySession();
}

/** Same as getServerSession() but redirects to /onboarding if null. */
export async function requireServerSession(): Promise<ServerSession> {
  const s = await getServerSession();
  if (!s) redirect("/onboarding");
  return s;
}

function cryptoRandomId(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("");
}
