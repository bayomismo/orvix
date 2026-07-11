/**
 * @orvix/db — InMemoryRepository tests.
 */

import { describe, it, expect, beforeEach } from "vitest";

import { createInMemoryRepository } from "../in-memory";

describe("InMemoryRepository", () => {
  let repo: ReturnType<typeof createInMemoryRepository>;

  beforeEach(async () => {
    repo = createInMemoryRepository();
    await repo.reset();
  });

  it("bootstraps a workspace with seed rows", async () => {
    const { workspace, owner, session } = await repo.bootstrapWorkspace({
      name: "Acme",
      industry: "saas",
      companySize: "11-50",
      teamStructure: "functional",
      primaryGoal: "ship-faster",
      ownerEmail: "j@acme.com",
      ownerName: "Jordan",
    });
    expect(workspace.id).toMatch(/^c/);
    expect(owner.email).toBe("j@acme.com");
    expect(session.workspaceId).toBe(workspace.id);
    const types = await repo.listWorkItemTypes(workspace.id);
    expect(types.length).toBe(7);
    const roles = await repo.listRoles(workspace.id);
    expect(roles.map((r) => r.key).sort()).toEqual([
      "admin",
      "ai_assistant",
      "contributor",
      "manager",
      "owner",
      "viewer",
    ]);
  });

  it("isolates by workspace", async () => {
    const a = await repo.bootstrapWorkspace({
      name: "A",
      industry: "saas",
      companySize: "2-10",
      teamStructure: "flat",
      primaryGoal: "ship-faster",
      ownerEmail: "a@a.co",
      ownerName: "A",
    });
    const b = await repo.bootstrapWorkspace({
      name: "B",
      industry: "saas",
      companySize: "2-10",
      teamStructure: "flat",
      primaryGoal: "ship-faster",
      ownerEmail: "b@b.co",
      ownerName: "B",
    });
    const aItem = await repo.createWorkItem({
      workspaceId: a.workspace.id,
      typeKey: "task",
      title: "A task",
      status: "backlog",
      priority: "normal",
      createdById: a.owner.id,
      customFields: {},
    });
    const aList = await repo.listWorkItems(a.workspace.id);
    const bList = await repo.listWorkItems(b.workspace.id);
    expect(aList).toHaveLength(1);
    expect(aList[0]?.id).toBe(aItem.id);
    expect(bList).toHaveLength(0);
  });

  it("idempotency cache returns cached value within TTL", async () => {
    await repo.bootstrapWorkspace({
      name: "Z",
      industry: "saas",
      companySize: "2-10",
      teamStructure: "flat",
      primaryGoal: "ship-faster",
      ownerEmail: "z@z.co",
      ownerName: "Z",
    });
    const first = await repo.idempotencyGet<{ ok: boolean }>("req-1");
    expect(first).toBeUndefined();
    await repo.idempotencyPut("req-1", { ok: true });
    const second = await repo.idempotencyGet<{ ok: boolean }>("req-1");
    expect(second).toEqual({ ok: true });
  });
});
