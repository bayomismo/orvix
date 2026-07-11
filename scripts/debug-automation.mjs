// Debug automation trigger
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core/index.mjs";

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

  page.on("console", (msg) => {
    if (msg.text().includes("automations")) console.log("CONSOLE:", msg.text());
  });
  page.on("pageerror", (err) => console.log("PAGEERR:", err.message));

  await page.goto("http://localhost:3000/onboarding", { waitUntil: "networkidle" });
  await page.fill('input[id="workspaceName"]', "Test Co.");
  await page.fill('input[id="ownerName"]', "Tester");
  await page.fill('input[id="ownerEmail"]', "tester@t.co");
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("SaaS")');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("2 – 10")');
  await page.click('label:has-text("Functional")');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(300);
  await page.click('label:has-text("Reduce overhead")');
  await page.click('button:has-text("Build my workspace")');
  await page.waitForURL("**/inbox", { timeout: 15000 });

  await page.goto("http://localhost:3000/customers", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.click('button:has-text("+ New customer")');
  await page.waitForTimeout(300);
  await page.fill('input[id="cname"]', "Trigger Test");
  await page.fill('input[id="ccompany"]', "TT");
  await page.fill('input[id="cvalue"]', "5000");
  await page.selectOption('select[id="cstage"]', "lead");
  await page.click('button:has-text("Create")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "/workspace/orvix/docs/screenshots/debug-auto.png", fullPage: true });
  console.log("URL after create:", page.url());

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
