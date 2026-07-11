import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // Tests must run against the in-memory repository, never Prisma.
    // The factory checks this env var first; setting it to "memory"
    // here prevents tests from accidentally hitting a real database
    // when DATABASE_URL is set in the host environment.
    env: {
      ORVIX_DB_BACKEND: "memory",
    },
  },
});
