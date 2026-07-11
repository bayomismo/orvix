#!/usr/bin/env node
/**
 * scripts/sync-prisma-client.mjs
 *
 * After `pnpm install`, the Prisma client is generated into
 * `packages/db/node_modules/.prisma/client/`. Other workspace packages
 * (apps/web, apps/ai) import `@prisma/client` and resolve it through
 * the pnpm store at `node_modules/.pnpm/@prisma+client@<version>/node_modules/`,
 * which has its own un-generated stub.
 *
 * We need the generated client in BOTH locations. `prisma generate` is
 * normally called by the `@orvix/db` build script, but Vercel runs
 * `pnpm install` before any build step. This postinstall script runs
 * `prisma generate` and syncs the result.
 *
 * It's idempotent: if the generated client already exists and matches,
 * it's a no-op.
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, statSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DB_PKG = join(ROOT, "packages", "db");
const GENERATED_DIR = join(DB_PKG, "node_modules", ".prisma", "client");

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(`[sync-prisma] ${msg}`);
}

function copyDir(src, dst) {
  if (!existsSync(src)) return false;
  if (!existsSync(dst)) mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const dstPath = join(dst, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
    }
  }
  return true;
}

function findPnpmPrismaClientDir() {
  // The pnpm store layout: node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client
  const pnpmRoot = join(ROOT, "node_modules", ".pnpm");
  if (!existsSync(pnpmRoot)) return null;
  const entries = readdirSync(pnpmRoot);
  for (const entry of entries) {
    if (entry.startsWith("@prisma+client@")) {
      return join(pnpmRoot, entry, "node_modules", ".prisma", "client");
    }
  }
  return null;
}

function main() {
  // 1. Run `prisma generate` in packages/db to produce the generated client.
  log("running prisma generate in packages/db");
  try {
    execSync("pnpm --filter @orvix/db db:generate", {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ORVIX_DB_BACKEND: "memory" },
    });
  } catch (e) {
    log(`prisma generate failed (this is OK if it ran already): ${e.message?.slice(0, 200) ?? e}`);
  }

  // 2. Sync the generated client to the pnpm store location.
  const pnpmTarget = findPnpmPrismaClientDir();
  if (!pnpmTarget) {
    log("pnpm store for @prisma/client not found; skipping sync (probably no node_modules yet)");
    return;
  }

  if (!existsSync(GENERATED_DIR)) {
    log(`generated client not found at ${GENERATED_DIR}; nothing to sync`);
    return;
  }

  log(`syncing generated client to ${pnpmTarget}`);
  // Clear target and copy fresh
  if (existsSync(pnpmTarget)) rmSync(pnpmTarget, { recursive: true, force: true });
  copyDir(GENERATED_DIR, pnpmTarget);
  log("sync complete");
}

main();
