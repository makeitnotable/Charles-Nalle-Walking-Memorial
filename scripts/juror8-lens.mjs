// Lens fresh vs after-walk. usage: node scripts/juror8-lens.mjs p390
import { launch, ctx, VPS, watch, shot, sleep, go, save, floating, touchTap } from "./juror8-lib.mjs";
const key = process.argv[2] || "p390";
const vp = VPS[key];
const tag = `lens-${key}`;
const out = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
const tap = async (loc) => { const b = await loc.boundingBox(); if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };
await go(page, "/map", 6000);
// index block first (scroll to the copy block)
await page.evaluate(() => { const h = [...document.querySelectorAll("main h1, main h2")].find((e) => /Five spots/i.test(e.textContent)); h && h.scrollIntoView({ block: "start" }); }); await sleep(900);
await shot(page, `${tag}-00-copy`);
await page.evaluate(() => scrollBy(0, innerHeight * 0.8)); await sleep(700);
await shot(page, `${tag}-00b-index`);
await page.evaluate(() => scrollTo(0, 0)); await sleep(800);
// fresh lens
await tap(page.locator("button:visible:has-text('1858')").first()); await sleep(2500);
await shot(page, `${tag}-01-fresh`);
out.freshMarkersAbove = await page.evaluate(() => {
  // which markers are visually on top at their own centre?
  return [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { t: m.textContent.trim().slice(0, 20), inside: !!m.contains(el), z: getComputedStyle(m).zIndex }; });
});
out.caption = await page.evaluate(() => [...document.querySelectorAll("p, figcaption, span, div")].filter((e) => /Library of Congress/.test(e.textContent) && e.children.length === 0).map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); return { txt: e.textContent.trim(), lines: [...rg.getClientRects()].map((r) => Math.round(r.top)).filter((v, i, a) => a.indexOf(v) === i).length, w: Math.round(e.getBoundingClientRect().width) }; }));
out.viewer = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.src) || /1858/.test(i.alt)); if (!img) return null; const v = img.closest("[style*=overflow], figure, div"); const r = img.getBoundingClientRect(); const vr = v.getBoundingClientRect(); return { img: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, viewer: { x: Math.round(vr.x), y: Math.round(vr.y), w: Math.round(vr.width), h: Math.round(vr.height) }, vw: innerWidth, vh: innerHeight, areaPct: Math.round((vr.width * vr.height) / (innerWidth * innerHeight) * 100) }; });
// keyboard: + then 0
await page.keyboard.press("+"); await sleep(500); await page.keyboard.press("+"); await sleep(600);
await shot(page, `${tag}-02-zoomed`);
await page.keyboard.press("0"); await sleep(600);
// desktop wheel zoom in the lens
if (!vp.mobile) { await page.mouse.move(vp.width / 2, vp.height / 2); await page.mouse.wheel(0, -400); await sleep(700); await shot(page, `${tag}-02b-wheel`); out.scrollAfterWheelInLens = await page.evaluate(() => scrollY); }
await tap(page.locator("button:visible:has-text('Back to today')").first()); await sleep(1500);
await shot(page, `${tag}-03-back-today`);
// walk → back → lens
await tap(page.locator("button:visible:has-text('Take the walk')").first()); await sleep(5000);
await tap(page.locator("button:visible[aria-label='Back to map'], button:visible:has-text('Back')").first()); await sleep(2500);
await shot(page, `${tag}-04-after-walk-overview`);
await tap(page.locator("button:visible:has-text('1858')").first()); await sleep(2500);
await shot(page, `${tag}-05-lens-after-walk`);
out.afterWalkMarkersAbove = await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { t: m.textContent.trim().slice(0, 20), inside: !!m.contains(el), z: getComputedStyle(m).zIndex, x: Math.round(r.x), y: Math.round(r.y) }; }));
out.log = log.filter((l) => !/vector\.pbf/.test(l));
save(`${tag}.json`, out);
console.log(JSON.stringify(out, null, 1));
await c.close(); await browser.close();
