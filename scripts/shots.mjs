#!/usr/bin/env node
/**
 * The QA eye: Playwright screenshot matrix for every route × 3 viewports,
 * plus scroll-position shots on long pages. The acceptance instrument for
 * every phase (docs/PLAN.md).
 *
 * Usage:
 *   node scripts/shots.mjs <outdir> [--base http://localhost:4321] [--routes /,/map]
 *   node scripts/shots.mjs docs/qa/phase0
 *   node scripts/shots.mjs docs/qa/phase6-live --base https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial
 *
 * Output: <outdir>/<route-slug>--<viewport>[--scrollN].png
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/qa/adhoc";
function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ROUTES = flag(
  "routes",
  "/,/mansion,/commissioners-office,/barbershop,/ferry,/bakery,/map,/people,/paintings,/about",
).split(",");
const SCROLLS = Number(flag("scrolls", "3")); // extra shots per long page
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

mkdirSync(outdir, { recursive: true });

const browser = await chromium.launch();
const failures = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  for (const route of ROUTES) {
    const slug = route === "/" ? "home" : route.replace(/\//g, "");
    const url = BASE + route;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(2500); // maps/fonts/motion settle
      await page.screenshot({ path: join(outdir, `${slug}--${vp.name}.png`) });

      // Scroll-position shots on long pages
      const docH = await page.evaluate(() => document.body.scrollHeight);
      const vh = vp.height;
      if (docH > vh * 1.5 && SCROLLS > 0) {
        for (let s = 1; s <= SCROLLS; s++) {
          const y = Math.round(((docH - vh) * s) / SCROLLS);
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await page.waitForTimeout(1200);
          await page.screenshot({
            path: join(outdir, `${slug}--${vp.name}--scroll${s}.png`),
          });
        }
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      console.log(`✓ ${slug} @ ${vp.name}`);
    } catch (e) {
      failures.push(`${slug} @ ${vp.name}: ${e.message.split("\n")[0]}`);
      console.error(`✗ ${slug} @ ${vp.name}: ${e.message.split("\n")[0]}`);
    }
  }
  if (consoleErrors.length) {
    console.error(`console errors @ ${vp.name}:\n  ` + consoleErrors.slice(0, 20).join("\n  "));
  }
  await context.close();
}

await browser.close();
if (failures.length) {
  console.error(`\n${failures.length} capture failure(s)`);
  process.exit(1);
}
console.log(`\nAll captures → ${outdir}`);
