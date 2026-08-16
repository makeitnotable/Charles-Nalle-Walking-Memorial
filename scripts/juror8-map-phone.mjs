// Map on a phone. usage: node scripts/juror8-map-phone.mjs p390
import { launch, ctx, VPS, watch, shot, sleep, go, save, floating, touchDrag, touchTap } from "./juror8-lib.mjs";
const key = process.argv[2] || "p390";
const vp = VPS[key];
const tag = `map-${key}`;
const out = { steps: {} };
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await go(page, "/map", 6000);
await shot(page, `${tag}-01-overview`);
out.steps.overview = { floating: await floating(page), markers: await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return { t: m.textContent.trim().slice(0, 30), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })) };
// menu open on map
await page.locator(".cnwm-menu-burger").click(); await sleep(700);
await shot(page, `${tag}-02-menu`);
await page.locator(".cnwm-menu-close").click(); await sleep(600);
// scroll past the map to the spot index (touch scroll)
for (let i = 0; i < 6; i++) { await touchDrag(page, vp.width / 2, vp.height - 60, vp.width / 2, 100, 10, 12); await sleep(250); }
await sleep(800);
await shot(page, `${tag}-03-index`);
out.steps.index = await page.evaluate(() => {
  const items = [...document.querySelectorAll("main li, main article, main a")].filter((e) => /Spot|Bakery|Commissioner/.test(e.textContent)).slice(0, 12);
  return { scrollY: scrollY, items: items.map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, txt: e.textContent.trim().replace(/\s+/g, " ").slice(0, 60), x: Math.round(r.x), w: Math.round(r.width), right: Math.round(r.right), sw: e.scrollWidth, cw: e.clientWidth }; }) };
});
// find the index title elements to check for overflow (Commissioner's inside its column)
out.steps.indexTitles = await page.evaluate(() => {
  const els = [...document.querySelectorAll("main h2, main h3, main .t-title-sm, main .t-title")].filter((e) => e.getBoundingClientRect().width > 0);
  return els.map((e) => { const r = e.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(e); const rr = rg.getBoundingClientRect(); return { txt: e.textContent.trim().replace(/\s+/g, " ").slice(0, 40), boxL: Math.round(r.left), boxR: Math.round(r.right), inkL: Math.round(rr.left), inkR: Math.round(rr.right), lines: rg.getClientRects().length }; });
});
await page.evaluate(() => scrollBy(0, 400)); await sleep(700);
await shot(page, `${tag}-03b-index-more`);
// Back to top, scroll down a little (120px) then press Take the walk
await page.evaluate(() => scrollTo(0, 0)); await sleep(800);
await page.evaluate(() => scrollBy(0, 120)); await sleep(700);
await shot(page, `${tag}-04-scrolled-a-little`);
const walkBtn = page.locator("button:has-text('Take the walk'), a:has-text('Take the walk')").first();
const wb = await walkBtn.boundingBox();
out.steps.walkBtn = wb;
await touchTap(page, wb.x + wb.width / 2, wb.y + wb.height / 2);
await sleep(1200);
await shot(page, `${tag}-05-walk-start`);
out.steps.walkStart = { scrollY: await page.evaluate(() => scrollY), floating: await floating(page) };
await sleep(4500);
await shot(page, `${tag}-06-walk-mid`);
out.steps.walkMid = { floating: await floating(page), markers: await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return { t: m.textContent.trim().slice(0, 30), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), cls: m.className.toString().slice(0, 60) }; })), cards: await page.evaluate(() => [...document.querySelectorAll(".keen-slider__slide, [class*=slide]")].filter((s) => s.getBoundingClientRect().width > 100).map((s) => { const r = s.getBoundingClientRect(); return { x: Math.round(r.x), r: Math.round(r.right), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), t: s.textContent.trim().slice(0, 30) }; })) };
// drag the cards mid-walk
const cards = out.steps.walkMid.cards;
const active = cards.find((k) => k.x >= 0 && k.r <= vp.width) || cards[1];
const cy = active.y + active.h / 2;
const btnTextBefore = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => /Stop the walk|Continue|Walk again/.test(t)));
// sample positions during and after drag
await touchDrag(page, vp.width - 40, cy, 60, cy, 14, 16);
const samples = [];
for (let i = 0; i < 25; i++) { samples.push(await page.evaluate(() => { const s = document.querySelector(".keen-slider__slide"); return s ? Math.round(s.getBoundingClientRect().x) : null; })); await sleep(16); }
await sleep(900);
await shot(page, `${tag}-07-after-drag`);
out.steps.drag = { btnTextBefore, samples, btnTextAfter: await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => /Stop the walk|Continue|Walk again/.test(t))), cards: await page.evaluate(() => [...document.querySelectorAll(".keen-slider__slide")].map((s) => { const r = s.getBoundingClientRect(); return { x: Math.round(r.x), r: Math.round(r.right), w: Math.round(r.width) }; })) };
// press Continue
const contBtn = page.locator("button:visible:has-text('Continue')").first();
if (await contBtn.count()) { const cb = await contBtn.boundingBox(); await touchTap(page, cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(3500); await shot(page, `${tag}-08-continued`); out.steps.continued = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => /Stop the walk|Continue|Walk again/.test(t))); }
// Back
const back = page.locator("button:visible[aria-label='Back to map'], button:visible:has-text('Back')").first();
const bb = await back.boundingBox();
if (bb) { await touchTap(page, bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(2500); }
await shot(page, `${tag}-09-back-overview`);
out.steps.afterBack = { floating: await floating(page) };
// See Troy in 1858
const lens = page.locator("button:visible:has-text('1858')").first();
const lb = await lens.boundingBox();
out.steps.lensBtn = lb;
if (lb) {
  await touchTap(page, lb.x + lb.width / 2, lb.y + lb.height / 2); await sleep(2500);
  await shot(page, `${tag}-10-lens`);
  out.steps.lens = { floating: await floating(page), caption: await page.evaluate(() => [...document.querySelectorAll("p, figcaption, span")].filter((e) => /Library of Congress|Drag to explore/.test(e.textContent) && e.children.length < 3).map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); return { txt: e.textContent.trim().replace(/\s+/g, " "), lines: rg.getClientRects().length, w: Math.round(e.getBoundingClientRect().width) }; })) };
  // pinch-less: drag to pan a bit
  await touchDrag(page, vp.width / 2, vp.height / 2, vp.width / 2 + 80, vp.height / 2 - 60, 8, 16); await sleep(600);
  await shot(page, `${tag}-11-lens-panned`);
  const bt = page.locator("button:visible:has-text('Back to today')").first();
  const bt2 = await bt.boundingBox();
  if (bt2) { await touchTap(page, bt2.x + bt2.width / 2, bt2.y + bt2.height / 2); await sleep(1500); }
  await shot(page, `${tag}-12-back-today`);
}
// tap a marker from the overview
const mk = await page.evaluate(() => { const m = document.querySelectorAll(".mapboxgl-marker")[2]; if (!m) return null; const r = m.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
if (mk) { await touchTap(page, mk.x, mk.y); await sleep(3000); await shot(page, `${tag}-13-marker-tapped`); out.steps.markerTapped = { floating: await floating(page), btns: await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter(Boolean).slice(0, 12)) }; }
out.log = log;
save(`${tag}.json`, out);
console.log(JSON.stringify(out, null, 1));
await c.close(); await browser.close();
