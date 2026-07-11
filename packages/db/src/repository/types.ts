/**
 * @orvix/db — Repository interface (Milestone 1).
 *
 * The Repository is the application-side facade for all data access.
 * It enforces tenant isolation by design (every operation carries a
 * workspaceId) and is implemented by two backends:
 *
 *   - {@link InMemoryRepository} — used when DATABASE_URL is unset
 *     (local dev, unit tests, preview environments without a DB).
 *   - {@link PrismaRepository}   — used in production. Wraps the
 *     `withWorkspace`-bound Prisma client so every query is RLS-gated.
 *
 * Call sites depend only on this interface. The choice of backend is a
 * build-time / runtime decision driven by env.
 *
 * Why a custom Repository and not raw Prisma:
 *   - One set of types, one set of tests, one set of error semantics.
 *   - The in-memory backend gives us a complete dev experience
 *     without DATABASE_URL. The Prisma backend replaces the in-memory
 *     store with a single env var change.
 *   - Repository-level guards (tenantId, soft-delete) compose with
 *     the Prisma extension + RLS — defense in depth.
 */

import type {
  Workspace,
  User,
  Session,
  WorkItem,
  WorkItemType,
  Comment,
  Activity,
  Attachment,
  Automation,
  AIAssistantConfig,
  AIRoutingProfile,
  AIRun,
  InboxItem,
  Department,
  Role,
} from "./shapes";

// ---------------------------------------------------------------------------
// Common shapes
// ---------------------------------------------------------------------------

export interface BootstrapInput {
  name: string;
  industry: Workspace["industry"];
  companySize: Workspace["companySize"];
  teamStructure: Workspace["teamStructure"];
  primaryGoal: Workspace["primaryGoal"];
  ownerEmail: string;
  ownerName: string;
}

export interface CreateWorkItemInput {
  workspaceId: string;
  typeKey: string;
  title: string;
  status: WorkItem["status"];
  priority: WorkItem["priority"];
  assigneeId?: string | undefined;
  createdById: string;
  description?: string | undefined;
  customFields: Record<string, unknown>;
}

export type UpdateWorkItemPatch = {
  title?: string;
  status?: WorkItem["status"];
  priority?: WorkItem["priority"];
  assigneeId?: string;
  /** Setting to `null` clears the description. */
  description?: string | null;
  customFields?: Record<string, unknown>;
};

export interface UpdateWorkItemInput {
  workspaceId: string;
  workItemId: string;
  /**
   * The fields to update. Setting a field to `null` clears it
   * (only supported for nullable fields like `description`).
   * To clear `assigneeId`, use the dedicated `unassignWorkItem` method.
   */
  patch: UpdateWorkItemPatch;
}

export interface CreateCommentInput {
  workspaceId: string;
  workItemId: string;
  authorId: string;
  body: string;
}

export interface CreateAttachmentInput {
  workspaceId: string;
  workItemId: string;
  uploaderId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
}

export interface CreateAutomationInput {
  workspaceId: string;
  name: string;
  trigger: Automation["trigger"];
  condition?: Automation["condition"];
  action: Automation["action"];
  enabled: boolean;
}

export interface UpdateAutomationInput {
  workspaceId: string;
  automationId: string;
  patch: Partial<Pick<Automation, "name" | "enabled" | "trigger" | "condition" | "action">>;
}

export interface CreateAIRunInput {
  workspaceId: string;
  routingProfile: string;
  kind: AIRun["kind"];
  decision: AIRun["decision"];
  rationale: string;
}

export type IdempotencyResult<T> =
  | { status: "fresh"; value: T }
  | { status: "replayed"; value: T };

// ---------------------------------------------------------------------------
// Repository contract
// ---------------------------------------------------------------------------

