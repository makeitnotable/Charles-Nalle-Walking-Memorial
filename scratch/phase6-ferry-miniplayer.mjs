import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const OUT = fileURLToPath(new URL("../docs/qa/phase6-ux/", import.meta.url));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto(BASE + "/ferry", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);
const play = page.locator('button[aria-label^="Play narration"]').first();
await play.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await play.tap();
await page.waitForTimeout(1200);
await page.evaluate(() => scrollBy(0, 1400));
await page.waitForTimeout(1000);
const mini = await page.evaluate(() => {
  const els = [...document.querySelectorAll("body *")].filter((e) => {
    const cs = getComputedStyle(e);
    if (cs.position !== "fixed") return false;
    const r = e.getBoundingClientRect();
    return r.width > 200 && r.height > 40 && /narration|CHAPTER/i.test(e.innerText || "");
  });
  return els.map((e) => {
    const r = e.getBoundingClientRect();
    return { text: (e.innerText || "").slice(0, 60).replace(/\n/g, " / "), left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
      visibleInVV: r.top < 844 && r.bottom > 0 && r.left < 390 && r.right > 0,
      fullyInVV: r.top >= 0 && r.bottom <= 844 && r.left >= 0 && r.right <= 390 };
  });
});
console.log("[MINI] ferry mini-player while playing+scrolled:", JSON.stringify(mini, null, 1));
console.log("[MINI] audio playing:", await page.evaluate(() => [...document.querySelectorAll("audio")].some((a) => !a.paused)));
await page.screenshot({ path: OUT + "fC2-ferry-miniplayer.png" });
await browser.close();
