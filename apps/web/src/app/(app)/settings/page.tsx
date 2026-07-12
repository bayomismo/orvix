import { PageHeader } from "@/components/PageHeader";
import {
  Badge,
  Card,
  CardBody,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  Users,
  Briefcase,
  Bell,
  Settings as SettingsIcon,
  CheckCircle,
  Sparkles,
} from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db } from "@/server/store";

export const dynamic = "force-dynamic";

const TABS = ["Profile", "Workspace", "Engine", "Security", "Notifications", "Theme"] as const;
type Tab = (typeof TABS)[number];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const s = await getSession();
  if (!s) return null;
  const sp = await searchParams;
  const tab = (TABS.includes(sp.tab as Tab) ? sp.tab : "Profile") as Tab;

  const user = db.users.get(s.user.id);
  const w = s.workspace;
  const deptCount = [...db.departments.values()].filter((d) => d.workspaceId === w.id).length;
  const roleCount = [...db.roles.values()].filter((r) => r.workspaceId === w.id).length;
  const typeCount = [...db.workItemTypes.values()].filter((t) => t.workspaceId === w.id).length;
  const memberCount = [...db.users.values()].filter((u) => u.workspaceId === w.id).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Workspace"
        title="Settings"
        subtitle="Identity, security, and the configuration of the runtime. Phase 1 deepens each panel."
      />

      <Tabs defaultValue={tab} className="flex flex-col gap-5">
        <TabsList aria-label="Settings sections" className="w-full overflow-x-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} asChild>
              <a
                href={`/settings?tab=${t}`}
                className="relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-fast ease-out-quint data-[state=active]:text-text-primary after:absolute after:left-2 after:right-2 after:-bottom-px after:h-px after:bg-brand-accent after:scale-x-0 after:origin-center after:transition-transform after:duration-default after:ease-out-quint data-[state=active]:after:scale-x-100"
              >
                {t}
              </a>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-0 focus-visible:outline-none">
          {tab === "Profile" ? <ProfilePanel userName={user?.displayName ?? "—"} userEmail={user?.email ?? "—"} /> : null}
          {tab === "Workspace" ? <WorkspacePanel workspaceName={w.name} industry={w.industry} memberCount={memberCount} createdAt={w.createdAt} /> : null}
          {tab === "Engine" ? <EnginePanel deptCount={deptCount} roleCount={roleCount} typeCount={typeCount} /> : null}
          {tab === "Security" ? <SecurityPanel /> : null}
          {tab === "Notifications" ? <NotificationsPanel /> : null}
          {tab === "Theme" ? <ThemePanel /> : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  hint,
  badge,
  badgeTone = "success",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  hint: string;
  badge?: string;
  badgeTone?: "success" | "warning" | "info" | "neutral";
}) {
  return (
    <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent"
        >
          <Icon size={12} />
        </span>
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-text-primary">
            {title}
          </h3>
          <p className="mt-0.5 text-2xs text-text-muted">{hint}</p>
        </div>
      </div>
      {badge ? <Badge tone={badgeTone} size="sm" dot>{badge}</Badge> : null}
    </header>
  );
}

function ProfilePanel({ userName, userEmail }: { userName: string; userEmail: string }) {
  return (
    <Card elevation="raised" className="overflow-hidden">
      <PanelHeader icon={Users} title="Profile" hint="Your identity in this workspace" />
      <CardBody className="flex flex-col gap-3 p-5">
        <Row k="Name" v={userName} />
        <Row k="Email" v={userEmail} />
        <Row k="Time zone" v={<span className="text-text-muted">Inherits browser</span>} />
        <Row k="Notification channel" v={<Badge tone="ai" size="sm" dot>Web only</Badge>} />
      </CardBody>
    </Card>
  );
}

function WorkspacePanel({
  workspaceName,
  industry,
  memberCount,
  createdAt,
}: {
  workspaceName: string;
  industry: string;
  memberCount: number;
  createdAt: string;
}) {
  return (
    <Card elevation="raised" className="overflow-hidden">
      <PanelHeader icon={Briefcase} title="Workspace" hint="The shared space for the team" badge="Active" badgeTone="success" />
      <CardBody className="flex flex-col gap-3 p-5">
        <Row k="Name" v={workspaceName} />
        <Row k="Industry" v={<span className="capitalize">{industry}</span>} />
        <Row k="Members" v={<span className="tabular-nums">{memberCount}</span>} />
        <Row k="Created" v={<span className="tabular-nums">{new Date(createdAt).toLocaleDateString()}</span>} />
      </CardBody>
    </Card>
  );
}

function EnginePanel({ deptCount, roleCount, typeCount }: { deptCount: number; roleCount: number; typeCount: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card elevation="raised" className="overflow-hidden">
        <PanelHeader icon={SettingsIcon} title="Engine" hint="Org structure, RBAC, types" />
        <CardBody className="flex flex-col gap-3 p-5">
          <Row k="Departments" v={<span className="tabular-nums">{deptCount}</span>} />
          <Row k="Roles" v={<span className="tabular-nums">{roleCount}</span>} />
          <Row k="Work item types" v={<span className="tabular-nums">{typeCount}</span>} />
          <Row k="AI assistant" v={<Badge tone="ai" size="sm" dot>Enabled</Badge>} />
        </CardBody>
      </Card>

      <Card elevation="raised" className="overflow-hidden">
        <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-ai/10 text-brand-ai"
            >
              <Sparkles size={12} />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                AI runtime
              </h3>
              <p className="mt-0.5 text-2xs text-text-muted">Profiles, memory, approvals</p>
            </div>
          </div>
          <Badge tone="ai" size="sm" dot>Live</Badge>
        </header>
        <CardBody className="flex flex-col gap-3 p-5">
          <Row k="Default mode" v={<Badge tone="warning" size="sm">Suggest only</Badge>} />
          <Row k="Routing profiles" v={<span className="tabular-nums">8</span>} />
          <Row k="Memory tiers" v={<span className="tabular-nums">3</span>} />
          <Row k="Verifiers" v={<span className="tabular-nums">2</span>} />
        </CardBody>
      </Card>
    </div>
  );
}

