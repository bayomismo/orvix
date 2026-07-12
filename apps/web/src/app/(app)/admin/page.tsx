import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import {
  Badge,
  Card,
  CardBody,
  Users,
  Folder,
  CheckSquare,
  Sparkles,
  ArrowRight,
  BarChart,
  Bell,
  Inbox,
} from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db } from "@/server/store";

export const dynamic = "force-dynamic";

interface AdminSection {
  href?: string;
  title: string;
  count: number | null;
  hint: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconTone: "accent" | "ai" | "info" | "warning" | "success";
  phase?: "Phase 1";
}

export default async function AdminPage() {
  const s = await getSession();
  if (!s) return null;

  const users = [...db.users.values()].filter((u) => u.workspaceId === s.workspace.id);
  const depts = [...db.departments.values()].filter((d) => d.workspaceId === s.workspace.id);
  const roles = [...db.roles.values()].filter((r) => r.workspaceId === s.workspace.id);
  const types = [...db.workItemTypes.values()].filter((t) => t.workspaceId === s.workspace.id);
  const automations = [...db.automations.values()].filter((a) => a.workspaceId === s.workspace.id);

  const sections: AdminSection[] = [
    {
      href: "/admin/automations",
      title: "Automations",
      count: automations.length,
      hint: "Trigger → action rules",
      icon: Sparkles,
      iconTone: "ai",
    },
    {
      title: "Users",
      count: users.length,
      hint: "Workspace membership",
      icon: Users,
      iconTone: "info",
    },
    {
      title: "Departments",
      count: depts.length,
      hint: "Org units",
      icon: Inbox,
      iconTone: "accent",
    },
    {
      title: "Roles",
      count: roles.length,
      hint: "RBAC",
      icon: CheckSquare,
      iconTone: "warning",
    },
    {
      title: "Work item types",
      count: types.length,
      hint: "Built-in + custom",
      icon: Folder,
      iconTone: "success",
    },
    {
      title: "Audit log",
      count: null,
      hint: "Every action, every actor",
      icon: BarChart,
      iconTone: "accent",
      phase: "Phase 1",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Admin"
        title="Admin"
        subtitle="Roles, departments, work item types, automations. The runtime is the policy."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <SectionCard key={s.title} section={s} />
        ))}
      </div>

      <Card elevation="raised" className="overflow-hidden">
        <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-ai/10 text-brand-ai"
            >
              <Bell size={12} />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                Audit at a glance
              </h3>
              <p className="mt-0.5 text-2xs text-text-muted">Surface count, current activity</p>
            </div>
          </div>
          <Badge tone="warning" size="sm" dot>Phase 1</Badge>
        </header>
        <CardBody className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-4">
          <Stat label="Users" value={users.length} />
          <Stat label="Departments" value={depts.length} />
          <Stat label="Roles" value={roles.length} />
          <Stat label="Types" value={types.length} />
          <Stat label="Automations" value={automations.length} />
          <Stat label="Comments" value={[...db.comments.values()].filter((c) => c.workspaceId === s.workspace.id).length} />
          <Stat label="AI runs" value={[...db.aiRuns.values()].filter((r) => r.workspaceId === s.workspace.id).length} />
          <Stat label="Inbox" value={[...db.inbox.values()].filter((i) => i.workspaceId === s.workspace.id).length} />
        </CardBody>
      </Card>
    </div>
  );
}

function SectionCard({ section }: { section: AdminSection }) {
  const Icon = section.icon;
  const iconClass =
    section.iconTone === "ai" ? "bg-brand-ai/10 text-brand-ai" :
    section.iconTone === "accent" ? "bg-brand-accent/10 text-brand-accent" :
    section.iconTone === "info" ? "bg-status-info-soft text-status-info" :
    section.iconTone === "warning" ? "bg-status-warning-soft text-status-warning" :
    section.iconTone === "success" ? "bg-status-success-soft text-status-success" :
    "bg-surface-inset text-text-muted";

  const inner = (
    <Card
      interactive={!!section.href}
      elevation="floating"
      className={
        "orvix-card-hover overflow-hidden " +
        (section.href ? "cursor-pointer" : "")
      }
    >
      <CardBody className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <span
            aria-hidden="true"
            className={"flex h-9 w-9 items-center justify-center rounded-md " + iconClass}
          >
            <Icon size={14} />
          </span>
          {section.href ? (
            <span
              aria-hidden="true"
              className="text-text-muted transition-transform duration-base ease-out-quint group-hover/sect:translate-x-0.5"
            >
              <ArrowRight size={14} />
            </span>
          ) : section.phase ? (
            <Badge tone="warning" size="sm">{section.phase}</Badge>
          ) : null}
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-text-primary">
            {section.title}
          </h3>
          <p className="mt-0.5 text-2xs text-text-muted">{section.hint}</p>
        </div>
        {section.count !== null ? (
          <div className="flex items-baseline gap-1.5">
            <span className="orvix-numeric text-2xl font-semibold tabular-nums text-text-primary">
              {section.count}
            </span>
            <span className="text-2xs text-text-muted">total</span>
          </div>
        ) : (
          <div className="text-2xs text-text-muted">coming in Phase 1</div>
        )}
      </CardBody>
    </Card>
  );

  if (section.href) {
    return (
      <Link href={section.href} className="group/sect block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-surface-divider bg-surface-canvas/40 px-3 py-2">
      <div className="text-2xs uppercase tracking-wider text-text-muted">{label}</div>
      <div className="orvix-numeric mt-0.5 text-lg font-semibold tabular-nums text-text-primary">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
