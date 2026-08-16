import { launch, ctx, watch, shot, sleep, save, goto, VPS, FLOATING_JS, touchDrag, rect } from "./juror5-lib.mjs";

const which = process.argv[2] ? process.argv[2].split(",") : ["p390"];
const results = {};
const browser = await launch();
const controls = () =>
  [...document.querySelectorAll("button, a, [role=button]")]
    .filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05; })
    .map((b) => { const r = b.getBoundingClientRect(); return { l: (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
const activeCard = () => { const s = document.querySelector(".keen-slider__slide"); return s ? Math.round(s.getBoundingClientRect().x) : null; };
const burgerState = () => { const b = document.querySelector('button[aria-label*="menu" i]'); if (!b) return null; let e = b; const chain = []; while (e && e !== document.body) { const cs = getComputedStyle(e); chain.push({ tag: e.tagName, cls: (e.className || "").toString().slice(0, 40), op: cs.opacity, tf: cs.transform, vis: cs.visibility, disp: cs.display, pe: cs.pointerEvents }); e = e.parentElement; } const r = b.getBoundingClientRect(); return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, chain: chain.slice(0, 4), hit: (() => { const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return el ? (el.getAttribute("aria-label") || el.tagName + "." + (el.className || "").toString().slice(0, 30)) : null; })() }; };

for (const key of which) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  const R = (results[key] = {});
  await goto(page, "/map");
  await sleep(12000);
  await shot(page, `map-${key}-20-overview-12s`);
  R.hintAt12s = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => e.children.length === 0 && /drag to explore/i.test(e.textContent || "")).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(e).opacity, pop: getComputedStyle(e.parentElement).opacity }; }));
  // walk
  await page.getByRole("button", { name: /take the walk/i }).click();
  await sleep(2500);
  R.burgerInWalk = await page.evaluate(burgerState);
  // flick forward with a real fast flick (~ 250px in 120ms)
  const strip = await page.evaluate(() => { const s = document.querySelector(".keen-slider"); const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const cy = strip.y + strip.h / 2;
  const before = await page.evaluate(activeCard);
  const sampP = page.evaluate(async () => { const s = document.querySelector(".keen-slider"); const out = []; const t0 = performance.now(); while (performance.now() - t0 < 1500) { out.push({ t: Math.round(performance.now() - t0), x: Math.round(s.querySelector(".keen-slider__slide").getBoundingClientRect().x) }); await new Promise((r) => requestAnimationFrame(r)); } return out; });
  if (vp.mobile) await touchDrag(page, { x: strip.x + strip.w * 0.8, y: cy }, { x: strip.x + strip.w * 0.15, y: cy }, 8, 14);
  else { const x0 = strip.x + strip.w * 0.8, x1 = strip.x + strip.w * 0.15; await page.mouse.move(x0, cy); await page.mouse.down(); for (let i = 1; i <= 8; i++) { await page.mouse.move(x0 + ((x1 - x0) * i) / 8, cy); await sleep(14); } await page.mouse.up(); }
  const samples = await sampP;
  R.flick = { before, samples: samples.filter((s, i) => i % 5 === 0), after: await page.evaluate(activeCard), controls: (await page.evaluate(controls)).filter((c) => /back|stop|continue|menu/i.test(c.l)) };
  // how many cards did it advance? slide width ~ (w) ; compute
  R.flick.advanced = Math.round((before - R.flick.after) / 340 * 10) / 10;
  await sleep(1500);
  await shot(page, `map-${key}-21-after-flick`);
  R.flick.markersAfter = await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return { t: m.getAttribute("aria-label")?.slice(0, 30), x: Math.round(r.x), y: Math.round(r.y) }; }));
  // slow 20px drag -> should return to same card and map should not move
  const b2 = await page.evaluate(activeCard);
  const c1 = await page.evaluate(() => { const m = document.querySelector(".mapboxgl-marker"); const r = m.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y)]; });
  if (vp.mobile) await touchDrag(page, { x: strip.x + strip.w * 0.5, y: cy }, { x: strip.x + strip.w * 0.5 - 20, y: cy }, 10, 30);
  else { const x0 = strip.x + strip.w * 0.5; await page.mouse.move(x0, cy); await page.mouse.down(); for (let i = 1; i <= 10; i++) { await page.mouse.move(x0 - 2 * i, cy); await sleep(30); } await page.mouse.up(); }
  await sleep(1200);
  const c2 = await page.evaluate(() => { const m = document.querySelector(".mapboxgl-marker"); const r = m.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y)]; });
  R.nudge = { before: b2, after: await page.evaluate(activeCard), markerBefore: c1, markerAfter: c2 };
  // tap the next (inactive) card
  const nextCard = await page.evaluate(() => { const s = [...document.querySelectorAll(".keen-slider__slide")].find((s) => { const r = s.getBoundingClientRect(); return r.x > innerWidth * 0.6 && r.x < innerWidth; }); if (!s) return null; const r = s.getBoundingClientRect(); return { x: r.x + 10, y: r.y + r.height / 2 }; });
  if (nextCard) { if (vp.mobile) { const { touchTap } = await import("./juror5-lib.mjs"); await touchTap(page, nextCard.x, nextCard.y); } else await page.mouse.click(nextCard.x, nextCard.y); await sleep(2000); R.tapNext = { active: await page.evaluate(activeCard), controls: (await page.evaluate(controls)).filter((c) => /back|stop|continue/i.test(c.l)) }; await shot(page, `map-${key}-22-tap-next`); }
  // walk to the end: press Continue then wait for the 5th
  const cont = page.getByRole("button", { name: /continue/i });
  if (await cont.count()) { await cont.first().click(); }
  await sleep(26000);
  R.endControls = (await page.evaluate(controls)).filter((c) => /back|stop|continue|walk again/i.test(c.l));
  await shot(page, `map-${key}-23-walk-end`);
  // Back
  await page.getByRole("button", { name: /^back/i }).first().click();
  await sleep(2500);
  R.afterBack = (await page.evaluate(controls)).filter((c) => /back|walk|1858|menu/i.test(c.l));
  // lens
  const lensBtn = page.getByRole("button", { name: /1858/i }).first();
  R.lensBtn = rect(await lensBtn.boundingBox());
  await lensBtn.click();
  await sleep(2500);
  await shot(page, `map-${key}-24-lens`);
  R.lens = {
    controls: await page.evaluate(controls),
    texts: await page.evaluate(() => [...document.querySelectorAll("p, span, figcaption, small, div")].filter((e) => e.children.length === 0 && e.textContent.trim().length > 6 && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < innerHeight && e.getBoundingClientRect().bottom > 0).map((e) => ({ t: e.textContent.trim().slice(0, 70), lines: e.getClientRects().length, w: Math.round(e.getBoundingClientRect().width), y: Math.round(e.getBoundingClientRect().top), fs: getComputedStyle(e).fontSize }))),
    imgs: await page.evaluate(() => [...document.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 100).map((i) => { const r = i.getBoundingClientRect(); return { src: i.currentSrc.split("/").pop(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), nat: i.naturalWidth + "x" + i.naturalHeight, tf: getComputedStyle(i).transform }; })),
    chip: await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => e.children.length === 0 && /april 27, 1860/i.test(e.textContent || "")).map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), vis: r.width > 0 && getComputedStyle(e).visibility !== "hidden" && parseFloat(getComputedStyle(e).opacity) > 0 }; })),
  };
  // viewer
  R.lensViewer = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 100).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0]; if (!img) return null; let e = img.parentElement; while (e && getComputedStyle(e).overflow !== "hidden" && getComputedStyle(e).overflow !== "clip") e = e.parentElement; if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), areaPct: Math.round(((r.width * r.height) / (innerWidth * innerHeight)) * 100) }; });
  // pan (drag) inside the viewer, then wheel zoom
  if (R.lensViewer) {
    const v = R.lensViewer; const cx = v.x + v.w / 2, cyy = v.y + v.h / 2;
    const t0 = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 100).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0]; return getComputedStyle(img).transform; });
    if (vp.mobile) await touchDrag(page, { x: cx, y: cyy }, { x: cx - 120, y: cyy - 80 }, 10, 16); else { await page.mouse.move(cx, cyy); await page.mouse.down(); for (let i = 1; i <= 10; i++) { await page.mouse.move(cx - 12 * i, cyy - 8 * i); await sleep(16); } await page.mouse.up(); }
    await sleep(500);
    const t1 = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 100).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0]; return getComputedStyle(img).transform; });
    R.lensPan = { t0, t1, moved: t0 !== t1 };
    await page.mouse.move(cx, cyy); await page.mouse.wheel(0, -500); await sleep(800);
    await shot(page, `map-${key}-25-lens-zoomed`);
    // keyboard: 0 resets
    await page.keyboard.press("0"); await sleep(600);
    const t2 = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 100).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0]; return getComputedStyle(img).transform; });
    R.lensReset = { t2, backToInitial: t2 === t0 };
  }
  const bt = page.getByRole("button", { name: /back to today/i }).first();
  R.backToday = rect(await bt.boundingBox());
  await bt.click(); await sleep(1500);
  R.afterBackToday = (await page.evaluate(controls)).filter((c) => /walk|1858|menu/i.test(c.l));
  await shot(page, `map-${key}-26-back-today`);
  // menu scroll hide on map: scroll the page down, check burger; up, check burger
  await page.evaluate(() => window.scrollTo({ top: 700 })); await sleep(700);
  R.burgerScrolledDown = await page.evaluate(burgerState);
  await page.evaluate(() => window.scrollBy({ top: -100 })); await sleep(700);
  R.burgerScrolledUp = await page.evaluate(burgerState);
  R.log = log;
  await c.close();
}
await browser.close();
save(`map2-${which.join("_")}.json`, results);
console.log(JSON.stringify(results, null, 1));
