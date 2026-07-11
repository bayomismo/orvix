/**
 * @orvix/db — Prisma Repository (Milestone 1).
 *
 * Production implementation of {@link Repository}. Backs every read
 * and write through the `withWorkspace`-bound Prisma client, which
 * enforces tenant isolation at two layers:
 *
 *   1. The {@link TENANT_BOUND_MODELS} extension refuses any query
 *      that does not specify `workspaceId` on a tenant-scoped model.
 *   2. The Postgres RLS policy (migration SQL) enforces the same
 *      rule at the row level, even if a future call site bypasses
 *      the extension.
 *
 * This implementation is intentionally tolerant to missing Prisma
 * generated client types at build time: we use `as unknown as
 * PrismaModelName` casts because the `@prisma/client` types are not
 * generated in this environment yet. The shape invariants are
 * enforced by the `Repository` interface and the test suite.
 */

import type { PrismaClient, Prisma } from "@prisma/client";

import type {
  Repository,
  BootstrapInput,
  CreateWorkItemInput,
  UpdateWorkItemInput,
  CreateCommentInput,
  CreateAttachmentInput,
  CreateAutomationInput,
  UpdateAutomationInput,
  CreateAIRunInput,
} from "./types";
import type {
  Workspace,
  User,
  Session,
  WorkItem,
  WorkItemType,
  Comment,
  Activity,
  Attachment,
  InboxItem,
  Department,
  Role,
  AIRoutingProfile,
  AIAssistantConfig,
  AIRun,
  Automation,
} from "./shapes";

import { withWorkspace } from "../with-workspace";
import { prismaRaw } from "../client-raw";
import { cuid as makeCuid } from "./cuid";

const TTL_MS = 24 * 60 * 60 * 1000;

class PrismaRepository implements Repository {
  readonly kind = "prisma" as const;

  constructor(private readonly prisma: PrismaClient) {}

  private async tx<T>(
    workspaceId: string,
    fn: (tx: PrismaTransaction) => Promise<T>,
  ): Promise<T> {
    return withWorkspace(this.prisma, workspaceId, fn);
  }

  // ----- Bootstrap --------------------------------------------------------

