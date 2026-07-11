import { redirect } from "next/navigation";

import { getSession } from "@/server/auth";

import { Wizard } from "./Wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  // If you already have a session, you don't belong here.
  const existing = await getSession();
  if (existing) redirect("/inbox");

  return <Wizard />;
}
