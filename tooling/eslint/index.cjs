/**
 * Root ESLint config (CJS, legacy format) — references the @orvix/config presets.
 *
 * Used as the root `.eslintrc.cjs` at the monorepo root. Each app and
 * package extends this with its own additions.
 */
const sharedPreset = require("../../packages/config/eslint/index.cjs");

// sharedPreset is a flat-config array. Convert it to a legacy-config
// shape (object with `rules`, `ignorePatterns`, `overrides`) so the
// `.eslintrc.cjs` legacy format can consume it.
const flat = Array.isArray(sharedPreset) ? sharedPreset : [sharedPreset];

const rules = {};
const ignorePatterns = [];
const overrides = [];

for (const block of flat) {
  if (!block) continue;
  if (block.ignores) {
    for (const p of block.ignores) ignorePatterns.push(p);
  }
  if (block.rules) {
    Object.assign(rules, block.rules);
  }
  if (block.files || block.overrides) {
    overrides.push({
      ...(block.files ? { files: block.files } : {}),
      ...(block.languageOptions ? { parserOptions: block.languageOptions } : {}),
      ...(block.rules ? { rules: block.rules } : {}),
    });
  }
}

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  plugins: ["@typescript-eslint"],
  extends: [],
  ignorePatterns: [
    "**/dist/**",
    "**/.next/**",
    "**/node_modules/**",
    "**/.turbo/**",
    "**/generated/**",
  ],
  rules: {
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    ...rules,
  },
  overrides,
};
