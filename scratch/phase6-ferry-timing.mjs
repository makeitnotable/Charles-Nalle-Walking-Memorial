import { chromium } from "playwright";
const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();
for (const path of ["/ferry", "/commissioners-office", "/barbershop"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  const t0 = Date.now();
  const samples = [];
  for (let i = 0; i < 8; i++) {
    const s = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, iw: innerWidth,
      fonts: document.fonts.status,
      widest: (() => { let w = 0, who = ""; for (const el of document.querySelectorAll("body *")) { const r = el.getBoundingClientRect(); if (r.right > w) { w = Math.round(r.right); who = el.tagName + "." + (el.className + "").slice(0, 40); } } return { right: w, who }; })(),
    })).catch(() => null);
    if (s) samples.push({ t: Date.now() - t0, ...s });
    await page.waitForTimeout(400);
  }
  console.log("=====", path);
  for (const s of samples) console.log(JSON.stringify(s));
  await ctx.close();
}
await browser.close();
