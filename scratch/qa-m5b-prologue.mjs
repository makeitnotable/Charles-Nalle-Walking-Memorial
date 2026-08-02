import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:4321/map", { waitUntil: "domcontentloaded" });
const t0 = Date.now();
for (const at of [800, 2000, 3500, 5000, 7000]) {
  const wait = at - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `docs/qa/phase23-motion/map-prologue-${at}ms.png` });
}
await browser.close();
console.log("prologue captured");
