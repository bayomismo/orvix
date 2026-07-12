/**
 * Seed a workspace with sample work items, AI runs, and inbox items
 * for visual demo screenshots.
 *
 * Usage:
 *   cookie=$(curl -s -i -X POST http://localhost:3301/api/dev/bootstrap -d '...' | grep set-cookie | sed ...)
 *   node scripts/seed-workspace.mjs "$cookie"
 */
const BASE = process.env.ORVIX_BASE_URL ?? "http://localhost:3301";
const COOKIE = process.argv[2];

if (!COOKIE) {
  console.error("Usage: node scripts/seed-workspace.mjs <cookie>");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  Cookie: `orvix_session=${COOKIE}`,
};

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

async function main() {
  // Customers
  const customers = [
    { name: "Sam Patel", company: "Pinewood Labs", dealValue: 8500, stage: "lead" },
    { name: "Casey Rivera", company: "Northwind Studio", dealValue: 24000, stage: "qualified" },
    { name: "Jordan Lee", company: "Acme Holdings", dealValue: 78000, stage: "proposal" },
    { name: "Morgan Chen", company: "Helix Robotics", dealValue: 120000, stage: "qualified" },
  ];
  for (const c of customers) {
    const r = await post("/customers", {
      clientRequestId: crypto.randomUUID(),
      ...c,
    });
    if (!r.data?.ok) console.error("customer failed:", r.data);
  }
  console.log("Customers:", customers.length);

  // Work items of various types
  const items = [
    { typeKey: "task", title: "Approve the new pricing matrix", status: "blocked", priority: "urgent" },
    { typeKey: "task", title: "Q3 launch landing page", status: "in_progress", priority: "high" },
    { typeKey: "project", title: "Onboarding revamp", status: "in_progress", priority: "normal" },
    { typeKey: "conversation", title: "Email: Casey — pricing", status: "in_progress", priority: "high" },
    { typeKey: "request", title: "Procurement: vendor onboarding", status: "in_progress", priority: "normal" },
    { typeKey: "document", title: "Q3 product brief", status: "done", priority: "normal" },
    { typeKey: "task", title: "Review Q2 customer interviews", status: "in_review", priority: "high" },
    { typeKey: "deal", title: "Northwind — Q4 expansion", status: "backlog", priority: "normal" },
    { typeKey: "task", title: "Update brand guidelines", status: "backlog", priority: "low" },
  ];
  for (const it of items) {
    const r = await post("/work", {
      clientRequestId: crypto.randomUUID(),
      ...it,
    });
    if (!r.data?.ok) console.error("item failed:", r.data);
  }
  console.log("Work items:", items.length);
}

main().catch(console.error);
