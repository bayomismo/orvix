/**
 * @orvix/db — In-memory Repository (Milestone 1).
 *
 * Pure in-process implementation of {@link Repository}. Used when no
 * `DATABASE_URL` is configured (local dev, unit tests, preview deploys
 * without a database). Mirrors the v0.2 `apps/web/src/server/store.ts`
 * data layout so call sites are stable across backends.
 *
 * State is held on `globalThis` so HMR / route-level resets do not lose
 * seeded data in dev.
 */

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
  Automation,
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
} from "./shapes";

const TTL_MS = 24 * 60 * 60 * 1000; // 24h

class InMemoryRepository implements Repository {
  readonly kind = "memory" as const;

  // Maps keyed by id.
  public readonly workspaces = new Map<string, Workspace>();
  public readonly users = new Map<string, User>();
  public readonly sessions = new Map<string, Session>();
  public readonly departments = new Map<string, Department>();
  public readonly roles = new Map<string, Role>();
  public readonly workItemTypes = new Map<string, WorkItemType>();
  public readonly workItems = new Map<string, WorkItem>();
  public readonly comments = new Map<string, Comment>();
  public readonly activities = new Map<string, Activity>();
  public readonly attachments = new Map<string, Attachment>();
  public readonly inbox = new Map<string, InboxItem>();
  public readonly aiConfigs = new Map<string, AIAssistantConfig>();
  public readonly aiRuns = new Map<string, AIRun>();
  public readonly automations = new Map<string, Automation>();

  /** Idempotency: clientRequestId -> { value, ts, ttlMs } */
  public readonly idem = new Map<
    string,
    { value: unknown; ts: number; ttlMs: number }
  >();

  // ----- Bootstrap --------------------------------------------------------

  async bootstrapWorkspace(
    input: BootstrapInput,
  ): Promise<{ workspace: Workspace; owner: User; session: Session }> {
    const workspaceId = cuid();
    const ownerId = cuid();
    const now = new Date().toISOString();

    const workspace: Workspace = {
      id: workspaceId,
      name: input.name,
      industry: input.industry,
      companySize: input.companySize,
      teamStructure: input.teamStructure,
      primaryGoal: input.primaryGoal,
      status: "active",
      createdAt: now,
    };
    this.workspaces.set(workspaceId, workspace);

    const owner: User = {
      id: ownerId,
      workspaceId,
      email: input.ownerEmail,
      displayName: input.ownerName,
      roleKey: "owner",
      createdAt: now,
    };
    this.users.set(ownerId, owner);

    this.seedRoles(workspaceId);
    this.seedDepartments(workspaceId);
    this.seedWorkItemTypes(workspaceId);
    this.seedAIConfig(workspaceId);
    this.seedInbox(workspaceId);
    this.seedAutomations(workspaceId);

    const session = await this.createSession(ownerId, workspaceId);
    return { workspace, owner, session };
  }

  // ----- Sessions --------------------------------------------------------

