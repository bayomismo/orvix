/**
 * Customer pipeline stages — non-Server-Action helpers.
 * Lives outside `actions.ts` so it can export sync functions.
 */
import type { WorkItem } from "@/server/store";

export const STAGES = ["lead", "qualified", "proposal", "won", "lost"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

const STATUS_TO_STAGE: Record<string, Stage> = {
  backlog: "lead",
  in_progress: "qualified",
  in_review: "proposal",
  done: "won",
  archived: "lost",
};

const STAGE_TO_STATUS: Record<Stage, "backlog" | "in_progress" | "in_review" | "done" | "archived"> = {
  lead: "backlog",
  qualified: "in_progress",
  proposal: "in_review",
  won: "done",
  lost: "archived",
};

export function getStage(workItem: WorkItem): Stage {
  return (STATUS_TO_STAGE[workItem.status] ?? "lead") as Stage;
}

export function statusForStage(stage: Stage): "backlog" | "in_progress" | "in_review" | "done" | "archived" {
  return STAGE_TO_STATUS[stage];
}

export function stageLabel(stage: Stage): string {
  return STAGE_LABEL[stage];
}
