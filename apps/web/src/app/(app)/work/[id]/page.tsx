import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, CardBody, EmptyState } from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db, type Activity } from "@/server/store";

import { WorkItemActions } from "./WorkItemActions";
import { CommentComposer } from "./CommentComposer";
import { AttachmentButton } from "./AttachmentButton";
import { AISummaryButton } from "./AISummaryButton";

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

const TYPE_ICON: Record<string, string> = {
  customer: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  deal: "M3 7h18M3 12h18M3 17h12",
  project: "M3 7l9-4 9 4-9 4v10l-9 4-9-4V7z",
  task: "M5 13l4 4L19 7",
  conversation: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  document: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  request: "M3 8l9 6 9-6 M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8",
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

  const icon = TYPE_ICON[w.typeKey] ?? TYPE_ICON.task;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1.5 text-2xs text-text-muted">
        <Link href="/work" className="transition-colors hover:text-text-secondary">
          Work
        </Link>
        <span aria-hidden="true">/</span>
        <span className="capitalize">{w.typeKey}</span>
        <span aria-hidden="true">/</span>
        <span className="font-mono tabular-nums">#{w.id.slice(0, 6)}</span>
      </div>

      <PageHeader
        compact
        title={w.title}
        subtitle={
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <Badge tone={STATUS_TONE[w.status] ?? "neutral"} size="sm">
              {STATUS_LABEL[w.status] ?? w.status}
            </Badge>
            <Badge tone={PRIORITY_TONE[w.priority] ?? "neutral"} size="sm">
              {PRIORITY_LABEL[w.priority] ?? w.priority} priority
            </Badge>
            <span aria-hidden="true">·</span>
            <span>Updated {timeAgo(w.updatedAt)}</span>
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
          <Card>
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

          <section className="flex flex-col gap-3">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                Comments <span className="ml-1.5 text-2xs font-normal text-text-muted tabular-nums">{comments.length}</span>
              </h3>
              <AttachmentButton workItemId={w.id} />
            </header>
            {comments.length === 0 ? (
              <Card>
                <CardBody className="p-5">
                  <EmptyState
                    shape="empty"
                    title="No comments yet."
                    description="Start the conversation."
                  />
                </CardBody>
              </Card>
            ) : (
              <Card>
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
                          <span className="text-text-muted tabular-nums">
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
              <Card>
                <ul className="divide-y divide-surface-divider">
                  {attachments.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-inset text-text-muted"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                        </svg>
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
          <Card>
            <CardBody className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-inset text-text-secondary"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                  </svg>
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                  Details
                </h3>
              </div>
              <div className="flex flex-col gap-2.5">
                <DetailRow label="Type" value={<span className="capitalize">{w.typeKey}</span>} />
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

          <Card>
            <CardBody className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                  AI Assistant
                </h3>
                <Badge tone="ai" size="sm" dot>Live</Badge>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Summarize, suggest next steps, draft a status update.
              </p>
              <AISummaryButton workItemId={w.id} title={w.title} description={w.description} />
            </CardBody>
          </Card>

          <Card>
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
