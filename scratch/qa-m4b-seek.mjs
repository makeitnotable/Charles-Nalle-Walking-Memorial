import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:4321/bakery", { waitUntil: "networkidle" });
await page.evaluate(() => document.querySelector("audio")?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(1500); // hydration
await page.evaluate(() => document.querySelector('p[data-timing="2"]')?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(300);
await page.click('p[data-timing="2"]', { position: { x: 40, y: 10 } });
await page.waitForTimeout(1200);
const st = await page.evaluate(() => {
  const a = document.querySelector("audio");
  const active = document.querySelector(".narration-active");
  return {
    time: +a.currentTime.toFixed(2),
    paused: a.paused,
    activeTiming: active?.getAttribute("data-timing"),
    activeText: active?.textContent.trim().slice(0, 40),
  };
});
console.log(JSON.stringify(st));
await page.screenshot({ path: "docs/qa/phase23-motion/player-para-seek.png" });
await browser.close();
