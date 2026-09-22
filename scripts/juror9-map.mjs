// juror9: /map as a visitor — overview, wheel (desktop), index, Take the walk, drag, Continue, Back, 1858 lens
import { launch, goto, shot, sleep, byText, floating, VIEWPORTS, log, saveJson, touchDrag, touchTap } from "./juror9-lib.mjs";

const key = process.argv[2] || "p390";
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp);
const notes = {};
const N = (k, v) => { notes[k] = v; log(k, JSON.stringify(v)); };

const markers = () => page.evaluate(() => {
  return [...document.querySelectorAll(".mapboxgl-marker")].map((m) => {
    const r = m.getBoundingClientRect();
    const btn = m.querySelector("button, a, [role=button]") || m;
    return { label: (btn.getAttribute("aria-label") || m.textContent || "").trim().slice(0, 50), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), cls: (m.className || "").toString().slice(0, 80), inner: (btn.className || "").toString().slice(0, 120), current: btn.getAttribute("aria-current"), pressed: btn.getAttribute("aria-pressed"), inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth };
  });
});
const cardsInfo = () => page.evaluate(() => {
  const cards = [...document.querySelectorAll("[class*=keen-slider__slide], .location-cards-slider > *")];
  return cards.map((c) => { const r = c.getBoundingClientRect(); return { x: Math.round(r.left), w: Math.round(r.width), y: Math.round(r.top), h: Math.round(r.height), t: (c.textContent || "").trim().slice(0, 30) }; });
});
const btnState = async () => {
  const out = {};
  for (const t of ["Stop the walk", "Continue", "Walk again", "Back", "Take the walk", "See Troy in 1858", "Back to today"]) {
    const b = await byText(page, new RegExp("^" + t.replace(/ /g, "\\s+") + "(\\s|$)", "i"));
    if (b) out[t] = await b.boundingBox();
  }
  return out;
};

