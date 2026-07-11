/**
 * @orvix/db — bypass client for migrations & system jobs
 *
 * Use this ONLY for:
 *   - migrations
 *   - cross-tenant batch operations (e.g., nightly tenacity jobs)
 *   - the audit-log notarization batcher
 *
 * Never use this from feature code. ESLint forbids `@orvix/db/client/raw`
 * imports in `apps/` and `packages/` other than `@orvix/db` itself.
 *
 * The client is lazy so importing this module without `DATABASE_URL`
 * does not crash the process.
 */

import type { PrismaClient } from "@prisma/client";

let _raw: PrismaClient | null = null;
function buildRaw(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient: RealPrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
  return new RealPrismaClient({
    log: process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prismaRaw: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_raw) _raw = buildRaw();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_raw as any)[prop];
  },
});
