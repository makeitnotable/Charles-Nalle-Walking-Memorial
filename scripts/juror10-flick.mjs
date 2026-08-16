// Phone card strip: fast flick vs slow nudge, sampled per frame
import { launch, ctx, VIEWPORTS, BASE, sleep, shot } from "./juror10-lib.mjs";
const vpKey = process.argv[2] || "p390";
const vp = VIEWPORTS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
await page.goto(BASE + "/map", { waitUntil: "networkidle" });
await sleep(3500);
const twk = page.locator("button:visible", { hasText: "Take the walk" }).first();
const tb = await twk.boundingBox();
await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
await sleep(7000);
const active = () => page.evaluate(() => { const c = document.querySelector('[aria-label^="Enter Spot"]'); return c ? c.getAttribute("aria-label").slice(0, 25) + " left=" + Math.round(c.getBoundingClientRect().left) : null; });
const strip = await page.evaluate(() => { const cards = [...document.querySelectorAll('[aria-label^="Focus Spot"], [aria-label^="Enter Spot"]')]; const rs = cards.map((c) => c.getBoundingClientRect()); return { top: Math.min(...rs.map((r) => r.top)), bottom: Math.max(...rs.map((r) => r.bottom)) }; });
const cy = (strip.top + strip.bottom) / 2, cx = vp.width / 2;
const cdp = await page.context().newCDPSession(page);
async function gesture(dx, ms, steps) {
  const start = { x: cx + dx / 2, y: cy };
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: start.x, y: start.y }] });
  const t0 = performance.now();
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x - (dx * i) / steps, y: cy }] });
    const target = t0 + (ms * i) / steps; while (performance.now() < target) { /* spin */ }
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
async function sample(ms) {
  return page.evaluate(async (ms) => {
    const out = []; const t0 = performance.now();
    while (performance.now() - t0 < ms) { const cs = [...document.querySelectorAll('[aria-label^="Focus Spot"], [aria-label^="Enter Spot"]')]; out.push(cs.map((c) => Math.round(c.getBoundingClientRect().left)).join("/")); await new Promise((r) => requestAnimationFrame(r)); }
    return out;
  }, ms);
}
console.log("before flick:", await active());
const center0 = await page.evaluate(() => JSON.stringify(document.querySelector(".mapboxgl-canvas").getBoundingClientRect()));
await gesture(140, 90, 8);
const s1 = await sample(900);
console.log("flick samples (card lefts):", s1.filter((_, i) => i % 3 === 0).join(" | "));
console.log("after flick:", await active());
await sleep(1500);
console.log("after flick +1.5s:", await active());
await shot(page, `flick-after-${vpKey}`);
// slow nudge 20px
const mapCenterBefore = await page.evaluate(() => { const c = document.querySelector(".mapboxgl-canvas"); return c.toDataURL ? null : null; });
await gesture(20, 400, 20);
const s2 = await sample(900);
console.log("nudge samples:", s2.filter((_, i) => i % 3 === 0).join(" | "));
console.log("after nudge:", await active());
await sleep(1500);
console.log("after nudge +1.5s:", await active());
// bigger flick backwards
await gesture(-160, 120, 10);
const s3 = await sample(900);
console.log("back-flick samples:", s3.filter((_, i) => i % 3 === 0).join(" | "));
console.log("after back-flick:", await active());
await browser.close();
