import { launch, ctx, watch, shot, sleep, save, goto, VPS, FLOATING_JS, touchDrag, rect } from "./juror5-lib.mjs";

const which = process.argv[2] ? process.argv[2].split(",") : ["p390"];
const results = {};
const browser = await launch();

const controls = () =>
  [...document.querySelectorAll("button, a, [role=button]")]
    .filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05; })
    .map((b) => { const r = b.getBoundingClientRect(); return { l: (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });

const markers = () =>
  [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); const lbl = m.querySelector("span, div"); return { t: (m.getAttribute("aria-label") || m.textContent || "").trim().slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });

for (const key of which) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  const R = (results[key] = {});
  await goto(page, "/map");
  await sleep(6000); // let the prologue camera settle
  R.overview = { controls: await page.evaluate(controls), markers: await page.evaluate(markers), floating: await page.evaluate(FLOATING_JS) };
  await shot(page, `map-${key}-01-overview`);
  R.mapShell = await page.evaluate(() => { const c = document.querySelector(".mapboxgl-canvas"); const r = c.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), docH: document.documentElement.scrollHeight }; });

  // scroll past the map to the index
  await page.evaluate(() => window.scrollTo({ top: innerHeight * 1.05 }));
  await sleep(1000);
  await shot(page, `map-${key}-02-index`);
  R.index = await page.evaluate(() => [...document.querySelectorAll("h1,h2,h3,p,a,li")].filter((e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight && r.width > 0 && e.children.length < 4; }).map((e) => e.tagName + " " + e.innerText.replace(/\n/g, " / ").slice(0, 60)));
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight }));
  await sleep(800);
  await shot(page, `map-${key}-03-indexfoot`);

  // scroll down a little from the top and press Take the walk
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await sleep(600);
  await page.evaluate(() => window.scrollTo({ top: 140 }));
  await sleep(600);
  await shot(page, `map-${key}-04-scrolled140`);
  const walkBtn = page.locator("button, a").filter({ hasText: /take the walk/i }).first();
  R.walkBtnBox = rect(await walkBtn.boundingBox());
  await walkBtn.click();
  await sleep(2600);
  R.afterWalk = { scrollY: await page.evaluate(() => scrollY), controls: await page.evaluate(controls), markers: await page.evaluate(markers), floating: await page.evaluate(FLOATING_JS) };
  await shot(page, `map-${key}-05-walk-start`);
  await sleep(4500);
  await shot(page, `map-${key}-06-walk-mid`);
  R.walkMid = { controls: await page.evaluate(controls), markers: await page.evaluate(markers) };
  // active card & label geometry: which card is active, and where's the active marker
  R.cards = await page.evaluate(() => [...document.querySelectorAll(".keen-slider__slide, [class*='slide']")].filter((s) => s.getBoundingClientRect().width > 100).map((s) => { const r = s.getBoundingClientRect(); const h = s.querySelector("h2,h3,h4,[class*='title']"); return { t: (h?.innerText || s.innerText).replace(/\n/g, " / ").slice(0, 50), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(s).opacity, tf: getComputedStyle(s).transform, titleLines: h ? h.getClientRects().length : null }; }));

  // DRAG the cards mid-walk
  const strip = await page.evaluate(() => { const s = document.querySelector(".keen-slider"); if (!s) return null; const r = s.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
  R.strip = strip;
  if (strip) {
    const cy = strip.y + strip.h / 2;
    const x0 = strip.x + strip.w * 0.7, x1 = strip.x + strip.w * 0.25;
    // sample positions during and after drag
    const samplesP = page.evaluate(async () => {
      const s = document.querySelector(".keen-slider");
      const out = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 1600) {
        const first = s.querySelector(".keen-slider__slide");
        out.push({ t: Math.round(performance.now() - t0), x: Math.round(first.getBoundingClientRect().x) });
        await new Promise((r) => requestAnimationFrame(r));
      }
      return out;
    });
    if (vp.mobile) await touchDrag(page, { x: x0, y: cy }, { x: x1, y: cy }, 14, 16);
    else { await page.mouse.move(x0, cy); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(x0 + ((x1 - x0) * i) / 14, cy); await sleep(16); } await page.mouse.up(); }
    const samples = await samplesP;
    R.dragSamples = samples;
    // reversal check on samples after the release (~250ms in)
    let reversals = 0; let dir = 0;
    for (let i = 1; i < samples.length; i++) { const d = samples[i].x - samples[i - 1].x; if (Math.abs(d) < 1) continue; const nd = Math.sign(d); if (dir && nd !== dir) reversals++; dir = nd; }
    R.dragReversals = reversals;
    await sleep(900);
    R.afterDrag = { controls: await page.evaluate(controls), markers: await page.evaluate(markers) };
    await shot(page, `map-${key}-07-after-drag`);
    // does it stay paused? wait 5s and compare active card
    const a1 = await page.evaluate(() => document.querySelector(".keen-slider__slide")?.getBoundingClientRect().x);
    await sleep(5000);
    const a2 = await page.evaluate(() => document.querySelector(".keen-slider__slide")?.getBoundingClientRect().x);
    R.stayedPaused = { a1: Math.round(a1), a2: Math.round(a2), same: Math.abs(a1 - a2) < 2 };
    await shot(page, `map-${key}-08-paused-5s`);
    // press Continue
    const cont = page.locator("button").filter({ hasText: /^continue$/i }).first();
    R.continueVisible = (await cont.count()) > 0;
    if (R.continueVisible) { await cont.click(); await sleep(3500); R.afterContinue = { controls: await page.evaluate(controls) }; await shot(page, `map-${key}-09-continued`); }
    // Stop the walk
    const stop = page.locator("button").filter({ hasText: /stop the walk/i }).first();
    if (await stop.count()) { await stop.click(); await sleep(1500); R.afterStop = { controls: await page.evaluate(controls) }; }
    // Back
    const back = page.locator("button, a").filter({ hasText: /^back/i }).first();
    if (await back.count()) { await back.click(); await sleep(2500); R.afterBack = { controls: await page.evaluate(controls), scrollY: await page.evaluate(() => scrollY) }; await shot(page, `map-${key}-10-back`); }
  }
  // Menu on map: open, close; scroll hide
  const burger = page.locator('button[aria-label*="menu" i]').first();
  R.burgerBox = rect(await burger.boundingBox());
  await burger.click(); await sleep(800); await shot(page, `map-${key}-11-menu`);
  R.menuOpen = await page.evaluate(() => [...document.querySelectorAll("[aria-expanded]")].map((e) => (e.getAttribute("aria-label") || "") + "=" + e.getAttribute("aria-expanded")));
  await page.keyboard.press("Escape"); await sleep(600);
  // 1858 lens
  const lens = page.getByRole("button", { name: /1858/i }).first();
  R.lensBtn = rect(await lens.boundingBox());
  if (R.lensBtn) {
    await lens.click(); await sleep(2500);
    await shot(page, `map-${key}-12-lens`);
    R.lens = { controls: await page.evaluate(controls), floating: await page.evaluate(FLOATING_JS), texts: await page.evaluate(() => [...document.querySelectorAll("p, span, figcaption, small")].filter((e) => e.children.length === 0 && e.textContent.trim().length > 6 && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < innerHeight && e.getBoundingClientRect().top >= 0).map((e) => ({ t: e.textContent.trim().slice(0, 70), lines: e.getClientRects().length, w: Math.round(e.getBoundingClientRect().width), y: Math.round(e.getBoundingClientRect().top) }))), imgs: await page.evaluate(() => [...document.querySelectorAll("img")].filter((i) => /1858|troy/i.test(i.src) && i.getBoundingClientRect().width > 50).map((i) => { const r = i.getBoundingClientRect(); return { src: i.currentSrc.split("/").pop(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), nat: i.naturalWidth + "x" + i.naturalHeight, tf: getComputedStyle(i).transform }; })) };
    // viewer box
    R.lensViewer = await page.evaluate(() => { const els = [...document.querySelectorAll("div, figure, section")].filter((e) => { const cs = getComputedStyle(e); return cs.overflow === "hidden" && e.querySelector("img") && e.getBoundingClientRect().width > innerWidth * 0.5; }); const e = els.sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width)[0]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), areaPct: Math.round((r.width * r.height) / (innerWidth * innerHeight) * 100) }; });
    // zoom in with wheel at centre
    const vb = R.lensViewer;
    if (vb) { await page.mouse.move(vb.x + vb.w / 2, vb.y + vb.h / 2); await page.mouse.wheel(0, -600); await sleep(900); await shot(page, `map-${key}-13-lens-zoomed`); }
    const backToday = page.getByRole("button", { name: /back to today/i }).first();
    R.backTodayBox = rect(await backToday.boundingBox());
    if (R.backTodayBox) { await backToday.click(); await sleep(1500); await shot(page, `map-${key}-14-back-today`); R.afterBackToday = { controls: await page.evaluate(controls) }; }
  }
  R.log = log;
  await c.close();
}
await browser.close();
save(`map-${which.join("_")}.json`, results);
console.log(JSON.stringify(results, null, 1));
