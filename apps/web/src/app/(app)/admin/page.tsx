import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const s = await getSession();
  if (!s) return null;

  const users = [...db.users.values()].filter((u) => u.workspaceId === s.workspace.id);
  const depts = [...db.departments.values()].filter((d) => d.workspaceId === s.workspace.id);
  const roles = [...db.roles.values()].filter((r) => r.workspaceId === s.workspace.id);
  const types = [...db.workItemTypes.values()].filter((t) => t.workspaceId === s.workspace.id);
  const automations = [...db.automations.values()].filter((a) => a.workspaceId === s.workspace.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Admin"
        title="Admin"
        subtitle="Roles, departments, work item types, automations. The runtime is the policy."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AdminLink href="/admin/automations" title="Automations" count={automations.length} hint="Trigger → action rules" />
        <AdminCard title="Users" count={users.length} hint="Workspace membership" />
        <AdminCard title="Departments" count={depts.length} hint="Org units" />
        <AdminCard title="Roles" count={roles.length} hint="RBAC" />
        <AdminCard title="Work item types" count={types.length} hint="Built-in + custom" />
        <AdminCard title="Audit log" count={null} hint="Phase 1" />
      </div>
    </div>
  );
}

function AdminLink({
  href,
  title,
  count,
  hint,
}: {
  href: string;
  title: string;
  count: number;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group/adm block rounded-lg border border-surface-divider bg-surface-elevated p-5 shadow-1 transition-all duration-base ease-snappy hover:-translate-y-px hover:border-surface-divider-strong hover:shadow-2"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-text-primary">{title}</h3>
          <p className="mt-0.5 text-2xs text-text-muted">{hint}</p>
        </div>
        <span
          aria-hidden="true"
          className="text-text-muted transition-transform duration-base ease-snappy group-hover/adm:translate-x-0.5"
        >
          →
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="orvix-numeric text-2xl font-semibold tabular-nums text-text-primary">
          {count}
        </span>
        <span className="text-2xs text-text-muted">total</span>
      </div>
    </Link>
  );
}

function AdminCard({
  title,
  count,
  hint,
}: {
  title: string;
  count: number | null;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-surface-divider bg-surface-elevated p-5 shadow-1">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-text-primary">{title}</h3>
          <p className="mt-0.5 text-2xs text-text-muted">{hint}</p>
        </div>
        {count === null ? <Badge tone="warning" size="sm">Phase 1</Badge> : null}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        {count !== null ? (
          <span className="orvix-numeric text-2xl font-semibold tabular-nums text-text-primary">
            {count}
          </span>
        ) : (
          <span className="text-2xs text-text-muted">coming in Phase 1</span>
        )}
      </div>
    </div>
  );
}
