import Link from "next/link";

import { Badge, Button, Card, CardBody } from "@orvix/ui";
import type { InboxItem } from "@/server/store";

/**
 * Right rail — the always-visible sidebar context. Inbox + quick
 * jump-back to recent activity, scoped to the workspace.
 */
export function ActivityRail({
  inbox,
  unread,
}: {
  inbox: InboxItem[];
  unread: number;
}) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
      <Card>
        <CardBody className="p-0">
          <header className="flex items-center justify-between px-5 py-3.5 border-b border-surface-divider">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-text-primary">Inbox</span>
              {unread > 0 ? (
                <Badge tone="ai" size="sm">{unread} new</Badge>
              ) : null}
            </div>
            <Link href="/inbox" className="text-2xs font-medium text-brand-accent hover:underline">
              View all
            </Link>
          </header>
          {inbox.length === 0 ? (
            <p className="px-5 py-6 text-sm text-text-muted">Inbox is clear.</p>
          ) : (
            <ul className="divide-y divide-surface-divider">
              {inbox.map((i) => (
                <li key={i.id}>
                  <Link
                    href={i.href}
                    className="group block px-5 py-3 transition-colors duration-fast ease-snappy hover:bg-surface-inset"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className={
                          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full " +
                          (i.read ? "bg-surface-divider-strong" : "bg-brand-accent")
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-text-primary tracking-tight">
                          {i.title}
                        </div>
                        {i.body ? (
                          <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary leading-relaxed">
                            {i.body}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-5">
          <div className="flex flex-col gap-1">
            <span className="text-2xs font-medium uppercase tracking-[0.06em] text-text-muted">
              Need help?
            </span>
            <p className="mt-0.5 text-sm text-text-primary">
              Press <kbd className="rounded border border-surface-divider bg-surface-canvas px-1.5 py-0.5 font-mono text-2xs">⌘K</kbd> to open the command palette.
            </p>
            <Button variant="secondary" size="sm" className="mt-3 self-start">
              Tour the product
            </Button>
          </div>
        </CardBody>
      </Card>
    </aside>
  );
}
