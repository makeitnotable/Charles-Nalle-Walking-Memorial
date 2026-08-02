// Verify /map hydration CLS after the shell reservation + bakery embed settle
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:4321/map", { waitUntil: "networkidle" });
await page.waitForTimeout(5000);
const cls = await page.evaluate(
  () =>
    new Promise((resolve) => {
      let total = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) total += e.value;
      }).observe({ type: "layout-shift", buffered: true });
      setTimeout(() => resolve(total), 800);
    }),
);
console.log("map CLS:", cls.toFixed(4));
// bakery embed settle check
const p2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p2.goto("http://localhost:4321/bakery", { waitUntil: "networkidle" });
await p2.evaluate(() => document.querySelector(".embed-map-shell")?.scrollIntoView({ block: "center" }));
await p2.waitForTimeout(8000);
const shell = await p2.locator(".embed-map-shell").screenshot({ path: "docs/qa/phase3/embed-bakery-settled.png" });
console.log("embed captured");
await browser.close();
