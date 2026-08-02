#!/usr/bin/env node
/**
 * Phase 6 FINAL live gate: console + network sweep on the LIVE GH Pages deploy.
 * Every route at 390. Collects console errors, pageerrors, HTTP >=400 responses
 * (the classic base-path regression: media/audio/favicon 404s), failed requests.
 */
import { chromium } from "playwright";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const ROUTES = [
  "/", "/mansion", "/commissioners-office", "/barbershop", "/ferry",
  "/bakery", "/map", "/people", "/paintings", "/about",
];

const browser = await chromium.launch();
const report = [];

for (const route of ROUTES) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  const badResponses = [];
  const failedRequests = [];

  page.on("pageerror", (e) => errors.push(`[pageerror] ${String(e)}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[console.error] ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`);
  });
  page.on("requestfailed", (r) => {
    failedRequests.push(`${r.failure()?.errorText ?? "?"} ${r.url()}`);
  });

  try {
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
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
    await page.waitForTimeout(3000);
  } catch (e) {
    errors.push(`[goto] ${e.message.split("\n")[0]}`);
  }

  report.push({ route, errors, badResponses, failedRequests });
  await context.close();
}

await browser.close();

let errTotal = 0;
let httpTotal = 0;
for (const r of report) {
  errTotal += r.errors.length;
  httpTotal += r.badResponses.length;
  const n = r.errors.length + r.badResponses.length + r.failedRequests.length;
  console.log(`\n[${n ? "!!" : "ok"}] ${r.route} @ 390`);
  for (const e of r.errors) console.log(`  ERROR ${e}`);
  for (const b of r.badResponses) console.log(`  HTTP  ${b}`);
  for (const f of r.failedRequests) console.log(`  FAIL  ${f}`);
}
console.log(
  `\n=== summary: ${errTotal} JS/console error(s), ${httpTotal} HTTP>=400 across ${report.length} routes ===`,
);
