// E2E for Sprint 3 — capture the dashboard / inbox state.
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
  await page.fill('input[id="workspaceName"]', "Acme Cloud");
  await page.fill('input[id="ownerName"]', "Riley Park");
  await page.fill('input[id="ownerEmail"]', "riley@acme.co");
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("SaaS")');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("11 – 50")');
  await page.click('label:has-text("Functional")');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("Ship faster")');
  await page.click('button:has-text("Build my workspace")');
  await page.waitForURL("**/inbox", { timeout: 15000 });

  // Initial dashboard (empty-ish)
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/dashboard-1-initial.png`, fullPage: true });

  // Quick-create a task
  await page.click('button:has-text("New task")');
  await page.waitForURL("**/work/**", { timeout: 15000 });
  await page.waitForTimeout(500);

  // Back to inbox
  await page.goto("http://localhost:3000/inbox", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/dashboard-2-with-task.png`, fullPage: true });

  // Use the AI bar to make a run
  await page.fill('input[placeholder*="Ask anything"]', "summarize the latest task");
  await page.click('button:has-text("Send")');
  await page.waitForTimeout(3000);

  // Go to inbox again to see the AI run
  await page.goto("http://localhost:3000/inbox", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/dashboard-3-with-ai.png`, fullPage: true });

  await browser.close();
  console.log("OK — dashboard E2E complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
