// M1b — fail-open: stall the destination request (hung load). The old page
// stays visible during the provisional load; the curtain must release itself.
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase23-motion";
fs.mkdirSync(OUT, { recursive: true });
const B = "http://localhost:4321";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const stalled = [];
await page.route("**/map", (route) => stalled.push(route)); // never continue

await page.goto(B + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const state = () =>
  page.evaluate(() => {
    const p = document.getElementById("curtain-panel");
    const r = p.getBoundingClientRect();
    return {
      covering: r.top <= 2 && r.bottom >= innerHeight - 2,
      panelTop: Math.round(r.top),
      pe: p.style.pointerEvents,
      flag: sessionStorage.getItem("cnwm-curtain"),
      path: location.pathname,
    };
  });

const t0 = Date.now();
await page.click('a[href="/map"]');
await page.waitForTimeout(1000);
const covered = await state();
console.log("covered@" + (Date.now() - t0) + "ms:", JSON.stringify(covered));
await page.screenshot({ path: `${OUT}/failopen-covered.png` });

await page.waitForTimeout(4200); // fail-open fires at 4000ms
const released = await state();
console.log("released@" + (Date.now() - t0) + "ms:", JSON.stringify(released));
await page.screenshot({ path: `${OUT}/failopen-released.png` });

// is the page interactive again? (menu burger clickable)
const hit = await page.evaluate(() => {
  const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
  return el?.tagName + " / " + (el?.className?.toString().slice(0, 50) ?? "");
});
console.log("elementFromPoint(center):", hit);
for (const r of stalled) await r.abort().catch(() => {});
await browser.close();
console.log("M1b done");
