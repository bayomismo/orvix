/**
 * @orvix/db — Repository factory (Milestone 1).
 *
 * Picks the correct {@link Repository} implementation based on the
 * environment. The decision is made once per process; the result is
 * cached on `globalThis` so HMR does not re-evaluate it.
 *
 *   - `DATABASE_URL` set AND `ORVIX_DB_BACKEND=prisma` → PrismaRepository
 *   - Otherwise → InMemoryRepository (default; safe for dev, tests,
 *     preview deploys without a database)
 *
 * The factory is a server-only module: importing it from a "use client"
 * file is a no-op. Keep the Prisma client out of the browser bundle.
 *
 * Cloud-workspace compatibility: the Minimax cloud stores the Neon URL
 * under the name `NEON_DATABASE_URL`. We alias it to `DATABASE_URL` at
 * module load so Prisma's `env("DATABASE_URL")` and our factory both
 * see the same value.
 */

import type { Repository } from "./types";
import { createInMemoryRepository } from "./in-memory";
import { PrismaClient } from "@prisma/client";

// One-time alias: cloud workspace stores the secret as NEON_DATABASE_URL.
if (!process.env["DATABASE_URL"] && process.env["NEON_DATABASE_URL"]) {
  process.env["DATABASE_URL"] = process.env["NEON_DATABASE_URL"];
}

declare global {
  // eslint-disable-next-line no-var
  var __orvixRepository: Repository | undefined;
  // eslint-disable-next-line no-var
  var __orvixPrisma: PrismaClient | undefined;
}

function buildRepository(): Repository {
  const databaseUrl = process.env["DATABASE_URL"];
  const backend = process.env["ORVIX_DB_BACKEND"] ?? (databaseUrl ? "prisma" : "memory");

  if (backend === "prisma" && databaseUrl) {
    // Lazy-construct the Prisma client so importing this module
    // without a database doesn't crash the process.
    if (!globalThis.__orvixPrisma) {
      globalThis.__orvixPrisma = new PrismaClient({
        log: process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"],
      });
    }
    // The Prisma implementation is async-loaded to avoid a circular
    // import: the prisma module imports withWorkspace which imports
    // the Prisma client. We re-import here.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createPrismaRepository } = require("./prisma") as typeof import("./prisma");
    return createPrismaRepository(globalThis.__orvixPrisma);
  }

  return createInMemoryRepository();
}

/** The process-wide Repository. */
export const repository: Repository =
  globalThis.__orvixRepository ?? buildRepository();
if (!globalThis.__orvixRepository) {
  globalThis.__orvixRepository = repository;
}

/** For tests that need a clean slate. */
export function resetRepositoryForTests(): void {
  globalThis.__orvixRepository = undefined;
}
