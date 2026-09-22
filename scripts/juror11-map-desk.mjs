import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep } from "./juror11-lib.mjs";
const vpKey = process.argv[2] || "d1440";
const vp = VPS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const errs = watchConsole(page, `map-${vpKey}`);
const tag = `map-${vpKey}`;
await goto(page, "/map", 2500);
await shot(page, `${tag}-00-overview-early`);
const controls = async () => page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const els = [...document.querySelectorAll("button, a, [role=button]")].filter(vis).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 36), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
  const pills = [...document.querySelectorAll(".mapboxgl-marker *")].filter((e) => vis(e) && e.getBoundingClientRect().width > 20).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 30), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
  const chips = [...document.querySelectorAll("div, span, p")].filter((e) => vis(e) && e.children.length === 0 && /1860|spots|scroll|drag|walk|zoom/i.test(e.textContent)).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 50), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
  return { els, pills, chips, y: Math.round(scrollY) };
});
let s = await controls();
log("early chips:", JSON.stringify(s.chips));
log("early pills:", JSON.stringify(s.pills));
// hint chip vs pill overlap
const overlap = (a, b) => !(a[0] + a[2] < b[0] || b[0] + b[2] < a[0] || a[1] + a[3] < b[1] || b[1] + b[3] < a[1]);
for (const ch of s.chips) for (const p of s.pills) if (overlap(ch.r, p.r)) log("!! chip/pill overlap:", ch.t, "vs", p.t);
await sleep(4000);
s = await controls();
log("overview controls:", JSON.stringify(s.els));
log("overview chips (6.5s):", JSON.stringify(s.chips));
await shot(page, `${tag}-01-overview`);
// wheel over the map
const before = await page.evaluate(() => ({ y: scrollY }));
await page.mouse.move(vp.width / 2, vp.height / 2);
await page.mouse.wheel(0, 300);
await sleep(600);
const afterWheel = await page.evaluate(() => ({ y: scrollY }));
log("wheel over map: scrollY", before.y, "->", afterWheel.y);
await shot(page, `${tag}-02-after-wheel`);
const notice = await page.evaluate(() => [...document.querySelectorAll("div, p, span")].filter((e) => e.children.length === 0 && /zoom|ctrl|⌘|scroll/i.test(e.textContent) && getComputedStyle(e).opacity !== "0" && e.getBoundingClientRect().width > 0).map((e) => ({ t: e.textContent.trim().slice(0, 80), r: e.getBoundingClientRect().toJSON(), op: getComputedStyle(e).opacity })));
log("notice:", JSON.stringify(notice));
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(600);
// ctrl+wheel zoom
const z0 = await page.evaluate(() => window.__map?.getZoom?.() ?? null);
await page.keyboard.down("Control");
await page.mouse.wheel(0, -200);
await page.keyboard.up("Control");
await sleep(1200);
await shot(page, `${tag}-03-after-ctrl-wheel`);
const z1 = await page.evaluate(() => window.__map?.getZoom?.() ?? null);
log("ctrl+wheel zoom:", z0, "->", z1, "scrollY", await page.evaluate(() => scrollY));
// meta+wheel
await page.keyboard.down("Meta");
await page.mouse.wheel(0, -200);
await page.keyboard.up("Meta");
await sleep(800);
await shot(page, `${tag}-03b-after-meta-wheel`);
// reload for a clean overview then take the walk
await goto(page, "/map", 6000);
const tw = page.locator("button:visible, a:visible", { hasText: /Take the walk/i }).first();
const twb = await tw.boundingBox();
log("Take the walk:", JSON.stringify(twb));
await page.mouse.click(twb.x + twb.width / 2, twb.y + twb.height / 2);
await sleep(3500);
s = await controls();
log("walk started controls:", JSON.stringify(s.els.filter((e) => /back|stop|continue|walk|menu/i.test(e.t))));
await shot(page, `${tag}-04-walk-started`);
// timing: watch active card changes for 20s
const timeline = [];
const t0 = Date.now();
let last = null;
while (Date.now() - t0 < 16000) {
  const cur = await page.evaluate(() => { const a = [...document.querySelectorAll(".keen-slider__slide")].map((s, i) => ({ i, x: s.getBoundingClientRect().x, w: s.getBoundingClientRect().width })); const c = a.find((s) => Math.abs(s.x + s.w / 2 - innerWidth / 2) < s.w / 2); return c ? c.i : null; });
  if (cur !== last) { timeline.push([Date.now() - t0, cur]); last = cur; }
  await sleep(100);
}
log("active-card timeline (ms,idx):", JSON.stringify(timeline));
await shot(page, `${tag}-05-walk-mid`);
const geom = await page.evaluate(() => {
  const strip = document.querySelector(".location-cards-slider, .keen-slider");
  const sr = strip?.getBoundingClientRect();
  const pills = [...document.querySelectorAll(".mapboxgl-marker *")].filter((e) => e.getBoundingClientRect().width > 20).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 30), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
  const menu = document.querySelector(".cnwm-menu")?.getBoundingClientRect();
  const slides = [...document.querySelectorAll(".keen-slider__slide")].map((sl) => { const r = sl.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.right)]; });
  return { strip: sr && [Math.round(sr.x), Math.round(sr.y), Math.round(sr.width), Math.round(sr.height)], pills, menu: menu && [Math.round(menu.x), Math.round(menu.y), Math.round(menu.width), Math.round(menu.height)], slides };
});
log("walk geometry:", JSON.stringify(geom));
// drag with the mouse mid-walk
const y = geom.strip[1] + geom.strip[3] / 2;
await page.mouse.move(vp.width * 0.6, y);
await page.mouse.down();
for (let i = 1; i <= 12; i++) { await page.mouse.move(vp.width * 0.6 - i * 20, y); await sleep(16); }
const mid = (await controls()).els.filter((e) => /stop the walk|continue|walk again/i.test(e.t));
log("button mid-drag:", JSON.stringify(mid));
await page.mouse.up();
const samples = [];
for (let i = 0; i < 25; i++) { samples.push(await page.evaluate(() => Math.round(document.querySelector(".keen-slider__slide").getBoundingClientRect().x))); await sleep(16); }
log("first slide x after release:", samples.join(","));
await sleep(800);
log("button after drag:", JSON.stringify((await controls()).els.filter((e) => /stop the walk|continue|walk again/i.test(e.t))));
await shot(page, `${tag}-06-after-drag`);
const cont = page.locator("button:visible", { hasText: /^Continue$/i }).first();
if (await cont.count()) { const cb = await cont.boundingBox(); await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(3500); log("after Continue:", JSON.stringify((await controls()).els.filter((e) => /stop|continue|walk again|back/i.test(e.t)))); await shot(page, `${tag}-07-continued`); }
// Stop the walk
const stop = page.locator("button:visible", { hasText: /Stop the walk/i }).first();
if (await stop.count()) { const sb = await stop.boundingBox(); await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2); await sleep(1600); log("after Stop:", JSON.stringify((await controls()).els.filter((e) => /stop|continue|walk again|back/i.test(e.t)))); await shot(page, `${tag}-08-stopped`); }
// Back
const back = page.locator("button:visible, a:visible", { hasText: /Back to map|^Back$/i }).first();
const bb = await back.boundingBox();
await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await sleep(3000);
s = await controls();
log("after Back pills:", JSON.stringify(s.pills));
await shot(page, `${tag}-09-back-overview`);
// lens
const lens = page.locator("button:visible, a:visible", { hasText: /See Troy in 1858/i }).first();
const lb = await lens.boundingBox();
log("lens button:", JSON.stringify(lb));
await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2);
await sleep(3500);
await shot(page, `${tag}-10-lens`);
const lensInfo = await page.evaluate(() => {
  const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.src) || /1858/.test(i.alt));
  const ir = img?.getBoundingClientRect();
  const wrap = img?.closest("[style*=overflow], .overflow-hidden, div")?.getBoundingClientRect();
  return { img: ir && [Math.round(ir.x), Math.round(ir.y), Math.round(ir.width), Math.round(ir.height)], wrap: wrap && [Math.round(wrap.x), Math.round(wrap.y), Math.round(wrap.width), Math.round(wrap.height)], transform: img && getComputedStyle(img).transform, iw: innerWidth, ih: innerHeight };
});
log("lens:", JSON.stringify(lensInfo));
log("lens controls:", JSON.stringify((await controls()).els));
// keyboard + zoom in lens
await page.keyboard.press("+");
await sleep(600);
await shot(page, `${tag}-11-lens-zoomed`);
const bt = page.locator("button:visible, a:visible", { hasText: /Back to today/i }).first();
const btb = await bt.boundingBox();
await page.mouse.click(btb.x + btb.width / 2, btb.y + btb.height / 2);
await sleep(2000);
await shot(page, `${tag}-12-back-today`);
// scroll down to the index
await page.evaluate(() => scrollTo({ top: innerHeight, behavior: "instant" }));
await sleep(1500);
await shot(page, `${tag}-13-index`);
await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
await sleep(1200);
await shot(page, `${tag}-14-foot`);
const of = await overflowCheck(page);
log("overflow:", of.bodySW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean");
log("console errors:", errs.length ? errs : "none");
await browser.close();
