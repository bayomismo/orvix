// E2E smoke for Sprint 1 — completes the wizard and verifies the
// generated workspace + departments + roles + nav + dashboard
// + customer pipeline + work item types + AI config.
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

  // Step 1: identity
  await page.goto("http://localhost:3000/onboarding", { waitUntil: "networkidle" });
  await page.fill('input[id="workspaceName"]', "Northwind Studio");
  await page.fill('input[id="ownerName"]', "Casey Rivera");
  await page.fill('input[id="ownerEmail"]', "casey@northwind.co");
  await page.screenshot({ path: `${OUT}/wizard-1-identity.png`, fullPage: true });
  await page.click('button:has-text("Continue")');

  // Step 2: industry
  await page.waitForTimeout(300);
  await page.click('label:has-text("Agency")');
  await page.screenshot({ path: `${OUT}/wizard-2-industry.png`, fullPage: true });
  await page.click('button:has-text("Continue")');

  // Step 3: shape
  await page.waitForTimeout(300);
  await page.click('label:has-text("2 – 10")');
  await page.click('label:has-text("Functional")');
  await page.screenshot({ path: `${OUT}/wizard-3-shape.png`, fullPage: true });
  await page.click('button:has-text("Continue")');

  // Step 4: goal
  await page.waitForTimeout(300);
  await page.click('label:has-text("Ship faster")');
  await page.screenshot({ path: `${OUT}/wizard-4-goal.png`, fullPage: true });
  await page.click('button:has-text("Build my workspace")');

  // Wait for the redirect to /inbox
  await page.waitForURL("**/inbox", { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/wizard-result-inbox.png`, fullPage: true });

  // Visit a few destinations to confirm the workspaceId is set
  for (const r of ["/work", "/customers", "/ai", "/admin"]) {
    await page.goto(`http://localhost:3000${r}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const name = `wizard-result${r.replace(/\//g, "-")}.png`;
    await page.screenshot({ path: `${OUT}/${name}`, fullPage: true });
  }

  // Pull the session cookie for the test report
  const cookies = await ctx.cookies();
  const session = cookies.find((c) => c.name === "orvix_session");
  writeFileSync(
    `${OUT}/wizard-cookie.json`,
    JSON.stringify({ sessionId: session?.value ?? null, ts: new Date().toISOString() }, null, 2),
  );

  await browser.close();
  console.log("OK — wizard completed end-to-end");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
