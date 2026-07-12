import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import {
  Badge,
  Breadcrumb,
  Card,
  CardBody,
  EmptyState,
  Sparkles,
  Clock,
  Users,
  Briefcase,
  Folder,
  CheckSquare,
  Message,
  File,
  InboxTray,
} from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db, type Activity } from "@/server/store";

import { WorkItemActions } from "./WorkItemActions";
import { CommentComposer } from "./CommentComposer";
import { AttachmentButton } from "./AttachmentButton";
import { AISummaryButton } from "./AISummaryButton";
import { CustomerProfileCard } from "./CustomerProfileCard";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  blocked: "Blocked",
  in_review: "In review",
  done: "Done",
  archived: "Archived",
};
const STATUS_TONE: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  backlog: "neutral",
  in_progress: "info",
  blocked: "danger",
  in_review: "warning",
  done: "success",
  archived: "neutral",
};
const PRIORITY_LABEL: Record<string, string> = {
  low: "Low", normal: "Normal", high: "High", urgent: "Urgent",
};
const PRIORITY_TONE: Record<string, "neutral" | "warning" | "danger"> = {
  low: "neutral", normal: "neutral", high: "warning", urgent: "danger",
};

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  customer: Users,
  deal: Briefcase,
  project: Folder,
  task: CheckSquare,
  conversation: Message,
  document: File,
  request: InboxTray,
};

const TYPE_LABEL: Record<string, string> = {
  customer: "Customer",
  deal: "Deal",
  project: "Project",
  task: "Task",
  conversation: "Conversation",
  document: "Document",
  request: "Request",
};

