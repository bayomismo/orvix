/**
 * Automation executor (Milestone 1).
 *
 * Pure, deterministic executor that:
 *   1. Lists enabled rules for the workspace.
 *   2. Filters by trigger + condition.
 *   3. Runs the action through the {@link Repository} (write path).
 *   4. Increments the rule's `runs` counter.
 *
 * The executor is the *only* place in the system that mutates
 * workspace state in response to an event. Server Actions and route
 * handlers are the *only* places that mutate in response to user
 * intent. The boundary is enforced: callers pass an explicit
 * `workspaceId` to every entry point.
 *
 * In production the executor is invoked by a single queue worker
 * (Phase 1: Vercel cron + Inngest; Phase 0: in-process). The shape of
 * the entry point is identical either way, so the production worker
 * is a drop-in replacement.
 */

import { repository, type Automation, type WorkItem } from "@orvix/db";

export type AutomationEvent =
  | { kind: "work_item_created"; workspaceId: string; workItem: WorkItem }
  | { kind: "status_changed"; workspaceId: string; workItem: WorkItem; from: string; to: string }
  | { kind: "ai_run_completed"; workspaceId: string; runId: string };

export interface ExecutorDeps {
  /**
   * Optional callback for the `ai_summarize` action. The default is
   * the deterministic Phase 0 planner. Production wires the model
   * router.
   */
  summarize?: (workspaceId: string, prompt: string) => Promise<string>;
  /** Optional clock injection (test-friendly). */
  now?: () => Date;
}

const defaultNow = (): Date => new Date();

export class AutomationExecutor {
  constructor(private readonly deps: ExecutorDeps = {}) {}

  /**
   * Run all matching rules for an event. Returns the count of rules
   * that fired. Errors are caught per-rule so a single bad rule
   * doesn't poison the rest.
   */
  async run(event: AutomationEvent): Promise<{ fired: number; errors: Array<{ ruleId: string; error: string }> }> {
    const rules = await repository.listAutomations(event.workspaceId);
    const matching = rules.filter((r) => r.enabled && matchesTrigger(r, event));
    let fired = 0;
    const errors: Array<{ ruleId: string; error: string }> = [];
    for (const rule of matching) {
      try {
        await this.executeOne(rule, event);
        fired += 1;
      } catch (e) {
        errors.push({
          ruleId: rule.id,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
    return { fired, errors };
  }

  private async executeOne(rule: Automation, event: AutomationEvent): Promise<void> {
    const { action } = rule;
    const now = (this.deps.now ?? defaultNow)().toISOString();

    switch (action.kind) {
      case "set_status": {
        if (event.kind === "work_item_created" || event.kind === "status_changed") {
          const newStatus = String(action.payload["status"] ?? "in_progress");
          await repository.updateWorkItem({
            workspaceId: event.workspaceId,
            workItemId: event.workItem.id,
            patch: { status: newStatus as WorkItem["status"] },
          });
        }
        break;
      }
      case "add_comment": {
        if (event.kind === "work_item_created" || event.kind === "status_changed") {
          const body = String(action.payload["body"] ?? "(automated)");
          await repository.createComment({
            workspaceId: event.workspaceId,
            workItemId: event.workItem.id,
            authorId: "automation",
            body,
          });
        }
        break;
      }
      case "ai_summarize": {
        const prompt = String(action.payload["prompt"] ?? "Summarize recent activity.");
        const text = this.deps.summarize
          ? await this.deps.summarize(event.workspaceId, prompt)
          : `(no AI provider) ${prompt}`;
        // Surface the result as an inbox item; the user can read it
        // on the Today feed.
        await repository.createActivity({
          workspaceId: event.workspaceId,
          workItemId: event.kind === "work_item_created" ? event.workItem.id : "",
          actorId: "automation",
          kind: "ai_summarized",
          payload: { text, source: rule.id, ts: now },
        });
        break;
      }
      case "send_to_inbox":
        await repository.createActivity({
          workspaceId: event.workspaceId,
          workItemId: event.kind === "work_item_created" ? event.workItem.id : "",
          actorId: "automation",
          kind: "ai_run",
          payload: {
            title: String(action.payload["title"] ?? "Automation"),
            body: action.payload["body"] ?? {},
            href: action.payload["href"] ?? "/inbox",
            ts: now,
          },
        });
        break;
    }
    await repository.incrementAutomationRuns(event.workspaceId, rule.id);
  }
}

function matchesTrigger(rule: Automation, event: AutomationEvent): boolean {
  if (event.kind === "work_item_created" && rule.trigger === "work_item_created") {
    return conditionMatches(rule, event.workItem);
  }
  if (event.kind === "status_changed" && rule.trigger === "status_changed") {
    return event.to === rule.condition?.value || !rule.condition;
  }
  if (event.kind === "ai_run_completed" && rule.trigger === "ai_run_completed") {
    return true;
  }
  return false;
}

function conditionMatches(rule: Automation, workItem: WorkItem): boolean {
  if (!rule.condition) return true;
  const { field, value } = rule.condition;
  if (field === "typeKey") return workItem.typeKey === String(value);
  if (field === "priority") return workItem.priority === String(value);
  if (field === "status") return workItem.status === String(value);
  return false;
}
