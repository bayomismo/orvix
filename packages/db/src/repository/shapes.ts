/**
 * @orvix/db — Repository shapes (Milestone 1).
 *
 * Canonical row types used by the Repository interface and both
 * backends (in-memory and Prisma). These shapes intentionally match the
 * `apps/web/src/server/store.ts` v0.2 schema so call sites don't change
 * shape when swapping backends.
 */

export type Industry =
  | "agency"
  | "saas"
  | "ecommerce"
  | "consulting"
  | "manufacturing"
  | "education"
  | "healthcare"
  | "finance"
  | "realestate"
  | "media"
  | "nonprofit"
  | "other";

export type CompanySize =
  | "solo"
  | "2-10"
  | "11-50"
  | "51-200"
  | "201-1000"
  | "1000+";

export type TeamStructure =
  | "flat"
  | "functional"
  | "divisional"
  | "matrix"
  | "pod";

export type PrimaryGoal =
  | "ship-faster"
  | "win-clients"
  | "deliver-on-time"
  | "grow-revenue"
  | "reduce-overhead"
  | "build-product"
  | "manage-team"
  | "stay-compliant";

export type WorkspaceStatus = "active" | "archived" | "suspended";

export interface Workspace {
  id: string;
  name: string;
  industry: Industry;
  companySize: CompanySize;
  teamStructure: TeamStructure;
  primaryGoal: PrimaryGoal;
  status: WorkspaceStatus;
  createdAt: string;
}

export type DepartmentKey =
  | "leadership"
  | "sales"
  | "delivery"
  | "operations"
  | "finance"
  | "people"
  | "support";

export interface Department {
  id: string;
  workspaceId: string;
  key: DepartmentKey;
  name: string;
  order: number;
}

export type RoleKey =
  | "owner"
  | "admin"
  | "manager"
  | "contributor"
  | "viewer"
  | "ai_assistant";

export interface Role {
  id: string;
  workspaceId: string;
  key: RoleKey;
  name: string;
  isSystem: boolean;
  permissions: readonly string[];
}

export type WorkItemTypeKey =
  | "customer"
  | "deal"
  | "project"
  | "task"
  | "conversation"
  | "document"
  | "request";

export interface WorkItemType {
  id: string;
  workspaceId: string;
  key: WorkItemTypeKey | string;
  name: string;
  icon: string;
  schema: Record<string, unknown>;
  isBuiltIn: boolean;
}

export type WorkItemStatus =
  | "backlog"
  | "in_progress"
  | "blocked"
  | "in_review"
  | "done"
  | "archived";

export type WorkItemPriority = "low" | "normal" | "high" | "urgent";

export interface WorkItem {
  id: string;
  workspaceId: string;
  typeKey: string;
  title: string;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  assigneeId?: string;
  createdById: string;
  description?: string;
  customFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  workspaceId: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  roleKey: RoleKey;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  workspaceId: string;
  expiresAt: string;
}

export interface Comment {
  id: string;
  workspaceId: string;
  workItemId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export type ActivityKind =
  | "created"
  | "status_changed"
  | "assigned"
  | "commented"
  | "attachment_added"
  | "ai_summarized"
  | "ai_run";

export interface Activity {
  id: string;
  workspaceId: string;
  workItemId: string;
  actorId: string;
  kind: ActivityKind | string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface Attachment {
  id: string;
  workspaceId: string;
  workItemId: string;
  uploaderId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  createdAt: string;
}

export interface InboxItem {
  id: string;
  workspaceId: string;
  surface: "inbox" | "approvals" | "today" | "automations";
  title: string;
  body?: string;
  href: string;
  createdAt: string;
  read: boolean;
}

export interface AIRoutingProfile {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  allowList: readonly string[];
}

export interface AIAssistantConfig {
  id: string;
  workspaceId: string;
  displayName: string;
  tonePreset: "warm_concise" | "formal_detailed" | "terse";
  autonomyLevel: "suggest_only" | "suggest_and_act_low_risk";
  routingProfiles: AIRoutingProfile[];
}

export type AIRunDecision = "execute" | "queue_for_approval" | "block" | "cooldown";

export interface AIRun {
  id: string;
  workspaceId: string;
  routingProfile: string;
  kind: string;
  decision: AIRunDecision;
  rationale: string;
  createdAt: string;
}

export type AutomationTrigger =
  | "work_item_created"
  | "status_changed"
  | "schedule:daily"
  | "ai_run_completed";

export type AutomationActionKind =
  | "set_status"
  | "add_comment"
  | "ai_summarize"
  | "send_to_inbox";

export interface AutomationAction {
  kind: AutomationActionKind;
  payload: Record<string, unknown>;
}

export interface AutomationCondition {
  kind: "equals";
  field: string;
  value: string | number;
}

export interface Automation {
  id: string;
  workspaceId: string;
  name: string;
  trigger: AutomationTrigger;
  condition?: AutomationCondition;
  action: AutomationAction;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  runs: number;
  lastRunAt?: string;
}