try {
  await goto(page, "/map", 5000);
  await shot(page, `${key}-map-overview`);
  N("overview.markers", await markers());
  N("overview.floating", await floating(page));
  N("overview.buttons", await btnState());
  N("overview.scrollY", await page.evaluate(() => scrollY));

  if (!vp.mobile) {
    // wheel over the map: does the page scroll? notice?
    await page.mouse.move(vp.width / 2, vp.height / 2);
    await page.mouse.wheel(0, 300);
    await sleep(500);
    N("wheel.scrollY-after-plain-wheel", await page.evaluate(() => scrollY));
    await shot(page, `${key}-map-after-plain-wheel`);
    await page.mouse.wheel(0, -300); await sleep(800);
    N("wheel.scrollY-after-back", await page.evaluate(() => scrollY));
    // ctrl+wheel: zoom?
    await page.mouse.move(vp.width / 2, vp.height / 2);
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, -200); await sleep(200);
    await page.mouse.wheel(0, -200);
    await page.keyboard.up("Control");
    await sleep(900);
    await shot(page, `${key}-map-after-ctrl-wheel`);
    N("wheel.scrollY-after-ctrl-wheel", await page.evaluate(() => scrollY));
    N("wheel.notice", await page.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => /wheel|scroll|zoom/i.test(e.textContent || "") && e.children.length === 0 && getComputedStyle(e).visibility !== "hidden" && e.getBoundingClientRect().height > 0).map((e) => ({ t: e.textContent.trim().slice(0, 80), o: getComputedStyle(e).opacity }))));
    // reset
    await goto(page, "/map", 5000);
  }

  // scroll past the map to the spot index
  await page.evaluate(() => scrollTo({ top: innerHeight * 1.05, behavior: "instant" }));
  await sleep(900);
  await shot(page, `${key}-map-index`);
  await page.evaluate(() => scrollTo({ top: innerHeight * 1.7, behavior: "instant" }));
  await sleep(600);
  await shot(page, `${key}-map-index-2`);
  N("index.titles", await page.evaluate(() => [...document.querySelectorAll(".map-index-title, [class*=index-title]")].map((e) => ({ t: e.textContent.trim().replace(/\s+/g, " "), lines: e.getClientRects().length }))));
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await sleep(600);
  await shot(page, `${key}-map-page-foot`);

  // scroll down a little and press Take the walk
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await sleep(300);
  await page.evaluate(() => scrollTo({ top: 140, behavior: "instant" }));
  await sleep(600);
  await shot(page, `${key}-map-scrolled-140`);
  let take = await byText(page, /Take the walk/i);
  N("take.btn", take ? await take.boundingBox() : null);
  if (take) {
    const b = await take.boundingBox();
    if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  }
  await sleep(1500);
  N("walk.scrollY-after-take", await page.evaluate(() => scrollY));
  await shot(page, `${key}-map-walk-1s`);
  N("walk.buttons-1s", await btnState());
  N("walk.floating", await floating(page));
  await sleep(2500);
  await shot(page, `${key}-map-walk-4s`);
  N("walk.markers-4s", await markers());
  N("walk.cards-4s", await cardsInfo());
  await sleep(4000);
  await shot(page, `${key}-map-walk-8s`);
  N("walk.markers-8s", await markers());
  N("walk.buttons-8s", await btnState());

  // drag the cards mid-walk
  const cards = await cardsInfo();
  const strip = cards.find((c) => c.w > 100) || cards[0];
  const cy = strip ? strip.y + strip.h / 2 : vp.height - 120;
  const x0 = vp.width * 0.7, x1 = vp.width * 0.25;
  const samples = [];
  const samplePromise = (async () => {
    for (let i = 0; i < 40; i++) {
      const c = await cardsInfo();
      samples.push({ t: Date.now(), xs: c.map((k) => k.x) });
      await sleep(16);
    }
  })();
  if (vp.mobile) await touchDrag(page, x0, cy, x1, cy, 14, 0, 16); else { await page.mouse.move(x0, cy); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(x0 + (x1 - x0) * i / 14, cy); await sleep(16); } await page.mouse.up(); }
  await samplePromise;
  await sleep(200);
  N("drag.buttons-immediately", await btnState());
  await shot(page, `${key}-map-after-drag-0.2s`);
  await sleep(900);
  N("drag.cards-after", await cardsInfo());
  N("drag.samples", samples.map((s) => s.xs[1] ?? s.xs[0]));
  await shot(page, `${key}-map-after-drag-1s`);
  N("drag.markers", await markers());
  // slow small drag: returns to same card?
  const before = await cardsInfo();
  if (vp.mobile) await touchDrag(page, vp.width / 2, cy, vp.width / 2 - 20, cy, 10, 0, 40); else { await page.mouse.move(vp.width / 2, cy); await page.mouse.down(); for (let i = 1; i <= 10; i++) { await page.mouse.move(vp.width / 2 - 2 * i, cy); await sleep(40); } await page.mouse.up(); }
  await sleep(1000);
  N("smalldrag.before", before.map((c) => c.x));
  N("smalldrag.after", (await cardsInfo()).map((c) => c.x));

  // Continue
  const cont = await byText(page, /^Continue/i);
  N("continue.btn", cont ? { t: (await cont.textContent()).trim(), aria: await cont.getAttribute("aria-label"), b: await cont.boundingBox() } : null);
  if (cont) { const b = await cont.boundingBox(); if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }
  await sleep(1500);
  await shot(page, `${key}-map-after-continue-1.5s`);
  N("continue.buttons", await btnState());
  await sleep(2000);
  await shot(page, `${key}-map-after-continue-3.5s`);
  // Back
  const back = await byText(page, /^Back(\s|$)/i);
  N("back.btn", back ? { t: (await back.textContent()).trim(), aria: await back.getAttribute("aria-label"), b: await back.boundingBox() } : null);
  if (back) { const b = await back.boundingBox(); if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }
  await sleep(2500);
  await shot(page, `${key}-map-after-back`);
  N("back.markers", await markers());
  N("back.buttons", await btnState());
  N("back.floating", await floating(page));

  // 1858 lens
  const lens = await byText(page, /See Troy in 1858/i);
  N("lens.btn", lens ? await lens.boundingBox() : null);
  if (lens) { const b = await lens.boundingBox(); if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }
  await sleep(2500);
  await shot(page, `${key}-map-lens-open`);
  N("lens.floating", await floating(page));
  N("lens.buttons", await btnState());
  N("lens.caption", await page.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => /Library of Congress|Drag to explore/i.test(e.textContent || "") && e.children.length <= 2 && e.getBoundingClientRect().height > 0).map((e) => ({ t: e.textContent.trim().replace(/\s+/g, " "), lines: e.getClientRects().length, r: (() => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; })() }))));
  // pan/zoom lens a little
  if (vp.mobile) await touchDrag(page, vp.width / 2, vp.height / 2, vp.width / 2 - 80, vp.height / 2 - 60, 10); else { await page.mouse.move(vp.width / 2, vp.height / 2); await page.mouse.down(); await page.mouse.move(vp.width / 2 - 80, vp.height / 2 - 60, { steps: 10 }); await page.mouse.up(); }
  await sleep(800);
  await shot(page, `${key}-map-lens-panned`);
  const today = await byText(page, /Back to today/i);
  N("lens.backtoday", today ? await today.boundingBox() : null);
  if (today) { const b = await today.boundingBox(); if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }
  await sleep(2000);
  await shot(page, `${key}-map-after-lens`);
  N("afterlens.buttons", await btnState());
  N("afterlens.markers", await markers());

  // tap a marker from overview → focused
  const mk = await markers();
  const m3 = mk[2];
  if (m3) { if (vp.mobile) await touchTap(page, m3.x + m3.w / 2, m3.y + m3.h / 2); else await page.mouse.click(m3.x + m3.w / 2, m3.y + m3.h / 2); }
  await sleep(2500);
  await shot(page, `${key}-map-marker-tap`);
  N("markertap.buttons", await btnState());
  N("markertap.floating", await floating(page));
  // menu open on map
  const burger = page.locator("button[aria-label*='menu' i]").first();
  if (await burger.count()) {
    N("menu.burger", await burger.boundingBox());
    if (await burger.isVisible()) { await burger.click(); await sleep(900); await shot(page, `${key}-map-menu-open`); await page.keyboard.press("Escape"); await sleep(600); }
  }
} catch (e) {
  log("ERR", e); notes.error = String(e);
}
notes.consoleErrors = errors;
saveJson(`${key}-map-notes`, notes);
log("console errors:", JSON.stringify(errors, null, 1));
await browser.close();