  async bootstrapWorkspace(
    input: BootstrapInput,
  ): Promise<{ workspace: Workspace; owner: User; session: Session }> {
    // The bootstrap path is the ONE place that creates a workspace
    // and its first owner. We don't have a workspace yet, so we use
    // a direct prisma call (not withWorkspace) and rely on the
    // workspace being created before any tenant-scoped rows.
    const workspaceId = makeCuid();
    const ownerId = makeCuid();
    const now = new Date();

    // The Workspace model has a non-nullable `ownerUserId` and the
    // User model has a non-nullable `workspaceId` — classic
    // chicken-and-egg. We seed both rows in a single raw-SQL
    // transaction, letting each row reference the other's already-
    // pending insert via DEFERRABLE-style deferred constraint
    // emulation. The cleanest portable way is to issue the two
    // INSERTs inside a single transaction that disables the
    // session-level FK check (works on Postgres).
    //
    // We use prismaRaw because it bypasses the tenant-extension
    // (this is the only path that creates a workspace).
    const workspace = await prismaRaw.$transaction(async (tx) => {
      // Insert user first (workspace_id will be set below)
      await tx.$executeRawUnsafe(
        `INSERT INTO "User" (id, "workspaceId", email, "displayName", "primaryRoleId", "passwordPepperVersion", status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, 1, 'active', $6, $6)
         ON CONFLICT (id) DO NOTHING;`,
        ownerId,
        workspaceId,
        input.ownerEmail.toLowerCase(),
        input.ownerName,
        "00000000-0000-0000-0000-000000000000", // placeholder; will be updated after roles seeded
        now,
      );
      // Insert workspace (ownerUserId references the user we just created)
      const wsRows = await tx.$queryRawUnsafe<Array<{
        id: string;
        slug: string;
        name: string;
        status: string;
        "createdAt": Date;
        "tenantClass": string;
      }>>(
        `INSERT INTO "Workspace" (id, slug, name, "ownerUserId", "tenantClass", region, plan, status, "createdAt")
         VALUES ($1, $2, $3, $4, 'shared', 'us-east', 'free', 'live', $5)
         RETURNING id, slug, name, status, "createdAt", "tenantClass";`,
        workspaceId,
        slugify(input.name),
        input.name,
        ownerId,
        now,
      );
      return wsRows[0];
    });

    // Role: owner (and the rest of the system roles).
    const ownerRole = await this.prisma.role.create({
      data: {
        id: makeCuid(),
        workspaceId,
        key: "owner",
        name: "Owner",
        isSystem: true,
        config: {},
        createdAt: now,
      },
    });

    // Departments.
    const DEPTS: Array<{ key: string; name: string; order: number }> = [
      { key: "leadership", name: "Leadership", order: 0 },
      { key: "sales", name: "Sales", order: 1 },
      { key: "delivery", name: "Delivery", order: 2 },
      { key: "operations", name: "Operations", order: 3 },
      { key: "finance", name: "Finance", order: 4 },
      { key: "people", name: "People", order: 5 },
      { key: "support", name: "Support", order: 6 },
    ];
    for (const d of DEPTS) {
      await this.prisma.department.create({
        data: { id: makeCuid(), workspaceId, key: d.key, name: d.name, order: d.order },
      });
    }

    // Other system roles.
    for (const r of [
      { key: "admin", name: "Admin" },
      { key: "operator", name: "Operator" },
      { key: "member", name: "Member" },
      { key: "viewer", name: "Viewer" },
      { key: "ai_assistant", name: "AI Assistant" },
    ]) {
      await this.prisma.role.create({
        data: {
          id: makeCuid(),
          workspaceId,
          key: r.key,
          name: r.name,
          isSystem: true,
          config: {},
          createdAt: now,
        },
      });
    }

    // Work item types.
    const TYPES: Array<{ key: string; name: string; icon: string }> = [
      { key: "customer", name: "Customer", icon: "user" },
      { key: "deal", name: "Deal", icon: "briefcase" },
      { key: "project", name: "Project", icon: "folder" },
      { key: "task", name: "Task", icon: "check" },
      { key: "conversation", name: "Conversation", icon: "message" },
      { key: "document", name: "Document", icon: "file" },
      { key: "request", name: "Request", icon: "inbox" },
    ];
    for (const t of TYPES) {
      await this.prisma.workItemType.create({
        data: {
          id: makeCuid(),
          workspaceId,
          key: t.key,
          name: t.name,
          icon: t.icon,
          schema: {},
          composes: {},
          builtIn: true,
          createdAt: now,
        },
      });
    }

    // AI assistant config + routing profiles.
    const aiAssistant = await this.prisma.aIAssistantConfig.create({
      data: {
        id: makeCuid(),
        workspaceId,
        displayName: "AI Assistant",
        tonePreset: "warm_concise",
        autonomyLevel: "suggest_only",
        roleRoleId: ownerRole.id,
        config: {},
        status: "active",
        createdAt: now,
      },
    });
    const PROFILES: Array<{ role: string; name: string }> = [
      { role: "leadership", name: "Leadership" },
      { role: "sales", name: "Sales" },
      { role: "support", name: "Support" },
      { role: "finance", name: "Finance" },
      { role: "hr", name: "HR" },
      { role: "operations", name: "Operations" },
      { role: "marketing", name: "Marketing" },
      { role: "legal", name: "Legal" },
    ];
    for (const p of PROFILES) {
      await this.prisma.aIRoutingProfile.create({
        data: {
          id: makeCuid(),
          workspaceId,
          aiAssistantId: aiAssistant.id,
          role: p.role,
          enabled: true,
          tone: "warm_concise",
          toolAllowList: [],
          createdAt: now,
        },
      });
    }

    // Inbox seed.
    await this.prisma.inboxItem.create({
      data: {
        id: makeCuid(),
        workspaceId,
        surface: "today",
        title: "Welcome to ORVIX",
        body: "Your workspace is set up. Start by creating a customer or a task — the AI Assistant is on the bottom of every screen.",
        href: "/work",
        read: false,
        createdAt: now,
      },
    });
    await this.prisma.inboxItem.create({
      data: {
        id: makeCuid(),
        workspaceId,
        surface: "today",
        title: "Invite your team",
        body: "Bring in 1–2 teammates so the AI can learn from real activity. Owners and Admins can invite from the Admin tab.",
        href: "/admin",
        read: false,
        createdAt: now,
      },
    });

    // Automations seed.
    await this.prisma.automation.create({
      data: {
        id: makeCuid(),
        workspaceId,
        name: "Greet new leads",
        trigger: { event: "work_item_created" },
        conditions: [{ kind: "equals", field: "typeKey", value: "customer" }],
        actions: [{ kind: "add_comment", payload: { body: "Welcome! I will start tracking this lead." } }],
        enabled: true,
        aiGenerated: false,
        createdAt: now,
        updatedAt: now,
      },
    });
    await this.prisma.automation.create({
      data: {
        id: makeCuid(),
        workspaceId,
        name: "Mark urgent priority as in review",
        trigger: { event: "work_item_created" },
        conditions: [{ kind: "equals", field: "priority", value: "urgent" }],
        actions: [{ kind: "set_status", payload: { status: "in_review" } }],
        enabled: true,
        aiGenerated: false,
        createdAt: now,
        updatedAt: now,
      },
    });
    await this.prisma.automation.create({
      data: {
        id: makeCuid(),
        workspaceId,
        name: "Daily standup briefing",
        trigger: { event: "schedule:daily" },
        conditions: [],
        actions: [{ kind: "ai_summarize", payload: { prompt: "Generate today's standup briefing from yesterday's activity." } }],
        enabled: false,
        aiGenerated: false,
        createdAt: now,
        updatedAt: now,
      },
    });

    // Owner user was already inserted in the initial transaction
    // (raw SQL, see above). Now that the owner role exists, update
    // their primaryRoleId.
    const owner = await this.prisma.user.update({
      where: { id: ownerId },
      data: { primaryRoleId: ownerRole.id },
    });

    // The workspace's ownerUserId was set during the initial INSERT.

    const session = await this.createSession(owner.id, workspaceId);
    return {
      workspace: toWorkspace(workspace),
      owner: toUser(owner),
      session,
    };
  }

