import { PageHeader } from "@/components/PageHeader";

import { getSession } from "@/server/auth";

import { listAutomations } from "./actions";
import { AutomationsClient } from "./AutomationsClient";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const s = await getSession();
  if (!s) return null;
  const rules = await listAutomations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Admin"
        title="Automations"
        subtitle="Trigger → condition → action. Phase 0 ships the four most common patterns; Phase 1 expands the grammar."
      />
      <AutomationsClient initial={rules} />
    </div>
  );
}
