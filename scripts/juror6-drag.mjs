// Card drag feel test at a viewport: several drags of different lengths/speeds; report which card lands and whether motion reverses.
import { launch, ctx, VPS, goto, shot, watch, sleep, touchDrag } from "./juror6-lib.mjs";
const vpName = process.argv[2] || "t768";
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/map"); await sleep(5000);
const walkBtn = page.locator("button:has-text('Take the walk'):visible").first();
await walkBtn.click(); await sleep(4000);
const state = () => page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(b => /stop the walk|continue|walk again/i.test(b.innerText || b.getAttribute("aria-label") || "")); const slides = [...document.querySelectorAll("[class*=keen-slider__slide]")].map(s => Math.round(s.getBoundingClientRect().left)); const active = [...document.querySelectorAll("[class*=keen-slider__slide]")].findIndex(s => { const r = s.getBoundingClientRect(); return r.left >= -5 && r.left < innerWidth / 2; }); const enter = [...document.querySelectorAll("button, a")].find(e => /^Enter Spot/.test(e.getAttribute("aria-label") || "")); return { btn: b && (b.innerText || b.getAttribute("aria-label")).trim(), first: slides[0], active: enter && enter.getAttribute("aria-label").slice(0, 25) }; });
const stripBox = await page.evaluate(() => { const s = [...document.querySelectorAll("[class*=keen-slider__slide]")].find(s => { const r = s.getBoundingClientRect(); return r.left >= 0 && r.left < innerWidth; }); const r = s.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
console.log("strip", JSON.stringify(stripBox), "state", JSON.stringify(await state()));
const y = stripBox.y + stripBox.h / 2;
async function run(label, dx, steps, stepMs) {
  const x0 = Math.min(vp.width - 30, stripBox.x + stripBox.w - 20);
  const before = await state();
  await touchDrag(page, { x: x0, y }, { x: x0 + dx, y }, steps, stepMs, 20);
  const samples = await page.evaluate(async () => { const out = []; const sl = document.querySelector("[class*=keen-slider__slide]"); for (let i = 0; i < 45; i++) { out.push(Math.round(sl.getBoundingClientRect().left)); await new Promise(r => requestAnimationFrame(r)); } return out; });
  await sleep(1400);
  const after = await state();
  // reversal: sign change in the deltas of samples
  let rev = 0; for (let i = 2; i < samples.length; i++) { const d1 = samples[i - 1] - samples[i - 2], d2 = samples[i] - samples[i - 1]; if (d1 * d2 < 0 && Math.abs(d2) > 1) rev++; }
  console.log(`${label}: dx=${dx} ${steps}x${stepMs}ms | ${before.active} -> ${after.active} | btn ${before.btn} -> ${after.btn} | reversals ${rev} | samples ${samples.slice(0, 20).join(",")}...${samples.slice(-3).join(",")}`);
}
await run("slow 20px", -20, 10, 30);
await run("half-card slow", -Math.round(stripBox.w * 0.45), 20, 30);
await run("half-card+ fast", -Math.round(stripBox.w * 0.6), 8, 12);
await run("full card", -Math.round(stripBox.w * 1.0), 16, 16);
await run("back one fast", 220, 8, 12);
await run("big flick", -Math.round(stripBox.w * 1.6), 10, 12);
console.log("errors", log.errors);
await browser.close();