  async createSession(userId: string, workspaceId: string): Promise<Session> {
    const session: Session = {
      id: cuid(),
      userId,
      workspaceId,
      expiresAt: new Date(Date.now() + TTL_MS).toISOString(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | null> {
    const s = this.sessions.get(id);
    if (!s) return null;
    if (new Date(s.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(id);
      return null;
    }
    return s;
  }

  async revokeSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  // ----- Users ------------------------------------------------------------

  async findUserByEmail(email: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.email === email) return u;
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async listUsers(workspaceId: string): Promise<readonly User[]> {
    return [...this.users.values()].filter((u) => u.workspaceId === workspaceId);
  }

  // ----- Workspace --------------------------------------------------------

  async getWorkspace(id: string): Promise<Workspace | null> {
    return this.workspaces.get(id) ?? null;
  }

  async updateWorkspace(id: string, patch: Partial<Workspace>): Promise<Workspace> {
    const existing = this.workspaces.get(id);
    if (!existing) throw new Error(`Workspace not found: ${id}`);
    const next: Workspace = { ...existing, ...patch, id: existing.id };
    this.workspaces.set(id, next);
    return next;
  }

  // ----- Departments ------------------------------------------------------

  async listDepartments(workspaceId: string): Promise<readonly Department[]> {
    return [...this.departments.values()]
      .filter((d) => d.workspaceId === workspaceId)
      .sort((a, b) => a.order - b.order);
  }

  // ----- Roles ------------------------------------------------------------

  async listRoles(workspaceId: string): Promise<readonly Role[]> {
    return [...this.roles.values()].filter((r) => r.workspaceId === workspaceId);
  }

  // ----- Work item types --------------------------------------------------

  async listWorkItemTypes(workspaceId: string): Promise<readonly WorkItemType[]> {
    return [...this.workItemTypes.values()].filter(
      (t) => t.workspaceId === workspaceId,
    );
  }

  async getWorkItemType(
    workspaceId: string,
    key: string,
  ): Promise<WorkItemType | null> {
    for (const t of this.workItemTypes.values()) {
      if (t.workspaceId === workspaceId && t.key === key) return t;
    }
    return null;
  }

  // ----- Work items -------------------------------------------------------

  async listWorkItems(
    workspaceId: string,
    filter?: { typeKey?: string },
  ): Promise<readonly WorkItem[]> {
    const items = [...this.workItems.values()].filter(
      (w) => w.workspaceId === workspaceId,
    );
    const filtered = filter?.typeKey
      ? items.filter((w) => w.typeKey === filter.typeKey)
      : items;
    return filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  async getWorkItem(workspaceId: string, id: string): Promise<WorkItem | null> {
    const w = this.workItems.get(id);
    if (!w || w.workspaceId !== workspaceId) return null;
    return w;
  }

  async createWorkItem(input: CreateWorkItemInput): Promise<WorkItem> {
    if (!input.workspaceId) throw new Error("createWorkItem: workspaceId required");
    const now = new Date().toISOString();
    const item: WorkItem = {
      id: cuid(),
      workspaceId: input.workspaceId,
      typeKey: input.typeKey,
      title: input.title,
      status: input.status,
      priority: input.priority,
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId } : {}),
      createdById: input.createdById,
      ...(input.description !== undefined ? { description: input.description } : {}),
      customFields: input.customFields,
      createdAt: now,
      updatedAt: now,
    };
    this.workItems.set(item.id, item);
    return item;
  }

  async updateWorkItem(input: UpdateWorkItemInput): Promise<WorkItem> {
    const w = this.workItems.get(input.workItemId);
    if (!w || w.workspaceId !== input.workspaceId) {
      throw new Error(`WorkItem not found: ${input.workItemId}`);
    }
    const { description: desc, ...rest } = input.patch;
    const next: WorkItem = {
      ...w,
      ...rest,
      id: w.id,
      workspaceId: w.workspaceId,
      typeKey: w.typeKey,
      createdById: w.createdById,
      createdAt: w.createdAt,
      updatedAt: new Date().toISOString(),
    };
    if (desc === null) {
      delete (next as Partial<WorkItem>).description;
    } else if (desc !== undefined) {
      next.description = desc;
    }
    this.workItems.set(w.id, next);
    return next;
  }

  async deleteWorkItem(workspaceId: string, id: string): Promise<void> {
    const w = this.workItems.get(id);
    if (!w || w.workspaceId !== workspaceId) return;
    this.workItems.delete(id);
  }

  async unassignWorkItem(workspaceId: string, id: string): Promise<WorkItem> {
    const w = this.workItems.get(id);
    if (!w || w.workspaceId !== workspaceId) {
      throw new Error(`WorkItem not found: ${id}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { assigneeId: _drop, ...rest } = w;
    const next: WorkItem = {
      ...rest,
      updatedAt: new Date().toISOString(),
    };
    this.workItems.set(w.id, next);
    return next;
  }

  // ----- Comments ---------------------------------------------------------

  async listComments(
    workspaceId: string,
    workItemId: string,
  ): Promise<readonly Comment[]> {
    return [...this.comments.values()]
      .filter((c) => c.workspaceId === workspaceId && c.workItemId === workItemId)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const comment: Comment = {
      id: cuid(),
      workspaceId: input.workspaceId,
      workItemId: input.workItemId,
      authorId: input.authorId,
      body: input.body,
      createdAt: new Date().toISOString(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  // ----- Activities -------------------------------------------------------

  async listActivities(
    workspaceId: string,
    workItemId: string,
  ): Promise<readonly Activity[]> {
    return [...this.activities.values()]
      .filter((a) => a.workspaceId === workspaceId && a.workItemId === workItemId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async createActivity(
    input: Omit<Activity, "id" | "createdAt">,
  ): Promise<Activity> {
    const a: Activity = {
      ...input,
      id: cuid(),
      createdAt: new Date().toISOString(),
    };
    this.activities.set(a.id, a);
    return a;
  }

  // ----- Attachments ------------------------------------------------------

  async listAttachments(
    workspaceId: string,
    workItemId: string,
  ): Promise<readonly Attachment[]> {
    return [...this.attachments.values()].filter(
      (a) => a.workspaceId === workspaceId && a.workItemId === workItemId,
    );
  }

  async createAttachment(input: CreateAttachmentInput): Promise<Attachment> {
    const a: Attachment = {
      id: cuid(),
      workspaceId: input.workspaceId,
      workItemId: input.workItemId,
      uploaderId: input.uploaderId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageKey: input.storageKey,
      createdAt: new Date().toISOString(),
    };
    this.attachments.set(a.id, a);
    return a;
  }

  // ----- Inbox ------------------------------------------------------------

  async listInbox(workspaceId: string): Promise<readonly InboxItem[]> {
    return [...this.inbox.values()]
      .filter((i) => i.workspaceId === workspaceId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async markInboxRead(workspaceId: string, id: string): Promise<void> {
    const i = this.inbox.get(id);
    if (!i || i.workspaceId !== workspaceId) return;
    this.inbox.set(id, { ...i, read: true });
  }

  // ----- AI ---------------------------------------------------------------

  async getAIAssistantConfig(workspaceId: string): Promise<AIAssistantConfig | null> {
    return this.aiConfigs.get(workspaceId) ?? null;
  }

  async listAIRoutingProfiles(workspaceId: string): Promise<readonly AIRoutingProfile[]> {
    const cfg = this.aiConfigs.get(workspaceId);
    return cfg ? cfg.routingProfiles : [];
  }

  async createAIRun(input: CreateAIRunInput): Promise<AIRun> {
    const run: AIRun = {
      id: cuid(),
      workspaceId: input.workspaceId,
      routingProfile: input.routingProfile,
      kind: input.kind,
      decision: input.decision,
      rationale: input.rationale,
      createdAt: new Date().toISOString(),
    };
    this.aiRuns.set(run.id, run);
    return run;
  }

  async listAIRuns(workspaceId: string, limit: number): Promise<readonly AIRun[]> {
    return [...this.aiRuns.values()]
      .filter((r) => r.workspaceId === workspaceId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, limit);
  }

  // ----- Automations ------------------------------------------------------

  async listAutomations(workspaceId: string): Promise<readonly Automation[]> {
    return [...this.automations.values()].filter(
      (a) => a.workspaceId === workspaceId,
    );
  }

  async getAutomation(workspaceId: string, id: string): Promise<Automation | null> {
    const a = this.automations.get(id);
    if (!a || a.workspaceId !== workspaceId) return null;
    return a;
  }

  async createAutomation(input: CreateAutomationInput): Promise<Automation> {
    const now = new Date().toISOString();
    const a: Automation = {
      id: cuid(),
      workspaceId: input.workspaceId,
      name: input.name,
      trigger: input.trigger,
      ...(input.condition ? { condition: input.condition } : {}),
      action: input.action,
      enabled: input.enabled,
      createdAt: now,
      updatedAt: now,
      runs: 0,
    };
    this.automations.set(a.id, a);
    return a;
  }

  async updateAutomation(input: UpdateAutomationInput): Promise<Automation> {
    const a = this.automations.get(input.automationId);
    if (!a || a.workspaceId !== input.workspaceId) {
      throw new Error(`Automation not found: ${input.automationId}`);
    }
    const next: Automation = {
      ...a,
      ...input.patch,
      id: a.id,
      workspaceId: a.workspaceId,
      createdAt: a.createdAt,
      runs: a.runs,
      ...(a.lastRunAt ? { lastRunAt: a.lastRunAt } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.automations.set(a.id, next);
    return next;
  }

  async deleteAutomation(workspaceId: string, id: string): Promise<void> {
    const a = this.automations.get(id);
    if (!a || a.workspaceId !== workspaceId) return;
    this.automations.delete(id);
  }

  async incrementAutomationRuns(workspaceId: string, id: string): Promise<void> {
    const a = this.automations.get(id);
    if (!a || a.workspaceId !== workspaceId) return;
    this.automations.set(id, {
      ...a,
      runs: a.runs + 1,
      lastRunAt: new Date().toISOString(),
    });
  }

  // ----- Idempotency ------------------------------------------------------

  async idempotencyGet<T>(clientRequestId: string): Promise<T | undefined> {
    const e = this.idem.get(clientRequestId);
    if (!e) return undefined;
    if (Date.now() - e.ts > e.ttlMs) {
      this.idem.delete(clientRequestId);
      return undefined;
    }
    return e.value as T;
  }

  async idempotencyPut<T>(clientRequestId: string, value: T): Promise<void> {
    this.idem.set(clientRequestId, { value, ts: Date.now(), ttlMs: TTL_MS });
  }

  // ----- Lifecycle --------------------------------------------------------

  async reset(): Promise<void> {
    this.workspaces.clear();
    this.users.clear();
    this.sessions.clear();
    this.departments.clear();
    this.roles.clear();
    this.workItemTypes.clear();
    this.workItems.clear();
    this.comments.clear();
    this.activities.clear();
    this.attachments.clear();
    this.inbox.clear();
    this.aiConfigs.clear();
    this.aiRuns.clear();
    this.automations.clear();
    this.idem.clear();
  }

  // ----- Seeding (private) ------------------------------------------------

  private seedRoles(workspaceId: string) {
    const roles: Role[] = [
      {
        id: cuid(),
        workspaceId,
        key: "owner",
        name: "Owner",
        isSystem: true,
        permissions: ["*"],
      },
      {
        id: cuid(),
        workspaceId,
        key: "admin",
        name: "Admin",
        isSystem: true,
        permissions: [
          "work.read",
          "work.write",
          "work.delete",
          "customer.read",
          "customer.write",
          "ai.read",
          "ai.approve",
          "settings.write",
          "admin.read",
        ],
      },
      {
        id: cuid(),
        workspaceId,
        key: "manager",
        name: "Manager",
        isSystem: true,
        permissions: [
          "work.read",
          "work.write",
          "work.assign",
          "customer.read",
          "customer.write",
          "ai.read",
        ],
      },
      {
        id: cuid(),
        workspaceId,
        key: "contributor",
        name: "Contributor",
        isSystem: true,
        permissions: ["work.read", "work.write", "customer.read", "ai.read"],
      },
      {
        id: cuid(),
        workspaceId,
        key: "viewer",
        name: "Viewer",
        isSystem: true,
        permissions: ["work.read", "customer.read"],
      },
      {
        id: cuid(),
        workspaceId,
        key: "ai_assistant",
        name: "AI Assistant",
        isSystem: true,
        permissions: ["work.read", "customer.read", "ai.execute", "ai.suggest"],
      },
    ];
    for (const r of roles) this.roles.set(r.id, r);
  }

  private seedDepartments(workspaceId: string) {
    const departments: Department[] = [
      { id: cuid(), workspaceId, key: "leadership", name: "Leadership", order: 0 },
      { id: cuid(), workspaceId, key: "sales", name: "Sales", order: 1 },
      { id: cuid(), workspaceId, key: "delivery", name: "Delivery", order: 2 },
      { id: cuid(), workspaceId, key: "operations", name: "Operations", order: 3 },
      { id: cuid(), workspaceId, key: "finance", name: "Finance", order: 4 },
      { id: cuid(), workspaceId, key: "people", name: "People", order: 5 },
      { id: cuid(), workspaceId, key: "support", name: "Support", order: 6 },
    ];
    for (const d of departments) this.departments.set(d.id, d);
  }

  private seedWorkItemTypes(workspaceId: string) {
    const types: WorkItemType[] = [
      { id: cuid(), workspaceId, key: "customer", name: "Customer", icon: "user", isBuiltIn: true, schema: {} },
      { id: cuid(), workspaceId, key: "deal", name: "Deal", icon: "briefcase", isBuiltIn: true, schema: {} },
      { id: cuid(), workspaceId, key: "project", name: "Project", icon: "folder", isBuiltIn: true, schema: {} },
      { id: cuid(), workspaceId, key: "task", name: "Task", icon: "check", isBuiltIn: true, schema: {} },
      { id: cuid(), workspaceId, key: "conversation", name: "Conversation", icon: "message", isBuiltIn: true, schema: {} },
      { id: cuid(), workspaceId, key: "document", name: "Document", icon: "file", isBuiltIn: true, schema: {} },
      { id: cuid(), workspaceId, key: "request", name: "Request", icon: "inbox", isBuiltIn: true, schema: {} },
    ];
    for (const t of types) this.workItemTypes.set(t.id, t);
  }

  private seedAIConfig(workspaceId: string) {
    const profiles: AIRoutingProfile[] = [
      { id: cuid(), workspaceId, key: "sales", name: "Sales", allowList: ["search_work_items", "summarize_work_item", "lookup_customer"] },
      { id: cuid(), workspaceId, key: "delivery", name: "Delivery", allowList: ["search_work_items", "create_work_item", "summarize_work_item"] },
      { id: cuid(), workspaceId, key: "operations", name: "Operations", allowList: ["search_work_items", "create_work_item"] },
      { id: cuid(), workspaceId, key: "finance", name: "Finance", allowList: ["search_work_items", "summarize_work_item"] },
      { id: cuid(), workspaceId, key: "support", name: "Support", allowList: ["search_work_items", "lookup_customer", "create_work_item"] },
      { id: cuid(), workspaceId, key: "leadership", name: "Leadership", allowList: ["search_work_items", "summarize_work_item"] },
      { id: cuid(), workspaceId, key: "people", name: "People", allowList: ["search_work_items"] },
      { id: cuid(), workspaceId, key: "general", name: "General", allowList: ["search_work_items", "summarize_work_item"] },
    ];
    const config: AIAssistantConfig = {
      id: cuid(),
      workspaceId,
      displayName: "AI Assistant",
      tonePreset: "warm_concise",
      autonomyLevel: "suggest_only",
      routingProfiles: profiles,
    };
    this.aiConfigs.set(workspaceId, config);
  }

  private seedInbox(workspaceId: string) {
    const items: InboxItem[] = [
      {
        id: cuid(),
        workspaceId,
        surface: "today",
        title: "Welcome to ORVIX",
        body: "Your workspace is set up. Start by creating a customer or a task — the AI Assistant is on the bottom of every screen.",
        href: "/work",
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: cuid(),
        workspaceId,
        surface: "today",
        title: "Invite your team",
        body: "Bring in 1–2 teammates so the AI can learn from real activity. Owners and Admins can invite from the Admin tab.",
        href: "/admin",
        createdAt: new Date().toISOString(),
        read: false,
      },
    ];
    for (const i of items) this.inbox.set(i.id, i);
  }

  private seedAutomations(workspaceId: string) {
    const now = new Date().toISOString();
    const rules: Automation[] = [
      {
        id: cuid(),
        workspaceId,
        name: "Greet new leads",
        trigger: "work_item_created",
        condition: { kind: "equals", field: "typeKey", value: "customer" },
        action: { kind: "add_comment", payload: { body: "Welcome! I will start tracking this lead." } },
        enabled: true,
        createdAt: now,
        updatedAt: now,
        runs: 0,
      },
      {
        id: cuid(),
        workspaceId,
        name: "Mark urgent priority as in review",
        trigger: "work_item_created",
        condition: { kind: "equals", field: "priority", value: "urgent" },
        action: { kind: "set_status", payload: { status: "in_review" } },
        enabled: true,
        createdAt: now,
        updatedAt: now,
        runs: 0,
      },
      {
        id: cuid(),
        workspaceId,
        name: "Daily standup briefing",
        trigger: "schedule:daily",
        action: { kind: "ai_summarize", payload: { prompt: "Generate today's standup briefing from yesterday's activity." } },
        enabled: false,
        createdAt: now,
        updatedAt: now,
        runs: 0,
      },
    ];
    for (const r of rules) this.automations.set(r.id, r);
  }
}

// Re-export cuid for parity with the legacy store.
export function cuid(): string {
  return (
    "c" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

export function createInMemoryRepository(): InMemoryRepository {
  return new InMemoryRepository();
}

/**
 * Backward-compat escape hatch: the legacy `apps/web/src/server/store.ts`
 * exposes the underlying Maps (e.g. `db.workItems`). New code should
 * always go through the Repository interface, but the existing UI
 * imports are still pointed at the Map shape.
 */
export function asLegacyStore(repo: InMemoryRepository): {
  workspaces: Map<string, Workspace>;
  users: Map<string, User>;
  sessions: Map<string, Session>;
  departments: Map<string, Department>;
  roles: Map<string, Role>;
  workItemTypes: Map<string, WorkItemType>;
  workItems: Map<string, WorkItem>;
  comments: Map<string, Comment>;
  activities: Map<string, Activity>;
  attachments: Map<string, Attachment>;
  inbox: Map<string, InboxItem>;
  aiConfigs: Map<string, AIAssistantConfig>;
  aiRuns: Map<string, AIRun>;
  automations: Map<string, Automation>;
  bootstrap: InMemoryRepository["bootstrapWorkspace"];
} {
  return {
    workspaces: repo.workspaces,
    users: repo.users,
    sessions: repo.sessions,
    departments: repo.departments,
    roles: repo.roles,
    workItemTypes: repo.workItemTypes,
    workItems: repo.workItems,
    comments: repo.comments,
    activities: repo.activities,
    attachments: repo.attachments,
    inbox: repo.inbox,
    aiConfigs: repo.aiConfigs,
    aiRuns: repo.aiRuns,
    automations: repo.automations,
    bootstrap: (input) => repo.bootstrapWorkspace(input),
  };
}
