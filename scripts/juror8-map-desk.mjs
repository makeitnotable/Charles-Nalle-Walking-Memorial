// Map on desktop/tablet-landscape (mouse). usage: node scripts/juror8-map-desk.mjs d1440
import { launch, ctx, VPS, watch, shot, sleep, go, save, floating } from "./juror8-lib.mjs";
const key = process.argv[2] || "d1440";
const vp = VPS[key];
const tag = `map-${key}`;
const out = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
const click = async (loc) => { const b = await loc.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };
await go(page, "/map", 6000);
await shot(page, `${tag}-01-overview`);
out.overview = { floating: await floating(page), markers: await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return { t: m.textContent.trim().replace(/\s+/g, " ").slice(0, 30), x: Math.round(r.x), y: Math.round(r.y) }; })), pitch: await page.evaluate(() => window.__map?.getPitch?.() ?? null) };
// wheel down with the pointer over the map
await page.mouse.move(vp.width / 2, vp.height / 2);
const zoomBefore = await page.evaluate(() => document.querySelector(".mapboxgl-canvas")?.getBoundingClientRect().height);
await page.mouse.wheel(0, 300); await sleep(300);
await shot(page, `${tag}-02-wheel-1`);
await page.mouse.wheel(0, 300); await sleep(300);
await shot(page, `${tag}-02-wheel-2`);
out.afterWheel = { scrollY: await page.evaluate(() => scrollY), notice: await page.evaluate(() => [...document.querySelectorAll("div, p, span")].filter((e) => e.children.length === 0 && /wheel|scroll|⌘|Ctrl|zoom/i.test(e.textContent) && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < innerHeight && e.getBoundingClientRect().bottom > 0).map((e) => { const r = e.getBoundingClientRect(); return { txt: e.textContent.trim().slice(0, 80), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(e).opacity }; })) };
await sleep(1500);
await shot(page, `${tag}-02-wheel-3`);
await page.evaluate(() => scrollTo(0, 0)); await sleep(800);
// ctrl+wheel
await page.mouse.move(vp.width / 2, vp.height / 2);
await page.keyboard.down("Control"); await page.mouse.wheel(0, -300); await sleep(200); await page.mouse.wheel(0, -300); await page.keyboard.up("Control"); await sleep(1200);
await shot(page, `${tag}-03-ctrl-wheel`);
out.afterCtrlWheel = { scrollY: await page.evaluate(() => scrollY) };
// reset via reload
await go(page, "/map", 6000);
// index below
await page.evaluate(() => { const h = [...document.querySelectorAll("main h1, main h2")].find((e) => /Five spots/i.test(e.textContent)); h && h.scrollIntoView({ block: "start" }); }); await sleep(900);
await shot(page, `${tag}-04-copy`);
await page.evaluate(() => scrollBy(0, innerHeight * 0.8)); await sleep(700);
await shot(page, `${tag}-04b-index`);
await page.evaluate(() => scrollTo(0, 0)); await sleep(800);
// menu open on map
await page.locator(".cnwm-menu-burger").click(); await sleep(700);
await shot(page, `${tag}-05-menu`);
await page.locator(".cnwm-menu-close").click(); await sleep(600);
// take the walk (scroll a little first)
await page.evaluate(() => scrollBy(0, 120)); await sleep(600);
await click(page.locator("button:visible:has-text('Take the walk')").first());
await sleep(1200);
await shot(page, `${tag}-06-walk-start`);
out.walkStart = { scrollY: await page.evaluate(() => scrollY), floating: await floating(page) };
await sleep(4500);
await shot(page, `${tag}-07-walk-mid`);
out.walkMid = { floating: await floating(page), cards: await page.evaluate(() => [...document.querySelectorAll(".keen-slider__slide")].map((s) => { const r = s.getBoundingClientRect(); return { x: Math.round(r.x), r: Math.round(r.right), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })), markers: await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return { t: m.textContent.trim().replace(/\s+/g, " ").slice(0, 30), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })) };
// mouse drag cards
const cy = out.walkMid.cards[1].y + out.walkMid.cards[1].h / 2;
await page.mouse.move(vp.width / 2 + 150, cy); await page.mouse.down();
for (let i = 1; i <= 14; i++) { await page.mouse.move(vp.width / 2 + 150 - i * 30, cy); await sleep(16); }
await page.mouse.up();
const samples = [];
for (let i = 0; i < 25; i++) { samples.push(await page.evaluate(() => Math.round(document.querySelector(".keen-slider__slide").getBoundingClientRect().x))); await sleep(16); }
await sleep(900);
await shot(page, `${tag}-08-after-drag`);
out.drag = { samples, btn: await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => /Stop the walk|Continue|Walk again/.test(t))) };
await click(page.locator("button:visible:has-text('Continue')").first()); await sleep(3000);
out.continued = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => /Stop the walk|Continue|Walk again/.test(t)));
// Stop the walk
await click(page.locator("button:visible:has-text('Stop the walk')").first()); await sleep(1500);
await shot(page, `${tag}-09-stopped`);
out.stopped = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => /Stop the walk|Continue|Walk again/.test(t)));
// Back to map
await click(page.locator("button:visible:has-text('Back to map')").first()); await sleep(2500);
await shot(page, `${tag}-10-back`);
// lens
await click(page.locator("button:visible:has-text('1858')").first()); await sleep(2500);
await shot(page, `${tag}-11-lens`);
out.lens = { floating: await floating(page), viewer: await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.src) || /1858/.test(i.alt)); if (!img) return null; const v = img.parentElement; const vr = v.getBoundingClientRect(); return { x: Math.round(vr.x), y: Math.round(vr.y), w: Math.round(vr.width), h: Math.round(vr.height), areaPct: Math.round((vr.width * vr.height) / (innerWidth * innerHeight) * 100) }; }) };
await page.mouse.move(vp.width / 2, vp.height / 2); await page.mouse.wheel(0, -500); await sleep(800);
await shot(page, `${tag}-12-lens-zoomed`);
out.lensWheelScrollY = await page.evaluate(() => scrollY);
await page.keyboard.press("0"); await sleep(500);
await click(page.locator("button:visible:has-text('Back to today')").first()); await sleep(1500);
await shot(page, `${tag}-13-back-today`);
// click a marker
const mk = await page.evaluate(() => { const m = document.querySelectorAll(".mapboxgl-marker")[0]; const r = m.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
await page.mouse.click(mk.x, mk.y); await sleep(3000);
await shot(page, `${tag}-14-marker`);
out.marker = { floating: await floating(page) };
// enter the chapter from the card (curtain)
const enter = page.locator(".keen-slider__slide button, .keen-slider__slide a").filter({ hasText: /Bakery/ }).first();
if (await enter.count()) { const eb = await enter.boundingBox(); if (eb) { await page.mouse.click(eb.x + eb.width / 2, eb.y + eb.height / 2); for (let i = 0; i < 8; i++) { await sleep(180); await shot(page, `${tag}-15-curtain-${i}`); } await sleep(1200); out.landed = page.url(); } }
out.log = log.filter((l) => !/vector\.pbf/.test(l));
save(`${tag}.json`, out);
console.log(JSON.stringify(out, null, 1));
await c.close(); await browser.close();
