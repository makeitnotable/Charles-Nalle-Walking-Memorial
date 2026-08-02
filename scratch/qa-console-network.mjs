#!/usr/bin/env node
/**
 * Phase 2+3 QA smoke: console + network sweep.
 * Visits every route at 390 and 1440, collects console errors/warnings,
 * pageerrors, failed requests (4xx/5xx), and aborted/failed loads.
 * Mapbox events 204 is normal (and 204 is not a failure anyway).
 */
import { chromium } from "playwright";

const BASE = "http://localhost:4321";
const ROUTES = [
  "/", "/mansion", "/commissioners-office", "/barbershop", "/ferry",
  "/bakery", "/map", "/people", "/paintings", "/about",
];
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];

const browser = await chromium.launch();
const report = [];

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    const warnings = [];
    const badResponses = [];
    const failedRequests = [];

    page.on("pageerror", (e) => errors.push(`[pageerror] ${String(e)}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`[console.error] ${m.text()}`);
      if (m.type() === "warning") warnings.push(`[console.warn] ${m.text()}`);
    });
    page.on("response", (r) => {
      if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`);
    });
    page.on("requestfailed", (r) => {
      failedRequests.push(`${r.failure()?.errorText ?? "?"} ${r.url()}`);
    });

    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(3000);
      // scroll to bottom to hydrate client:visible islands and lazy media
      await page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y <= h; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, h);
      });
      await page.waitForTimeout(2500);
    } catch (e) {
      errors.push(`[goto] ${e.message.split("\n")[0]}`);
    }

    report.push({ route, vp: vp.name, errors, warnings, badResponses, failedRequests });
    await context.close();
  }
}

await browser.close();

let errTotal = 0;
for (const r of report) {
  const n = r.errors.length + r.badResponses.length + r.failedRequests.length;
  errTotal += r.errors.length;
  const flag = n || r.warnings.length ? "!!" : "ok";
  console.log(`\n[${flag}] ${r.route} @ ${r.vp}`);
  for (const e of r.errors) console.log(`  ERROR ${e}`);
  for (const w of r.warnings) console.log(`  WARN  ${w}`);
  for (const b of r.badResponses) console.log(`  HTTP  ${b}`);
  for (const f of r.failedRequests) console.log(`  FAIL  ${f}`);
}
console.log(`\n=== summary: ${errTotal} JS/console error(s) across ${report.length} page-loads ===`);
