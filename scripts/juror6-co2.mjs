// CO: play part 2, then instant-scroll through the whole page and check a visible pause control exists at each stop.
import { launch, ctx, VPS, goto, shot, watch, sleep, save } from "./juror6-lib.mjs";

const vpName = process.argv[2] || "p390";
const which = process.argv[3] || "2"; // which part to play
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/commissioners-office");
await sleep(1500);
await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
const label = `Play narration: Commissioner’s Office, Pt ${which}`;
const btn = page.locator(`button[aria-label='${label}']`).first();
await btn.scrollIntoViewIfNeeded(); await sleep(500);
await btn.click(); await sleep(1500);
const VIS = () => [...document.querySelectorAll("button")].filter(b => /pause narration/i.test(b.getAttribute("aria-label") || "")).map(b => { const r = b.getBoundingClientRect(); let op = 1, e = b; while (e && e !== document.body) { const cs = getComputedStyle(e); op *= parseFloat(cs.opacity); if (cs.visibility === "hidden" || cs.display === "none") op = 0; e = e.parentElement; } return { t: b.getAttribute("aria-label").slice(-4), y: Math.round(r.top), w: Math.round(r.width), effOp: Math.round(op * 100) / 100, onscreen: r.top < innerHeight - 8 && r.bottom > 8 }; });
const docH = await page.evaluate(() => document.documentElement.scrollHeight);
const audio = () => page.evaluate(() => [...document.querySelectorAll("audio")].map(a => ({ p: a.paused, t: Math.round(a.currentTime) })));
console.log("audio:", JSON.stringify(await audio()));
const gaps = [];
for (let y = 0; y < docH; y += 400) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await sleep(700);
  const v = await page.evaluate(VIS);
  const vis = v.filter(x => x.onscreen && x.effOp > 0.5);
  const a = await audio();
  const playing = a.some(x => !x.p);
  if (playing && !vis.length) { gaps.push(y); if (gaps.length <= 3) await shot(page, `co2-${vpName}-pt${which}-gap-${y}`); }
  console.log(y, playing ? "PLAYING" : "paused", vis.map(x => `${x.t}@${x.y} op${x.effOp}`).join(" | ") || "— NONE —");
}
console.log("GAPS (playing, no visible pause control):", gaps);
console.log("errors:", log.errors);
await browser.close();
