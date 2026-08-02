import { chromium } from "playwright";
const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(9000);
const geom = await page.evaluate(() => {
  const m = [...document.querySelectorAll(".mapboxgl-marker")].find((m) => /Ferry/.test(m.getAttribute("aria-label") || ""));
  const p = m.querySelector("p"); // "Ferry Landing" label text
  const pill = p.closest("div");
  const r = pill.getBoundingClientRect();
  const hintP = [...document.querySelectorAll("p")].find((q) => /Drag to explore/.test(q.textContent));
  const hr = hintP.closest("div").getBoundingClientRect();
  return { pill: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) }, hintTop: Math.round(hr.top) };
});
console.log("[T2] ferry LABEL pill:", JSON.stringify(geom));
const cx = geom.pill.x + geom.pill.w / 2, cy = geom.pill.y + geom.pill.h / 2;
console.log("[T2] tapping label-pill dead center:", cx, cy, "| gap pill-bottom -> hint-top:", geom.hintTop - geom.pill.bottom);
await page.touchscreen.tap(cx, cy);
await page.waitForTimeout(2500);
console.log("[T2] result URL search:", JSON.stringify(await page.evaluate(() => location.search)), "| hint still present:", await page.evaluate(() => !![...document.querySelectorAll("p")].find((q) => /Drag to explore/.test(q.textContent))));
await browser.close();
