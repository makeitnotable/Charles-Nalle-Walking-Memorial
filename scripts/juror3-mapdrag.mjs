import { launch, newPage, shot, goto, sleep, report, cdp, VIEWPORTS } from "./juror3-lib.mjs";
// Focused test: does a real touch drag on the card strip move the cards mid-walk, pause the walk, and avoid snap-back?
const vp = process.argv[2] || "p390";
const V = VIEWPORTS[vp];
const browser = await launch();
const page = await newPage(browser, vp);
const session = await cdp(page);
await goto(page, "/map");
await sleep(4000);
await (await page.$('button:has-text("Take the walk")')).click();
await sleep(1500);
const cardStrip = () => page.evaluate(() => { const cards = [...document.querySelectorAll('[aria-label^="Focus Spot"], [aria-label^="Enter Spot"]')]; const active = cards.find((c) => /^Enter/.test(c.getAttribute("aria-label"))); return { active: active?.getAttribute("aria-label")?.slice(0, 13), lefts: cards.map((c) => Math.round(c.getBoundingClientRect().left)), y: Math.round(cards[0].getBoundingClientRect().top + cards[0].getBoundingClientRect().height / 2) }; });
const walkBtn = () => page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((b) => /Stop the walk|Continue|Walk again/.test(b.textContent)); return b?.textContent.trim(); });
const center = () => page.evaluate(() => { const c = document.querySelector(".mapboxgl-canvas"); return c ? "canvas" : null; });

async function drag(dx, ms, hold = 0) {
  const c = await cardStrip();
  const y = c.y; const x0 = V.width * 0.6; const x1 = x0 + dx;
  const steps = Math.max(6, Math.round(ms / 16));
  const sampler = page.evaluate(async (ms) => { const out = []; const t0 = performance.now(); const el = document.querySelector('[aria-label^="Enter Spot"], [aria-label^="Focus Spot"]'); while (performance.now() - t0 < ms) { out.push([Math.round(performance.now() - t0), Math.round(el.getBoundingClientRect().left)]); await new Promise((r) => requestAnimationFrame(r)); } return out; }, ms + 1400);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y, id: 1 }] });
  if (hold) await sleep(hold);
  for (let i = 1; i <= steps; i++) { await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + (dx * i) / steps, y, id: 1 }] }); await sleep(16); }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  const btnNow = await walkBtn();
  const pos = await sampler;
  // motion summary
  const xs = pos.map((p) => p[1]);
  const min = Math.min(...xs), max = Math.max(...xs);
  let reversals = 0, dir = 0; for (let i = 1; i < pos.length; i++) { const d = pos[i][1] - pos[i - 1][1]; if (Math.abs(d) < 3) continue; const s = Math.sign(d); if (dir && s !== dir) reversals++; dir = s; }
  console.log(`drag dx=${dx} over ${ms}ms hold=${hold}: btn right after=${btnNow} · track x range ${min}..${max} (start ${xs[0]}, end ${xs[xs.length - 1]}) · reversals ${reversals} · samples ${pos.length}`);
  await sleep(600);
  console.log("   after:", await cardStrip(), "btn:", await walkBtn());
}

console.log("start:", await cardStrip(), await walkBtn());
await drag(-180, 400);          // a real swipe left
await shot(page, `mapdrag-${vp}-a`);
await drag(-20, 400);           // a slow 20px nudge: should return to the same card
await drag(-200, 250, 80);      // hold then flick
await drag(+220, 350);          // swipe back right
await shot(page, `mapdrag-${vp}-b`);
// tap the previous (inactive) card
const c = await cardStrip();
const prevLeft = c.lefts.find((l) => l < 0);
console.log("tap inactive prev card at", prevLeft);
await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 10, y: c.y, id: 1 }] });
await sleep(50);
await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await sleep(1500);
console.log("after tap prev:", await cardStrip(), await walkBtn());
report(page, "mapdrag");
await browser.close();
