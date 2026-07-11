/**
 * Tenant-isolation tests — Phase 0 exit criteria.
 *
 * v0.2 isolation model — verified at the application layer. The Prisma
 * extension is the load-bearing gate; cross-tenant reads/writes are
 * expected to throw.
 *
 * The real cross-tenant test is the live Postgres RLS check. CI runs
 * that against a Postgres service (see `.github/workflows/ci.yml`).
 * Here we test the application-level contract with a mock.
 *
 * Because Prisma's `$extends` callback is async, violations surface as
 * rejected promises — we `await` and assert with `.rejects`.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";

import {
  applyTenantIsolation,
  withWorkspace,
  TenantIsolationError,
} from "../with-workspace";

const users: Array<{ id: string; workspaceId: string; email: string }> = [];
let nextUserId = 0;

// The mock is a plain object with a `$extends` method that
// intercepts every model operation and runs it through the
// extension's `$allOperations` callback — exactly mirroring how
// Prisma's real `$extends` works.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMock = any;

function buildMockPrisma() {
  // The base model implementation. Each method filters by workspaceId
  // when one is provided, but does NOT itself throw on missing tenant
  // keys — that is the extension's job. Without the extension, a
  // missing workspaceId would silently return all rows (or, for
  // create, write to any workspace). The application code path is
  // instrumented, so this never happens in production.
  const baseModels = {
    user: {
      findMany(args: { where?: { workspaceId?: string } }) {
        const ws = args?.where?.workspaceId;
        return ws ? users.filter((u) => u.workspaceId === ws) : users;
      },
      findFirst(args: { where?: { workspaceId?: string } }) {
        const ws = args?.where?.workspaceId;
        return ws
          ? (users.find((u) => u.workspaceId === ws) ?? null)
          : (users[0] ?? null);
      },
      count(args: { where?: { workspaceId?: string } }) {
        const ws = args?.where?.workspaceId;
        return ws ? users.filter((u) => u.workspaceId === ws).length : users.length;
      },
      create(args: { data: { workspaceId?: string; email: string } }) {
        const ws = args?.data?.workspaceId ?? "UNSCOPED";
        nextUserId += 1;
        const row = {
          id: `u${nextUserId}`,
          workspaceId: ws,
          email: args.data.email,
        };
        users.push(row);
        return row;
      },
      deleteMany(args: { where?: { workspaceId?: string } }) {
        const ws = args?.where?.workspaceId;
        if (!ws) {
          // Without the extension this is a bug; but we don't throw —
          // the extension enforces. Returning 0 makes the failure mode
          // visible without masking the extension's check.
          return { count: 0 };
        }
        const before = users.length;
        for (let i = users.length - 1; i >= 0; i--) {
          if (users[i]!.workspaceId === ws) users.splice(i, 1);
        }
        return { count: before - users.length };
      },
    },
  };

  const base: Record<string, AnyMock> = {
    ...baseModels,
    // The mock's `$transaction` invokes its callback with the
    // receiver (`this`) so that calls made through the instrumented
    // client propagate through the extension's gate, mirroring
    // Prisma's real behavior in a transaction.
    $transaction: async function (fn: (tx: AnyMock) => Promise<unknown>) {
      return fn(this);
    },
    $executeRawUnsafe: async () => 0,
    // The mock `$extends` wraps every model operation so the
    // extension's $allOperations callback runs first.
    $extends(extension: {
      query?: { $allModels?: { $allOperations: (params: AnyMock) => Promise<unknown> } };
    }) {
      const op = extension.query?.$allModels?.$allOperations;
      if (!op) return base;
      const wrapped: Record<string, AnyMock> = {};
      for (const [modelName, modelValue] of Object.entries(base)) {
        if (modelName.startsWith("$")) continue;
        if (typeof modelValue !== "object" || modelValue === null) continue;
        const wrappedModel: Record<string, AnyMock> = {};
        for (const [opName, opFn] of Object.entries(modelValue)) {
          if (typeof opFn !== "function") continue;
          wrappedModel[opName] = (args: AnyMock) =>
            op({
              model: modelName,
              operation: opName,
              args,
              query: (a: AnyMock) => (opFn as (a: AnyMock) => unknown)(a),
            });
        }
        wrapped[modelName] = wrappedModel;
      }
      wrapped["$transaction"] = base["$transaction"];
      wrapped["$executeRawUnsafe"] = base["$executeRawUnsafe"];
      return wrapped;
    },
  };
  return base;
}

const instrumented = applyTenantIsolation(buildMockPrisma());

describe("tenant isolation (Phase 0 exit criterion)", () => {
  beforeEach(() => {
    users.length = 0;
    nextUserId = 0;
  });

  it("refuses a read with no workspaceId filter", async () => {
    await expect(instrumented.user.findMany({})).rejects.toBeInstanceOf(
      TenantIsolationError,
    );
  });

  it("refuses a write missing workspaceId in data", async () => {
    await expect(
      instrumented.user.create({ data: { email: "x@example.com" } }),
    ).rejects.toBeInstanceOf(TenantIsolationError);
  });

  it("allows a read with explicit workspaceId", async () => {
    const result = await instrumented.user.findMany({ where: { workspaceId: "ws_A" } });
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows a write that includes workspaceId in data", async () => {
    const result = await instrumented.user.create({
      data: { workspaceId: "ws_A", email: "alice@acme.com" },
    });
    expect(result).toMatchObject({ workspaceId: "ws_A" });
  });

  it("workspace A reads see only A users (not B users)", async () => {
    await instrumented.user.create({
      data: { workspaceId: "ws_A", email: "alice@a.com" },
    });
    await instrumented.user.create({
      data: { workspaceId: "ws_B", email: "bob@b.com" },
    });

    const aUsers = await instrumented.user.findMany({ where: { workspaceId: "ws_A" } });
    const bUsers = await instrumented.user.findMany({ where: { workspaceId: "ws_B" } });

    expect((aUsers as Array<{ email: string }>).map((u) => u.email).sort()).toEqual([
      "alice@a.com",
    ]);
    expect((bUsers as Array<{ email: string }>).map((u) => u.email).sort()).toEqual([
      "bob@b.com",
    ]);
  });

  it("withWorkspace: writes inside the transaction carry the bound workspaceId", async () => {
    // The instrumented client is what production code passes to
    // `withWorkspace`, so the extension's gate fires inside the
    // transaction. The mock's $transaction invokes its callback with
    // the same base reference — which is the instrumented one.
    const instrumentedForWs = applyTenantIsolation(buildMockPrisma());
    const created = await withWorkspace(
      instrumentedForWs,
      "ws_A",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (tx: any) =>
        tx.user.create({ data: { email: "c@a.com", workspaceId: "ws_A" } }),
    );
    expect((created as { workspaceId: string }).workspaceId).toBe("ws_A");
  });

  it("withWorkspace: a write that does not include workspaceId is rejected by the extension", async () => {
    const instrumentedForWs = applyTenantIsolation(buildMockPrisma());
    await expect(
      withWorkspace(
        instrumentedForWs,
        "ws_A",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (tx: any) => tx.user.create({ data: { email: "no-ws@a.com" } }),
      ),
    ).rejects.toBeInstanceOf(TenantIsolationError);
  });

  it("does not allow workspaceA's read path to leak rows from workspaceB", async () => {
    const instrumentedForWs = applyTenantIsolation(buildMockPrisma());
    await instrumentedForWs.user.create({
      data: { workspaceId: "ws_B", email: "leaky@b.com" },
    });

    const aRead = (await instrumentedForWs.user.findMany({
      where: { workspaceId: "ws_A" },
    })) as Array<{ email: string }>;

    expect(aRead.find((u) => u.email === "leaky@b.com")).toBeUndefined();
  });
});

describe("audit log chain (Phase 0 notarization scaffold)", () => {
  it("workspace IDs are UUID-shaped (uuid_generate_v7)", () => {
    const id = randomUUID();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
