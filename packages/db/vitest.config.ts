import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // Tests run against the in-memory repository, never Prisma.
    env: {
      ORVIX_DB_BACKEND: "memory",
    },
  },
});
