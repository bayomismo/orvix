/**
 * @orvix/db — client entry
 *
 * Lazy Prisma client + the withWorkspace tenant isolation extension.
 * Two flavors:
 *
 *   import { prisma } from "@orvix/db/client"          // tenant-checked
 *   import { prismaRaw } from "@orvix/db/client/raw"   // bypass for migrations / system jobs
 *
 * The Prisma client is constructed lazily on first access so importing
 * this module in environments without a `DATABASE_URL` (tests, dev mode)
 * does not crash the process. When the active backend is the in-memory
 * Repository, neither client is used.
 *
 * Cloud-workspace compatibility: the Minimax cloud stores the Neon URL
 * under the name `NEON_DATABASE_URL`. We alias it to `DATABASE_URL` at
 * module load so Prisma's `env("DATABASE_URL")` (used inside the
 * generated client) and the lazy constructor both see the same value.
 */

import type { PrismaClient } from "@prisma/client";

// Cloud-workspace alias: copy NEON_DATABASE_URL into DATABASE_URL
// before any Prisma client gets a chance to read it.
if (!process.env["DATABASE_URL"] && process.env["NEON_DATABASE_URL"]) {
  process.env["DATABASE_URL"] = process.env["NEON_DATABASE_URL"];
}

let _prisma: PrismaClient | null = null;

function buildPrisma(): PrismaClient {
  // Lazy require so the prisma client is not loaded unless needed.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient: RealPrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { applyTenantIsolation } = require("./with-workspace") as typeof import("./with-workspace");
  return applyTenantIsolation(
    new RealPrismaClient({
      log: process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"],
    }),
  );
}

let _prismaRaw: PrismaClient | null = null;
function buildPrismaRaw(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient: RealPrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
  return new RealPrismaClient({
    log: process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"],
  });
}

/** Tenant-checked Prisma client. Constructed on first use. */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prisma) _prisma = buildPrisma();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_prisma as any)[prop];
  },
});

/** Unchecked Prisma client. Migrations / system jobs only. */
export const prismaRaw: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prismaRaw) _prismaRaw = buildPrismaRaw();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_prismaRaw as any)[prop];
  },
});

export * from "./types";
export { withWorkspace, applyTenantIsolation } from "./with-workspace";
export type {
  TenantClass,
  WorkspaceStatus,
  DnaStatus,
  AiAutonomyLevel,
  AiTonePreset,
  AiMemoryLayer,
  AiRunKind,
  AiRunModelTier,
  AiRunStatus,
  WorkItemPriority,
  RoleKey,
} from "./types";
