import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // Tests use the in-memory repository.
    env: {
      ORVIX_DB_BACKEND: "memory",
    },
  },
});
