// Repro 2: walk → drag (pause) → Continue → wait X → Back → stray active marker?
import { launch, ctx, VPS, watch, shot, sleep, go, save, touchTap, touchDrag } from "./juror8-lib.mjs";
const key = process.argv[2] || "p390";
const delays = (process.argv[3] || "1000,2000,3500,5000").split(",").map(Number);
const vp = VPS[key];
const out = [];
const browser = await launch();
for (const d of delays) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await go(page, "/map", 6000);
  const tap = async (loc) => { const b = await loc.boundingBox(); if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };
  const activeInfo = () => page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => m.textContent.trim().replace(/\s+/g, " ")));
  await tap(page.locator("button:visible:has-text('Take the walk')").first());
  await sleep(5700);
  const card = await page.evaluate(() => { const s = [...document.querySelectorAll(".keen-slider__slide")].find((k) => k.getBoundingClientRect().x > 0 && k.getBoundingClientRect().right <= innerWidth); const r = s.getBoundingClientRect(); return { y: r.y + r.height / 2 }; });
  if (vp.mobile) await touchDrag(page, vp.width - 40, card.y, 60, card.y, 14, 16); else { await page.mouse.move(vp.width - 200, card.y); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(vp.width - 200 - i * 25, card.y); await sleep(16); } await page.mouse.up(); }
  await sleep(1200);
  const paused = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => /Stop the walk|Continue|Walk again/.test(t)));
  await tap(page.locator("button:visible:has-text('Continue')").first());
  await sleep(d);
  const before = await activeInfo();
  await tap(page.locator("button:visible[aria-label='Back to map'], button:visible:has-text('Back')").first());
  await sleep(3500);
  const after = await activeInfo();
  const stray = after.filter((a) => /[A-Za-z]/.test(a));
  await shot(page, `backrace2-${key}-${d}`);
  out.push({ delay: d, paused, before, after, stray });
  console.log(JSON.stringify(out[out.length - 1]));
  await c.close();
}
await browser.close();
save(`backrace2-${key}.json`, out);
