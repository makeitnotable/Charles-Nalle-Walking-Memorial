import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const bad = [];
page.on("response", r => { if (r.status() >= 400) bad.push(r.status() + " " + r.url()); });
page.on("requestfailed", r => bad.push("FAILED " + r.url() + " " + r.failure()?.errorText));
await page.goto("https://rewildyourself.com/", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(8000);
console.log(bad.join("\n") || "no failures");
// loader state
const loader = await page.evaluate(() => {
  const els = [...document.querySelectorAll('[class*="loader"],[class*="loading"],[class*="preload"],[class*="intro"]')].map(el => ({
    cls: String(el.className).slice(0, 70),
    display: getComputedStyle(el).display, opacity: getComputedStyle(el).opacity,
    pe: getComputedStyle(el).pointerEvents,
    h: Math.round(el.getBoundingClientRect().height),
  }));
  return { els, htmlCls: document.documentElement.className, bodyCls: document.body.className };
});
console.log(JSON.stringify(loader, null, 2));
await browser.close();