export default async function WorkItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const s = await getSession();
  if (!s) return null;
  const { id } = await params;
  const w = db.workItems.get(id);
  if (!w || w.workspaceId !== s.workspace.id) notFound();

  const assignee = w.assigneeId ? db.users.get(w.assigneeId) : undefined;
  const createdBy = db.users.get(w.createdById);

  const comments = [...db.comments.values()]
    .filter((c) => c.workItemId === w.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  const activities = [...db.activities.values()]
    .filter((a) => a.workItemId === w.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const attachments = [...db.attachments.values()].filter(
    (a) => a.workItemId === w.id,
  );

  // Related items: if this is a customer, show their conversations and tasks
  const related = w.typeKey === "customer"
    ? [...db.workItems.values()]
        .filter(
          (other) =>
            other.workspaceId === s.workspace.id &&
            other.id !== w.id &&
            (other.typeKey === "conversation" ||
              other.typeKey === "task" ||
              other.typeKey === "document"),
        )
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .slice(0, 4)
    : [];

  const Icon = TYPE_ICON[w.typeKey] ?? CheckSquare;
  const isCustomer = w.typeKey === "customer";

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Work", href: "/work" },
          { label: TYPE_LABEL[w.typeKey] ?? w.typeKey, href: `/work?type=${w.typeKey}` },
          { label: w.title },
        ]}
      />

      <PageHeader
        compact
        title={w.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-surface-inset text-text-secondary">
              <Icon size={12} />
            </span>
            <span>{TYPE_LABEL[w.typeKey] ?? w.typeKey}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">#{w.id.slice(0, 6)}</span>
            <span aria-hidden="true">·</span>
            <Badge tone={STATUS_TONE[w.status] ?? "neutral"} size="sm">
              {STATUS_LABEL[w.status] ?? w.status}
            </Badge>
            <Badge tone={PRIORITY_TONE[w.priority] ?? "neutral"} size="sm">
              {PRIORITY_LABEL[w.priority] ?? w.priority}
            </Badge>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={10} aria-hidden="true" />
              {timeAgo(w.updatedAt)}
            </span>
          </span>
        }
        actions={
          <WorkItemActions
            workItemId={w.id}
            currentStatus={w.status}
            currentPriority={w.priority}
            currentAssigneeId={w.assigneeId ?? null}
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6 min-w-0">
          <Card elevation="raised">
            <CardBody className="p-6">
              {w.description ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                  {w.description}
                </div>
              ) : (
                <p className="text-sm italic text-text-muted">
                  No description yet. Add one to give the Assistant more to work with.
                </p>
              )}
            </CardBody>
          </Card>

          {isCustomer && related.length > 0 ? (
            <section className="flex flex-col gap-3">
              <header className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                  Related
                </h3>
                <span className="text-2xs text-text-muted tabular-nums">{related.length}</span>
              </header>
              <Card elevation="flat" className="overflow-hidden">
                <CardBody className="p-0">
                  <ul className="divide-y divide-surface-divider">
                    {related.map((r) => {
                      const RIcon = TYPE_ICON[r.typeKey] ?? CheckSquare;
                      return (
                        <li key={r.id}>
                          <Link
                            href={`/work/${r.id}`}
                            className="group flex items-center gap-3 px-5 py-3 transition-colors duration-fast ease-out-quint hover:bg-surface-inset"
                          >
                            <span
                              aria-hidden="true"
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-inset text-text-secondary transition-colors duration-fast ease-out-quint group-hover:bg-surface-elevated group-hover:text-text-primary"
                            >
                              <RIcon size={12} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-text-primary">
                                {r.title}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-2xs text-text-muted">
                                <span className="capitalize">{r.typeKey}</span>
                                <span aria-hidden="true">·</span>
                                <span>{timeAgo(r.updatedAt)}</span>
                              </div>
                            </div>
                            <Badge tone={STATUS_TONE[r.status] ?? "neutral"} size="sm">
                              {STATUS_LABEL[r.status] ?? r.status}
                            </Badge>
                            <span
                              aria-hidden="true"
                              className="text-text-muted transition-transform duration-fast ease-out-quint group-hover:translate-x-0.5"
                            >
                              →
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardBody>
              </Card>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                Comments <span className="ml-1.5 text-2xs font-normal text-text-muted tabular-nums">{comments.length}</span>
              </h3>
              <AttachmentButton workItemId={w.id} />
            </header>
            {comments.length === 0 ? (
              <Card elevation="flat">
                <CardBody className="p-5">
                  <EmptyState
                    shape="empty"
                    title="No comments yet."
                    description="Start the conversation."
                  />
                </CardBody>
              </Card>
            ) : (
              <Card elevation="flat" className="overflow-hidden">
                <ul className="divide-y divide-surface-divider">
                  {comments.map((c) => {
                    const author = c.authorId === "automation" ? null : db.users.get(c.authorId);
                    return (
                      <li key={c.id} className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-2xs">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-brand-accent to-brand-ai text-2xs font-semibold text-text-on-accent">
                            {author ? author.displayName[0] : "A"}
                          </span>
                          <span className="font-medium text-text-primary">
                            {author?.displayName ?? "Automation"}
                          </span>
                          <span className="text-text-muted">·</span>
                          <span className="text-text-muted inline-flex items-center gap-1 tabular-nums">
                            <Clock size={10} aria-hidden="true" />
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                          {c.body}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
            <CommentComposer workItemId={w.id} />
          </section>

          {attachments.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                Attachments <span className="ml-1.5 text-2xs font-normal text-text-muted tabular-nums">{attachments.length}</span>
              </h3>
              <Card elevation="flat" className="overflow-hidden">
                <ul className="divide-y divide-surface-divider">
                  {attachments.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-inset text-text-muted"
                      >
                        <File size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-text-primary">
                          {a.fileName}
                        </div>
                        <div className="text-2xs text-text-muted tabular-nums">
                          {formatBytes(a.sizeBytes)} · {a.mimeType}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4">
          {isCustomer ? <CustomerProfileCard w={w} /> : null}

          <Card elevation="raised">
            <CardBody className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-inset text-text-secondary"
                >
                  <Icon size={14} />
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                  Details
                </h3>
              </div>
              <div className="flex flex-col gap-2.5">
                <DetailRow label="Type" value={<span className="capitalize">{TYPE_LABEL[w.typeKey] ?? w.typeKey}</span>} />
                <DetailRow
                  label="Status"
                  value={<Badge tone={STATUS_TONE[w.status] ?? "neutral"} size="sm">{STATUS_LABEL[w.status] ?? w.status}</Badge>}
                />
                <DetailRow
                  label="Priority"
                  value={<Badge tone={PRIORITY_TONE[w.priority] ?? "neutral"} size="sm">{PRIORITY_LABEL[w.priority] ?? w.priority}</Badge>}
                />
                <DetailRow
                  label="Assignee"
                  value={assignee ? assignee.displayName : <span className="text-text-muted">Unassigned</span>}
                />
                <DetailRow
                  label="Created by"
                  value={createdBy?.displayName ?? "—"}
                />
                <DetailRow
                  label="Created"
                  value={<span className="tabular-nums">{new Date(w.createdAt).toLocaleString()}</span>}
                />
                <DetailRow
                  label="Updated"
                  value={<span className="tabular-nums">{new Date(w.updatedAt).toLocaleString()}</span>}
                />
              </div>
            </CardBody>
          </Card>

          <Card elevation="raised" className="overflow-hidden">
            <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-brand-ai" aria-hidden="true" />
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                  AI Assistant
                </h3>
              </div>
              <Badge tone="ai" size="sm" dot>Live</Badge>
            </header>
            <CardBody className="flex flex-col gap-3 p-5">
              <p className="text-xs text-text-secondary leading-relaxed">
                Summarize, suggest next steps, draft a status update.
              </p>
              <AISummaryButton workItemId={w.id} title={w.title} description={w.description} />
            </CardBody>
          </Card>

          <Card elevation="raised">
            <CardBody className="flex flex-col gap-3 p-5">
              <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                Activity
              </h3>
              {activities.length === 0 ? (
                <p className="text-2xs text-text-muted">No activity yet.</p>
              ) : (
                <ol className="flex flex-col gap-2.5">
                  {activities.slice(0, 8).map((a) => (
                    <ActivityRow key={a.id} a={a} />
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary text-right">{value}</span>
    </div>
  );
}

function ActivityRow({ a }: { a: Activity }) {
  const actor = db.users.get(a.actorId);
  const name = actor?.displayName ?? "Someone";
  let body: React.ReactNode = null;
  if (a.kind === "created") body = <><span className="font-medium text-text-primary">{name}</span> created this</>;
  else if (a.kind === "status_changed") {
    const p = a.payload as { from?: string; to?: string };
    body = (
      <>
        <span className="font-medium text-text-primary">{name}</span> changed status{" "}
        {p.from ? <Badge tone={STATUS_TONE[p.from] ?? "neutral"} size="sm">{STATUS_LABEL[p.from] ?? p.from}</Badge> : null}
        {" → "}
        {p.to ? <Badge tone={STATUS_TONE[p.to] ?? "neutral"} size="sm">{STATUS_LABEL[p.to] ?? p.to}</Badge> : null}
      </>
    );
  } else if (a.kind === "commented") body = <><span className="font-medium text-text-primary">{name}</span> commented</>;
  else if (a.kind === "attachment_added") {
    const p = a.payload as { fileName?: string };
    body = <><span className="font-medium text-text-primary">{name}</span> attached {p.fileName}</>;
  } else if (a.kind === "ai_summarized") body = <><span className="font-medium text-text-primary">AI</span> summarized this</>;
  else body = <><span className="font-medium text-text-primary">{name}</span> {a.kind}</>;

  return (
    <li className="flex flex-col gap-0.5 text-xs text-text-secondary">
      <div className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-text-muted" />
        <span className="text-2xs text-text-muted tabular-nums">
          {new Date(a.createdAt).toLocaleString()}
        </span>
      </div>
      <div className="ml-3 flex flex-wrap items-center gap-1">{body}</div>
    </li>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