function SecurityPanel() {
  return (
    <Card elevation="raised" className="overflow-hidden">
      <PanelHeader icon={CheckCircle} title="Security" hint="Auth, isolation, audit" badge="Operational" badgeTone="success" />
      <CardBody className="flex flex-col gap-3 p-5">
        <Row k="Auth" v="Auth.js (session cookie)" />
        <Row k="2FA" v={<Badge tone="warning" size="sm">Phase 1</Badge>} />
        <Row k="SSO / SAML" v={<Badge tone="warning" size="sm">Phase 1</Badge>} />
        <Row k="Tenant isolation" v={<Badge tone="success" size="sm" dot>RLS + extension</Badge>} />
        <Row k="Audit log" v={<Badge tone="warning" size="sm">Phase 1</Badge>} />
      </CardBody>
    </Card>
  );
}

function NotificationsPanel() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card elevation="raised" className="overflow-hidden">
        <PanelHeader icon={Bell} title="Channels" hint="Where notifications go" />
        <CardBody className="flex flex-col gap-3 p-5">
          <ToggleRow
            label="In-app"
            hint="Surface in the inbox card on the right rail"
            defaultChecked
            disabled
          />
          <ToggleRow label="Email" hint="Daily digest" />
          <ToggleRow label="Push" hint="Browser notifications" />
        </CardBody>
      </Card>

      <Card elevation="raised" className="overflow-hidden">
        <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-status-warning-soft text-status-warning"
            >
              <Bell size={12} />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                What notifies you
              </h3>
              <p className="mt-0.5 text-2xs text-text-muted">Triggers per surface</p>
            </div>
          </div>
        </header>
        <CardBody className="flex flex-col gap-3 p-5">
          <ToggleRow label="AI runs awaiting approval" hint="Bell + inbox card" defaultChecked />
          <ToggleRow label="Customer stage changes" hint="Stage badge updates" defaultChecked />
          <ToggleRow label="Comments on your work items" hint="@mention + reply" defaultChecked />
          <ToggleRow label="Weekly pipeline briefing" hint="Monday 9am" />
        </CardBody>
      </Card>
    </div>
  );
}

function ThemePanel() {
  return (
    <Card elevation="raised" className="overflow-hidden">
      <PanelHeader icon={Sparkles} title="Theme" hint="Visual mode + accent" badge="Dark" badgeTone="info" />
      <CardBody className="flex flex-col gap-4 p-5">
        <div>
          <div className="text-2xs uppercase tracking-[0.06em] text-text-muted">Mode</div>
          <div className="mt-2 flex items-center gap-2">
            <ThemeChip label="Dark" active dot />
            <ThemeChip label="Light" disabled />
            <ThemeChip label="System" disabled />
          </div>
        </div>

        <div>
          <div className="text-2xs uppercase tracking-[0.06em] text-text-muted">Accent</div>
          <div className="mt-2 flex items-center gap-2">
            <AccentChip color="#5046E5" name="Indigo" active />
            <AccentChip color="#8B5CF6" name="Violet" />
            <AccentChip color="#10B981" name="Emerald" />
            <AccentChip color="#F59E0B" name="Amber" />
          </div>
        </div>

        <p className="text-2xs text-text-muted">
          Light mode and additional accents land in Phase 1. The Assistant follows your system theme until then.
        </p>
      </CardBody>
    </Card>
  );
}

function ThemeChip({ label, active, dot, disabled }: { label: string; active?: boolean; dot?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={
        "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-fast ease-out-quint " +
        (active
          ? "border-brand-accent bg-brand-accent/10 text-text-primary"
          : disabled
            ? "cursor-not-allowed border-surface-divider bg-surface-canvas text-text-muted opacity-50"
            : "border-surface-divider bg-surface-canvas text-text-secondary hover:border-surface-divider-strong hover:text-text-primary")
      }
    >
      {dot ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-accent" /> : null}
      {label}
    </button>
  );
}

function AccentChip({ color, name, active }: { color: string; name: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={name}
      className={
        "flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs font-medium transition-colors duration-fast ease-out-quint " +
        (active
          ? "border-brand-accent bg-surface-elevated text-text-primary"
          : "border-surface-divider bg-surface-canvas text-text-secondary hover:border-surface-divider-strong hover:text-text-primary")
      }
    >
      <span
        aria-hidden="true"
        className="h-3.5 w-3.5 rounded-full ring-1 ring-surface-divider-strong"
        style={{ background: color }}
      />
      {name}
    </button>
  );
}

function ToggleRow({
  label,
  hint,
  defaultChecked,
  disabled,
}: {
  label: string;
  hint: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-2xs text-text-muted">{hint}</div>
      </div>
      <Switch defaultChecked={defaultChecked ?? false} disabled={disabled} aria-label={label} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-text-muted">{k}</span>
      <span className="text-text-primary text-right">{v}</span>
    </div>
  );
}
