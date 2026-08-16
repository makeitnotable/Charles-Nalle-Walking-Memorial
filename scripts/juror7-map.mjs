// Map + walk + lens at one viewport
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, cdp, touchDrag, VIEWPORTS } from "./juror7-lib.mjs";

const vp = process.argv[2] || "390";
const V = VIEWPORTS[vp];
const phone = V.mobile && V.width < 640;
const tag = "map-" + vp;
const errs = [];
const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, tag, errs);
const session = await cdp(page);

const controls = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("button, a.btn, [role=button]")]
      .filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.1; })
      .map((b) => ({ label: (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50), rect: [Math.round(b.getBoundingClientRect().x), Math.round(b.getBoundingClientRect().y), Math.round(b.getBoundingClientRect().width), Math.round(b.getBoundingClientRect().height)] }))
  );
const markers = () =>
  page.evaluate(() =>
    [...document.querySelectorAll(".mapboxgl-marker, [class*='marker']")]
      .map((m) => { const r = m.getBoundingClientRect(); return { t: (m.getAttribute("aria-label") || m.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight }; })
  );

await goto(page, "/map");
await sleep(6000); // let the prologue camera settle
await shot(page, `${tag}-01-overview`);
log.overviewControls = await controls();
log.overviewMarkers = await markers();
log.chip = await page.evaluate(() => [...document.querySelectorAll("div,span,p")].filter((e) => /April 27, 1860/.test(e.textContent || "") && e.children.length <= 2 && e.getBoundingClientRect().height < 60).map((e) => ({ t: e.textContent.trim(), rect: e.getBoundingClientRect().toJSON() })).slice(0, 2).map((x) => ({ t: x.t, rect: [Math.round(x.rect.x), Math.round(x.rect.y), Math.round(x.rect.width), Math.round(x.rect.height)] })));

// scroll past the map to the spot index
await page.evaluate(() => scrollTo({ top: innerHeight * 1.05, behavior: "instant" }));
await sleep(1200);
await shot(page, `${tag}-02-below-map`);
await page.evaluate(() => scrollTo({ top: document.querySelector('a[href$="/bakery"]').getBoundingClientRect().top + scrollY - 120, behavior: "instant" }));
await sleep(900);
await shot(page, `${tag}-03-spot-index`);
log.indexTitles = await page.evaluate(() => [...document.querySelectorAll('a[href$="/bakery"], a[href$="/commissioners-office"], a[href$="/mansion"], a[href$="/ferry"], a[href$="/barbershop"]')].filter((a) => a.closest("footer") == null && (a.textContent || "").includes("Spot")).map((a) => { const h = a.querySelector("h2,h3,h4,.t-title,.t-title-sm") || a; return { t: h.textContent.trim().replace(/\s+/g, " ").slice(0, 60), lines: h.getClientRects().length, w: Math.round(h.getBoundingClientRect().width), overflow: h.scrollWidth > h.clientWidth + 1 }; }));

// back up, scroll down a little (map partially out) and press Take the walk
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(600);
await page.evaluate(() => scrollTo({ top: 180, behavior: "instant" }));
await sleep(600);
await shot(page, `${tag}-04-scrolled-a-little`);
const take = page.locator('button:has-text("Take the walk")').first();
log.takeVisibleBefore = await take.isVisible();
const tb = await take.boundingBox();
log.takeBox = tb;
if (tb && tb.y + tb.height <= V.height && tb.y >= 0) await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
else { await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(500); const b2 = await take.boundingBox(); await page.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2); log.takeNeededScrollBack = true; }
await sleep(900);
log.scrollAfterTake = await page.evaluate(() => Math.round(scrollY));
await shot(page, `${tag}-05-walk-started`);
log.walkControls = await controls();
await sleep(3500);
await shot(page, `${tag}-06-walk-stop1`);
log.walkMarkers = await markers();
log.walkCards = await page.evaluate(() => [...document.querySelectorAll('[aria-label^="Enter Spot"], [aria-label^="Focus Spot"]')].map((d) => { const r = d.getBoundingClientRect(); const t = d.querySelector("h2,h3,h4,[class*='title']"); return { t: d.getAttribute("aria-label").slice(0, 40), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], titleLines: t ? t.getClientRects().length : null, titleText: t?.textContent.trim().replace(/\s+/g, " | ") }; }));
// wait for stop 2 arrival
await sleep(5000);
await shot(page, `${tag}-07-walk-stop2`);
log.walkControls2 = await controls();
log.walkCards2 = await page.evaluate(() => [...document.querySelectorAll('[aria-label^="Enter Spot"], [aria-label^="Focus Spot"]')].map((d) => { const r = d.getBoundingClientRect(); return { t: d.getAttribute("aria-label").slice(0, 30), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; }));

// drag the cards mid-walk
const active = page.locator('[aria-label^="Enter Spot"]').first();
const ab = await active.boundingBox();
log.activeBefore = ab;
const startX = ab.x + ab.width * 0.7, startY = ab.y + ab.height * 0.4;
const samples = [];
const sampler = async () => { for (let i = 0; i < 30; i++) { const s = await page.evaluate(() => { const t = document.querySelector('[aria-label^="Enter Spot"], [aria-label^="Focus Spot"]'); return t ? Math.round(t.getBoundingClientRect().x) : null; }); samples.push(s); await sleep(16); } };
if (phone || V.mobile) await touchDrag(session, { x: startX, y: startY }, { x: startX - 140, y: startY }, 14, 16);
else { await page.mouse.move(startX, startY); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(startX - (140 * i) / 14, startY); await sleep(16); } await page.mouse.up(); }
const samp = sampler();
await sleep(60);
log.controlsRightAfterDrag = await controls();
await samp;
log.dragSamples = samples;
// snap-back detection: after the drag ends, positions should move monotonic toward settle
let reversals = 0; for (let i = 2; i < samples.length; i++) { const d1 = samples[i - 1] - samples[i - 2], d2 = samples[i] - samples[i - 1]; if (d1 * d2 < 0 && Math.abs(d2) > 3) reversals++; }
log.reversals = reversals;
await sleep(1500);
await shot(page, `${tag}-08-after-drag`);
log.controlsAfterDrag = await controls();
log.cardsAfterDrag = await page.evaluate(() => [...document.querySelectorAll('[aria-label^="Enter Spot"], [aria-label^="Focus Spot"]')].map((d) => ({ t: d.getAttribute("aria-label").slice(0, 30), x: Math.round(d.getBoundingClientRect().x) })));
// press Continue
const contBtn = page.locator('button:has-text("Continue")').first();
if (await contBtn.count()) { const cb = await contBtn.boundingBox(); await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(4000); await shot(page, `${tag}-09-continued`); log.controlsAfterContinue = await controls(); }
// Stop the walk
const stopBtn = page.locator('button:has-text("Stop the walk")').first();
if (await stopBtn.count()) { const sb = await stopBtn.boundingBox(); await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2); await sleep(1500); await shot(page, `${tag}-10-stopped`); log.controlsAfterStop = await controls(); }
// Back
const back = page.locator('button[aria-label="Back to map"], button:has-text("Back")').first();
if (await back.count()) { const bb = await back.boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(3000); await shot(page, `${tag}-11-back-overview`); log.controlsAfterBack = await controls(); }

