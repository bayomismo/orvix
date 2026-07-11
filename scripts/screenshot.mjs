// Phase 0 v0.3 visual review — capture every destination page.
// Onboards first to establish a session, then snapshots all 7 destinations
// + the marketing landing + the onboarding wizard.
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core/index.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "/workspace/orvix/docs/screenshots/v0.3";
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { name: "03-inbox",            path: "/inbox" },
  { name: "04-work-list",        path: "/work" },
  { name: "05-customers",        path: "/customers" },
  { name: "06-ai",               path: "/ai" },
  { name: "07-reports",          path: "/reports" },
  { name: "08-settings",         path: "/settings" },
  { name: "09-admin",            path: "/admin" },
  { name: "10-admin-automations", path: "/admin/automations" },
];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 0) Capture the marketing landing first (no session).
  console.log("[BOOT] Capturing marketing surfaces (no session) …");
  try {
    const resp = await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(OUT, "01-landing.png"), fullPage: true });
    console.log(`[OK] / (landing) -> ${resp ? resp.status() : "?"}`);
  } catch (e) {
    console.error(`[FAIL] /: ${e.message}`);
  }

  // The onboarding wizard requires no session, capture it now.
  try {
    const resp = await page.goto("http://localhost:3000/onboarding", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(OUT, "02-onboarding.png"), fullPage: true });
    console.log(`[OK] /onboarding -> ${resp ? resp.status() : "?"}`);
  } catch (e) {
    console.error(`[FAIL] /onboarding: ${e.message}`);
  }

  // 1) Bootstrap a session via the dev API (sets cookie).
  console.log("[BOOT] Bootstrap via /api/dev/bootstrap …");
  const boot = await context.request.post("http://localhost:3000/api/dev/bootstrap", {
    data: {
      workspaceName: "Acme Holdings",
      ownerName: "Jordan Lee",
      ownerEmail: "jordan@acme.com",
      industry: "saas",
      companySize: "11-50",
      teamStructure: "functional",
      primaryGoal: "ship-faster",
    },
  });
  const bootJson = await boot.json();
  console.log("[BOOT] bootstrap response:", boot.status, bootJson);
  if (!bootJson.ok) {
    throw new Error("Bootstrap failed: " + JSON.stringify(bootJson));
  }
  // Verify cookie is set
  const cookies = await context.cookies("http://localhost:3000");
  console.log("[BOOT] cookies:", cookies.map((c) => c.name));
  // 2) Seed sample data so the surfaces have content
  console.log("[BOOT] Seeding sample work items …");
  const seed = await context.request.post("http://localhost:3000/api/dev/seed", { data: {} });
  const seedJson = await seed.json();
  console.log("[BOOT] seed response:", seed.status, seedJson);
  console.log("[BOOT] session ready.");

  const results = [];
  for (const r of ROUTES) {
    const url = `http://localhost:3000${r.path}`;
    const file = join(OUT, `${r.name}.png`);
    try {
      // Retry: pages may need warm-up compile time
      let resp = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
          break;
        } catch (e) {
          if (attempt === 2) throw e;
          await page.waitForTimeout(2000);
        }
      }
      await page.waitForTimeout(800);
      await page.screenshot({ path: file, fullPage: true });
      const status = resp ? resp.status() : "no-response";
      const title = await page.title();
      results.push({ name: r.name, path: r.path, status, title, file });
      console.log(`[OK] ${r.path} -> ${status} (${title})`);
    } catch (e) {
      results.push({ name: r.name, path: r.path, error: e.message, file });
      console.error(`[FAIL] ${r.path}: ${e.message}`);
    }
  }

  // Try a work item detail if any exist
  await page.goto("http://localhost:3000/work", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const firstItem = page.locator('a[href^="/work/"]').first();
  if (await firstItem.isVisible({ timeout: 1000 }).catch(() => false)) {
    const href = await firstItem.getAttribute("href");
    if (href) {
      const detail = join(OUT, "11-work-detail.png");
      try {
        await page.goto(`http://localhost:3000${href}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(400);
        await page.screenshot({ path: detail, fullPage: true });
        results.push({ name: "11-work-detail", path: href, status: 200, file: detail });
        console.log(`[OK] ${href} -> 200 (work-detail)`);
      } catch (e) {
        console.error(`[FAIL] work detail: ${e.message}`);
      }
    }
  }

  writeFileSync(join(OUT, "_index.json"), JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
