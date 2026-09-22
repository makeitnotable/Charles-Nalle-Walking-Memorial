import { chromium, devices } from "playwright";
const browser = await chromium.launch({ args: ["--use-gl=angle"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices["Pixel 5"].userAgent });
const page = await ctx.newPage();
await ctx.addInitScript(() => { const st = document.createElement("style"); st.textContent = "astro-dev-toolbar{display:none !important}"; document.addEventListener("DOMContentLoaded", () => document.head.appendChild(st)); });
async function touchDrag(page, x1, y1, x2, y2, steps = 12, ms = 250) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x1, y: y1, id: 1 }] });
  for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x1 + ((x2 - x1) * i) / steps, y: y1 + ((y2 - y1) * i) / steps, id: 1 }] }); await page.waitForTimeout(ms / steps); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
await page.goto("http://localhost:4321/paintings", { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__museum, null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);
const st = () => page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const w = b.closest(".cnwm-menu"); const s = [...document.querySelectorAll("button")].find((x) => /Skip/.test(x.textContent)); const br = b.getBoundingClientRect(); const sr = s ? s.getBoundingClientRect() : null; return { sy: Math.round(scrollY), burger: { y: Math.round(br.y), h: Math.round(br.height), wrapOp: getComputedStyle(w).opacity }, skip: sr ? { x: Math.round(sr.x), y: Math.round(sr.y), w: Math.round(sr.width), h: Math.round(sr.height) } : null }; });
console.log("0", JSON.stringify(await st()));
await touchDrag(page, 100, 700, 100, 200, 10, 250); await page.waitForTimeout(700);
console.log("after 1 swipe up", JSON.stringify(await st()));
await touchDrag(page, 100, 700, 100, 200, 10, 250); await page.waitForTimeout(700);
console.log("after 2 swipes", JSON.stringify(await st()));
await touchDrag(page, 100, 300, 100, 450, 10, 250); await page.waitForTimeout(900);
console.log("after small swipe down (scroll up)", JSON.stringify(await st()));
await page.screenshot({ path: "docs/v7/qa/uxwalk-phone/paintings-390-08-burger-vs-skip.png" });
await browser.close();
