/**
 * tooling/list-builtin-types.ts
 *
 * Print the 7 built-in Work Item type keys from @orvix/schemas. Run via:
 *
 *     pnpm --filter @orvix/tooling run list-builtin-types
 *
 * Useful for code-generation scripts and for the dev-time sanity check
 * that the runtime and the schema package agree on the type catalog.
 */

import { BUILT_IN_WORK_ITEM_TYPES } from "@orvix/schemas";

const list = [...BUILT_IN_WORK_ITEM_TYPES];

console.log(`Built-in Work Item types (count: ${list.length}):`);
for (const t of list) {
  console.log(`  - ${t}`);
}

if (list.length !== 7) {
  console.error(`Expected exactly 7 built-in types. Got ${list.length}.`);
  process.exit(1);
}

console.log("OK: count matches v0.2 baseline.");
