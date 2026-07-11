// Debug: single customer creation
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

  page.on("console", (msg) => {
    console.log("CONSOLE:", msg.type(), msg.text());
  });
  page.on("pageerror", (err) => console.log("PAGEERR:", err.message));
  page.on("request", (r) => {
    if (r.method() === "POST") {
      console.log("NETWORK POST:", r.url(), r.headers()["next-action"] ?? "");
    }
  });
  page.on("response", (r) => {
    if (r.request().method() === "POST") {
      console.log("NETWORK POST RESP:", r.status(), r.url());
    }
  });

  await page.goto("http://localhost:3000/onboarding", { waitUntil: "networkidle" });
  await page.fill('input[id="workspaceName"]', "Test Co.");
  await page.fill('input[id="ownerName"]', "Tester");
  await page.fill('input[id="ownerEmail"]', "tester@test.co");
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

  await page.goto("http://localhost:3000/customers", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Click the trigger
  await page.click('button:has-text("+ New customer")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/debug-1-dialog-open.png`, fullPage: true });

  // Fill the fields
  await page.fill('input[id="cname"]', "Test Customer");
  await page.fill('input[id="ccompany"]', "Test Co");
  await page.fill('input[id="cvalue"]', "10000");
  await page.selectOption('select[id="cstage"]', "qualified");
  await page.screenshot({ path: `${OUT}/debug-2-filled.png`, fullPage: true });

  // Click Create
  const createBtn = page.locator('button:has-text("Create")').last();
  await createBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/debug-3-after-create.png`, fullPage: true });

  // Check current state
  const url = page.url();
  const visible = await page.locator('text=Test Customer').count();
  console.log("URL:", url);
  console.log("Test Customer visible count:", visible);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
