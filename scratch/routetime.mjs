import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:4321/map", { waitUntil: "domcontentloaded" });
const t0 = Date.now();
for (let i = 0; i < 10; i++) {
  await p.waitForTimeout(1000);
  // Count orange-ish route pixels in a band between the stops
  const n = await p.evaluate(() => {
    const cv = document.querySelector("canvas");
    if (!cv) return -1;
    return cv.width + "x" + cv.height;
  });
  await p.screenshot({ path: `scratch/rt-${i + 1}s.png`, clip: { x: 560, y: 150, width: 400, height: 600 } });
  console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s canvas=${n}`);
}
await b.close();
