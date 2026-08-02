import { chromium } from "playwright";
const browser = await chromium.launch();

// A: plain mousedown (tap, no drag) at 1.5s into the prologue
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("http://localhost:4321/map", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.mouse.move(640, 400);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "docs/qa/phase23-motion/map-skip-tap.png" });
  await page.close();
}
// B: small drag at 1.5s into the prologue
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("http://localhost:4321/map", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.mouse.move(640, 400);
  await page.mouse.down();
  await page.mouse.move(660, 410, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "docs/qa/phase23-motion/map-skip-drag.png" });
  await page.close();
}
await browser.close();
console.log("skip probes captured");
