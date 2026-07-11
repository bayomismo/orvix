/**
 * Auth.js v5 catch-all route (Milestone 1).
 *
 * Mounts the OAuth / magic-link / credential handlers at
 * /api/auth/*. Without this file Auth.js is not wired — but the
 * legacy cookie session still works for local dev.
 */

export { GET, POST } from "@/server/auth/route";
