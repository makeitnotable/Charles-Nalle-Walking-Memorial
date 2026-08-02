import { chromium } from "playwright";
const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto(BASE + "/ferry", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3500);
const wide = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 391 || r.right > 391) {
      const cs = getComputedStyle(el);
      out.push({
        tag: el.tagName, cls: (el.className + "").slice(0, 70),
        text: (el.innerText || "").trim().slice(0, 40).replace(/\n/g, " / "),
        w: Math.round(r.width), right: Math.round(r.right), left: Math.round(r.left), top: Math.round(r.top + scrollY),
        ws: cs.whiteSpace, minW: cs.minWidth,
      });
    }
  }
  // narrow to leaf offenders (no wide children)
  return out.slice(0, 40);
});
console.log(JSON.stringify(wide, null, 1));
await browser.close();
