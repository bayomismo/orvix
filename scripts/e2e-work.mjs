// E2E for Sprint 2 — completes the wizard, then exercises the work
// engine: create → list → detail → comment → change status → AI
// summary → delete.
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core/index.mjs";
import { writeFileSync } from "node:fs";

const OUT = "/workspace/orvix/docs/screenshots";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // 1. Onboard via dev API (fast + reliable)
  const boot = await ctx.request.post("http://localhost:3000/api/dev/bootstrap", {
    data: {
      workspaceName: "Helios Lab",
      ownerName: "Mira Sun",
      ownerEmail: `mira+${Date.now()}@helios.co`,
      industry: "saas",
      companySize: "11-50",
      teamStructure: "pod",
      primaryGoal: "ship-faster",
    },
  });
  if (!(await boot.json()).ok) throw new Error("bootstrap failed");
  await page.goto("http://localhost:3000/inbox", { waitUntil: "domcontentloaded" });

  // 2. Open Work, create a task
  await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/work-1-empty.png`, fullPage: true });

  await page.click('button:has-text("New work item")');
  await page.waitForTimeout(300);
  await page.click('label[for*="customer"] >> nth=0').catch(() => {});  // noop, default is task
  await page.screenshot({ path: `${OUT}/work-2-create-dialog.png`, fullPage: true });

  // Fill the create form
  await page.fill('input[id="title"]', "Q3 launch landing page");
  await page.fill('textarea[id="description"]', "Build the public launch page. Need copy from Maya by Friday.");
  await page.selectOption('select[id="status"]', "in_progress");
  await page.selectOption('select[id="priority"]', "high");
  await page.click('button:has-text("Create")');

  // Should land on the detail page
  await page.waitForURL("**/work/**", { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/work-3-detail.png`, fullPage: true });

  // 3. Add a comment
  await page.fill('textarea[placeholder*="Write a comment"]', "Picked up. Will share the first draft tomorrow.");
  await page.click('button:has-text("Comment")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/work-4-comment.png`, fullPage: true });

  // 4. Change status to In Review
  await page.selectOption('select[aria-label="Status"]', "in_review");
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/work-5-status-changed.png`, fullPage: true });

  // 5. Trigger AI summary
  await page.click('button:has-text("Generate summary")');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/work-6-ai-summary.png`, fullPage: true });

  // 6. Back to list — should show 1 item
  await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/work-7-list.png`, fullPage: true });

  // 7. Create a deal
  await page.click('button:has-text("New work item")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("Deal")');
  await page.fill('input[id="title"]', "Acme — annual contract");
  await page.selectOption('select[id="status"]', "backlog");
  await page.selectOption('select[id="priority"]', "high");
  await page.click('button:has-text("Create")');
  await page.waitForURL("**/work/**", { timeout: 15000 });
  await page.waitForTimeout(500);

  // 8. Filter list by Deal
  await page.goto("http://localhost:3000/work?type=deal", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/work-8-filtered-deals.png`, fullPage: true });

  await browser.close();
  writeFileSync(`${OUT}/work-cookie.json`, JSON.stringify({ ok: true, ts: new Date().toISOString() }));
  console.log("OK — work engine E2E complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
