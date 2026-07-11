/**
 * Screenshot the live Vercel deployment with proper cookie injection.
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";

const SESSION = process.env.SESSION;
const BASE = process.env.BASE ?? "https://orvix-two.vercel.app";
const OUT = "/workspace/orvix/docs/screenshots/v1.0/_vercel";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { id: "dashboard", path: "/inbox", wait: 2000 },
  { id: "work", path: "/work", wait: 2000 },
  { id: "customer", path: "/customers", wait: 2000 },
  { id: "ai", path: "/ai", wait: 2000 },
  { id: "reports", path: "/reports", wait: 2000 },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
  executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
  extraHTTPHeaders: {
    Cookie: SESSION ? `orvix_session=${SESSION}` : "",
  },
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (msg) => { if (msg.type() === "error") errors.push("CONSOLE: " + msg.text().slice(0, 200)); });

for (const p of PAGES) {
  console.log(`→ ${p.id} (${p.path})`);
  try {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch (e) { console.log("  nav err:", e.message); }
  await page.waitForTimeout(p.wait);
  await page.screenshot({ path: `${OUT}/${p.id}.png`, fullPage: false });

  if (p.id === "dashboard") {
    const check = await page.evaluate(() => {
      const sidebar = document.querySelector("aside[aria-label='Primary']");
      const topbar = document.querySelector("input[placeholder*='Search']");
      const orb = document.querySelector("[aria-label='Open AI Assistant']");
      return {
        hasSidebar: !!sidebar,
        sidebarText: sidebar ? sidebar.innerText.split("\n").slice(0, 15) : null,
        hasTopbar: !!topbar,
        hasOrb: !!orb,
        bodyClass: document.documentElement.className,
        bodyDataTheme: document.documentElement.getAttribute("data-theme"),
        title: document.querySelector("h1")?.textContent ?? null,
      };
    });
    console.log("DOM check:", JSON.stringify(check, null, 2));
  }
}

console.log("Errors:", errors);
await browser.close();
console.log("Done.");