// 1858 lens
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(800);
log.controlsBeforeLens = await controls();
const lens = page.locator('button:has-text("1858")').first();
let lb = await lens.boundingBox();
if (!lb) { await page.reload({ waitUntil: "networkidle" }); await sleep(5000); log.lensNeededReload = true; lb = await lens.boundingBox(); }
if (lb) {
  await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2);
  await sleep(2500);
  await shot(page, `${tag}-12-lens-open`);
  log.lensControls = await controls();
  log.lensCaption = await page.evaluate(() => [...document.querySelectorAll("p,span,div,figcaption")].filter((e) => /Library of Congress|Drag to explore/.test(e.textContent || "") && e.children.length <= 3 && e.getBoundingClientRect().height < 120).map((e) => ({ t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 90), lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight || 16)), rect: [Math.round(e.getBoundingClientRect().x), Math.round(e.getBoundingClientRect().y), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)] })).slice(0, 4));
  log.lensImg = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.src) || /1858/.test(i.alt || "")); if (!img) return null; const r = img.getBoundingClientRect(); const box = img.parentElement.getBoundingClientRect(); return { src: img.currentSrc.split("/").pop(), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], parent: [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)], transform: getComputedStyle(img).transform, natural: [img.naturalWidth, img.naturalHeight] }; });
  // zoom in with keyboard +
  await page.keyboard.press("+"); await sleep(400); await page.keyboard.press("+"); await sleep(600);
  await shot(page, `${tag}-13-lens-zoomed`);
  await page.keyboard.press("0"); await sleep(600);
  const backT = page.locator('button:has-text("Back to today")').first();
  const bt = await backT.boundingBox();
  await page.mouse.click(bt.x + bt.width / 2, bt.y + bt.height / 2);
  await sleep(1500);
  await shot(page, `${tag}-14-back-today`);
  log.afterLensControls = await controls();
}
// menu on the map page: scroll page (below map) and check menu hide
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(300);
for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 120); await sleep(100); }
await sleep(700);
log.menuHiddenOnMapScroll = await page.evaluate(() => document.querySelector(".cnwm-menu")?.getAttribute("data-hidden"));
for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -40); await sleep(100); }
await sleep(700);
log.menuShownOnMapScrollUp = await page.evaluate(() => document.querySelector(".cnwm-menu")?.getAttribute("data-hidden"));
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(500);
await page.click('button[aria-label="Open menu"]');
await sleep(900);
await shot(page, `${tag}-15-menu-open`);
log.menuOpenControls = await controls();
await page.keyboard.press("Escape");
await sleep(600);
log.menuClosed = await page.evaluate(() => !!document.querySelector('button[aria-label="Open menu"]'));

writeJson(`map-${vp}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
console.log("ERRS", JSON.stringify(errs.filter((e) => !/ERR_ABORTED/.test(e.text)), null, 1));
await browser.close();