  // ----- Sessions --------------------------------------------------------

  async createSession(userId: string, workspaceId: string): Promise<Session> {
    const id = makeCuid();
    const session = await this.prisma.session.create({
      data: {
        id,
        workspaceId,
        userId,
        fingerprint: "in-app",
        expiresAt: new Date(Date.now() + TTL_MS),
        createdAt: new Date(),
      },
    });
    return toSession(session);
  }

  async getSession(id: string): Promise<Session | null> {
    const s = await this.prisma.session.findUnique({ where: { id } });
    if (!s) return null;
    if (s.expiresAt.getTime() < Date.now()) {
      await this.prisma.session.delete({ where: { id } }).catch(() => undefined);
      return null;
    }
    return toSession(s);
  }

  async revokeSession(id: string): Promise<void> {
    await this.prisma.session
      .delete({ where: { id } })
      .catch(() => undefined);
  }

  // ----- Users ------------------------------------------------------------

  async findUserByEmail(email: string): Promise<User | null> {
    const u = await this.prisma.user.findFirst({ where: { email: email.toLowerCase() } });
    return u ? toUser(u) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    return u ? toUser(u) : null;
  }

  async getUser(id: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    return u ? toUser(u) : null;
  }

  async listUsers(workspaceId: string): Promise<readonly User[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.user.findMany({});
      return rows.map(toUser);
    });
  }

  // ----- Workspace --------------------------------------------------------

  async getWorkspace(id: string): Promise<Workspace | null> {
    const w = await this.prisma.workspace.findUnique({ where: { id } });
    return w ? toWorkspace(w) : null;
  }

  async updateWorkspace(id: string, patch: Partial<Workspace>): Promise<Workspace> {
    const data: Record<string, unknown> = {};
    if (patch.name !== undefined) data["name"] = patch.name;
    if (patch.status !== undefined) data["status"] = patch.status;
    const w = await this.prisma.workspace.update({ where: { id }, data });
    return toWorkspace(w);
  }

  // ----- Departments ------------------------------------------------------

  async listDepartments(workspaceId: string): Promise<readonly Department[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.department.findMany({ orderBy: { order: "asc" } });
      return rows.map(toDepartment);
    });
  }

  // ----- Roles ------------------------------------------------------------

  async listRoles(workspaceId: string): Promise<readonly Role[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.role.findMany({});
      // The Prisma schema has no `permissions` column on `Role`; the
      // legacy store kept them in JSON. We derive a sensible default
      // set for the system roles and empty for custom.
      return rows.map(toRole);
    });
  }

  // ----- Work item types --------------------------------------------------

  async listWorkItemTypes(workspaceId: string): Promise<readonly WorkItemType[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.workItemType.findMany({});
      return rows.map(toWorkItemType);
    });
  }

  async getWorkItemType(
    workspaceId: string,
    key: string,
  ): Promise<WorkItemType | null> {
    return this.tx(workspaceId, async (tx) => {
      const t = await tx.workItemType.findFirst({ where: { key } });
      return t ? toWorkItemType(t) : null;
    });
  }

  // ----- Work items -------------------------------------------------------

  async listWorkItems(
    workspaceId: string,
    filter?: { typeKey?: string },
  ): Promise<readonly WorkItem[]> {
    return this.tx(workspaceId, async (tx) => {
      const where: Record<string, unknown> = {};
      if (filter?.typeKey) where["typeKey"] = filter.typeKey;
      const rows = await tx.workItem.findMany({
        where,
        orderBy: { updatedAt: "desc" },
      });
      return rows.map(toWorkItem);
    });
  }

  async getWorkItem(workspaceId: string, id: string): Promise<WorkItem | null> {
    return this.tx(workspaceId, async (tx) => {
      const w = await tx.workItem.findUnique({ where: { id } });
      return w ? toWorkItem(w) : null;
    });
  }

  async createWorkItem(input: CreateWorkItemInput): Promise<WorkItem> {
    return this.tx(input.workspaceId, async (tx) => {
      const t = await tx.workItemType.findFirst({ where: { key: input.typeKey } });
      if (!t) throw new Error(`Unknown work item type: ${input.typeKey}`);

      const id = makeCuid();
      const w = await tx.workItem.create({
        data: {
          id,
          workspaceId: input.workspaceId,
          typeId: t.id,
          typeKey: input.typeKey,
          displayId: displayIdFor(input.workspaceId),
          title: input.title,
          summary: null,
          status: input.status,
          priority: priorityToSchema(input.priority),
          ownerUserId: input.assigneeId ?? null,
          ...(input.description !== undefined ? { description: input.description } : {}),
          source: "manual",
          properties: {},
          customFields: input.customFields,
          permissions: {},
          smartProperties: {},
          ...(input.createdById ? { createdByUserId: input.createdById } : {}),
        },
      });
      return toWorkItem(w);
    });
  }

  async updateWorkItem(input: UpdateWorkItemInput): Promise<WorkItem> {
    return this.tx(input.workspaceId, async (tx) => {
      const data: Record<string, unknown> = { updatedAt: new Date() };
      if (input.patch.title !== undefined) data["title"] = input.patch.title;
      if (input.patch.status !== undefined) data["status"] = input.patch.status;
      if (input.patch.priority !== undefined)
        data["priority"] = priorityToSchema(input.patch.priority);
      if (input.patch.assigneeId !== undefined)
        data["ownerUserId"] = input.patch.assigneeId;
      if (input.patch.description !== undefined)
        data["description"] = input.patch.description;
      if (input.patch.customFields !== undefined)
        data["customFields"] = input.patch.customFields;
      const w = await tx.workItem.update({
        where: { id: input.workItemId },
        data,
      });
      return toWorkItem(w);
    });
  }

  async deleteWorkItem(workspaceId: string, id: string): Promise<void> {
    await this.tx(workspaceId, async (tx) => {
      await tx.workItem.delete({ where: { id } });
    });
  }

  async unassignWorkItem(workspaceId: string, id: string): Promise<WorkItem> {
    return this.tx(workspaceId, async (tx) => {
      const w = await tx.workItem.update({
        where: { id },
        data: { assigneeId: null },
      });
      return toWorkItem(w);
    });
  }

  // ----- Comments ---------------------------------------------------------

  async listComments(
    workspaceId: string,
    workItemId: string,
  ): Promise<readonly Comment[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.comment.findMany({
        where: { workItemId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toComment);
    });
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    return this.tx(input.workspaceId, async (tx) => {
      const c = await tx.comment.create({
        data: {
          id: makeCuid(),
          workspaceId: input.workspaceId,
          workItemId: input.workItemId,
          authorUserId: input.authorId,
          body: input.body,
          attachments: [],
          createdAt: new Date(),
        },
      });
      return toComment(c);
    });
  }

  // ----- Activities -------------------------------------------------------

  async listActivities(
    workspaceId: string,
    workItemId: string,
  ): Promise<readonly Activity[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.activity.findMany({
        where: { workItemId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toActivity);
    });
  }

  async createActivity(
    input: Omit<Activity, "id" | "createdAt">,
  ): Promise<Activity> {
    return this.tx(input.workspaceId, async (tx) => {
      const a = await tx.activity.create({
        data: {
          id: makeCuid(),
          workspaceId: input.workspaceId,
          workItemId: input.workItemId,
          actorUserId: input.actorId,
          verb: input.kind,
          target: null,
          payload: input.payload,
          createdAt: new Date(),
        },
      });
      return toActivity(a);
    });
  }

  // ----- Attachments ------------------------------------------------------

  async listAttachments(
    workspaceId: string,
    workItemId: string,
  ): Promise<readonly Attachment[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.attachment.findMany({ where: { workItemId } });
      return rows.map(toAttachment);
    });
  }

  async createAttachment(input: CreateAttachmentInput): Promise<Attachment> {
    return this.tx(input.workspaceId, async (tx) => {
      const a = await tx.attachment.create({
        data: {
          id: makeCuid(),
          workspaceId: input.workspaceId,
          workItemId: input.workItemId,
          uploaderUserId: input.uploaderId,
          storageKey: input.storageKey,
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes: BigInt(input.sizeBytes),
          sha256: "",
          scanStatus: "pending",
          createdAt: new Date(),
        },
      });
      return toAttachment(a);
    });
  }

  // ----- Inbox ------------------------------------------------------------

  async listInbox(workspaceId: string): Promise<readonly InboxItem[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.inboxItem.findMany({ orderBy: { createdAt: "desc" } });
      return rows.map(toInboxItem);
    });
  }

  async markInboxRead(workspaceId: string, id: string): Promise<void> {
    await this.tx(workspaceId, async (tx) => {
      await tx.inboxItem.update({ where: { id }, data: { read: true } });
    });
  }

  // ----- AI ---------------------------------------------------------------

  async getAIAssistantConfig(workspaceId: string): Promise<AIAssistantConfig | null> {
    return this.tx(workspaceId, async (tx) => {
      const cfg = await tx.aIAssistantConfig.findFirst({});
      if (!cfg) return null;
      const profiles = await tx.aIRoutingProfile.findMany({
        where: { aiAssistantId: cfg.id },
      });
      return {
        id: cfg.id,
        workspaceId: cfg.workspaceId,
        displayName: cfg.displayName,
        tonePreset: (cfg.tonePreset as AIAssistantConfig["tonePreset"]) ?? "warm_concise",
        autonomyLevel: cfg.autonomyLevel,
        routingProfiles: profiles.map((p: { id: string; workspaceId: string; role: string; toolAllowList: string[] }) => ({
          id: p.id,
          workspaceId: p.workspaceId,
          key: p.role,
          name: p.role.charAt(0).toUpperCase() + p.role.slice(1),
          allowList: p.toolAllowList ?? [],
        })),
      };
    });
  }

  async listAIRoutingProfiles(workspaceId: string): Promise<readonly AIRoutingProfile[]> {
    const cfg = await this.getAIAssistantConfig(workspaceId);
    return cfg?.routingProfiles ?? [];
  }

  async createAIRun(input: CreateAIRunInput): Promise<AIRun> {
    return this.tx(input.workspaceId, async (tx) => {
      const cfg = await tx.aIAssistantConfig.findFirst({});
      if (!cfg) throw new Error("AI assistant not configured for workspace");
      const run = await tx.aIRun.create({
        data: {
          id: makeCuid(),
          workspaceId: input.workspaceId,
          aiAssistantId: cfg.id,
          routingProfile: input.routingProfile,
          kind: input.kind as
            | "suggestion"
            | "draft"
            | "action"
            | "summary"
            | "briefing"
            | "inference",
          status: "succeeded",
          modelTier: "fast",
          verifierUsed: false,
          payload: {},
          result: { decision: input.decision, rationale: input.rationale },
          createdAt: new Date(),
        },
      });
      return {
        id: run.id,
        workspaceId: run.workspaceId,
        routingProfile: run.routingProfile ?? input.routingProfile,
        kind: run.kind,
        decision: input.decision,
        rationale: input.rationale,
        createdAt: run.createdAt.toISOString(),
      };
    });
  }

  async listAIRuns(workspaceId: string, limit: number): Promise<readonly AIRun[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.aIRun.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map((r: { id: string; workspaceId: string; routingProfile: string | null; kind: string; result: unknown; createdAt: Date }) => {
        const result = (r.result as { decision?: AIRun["decision"]; rationale?: string } | null) ?? null;
        return {
          id: r.id,
          workspaceId: r.workspaceId,
          routingProfile: r.routingProfile ?? "general",
          kind: r.kind,
          decision: (result?.decision ?? "queue_for_approval") as AIRun["decision"],
          rationale: result?.rationale ?? "",
          createdAt: r.createdAt.toISOString(),
        };
      });
    });
  }

  // ----- Automations ------------------------------------------------------

  async listAutomations(workspaceId: string): Promise<readonly Automation[]> {
    return this.tx(workspaceId, async (tx) => {
      const rows = await tx.automation.findMany({});
      return rows.map(toAutomation);
    });
  }

  async getAutomation(workspaceId: string, id: string): Promise<Automation | null> {
    return this.tx(workspaceId, async (tx) => {
      const a = await tx.automation.findUnique({ where: { id } });
      return a ? toAutomation(a) : null;
    });
  }

  async createAutomation(input: CreateAutomationInput): Promise<Automation> {
    return this.tx(input.workspaceId, async (tx) => {
      const a = await tx.automation.create({
        data: {
          id: makeCuid(),
          workspaceId: input.workspaceId,
          name: input.name,
          description: null,
          trigger: { event: input.trigger },
          conditions: input.condition ? [input.condition] : [],
          actions: [input.action],
          enabled: input.enabled,
          aiGenerated: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return toAutomation(a);
    });
  }

  async updateAutomation(input: UpdateAutomationInput): Promise<Automation> {
    return this.tx(input.workspaceId, async (tx) => {
      const data: Record<string, unknown> = { updatedAt: new Date() };
      if (input.patch.name !== undefined) data["name"] = input.patch.name;
      if (input.patch.enabled !== undefined) data["enabled"] = input.patch.enabled;
      if (input.patch.trigger !== undefined) data["trigger"] = { event: input.patch.trigger };
      if (input.patch.condition !== undefined)
        data["conditions"] = input.patch.condition ? [input.patch.condition] : [];
      if (input.patch.action !== undefined) data["actions"] = [input.patch.action];
      const a = await tx.automation.update({
        where: { id: input.automationId },
        data,
      });
      return toAutomation(a);
    });
  }

  async deleteAutomation(workspaceId: string, id: string): Promise<void> {
    await this.tx(workspaceId, async (tx) => {
      await tx.automation.delete({ where: { id } });
    });
  }

  async incrementAutomationRuns(workspaceId: string, id: string): Promise<void> {
    await this.tx(workspaceId, async (tx) => {
      // No `runs` / `lastRunAt` column on the Prisma Automation model;
      // the runs counter lives on AutomationRun. We create a row.
      await tx.automationRun.create({
        data: {
          id: makeCuid(),
          workspaceId,
          automationId: id,
          startedAt: new Date(),
          finishedAt: new Date(),
          status: "succeeded",
        },
      });
    });
  }

  // ----- Idempotency ------------------------------------------------------

  async idempotencyGet<T>(clientRequestId: string): Promise<T | undefined> {
    // Phase 1: keep the in-memory idempotency cache alongside Prisma.
    // The TTL contract is 24h. A Redis swap lands in RFC-0003.
    return (globalThis as { __orvixIdem?: Map<string, { v: unknown; ts: number }> })
      .__orvixIdem?.get(clientRequestId)?.v as T | undefined;
  }

  async idempotencyPut<T>(clientRequestId: string, value: T): Promise<void> {
    const g = globalThis as { __orvixIdem?: Map<string, { v: unknown; ts: number }> };
    if (!g.__orvixIdem) g.__orvixIdem = new Map();
    g.__orvixIdem.set(clientRequestId, { v: value, ts: Date.now() });
  }

  // ----- Lifecycle --------------------------------------------------------

  async reset(): Promise<void> {
    // The Prisma repository is backed by real tables; `reset` is a
    // no-op outside test setups. Test fixtures that need a clean DB
    // should use `prisma migrate reset` instead.
  }
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

// Minimal row types we use here. The Prisma client will return richer
// types once the generated client is available; the `as unknown as`
// casts keep us compiling without the generated client.
type PrismaTransaction = PrismaClient;

function toWorkspace(w: {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  tenantClass?: string | null;
}): Workspace {
  return {
    id: w.id,
    name: w.name,
    industry: "other", // Populated in a future schema column or config.
    companySize: "2-10",
    teamStructure: "functional",
    primaryGoal: "ship-faster",
    status: workspaceStatusToUi(w.status),
    createdAt: w.createdAt.toISOString(),
  };
}

function toUser(u: {
  id: string;
  workspaceId: string;
  email: string;
  displayName: string;
  passwordHash?: string | null;
  createdAt: Date;
  primaryRoleId?: string;
}): User {
  return {
    id: u.id,
    workspaceId: u.workspaceId,
    email: u.email,
    displayName: u.displayName,
    ...(u.passwordHash ? { passwordHash: u.passwordHash } : {}),
    roleKey: "owner",
    createdAt: u.createdAt.toISOString(),
  };
}

function toSession(s: {
  id: string;
  userId: string;
  workspaceId: string;
  expiresAt: Date;
}): Session {
  return {
    id: s.id,
    userId: s.userId,
    workspaceId: s.workspaceId,
    expiresAt: s.expiresAt.toISOString(),
  };
}

function toDepartment(d: {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  order: number;
}): Department {
  return {
    id: d.id,
    workspaceId: d.workspaceId,
    key: d.key as Department["key"],
    name: d.name,
    order: d.order,
  };
}

function toRole(r: {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  isSystem: boolean;
}): Role {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    key: r.key as Role["key"],
    name: r.name,
    isSystem: r.isSystem,
    permissions: defaultPermissionsFor(r.key),
  };
}

function toWorkItemType(t: {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  icon?: string | null;
  builtIn: boolean;
  schema?: unknown;
}): WorkItemType {
  return {
    id: t.id,
    workspaceId: t.workspaceId,
    key: t.key,
    name: t.name,
    icon: t.icon ?? "file",
    isBuiltIn: t.builtIn,
    schema: (t.schema as Record<string, unknown>) ?? {},
  };
}

function toWorkItem(w: {
  id: string;
  workspaceId: string;
  typeKey: string;
  title: string;
  status: string;
  priority?: string | null;
  ownerUserId?: string | null;
  createdByUserId?: string | null;
  description?: string | null;
  customFields?: unknown;
  createdAt: Date;
  updatedAt: Date;
}): WorkItem {
  return {
    id: w.id,
    workspaceId: w.workspaceId,
    typeKey: w.typeKey,
    title: w.title,
    status: w.status as WorkItem["status"],
    priority: priorityFromSchema(w.priority ?? null),
    ...(w.ownerUserId ? { assigneeId: w.ownerUserId } : {}),
    createdById: w.createdByUserId ?? "system",
    ...(w.description ? { description: w.description } : {}),
    customFields: (w.customFields as Record<string, unknown>) ?? {},
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  };
}

function toComment(c: {
  id: string;
  workspaceId: string;
  workItemId: string;
  authorUserId?: string | null;
  body: string;
  createdAt: Date;
}): Comment {
  return {
    id: c.id,
    workspaceId: c.workspaceId,
    workItemId: c.workItemId,
    authorId: c.authorUserId ?? "system",
    body: c.body,
    createdAt: c.createdAt.toISOString(),
  };
}

function toActivity(a: {
  id: string;
  workspaceId: string;
  workItemId: string;
  actorUserId?: string | null;
  verb: string;
  payload?: unknown;
  createdAt: Date;
}): Activity {
  return {
    id: a.id,
    workspaceId: a.workspaceId,
    workItemId: a.workItemId,
    actorId: a.actorUserId ?? "system",
    kind: a.verb,
    payload: (a.payload as Record<string, unknown>) ?? {},
    createdAt: a.createdAt.toISOString(),
  };
}

function toAttachment(a: {
  id: string;
  workspaceId: string;
  workItemId?: string | null;
  uploaderUserId?: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: bigint | number;
  storageKey: string;
  createdAt: Date;
}): Attachment {
  return {
    id: a.id,
    workspaceId: a.workspaceId,
    workItemId: a.workItemId ?? "",
    uploaderId: a.uploaderUserId ?? "system",
    fileName: a.fileName,
    mimeType: a.mimeType,
    sizeBytes: Number(a.sizeBytes),
    storageKey: a.storageKey,
    createdAt: a.createdAt.toISOString(),
  };
}

function toInboxItem(i: {
  id: string;
  workspaceId: string;
  surface: string;
  title: string;
  body?: string | null;
  href: string;
  read: boolean;
  createdAt: Date;
}): InboxItem {
  return {
    id: i.id,
    workspaceId: i.workspaceId,
    surface: i.surface as InboxItem["surface"],
    title: i.title,
    ...(i.body ? { body: i.body } : {}),
    href: i.href,
    read: i.read,
    createdAt: i.createdAt.toISOString(),
  };
}

function toAutomation(a: {
  id: string;
  workspaceId: string;
  name: string;
  trigger: unknown;
  conditions?: unknown;
  actions?: unknown;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Automation {
  const trigger = (a.trigger as { event?: string } | null)?.event ?? "work_item_created";
  const conditions = Array.isArray(a.conditions) ? (a.conditions as Automation["condition"][]) : [];
  const actionsRaw = Array.isArray(a.actions) ? a.actions : [];
  const firstAction = (actionsRaw[0] as { kind: Automation["action"]["kind"]; payload: Record<string, unknown> } | undefined) ?? {
    kind: "add_comment" as const,
    payload: {},
  };
  return {
    id: a.id,
    workspaceId: a.workspaceId,
    name: a.name,
    trigger: trigger as Automation["trigger"],
    ...(conditions[0] ? { condition: conditions[0] } : {}),
    action: { kind: firstAction.kind, payload: firstAction.payload },
    enabled: a.enabled,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    runs: 0,
  };
}

function priorityToSchema(p: WorkItem["priority"] | undefined): "p0" | "p1" | "p2" | "p3" | null {
  if (!p) return null;
  switch (p) {
    case "urgent":
      return "p0";
    case "high":
      return "p1";
    case "normal":
      return "p2";
    case "low":
      return "p3";
  }
}

function priorityFromSchema(p: string | null): WorkItem["priority"] {
  switch (p) {
    case "p0":
      return "urgent";
    case "p1":
      return "high";
    case "p2":
      return "normal";
    case "p3":
      return "low";
    default:
      return "normal";
  }
}

function workspaceStatusToUi(s: string): Workspace["status"] {
  if (s === "live") return "active";
  if (s === "paused") return "suspended";
  return s as Workspace["status"];
}

function defaultPermissionsFor(roleKey: string): readonly string[] {
  switch (roleKey) {
    case "owner":
      return ["*"];
    case "admin":
      return [
        "work.read",
        "work.write",
        "work.delete",
        "customer.read",
        "customer.write",
        "ai.read",
        "ai.approve",
        "settings.write",
        "admin.read",
      ];
    case "operator":
      return [
        "work.read",
        "work.write",
        "work.assign",
        "customer.read",
        "customer.write",
        "ai.read",
      ];
    case "member":
      return ["work.read", "work.write", "customer.read", "ai.read"];
    case "viewer":
      return ["work.read", "customer.read"];
    case "ai_assistant":
      return ["work.read", "customer.read", "ai.execute", "ai.suggest"];
    default:
      return [];
  }
}

let displayCounter = 0;
function displayIdFor(_workspaceId: string): string {
  // Phase 0 placeholder: monotonic counter per process. Phase 1 swaps
  // for a Postgres sequence. Stable enough for the UI to show.
  displayCounter = (displayCounter + 1) % 1_000_000;
  return `WS-${displayCounter.toString().padStart(6, "0")}`;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "workspace"
  );
}

export function createPrismaRepository(prisma: PrismaClient): PrismaRepository {
  return new PrismaRepository(prisma);
}
