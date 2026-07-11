import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.test.ts"],
    environment: "node",
    // Tests must use the in-memory repository even if DATABASE_URL is set.
    env: {
      ORVIX_DB_BACKEND: "memory",
    },
  },
});
