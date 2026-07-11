// E2E for Sprint 4 — AI Console + Customers pipeline
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core/index.mjs";

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

  // Onboard
  await page.goto("http://localhost:3000/onboarding", { waitUntil: "networkidle" });
  await page.fill('input[id="workspaceName"]', "Atlas & Co.");
  await page.fill('input[id="ownerName"]', "Sam Cohen");
  await page.fill('input[id="ownerEmail"]', "sam@atlas.co");
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("Consulting")');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("2 – 10")');
  await page.click('label:has-text("Pods")');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("Win more clients")');
  await page.click('button:has-text("Build my workspace")');
  await page.waitForURL("**/inbox", { timeout: 15000 });

  // Customers — empty
  await page.goto("http://localhost:3000/customers", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/customers-1-empty.png`, fullPage: true });

  // Create 3 customers at different stages
  const customers = [
    { name: "Meridian Bank", company: "Meridian", value: "45000", stage: "qualified" },
    { name: "Helios Group", company: "Helios", value: "12000", stage: "lead" },
    { name: "Vega Labs", company: "Vega", value: "88000", stage: "proposal" },
  ];
  for (const c of customers) {
    await page.click('button:has-text("+ New customer")');
    await page.waitForTimeout(300);
    await page.fill('input[id="cname"]', c.name);
    await page.fill('input[id="ccompany"]', c.company);
    await page.fill('input[id="cvalue"]', c.value);
    await page.selectOption('select[id="cstage"]', c.stage);
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(700);
  }

  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/customers-2-pipeline.png`, fullPage: true });

  // AI Console — make a summary run
  await page.goto("http://localhost:3000/ai?tab=Console", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/ai-1-console-empty.png`, fullPage: true });

  await page.click('label:has-text("Summarize")');
  await page.fill('textarea[id="prompt"]', "Summarize the current pipeline state: 3 active customers across lead, qualified, and proposal stages.");
  await page.click('button:has-text("Run")');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/ai-2-console-result.png`, fullPage: true });

  // Activity tab
  await page.goto("http://localhost:3000/ai?tab=Activity", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/ai-3-activity.png`, fullPage: true });

  // Approvals tab
  await page.goto("http://localhost:3000/ai?tab=Approvals", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/ai-4-approvals.png`, fullPage: true });

  // Memory tab
  await page.goto("http://localhost:3000/ai?tab=Memory", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/ai-5-memory.png`, fullPage: true });

  await browser.close();
  console.log("OK — AI + Customers E2E complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
