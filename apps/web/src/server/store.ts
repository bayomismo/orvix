/**
 * Legacy in-memory store shim (Milestone 1).
 *
 * This file is the backward-compat surface for code that imports
 * `db` and the seed shapes from `@/server/store`. Internally the
 * data is now stored in the InMemoryRepository from `@orvix/db`.
 * The shim re-exports the underlying Maps so existing call sites
 * (e.g. `db.workItems.get(id)`, `db.users.get(id)`) keep working.
 *
 * New code should go through the Repository interface
 * (`import { repository } from "@orvix/db"`). The actions in
 * `apps/web/src/app/.../actions.ts` are being migrated.
 */

import { repository, type Automation, type WorkItem } from "@orvix/db";

/**
 * The legacy seed shapes — preserved here so any call site that
 * imports `Industry`, `CompanySize`, etc. keeps working. The
 * canonical source is `@orvix/db`; this file re-exports the
 * identical types under their old names.
 */
export type {
  Industry,
  CompanySize,
  TeamStructure,
  PrimaryGoal,
  WorkspaceStatus,
  Workspace,
  Department,
  DepartmentKey,
  Role,
  RoleKey,
  WorkItemType,
  WorkItemTypeKey,
  WorkItemStatus,
  WorkItemPriority,
  WorkItem,
  User,
  Session,
  Comment,
  Activity,
  Attachment,
  InboxItem,
  AIRun,
  AutomationTrigger,
  AutomationActionKind,
  Automation,
  AIAssistantConfig,
  AIRoutingProfile,
} from "@orvix/db";

/**
 * The legacy `DashboardKPI` shape. Not used by the Repository — we
 * keep it here for type compatibility with the v0.2 Server Actions
 * that read it. The dashboard reads from the computed aggregation
 * of work items in `/inbox/page.tsx` rather than this table.
 */
export interface DashboardKPI {
  id: string;
  workspaceId: string;
  key: string;
  label: string;
  value: number;
  delta: number;
  trend: "up" | "down" | "flat";
}

import type {
  InboxItem as DbInboxItem,
  AIAssistantConfig as DbAIAssistantConfig,
  AIRun as DbAIRun,
  Workspace as DbWorkspace,
  User as DbUser,
  Session as DbSession,
  Department as DbDepartment,
  Role as DbRole,
  WorkItemType as DbWorkItemType,
  Comment as DbComment,
  Activity as DbActivity,
  Attachment as DbAttachment,
} from "@orvix/db";

/**
 * The legacy `db` shim. We proxy property access to the in-memory
 * repository's underlying Maps. The action functions in
 * `actions.ts` route through the Repository interface; reads in
 * Server Components continue to use the maps.
 *
 * When the active backend is Prisma (production with DATABASE_URL
 * set), this shim will throw on access — by that point every call
 * site should have been migrated to the Repository API.
 */
interface LegacyStore {
  workspaces: Map<string, DbWorkspace>;
  users: Map<string, DbUser>;
  sessions: Map<string, DbSession>;
  departments: Map<string, DbDepartment>;
  roles: Map<string, DbRole>;
  workItemTypes: Map<string, DbWorkItemType>;
  workItems: Map<string, WorkItem>;
  comments: Map<string, DbComment>;
  activities: Map<string, DbActivity>;
  attachments: Map<string, DbAttachment>;
  inbox: Map<string, DbInboxItem>;
  aiConfigs: Map<string, DbAIAssistantConfig>;
  aiRuns: Map<string, DbAIRun>;
  automations: Map<string, Automation>;
}

function legacyStore(): LegacyStore {
  const r = repository;
  if (r.kind !== "memory") {
    throw new Error(
      "Legacy in-memory store is not available because the Prisma backend is active. " +
        "Migrate the call site to use the Repository interface (`import { repository } from '@orvix/db'`).",
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = r as any;
  return {
    workspaces: raw.workspaces,
    users: raw.users,
    sessions: raw.sessions,
    departments: raw.departments,
    roles: raw.roles,
    workItemTypes: raw.workItemTypes,
    workItems: raw.workItems,
    comments: raw.comments,
    activities: raw.activities,
    attachments: raw.attachments,
    inbox: raw.inbox,
    aiConfigs: raw.aiConfigs,
    aiRuns: raw.aiRuns,
    automations: raw.automations,
  };
}

/** The shim. Lazy-evaluated so the in-memory repo is hot. */
export const db: LegacyStore = new Proxy({} as LegacyStore, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (legacyStore() as any)[prop];
  },
}) as LegacyStore;

/** Re-export `cuid` for legacy callers. The Repository owns its own
 * id generator. */
export { cuid } from "@orvix/db";