export interface Repository {
  // Bootstrap & sessions
  bootstrapWorkspace(input: BootstrapInput): Promise<{ workspace: Workspace; owner: User; session: Session }>;
  createSession(userId: string, workspaceId: string): Promise<Session>;
  getSession(id: string): Promise<Session | null>;
  revokeSession(id: string): Promise<void>;

  // Users
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  getUser(id: string): Promise<User | null>;
  listUsers(workspaceId: string): Promise<readonly User[]>;

  // Workspaces
  getWorkspace(id: string): Promise<Workspace | null>;
  updateWorkspace(id: string, patch: Partial<Workspace>): Promise<Workspace>;

  // Departments
  listDepartments(workspaceId: string): Promise<readonly Department[]>;

  // Roles
  listRoles(workspaceId: string): Promise<readonly Role[]>;

  // Work item types
  listWorkItemTypes(workspaceId: string): Promise<readonly WorkItemType[]>;
  getWorkItemType(workspaceId: string, key: string): Promise<WorkItemType | null>;

  // Work items
  listWorkItems(workspaceId: string, filter?: { typeKey?: string }): Promise<readonly WorkItem[]>;
  getWorkItem(workspaceId: string, id: string): Promise<WorkItem | null>;
  createWorkItem(input: CreateWorkItemInput): Promise<WorkItem>;
  updateWorkItem(input: UpdateWorkItemInput): Promise<WorkItem>;
  /** Clear the assignee on a work item. */
  unassignWorkItem(workspaceId: string, id: string): Promise<WorkItem>;
  deleteWorkItem(workspaceId: string, id: string): Promise<void>;

  // Comments
  listComments(workspaceId: string, workItemId: string): Promise<readonly Comment[]>;
  createComment(input: CreateCommentInput): Promise<Comment>;

  // Activities
  listActivities(workspaceId: string, workItemId: string): Promise<readonly Activity[]>;
  createActivity(input: Omit<Activity, "id" | "createdAt">): Promise<Activity>;

  // Attachments
  listAttachments(workspaceId: string, workItemId: string): Promise<readonly Attachment[]>;
  createAttachment(input: CreateAttachmentInput): Promise<Attachment>;

  // Inbox
  listInbox(workspaceId: string): Promise<readonly InboxItem[]>;
  markInboxRead(workspaceId: string, id: string): Promise<void>;

  // AI
  getAIAssistantConfig(workspaceId: string): Promise<AIAssistantConfig | null>;
  listAIRoutingProfiles(workspaceId: string): Promise<readonly AIRoutingProfile[]>;
  createAIRun(input: CreateAIRunInput): Promise<AIRun>;
  listAIRuns(workspaceId: string, limit: number): Promise<readonly AIRun[]>;

  // Automations
  listAutomations(workspaceId: string): Promise<readonly Automation[]>;
  getAutomation(workspaceId: string, id: string): Promise<Automation | null>;
  createAutomation(input: CreateAutomationInput): Promise<Automation>;
  updateAutomation(input: UpdateAutomationInput): Promise<Automation>;
  deleteAutomation(workspaceId: string, id: string): Promise<void>;
  incrementAutomationRuns(workspaceId: string, id: string): Promise<void>;

  // Idempotency (keyed by clientRequestId)
  idempotencyGet<T>(clientRequestId: string): Promise<T | undefined>;
  idempotencyPut<T>(clientRequestId: string, value: T): Promise<void>;

  // Bulk / lifecycle
  reset(): Promise<void>;
  /** Whether this repository is backed by Prisma/Postgres. */
  readonly kind: "memory" | "prisma";
}

// ---------------------------------------------------------------------------
// Re-export shapes for convenience
// ---------------------------------------------------------------------------

export type {
  Workspace,
  User,
  Session,
  WorkItem,
  WorkItemType,
  Comment,
  Activity,
  Attachment,
  Automation,
  AIAssistantConfig,
  AIRoutingProfile,
  AIRun,
  InboxItem,
  Department,
  Role,
} from "./shapes";
