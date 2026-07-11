/**
 * @orvix/db — Repository entry.
 *
 * Public re-exports for the Repository abstraction (Milestone 1).
 */

export type {
  Repository,
  UpdateWorkItemPatch,
  CreateAutomationInput,
  UpdateAutomationInput,
  BootstrapInput,
  CreateWorkItemInput,
  CreateCommentInput,
  CreateAttachmentInput,
} from "./types";
export * from "./shapes";
export { repository } from "./factory";
export { createInMemoryRepository } from "./in-memory";
export { createPrismaRepository } from "./prisma";
export { resetRepositoryForTests } from "./factory";
