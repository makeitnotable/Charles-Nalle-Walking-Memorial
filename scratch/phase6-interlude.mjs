// Phase 6 FINAL — painting interlude Ken Burns scrub on live /bakery
// 3 offsets through the band; read the img transform; CLS observer running.
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase6-motion";
fs.mkdirSync(OUT, { recursive: true });
const LIVE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(() => {
  window.__cls = 0;
  window.__clsEntries = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (!e.hadRecentInput) {
        window.__cls += e.value;
        if (e.value > 0.0005)
          window.__clsEntries.push({ value: +e.value.toFixed(4), t: Math.round(e.startTime) });
      }
    }
  }).observe({ type: "layout-shift", buffered: true });
});
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(LIVE + "/bakery", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);

const band = await p.evaluate(() => {
  const el = document.querySelector(".painting-interlude");
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.top + scrollY), height: Math.round(r.height) };
});
const vh = 800;
const positions = {
  "entering (band top at 75% vh)": band.top - vh * 0.75,
  "centered": band.top + band.height / 2 - vh / 2,
  "leaving (band bottom at 25% vh)": band.top + band.height - vh * 0.25,
};

const readImg = () =>
  p.evaluate(() => {
    const img = document.querySelector(".interlude-img");
    const t = getComputedStyle(img).transform;
    const m = t.match(/matrix\(([^)]+)\)/);
    const [a, , , d, , f] = m ? m[1].split(",").map(Number) : [1, 0, 0, 1, 0, 0];
    return { scale: +a.toFixed(3), translateY: +f.toFixed(1), naturalW: img.naturalWidth, complete: img.complete };
  });

let i = 1;
console.log("=== interlude scrub /bakery (live) ===");
for (const [label, y] of Object.entries(positions)) {
  await p.evaluate((yy) => window.scrollTo(0, yy), Math.round(y));
  await p.waitForTimeout(1100); // let scrub 0.6 catch up
  const st = await readImg();
  console.log(label.padEnd(32), JSON.stringify(st));
  await p.screenshot({ path: `${OUT}/interlude-bakery-${i}.png` });
  i++;
}
// jank probe: 20 small scroll steps through the band while counting long frames
const jank = await p.evaluate(async (bandTop) => {
  window.scrollTo(0, bandTop - 800);
  await new Promise((r) => setTimeout(r, 400));
  let longFrames = 0;
  let frames = 0;
  let last = performance.now();
  let done = false;
  const tick = (t) => {
    const dt = t - last;
    last = t;
    frames++;
    if (dt > 40) longFrames++;
    if (!done) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  for (let s = 0; s < 20; s++) {
    window.scrollBy(0, 70);
    await new Promise((r) => setTimeout(r, 80));
  }
  done = true;
  return { frames, longFrames };
}, band.top);
const cls = await p.evaluate(() => ({ cls: +window.__cls.toFixed(4), entries: window.__clsEntries.slice(0, 5) }));
console.log("jank probe:", JSON.stringify(jank));
console.log("page CLS incl. scrub pass:", JSON.stringify(cls));
console.log("pageerrors:", errs.length ? errs : "none");
await browser.close();
console.log("interlude done");
