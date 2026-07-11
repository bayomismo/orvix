import { PageHeader } from "@/components/PageHeader";
import { Badge, Card, CardBody } from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getSession();
  if (!s) return null;
  const user = db.users.get(s.user.id);
  const w = s.workspace;
  const deptCount = [...db.departments.values()].filter((d) => d.workspaceId === w.id).length;
  const roleCount = [...db.roles.values()].filter((r) => r.workspaceId === w.id).length;
  const typeCount = [...db.workItemTypes.values()].filter((t) => t.workspaceId === w.id).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Workspace"
        title="Settings"
        subtitle="Identity, security, and the configuration of the runtime. Phase 1 deepens each panel."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardBody className="flex flex-col gap-3 p-5">
            <header className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                Workspace
              </h3>
              <Badge tone="success" size="sm" dot>Active</Badge>
            </header>
            <Row k="Name" v={w.name} />
            <Row k="Industry" v={<span className="capitalize">{w.industry}</span>} />
            <Row k="Owner" v={user?.displayName ?? "—"} />
            <Row k="Created" v={<span className="tabular-nums">{new Date(w.createdAt).toLocaleDateString()}</span>} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-3 p-5">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">
              Engine
            </h3>
            <Row k="Departments" v={<span className="tabular-nums">{deptCount}</span>} />
            <Row k="Roles" v={<span className="tabular-nums">{roleCount}</span>} />
            <Row k="Work item types" v={<span className="tabular-nums">{typeCount}</span>} />
            <Row k="AI assistant" v={<Badge tone="ai" size="sm" dot>Enabled</Badge>} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-3 p-5">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">
              Security
            </h3>
            <Row k="Auth" v="Auth.js (session cookie)" />
            <Row k="2FA" v={<Badge tone="warning" size="sm">Phase 1</Badge>} />
            <Row k="SSO" v={<Badge tone="warning" size="sm">Phase 1</Badge>} />
            <Row k="Tenant isolation" v={<Badge tone="success" size="sm" dot>RLS + extension</Badge>} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-3 p-5">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">
              Profile
            </h3>
            <Row k="Name" v={user?.displayName ?? "—"} />
            <Row k="Email" v={user?.email ?? "—"} />
            <Row k="Time zone" v={<span className="text-text-muted">Inherits browser</span>} />
          </CardBody>
        </Card>
      </div>
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
