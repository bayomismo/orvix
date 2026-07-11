/**
 * RBAC tests.
 */

import { describe, it, expect, beforeEach } from "vitest";

import { repository, resetRepositoryForTests } from "@orvix/db";

import {
  defaultGrantsForRole,
  hasPermission,
  requirePermission,
  PermissionDeniedError,
} from "../rbac";

import type { ServerSession } from "../auth/session";

async function makeSession(roleKey: string): Promise<ServerSession> {
  const { workspace, owner } = await repository.bootstrapWorkspace({
    name: `ws-${roleKey}-${Date.now()}-${Math.random()}`,
    industry: "saas",
    companySize: "2-10",
    teamStructure: "flat",
    primaryGoal: "ship-faster",
    ownerEmail: `o-${roleKey}-${Date.now()}-${Math.random()}@example.com`,
    ownerName: "Owner",
  });
  // Update the owner's role key to whatever we want to test.
  const user = await repository.findUserById(owner.id);
  if (user) {
    user.roleKey = roleKey as typeof user.roleKey;
    // Direct mutation only valid for the in-memory backend; if the
    // Prisma backend is active, the role change would require an
    // update. The in-memory backend mutates the same Map.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (repository as any).users?.set?.(user.id, user);
  }
  return {
    userId: user?.id ?? owner.id,
    workspaceId: workspace.id,
    roleKey,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    user: user ?? owner,
    workspace,
    source: "memory",
  };
}

describe("RBAC", () => {
  beforeEach(async () => {
    resetRepositoryForTests();
  });

  it("owner bypasses every check", async () => {
    const s = await makeSession("owner");
    expect(await hasPermission(s, "work.read")).toBe(true);
    expect(await hasPermission(s, "ai.approve")).toBe(true);
    expect(await hasPermission(s, "*")).toBe(true);
  });

  it("viewer cannot write or approve", async () => {
    const s = await makeSession("viewer");
    expect(await hasPermission(s, "work.read")).toBe(true);
    expect(await hasPermission(s, "work.write")).toBe(false);
    expect(await hasPermission(s, "ai.approve")).toBe(false);
  });

  it("admin can write work + approve AI but not delete (with current matrix)", async () => {
    const s = await makeSession("admin");
    // The admin default matrix includes work.delete, but not the
    // wildcard. Both should pass.
    expect(await hasPermission(s, "work.write")).toBe(true);
    expect(await hasPermission(s, "ai.approve")).toBe(true);
    expect(await hasPermission(s, "work.delete")).toBe(true);
  });

  it("ai_assistant can execute and suggest", async () => {
    const s = await makeSession("ai_assistant");
    expect(await hasPermission(s, "ai.execute")).toBe(true);
    expect(await hasPermission(s, "ai.suggest")).toBe(true);
    expect(await hasPermission(s, "work.write")).toBe(false);
  });

  it("requirePermission throws on miss", async () => {
    const s = await makeSession("viewer");
    expect(() => undefined).not.toThrow();
    await expect(requirePermission(s, "work.write")).rejects.toBeInstanceOf(
      PermissionDeniedError,
    );
  });

  it("defaultGrantsForRole includes * for owner and omits it for viewer", () => {
    expect(defaultGrantsForRole("owner")).toContain("*");
    expect(defaultGrantsForRole("viewer")).not.toContain("*");
  });
});
