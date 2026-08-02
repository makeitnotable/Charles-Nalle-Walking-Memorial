import { chromium } from "playwright";
const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(9000);
const geom = await page.evaluate(() => {
  const m = [...document.querySelectorAll(".mapboxgl-marker")].find((m) => /Ferry/.test(m.getAttribute("aria-label") || ""));
  // visible label pill = the element with the rounded bg (deepest div with text)
  const label = [...m.querySelectorAll("div")].map((d) => ({ d, r: d.getBoundingClientRect() })).sort((a, b) => a.r.height - b.r.height)[0];
  const hintP = [...document.querySelectorAll("p")].find((p) => /Drag to explore/.test(p.textContent));
  const hr = hintP.closest("div").getBoundingClientRect();
  return { pill: { x: Math.round(label.r.x), y: Math.round(label.r.y), w: Math.round(label.r.width), h: Math.round(label.r.height) }, hintTop: Math.round(hr.top) };
});
console.log("[T] ferry visible label pill:", JSON.stringify(geom));
const cx = geom.pill.x + geom.pill.w / 2, cy = geom.pill.y + geom.pill.h / 2;
console.log("[T] tapping visible-pill dead center:", cx, cy, "| clearance to hint top:", geom.hintTop - cy);
await page.touchscreen.tap(cx, cy);
await page.waitForTimeout(2500);
console.log("[T] result URL:", await page.evaluate(() => location.search), "| hint still present:", await page.evaluate(() => !![...document.querySelectorAll("p")].find((p) => /Drag to explore/.test(p.textContent))));
await browser.close();
