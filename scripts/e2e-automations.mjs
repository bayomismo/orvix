// E2E for Sprint 5 — automations
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
  await page.fill('input[id="workspaceName"]', "Vector Labs");
  await page.fill('input[id="ownerName"]', "Alex Kim");
  await page.fill('input[id="ownerEmail"]', "alex@vector.co");
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

  // Visit automations
  await page.goto("http://localhost:3000/admin/automations", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/automations-1-defaults.png`, fullPage: true });

  // Create a customer — should trigger "Greet new leads" automation
  await page.goto("http://localhost:3000/customers", { waitUntil: "networkidle" });
  await page.click('button:has-text("+ New customer")');
  await page.waitForTimeout(300);
  await page.fill('input[id="cname"]', "Acme Corp");
  await page.fill('input[id="ccompany"]', "Acme");
  await page.fill('input[id="cvalue"]', "50000");
  await page.selectOption('select[id="cstage"]', "qualified");
  await page.click('button:has-text("Create")');
  await page.waitForURL("**/work/**", { timeout: 15000 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/automations-2-triggered.png`, fullPage: true });

  // Check that the comment was added
  const commentCount = await page.locator('text=Welcome').count();
  console.log("Welcome comment count:", commentCount);

  // Back to automations — should show the rule ran
  await page.goto("http://localhost:3000/admin/automations", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/automations-3-ran.png`, fullPage: true });

  // Toggle one off
  const firstToggle = page.locator('button[role="switch"]').first();
  await firstToggle.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/automations-4-toggled.png`, fullPage: true });

  // Create a new rule via the dialog
  await page.click('button:has-text("+ New automation")');
  await page.waitForTimeout(300);
  await page.fill('input[id="rname"]', "Notify when task is blocked");
  await page.click('label:has-text("Status changed")');
  await page.fill('input[id="cfield"]', "status");
  await page.fill('input[id="cvalue"]', "blocked");
  await page.click('label:has-text("Send to inbox")');
  await page.fill('textarea[id="abody"]', "A task is blocked and needs attention.");
  await page.screenshot({ path: `${OUT}/automations-5-builder.png`, fullPage: true });
  await page.click('button:has-text("Create rule")');
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/automations-6-after-create.png`, fullPage: true });

  await browser.close();
  console.log("OK — automations E2E complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
