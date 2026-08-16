import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep, cdp, touchDrag, touchTap } from "./juror11-lib.mjs";
const vpKey = process.argv[2] || "p390";
const vp = VPS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const errs = watchConsole(page, `map-${vpKey}`);
const tag = `map-${vpKey}`;
const session = await cdp(page);
await goto(page, "/map", 6000);
await shot(page, `${tag}-01-overview`);

const controls = async () => page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const els = [...document.querySelectorAll("button, a, [role=button]")].filter(vis).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 36), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
  const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return { t: m.textContent.trim().replace(/\s+/g, " ").slice(0, 30), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], cls: m.className.slice(0, 80), active: /active|is-active|current/.test(m.className) || !!m.querySelector("[aria-current], .is-active, [data-active=true]") }; });
  const chips = [...document.querySelectorAll("div, span, p")].filter((e) => vis(e) && e.children.length === 0 && /1860|spots|scroll|drag|walk/i.test(e.textContent)).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 40), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
  return { els, markers, chips, y: Math.round(scrollY) };
});
let s = await controls();
log("overview controls:", JSON.stringify(s.els));
log("overview markers:", JSON.stringify(s.markers));
log("overview chips:", JSON.stringify(s.chips));
// scroll past the map to the spot index
await page.evaluate(() => scrollTo({ top: innerHeight, behavior: "instant" }));
await sleep(1200);
await shot(page, `${tag}-02-index`);
await page.evaluate(() => scrollTo({ top: innerHeight * 1.9, behavior: "instant" }));
await sleep(1000);
await shot(page, `${tag}-03-index2`);
const idx = await page.evaluate(() => [...document.querySelectorAll(".map-index-title, [class*=index] h2, [class*=index] h3")].map((e) => ({ t: e.textContent.trim().replace(/\s+/g, " "), lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)) })));
log("index titles:", JSON.stringify(idx));
// scroll back up a little offset (map partly visible), then press Take the walk
await page.evaluate(() => scrollTo({ top: 120, behavior: "instant" }));
await sleep(800);
await shot(page, `${tag}-04-scrolled-120`);
const tw = page.locator("button, a", { hasText: /Take the walk/i }).first();
const twb = await tw.boundingBox();
log("Take the walk box (scrolled 120):", JSON.stringify(twb));
await touchTap(session, twb.x + twb.width / 2, twb.y + twb.height / 2);
await sleep(3500);
s = await controls();
log("after Take the walk: scrollY", s.y, JSON.stringify(s.els.filter((e) => /back|stop|continue|walk|menu/i.test(e.t))));
await shot(page, `${tag}-05-walk-started`);
// where is the active marker vs card strip
const geom = await page.evaluate(() => {
  const strip = document.querySelector(".location-cards-slider, .keen-slider, [class*=slider]");
  const sr = strip?.getBoundingClientRect();
  const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return { t: m.textContent.trim().replace(/\s+/g, " ").slice(0, 30), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], cls: m.className.slice(0, 60) }; });
  const slides = [...document.querySelectorAll(".keen-slider__slide")].map((sl) => { const r = sl.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.right), Math.round(r.width)]; });
  return { strip: sr && [Math.round(sr.x), Math.round(sr.y), Math.round(sr.width), Math.round(sr.height)], markers, slides, iw: innerWidth };
});
log("walk geometry:", JSON.stringify(geom));
await sleep(3500);
await shot(page, `${tag}-06-walk-stop2`);
// drag the cards mid-walk
const stripBox = geom.strip;
const y = stripBox ? stripBox[1] + stripBox[3] / 2 : vp.height - 160;
const btnBefore = (await controls()).els.filter((e) => /stop the walk|continue|walk again/i.test(e.t));
log("button before drag:", JSON.stringify(btnBefore));
// sample positions during/after drag
await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: vp.width * 0.7, y }] });
for (let i = 1; i <= 10; i++) { await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: vp.width * 0.7 - i * 14, y }] }); await sleep(16); }
const midDrag = (await controls()).els.filter((e) => /stop the walk|continue|walk again/i.test(e.t));
log("button mid-drag:", JSON.stringify(midDrag));
await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
const samples = [];
for (let i = 0; i < 25; i++) { samples.push(await page.evaluate(() => { const a = document.querySelector(".keen-slider__slide"); return a ? Math.round(a.getBoundingClientRect().x) : null; })); await sleep(16); }
log("first-slide x samples after release:", samples.join(","));
await sleep(600);
const afterDrag = await controls();
log("button after drag:", JSON.stringify(afterDrag.els.filter((e) => /stop the walk|continue|walk again/i.test(e.t))));
const peek = await page.evaluate(() => [...document.querySelectorAll(".keen-slider__slide")].map((sl) => { const r = sl.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.right)]; }).filter((r) => r[1] > 0 && r[0] < innerWidth));
log("visible slides after drag (x,right), iw=", vp.width, JSON.stringify(peek));
await shot(page, `${tag}-07-after-drag`);
// wait to see if auto cycling continues (it shouldn't)
const cardBefore = await page.evaluate(() => document.querySelector(".keen-slider__slide[aria-current], .keen-slider__slide.is-active")?.textContent.trim().slice(0, 30));
await sleep(4000);
const cardAfter = await page.evaluate(() => document.querySelector(".keen-slider__slide[aria-current], .keen-slider__slide.is-active")?.textContent.trim().slice(0, 30));
log("paused holds? active card before/after 4s:", cardBefore, "|", cardAfter);
// tap Continue
const contBtn = page.locator("button", { hasText: /^Continue$/i }).first();
if (await contBtn.count()) {
  const cb = await contBtn.boundingBox();
  await touchTap(session, cb.x + cb.width / 2, cb.y + cb.height / 2);
  await sleep(3500);
  log("after Continue:", JSON.stringify((await controls()).els.filter((e) => /stop the walk|continue|walk again|back/i.test(e.t))));
  await shot(page, `${tag}-08-continued`);
} else log("NO Continue button found");
// press Back
const back = page.locator("button:visible, a:visible", { hasText: /Back/i }).first();
const bb = await back.boundingBox();
log("Back box:", JSON.stringify(bb));
await touchTap(session, bb.x + bb.width / 2, bb.y + bb.height / 2);
await sleep(3000);
s = await controls();
log("after Back markers:", JSON.stringify(s.markers));
log("after Back controls:", JSON.stringify(s.els));
await shot(page, `${tag}-09-back-overview`);
// See Troy in 1858
const lens = page.locator("button:visible, a:visible", { hasText: /See Troy in 1858/i }).first();
const lb = await lens.boundingBox();
log("lens button:", JSON.stringify(lb));
await touchTap(session, lb.x + lb.width / 2, lb.y + lb.height / 2);
await sleep(3500);
await shot(page, `${tag}-10-lens`);
const lensInfo = await page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight; };
  const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.src) || /1858/.test(i.alt));
  const ir = img?.getBoundingClientRect();
  const texts = [...document.querySelectorAll("p, span, div, button")].filter((e) => vis(e) && e.children.length === 0 && e.textContent.trim()).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 50), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
  return { img: ir && [Math.round(ir.x), Math.round(ir.y), Math.round(ir.width), Math.round(ir.height)], transform: img && getComputedStyle(img).transform, texts: texts.slice(0, 20) };
});
log("lens:", JSON.stringify(lensInfo));
const bt = page.locator("button:visible, a:visible", { hasText: /Back to today/i }).first();
const btb = await bt.boundingBox();
await touchTap(session, btb.x + btb.width / 2, btb.y + btb.height / 2);
await sleep(2000);
await shot(page, `${tag}-11-back-today`);
const of = await overflowCheck(page);
log("overflow:", of.bodySW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean");
log("console errors:", errs.length ? errs : "none");
await browser.close();
