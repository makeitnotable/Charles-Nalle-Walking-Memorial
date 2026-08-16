// Map + the walk + the 1858 lens, as a visitor. Phone uses CDP touch drags.
import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const ks = (process.argv[2] || "p390,d1440").split(",");
const R = {};

const ui = (page) => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden" && getComputedStyle(e).opacity !== "0"; };
  const btns = [...document.querySelectorAll("button, a.btn, [role=button]")].filter(vis).map((b) => { const r = b.getBoundingClientRect(); return `${(b.getAttribute("aria-label") || b.textContent.trim().replace(/\s+/g, " ")).slice(0, 44)} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
  const chip = [...document.querySelectorAll("div, span, p")].filter((e) => vis(e) && /1860/.test(e.textContent) && e.textContent.trim().length < 40 && e.children.length < 3).map((e) => e.textContent.trim())[0];
  const m = window.__troyMap;
  let map = null;
  try { if (m) { const mm = m.map || m; map = { center: mm.getCenter?.() && [+mm.getCenter().lng.toFixed(5), +mm.getCenter().lat.toFixed(5)], zoom: +mm.getZoom?.().toFixed(2), pitch: +mm.getPitch?.().toFixed(1), moving: mm.isMoving?.(), state: m.state ?? m.walk ?? undefined, keys: Object.keys(m).slice(0, 20) }; } } catch (e) { map = { err: String(e) }; }
  const active = document.querySelector('[aria-label^="Enter Spot"]')?.getAttribute("aria-label");
  const burger = document.querySelector(".cnwm-menu");
  return { btns, chip, map, active, burgerAttrs: burger && [...burger.attributes].map((a) => a.name + "=" + a.value).join(" "), burgerOp: burger && getComputedStyle(burger).opacity };
});

async function touchDrag(page, x0, y0, x1, y1, steps = 12, ms = 250) {
  const cdp = await page.context().newCDPSession(page);
  const t = (x, y) => [{ x, y, id: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: t(x0, y0) });
  for (let i = 1; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps, y = y0 + ((y1 - y0) * i) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: t(x, y) });
    await sleep(ms / steps);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
async function mouseDrag(page, x0, y0, x1, y1, steps = 12, ms = 250) {
  await page.mouse.move(x0, y0); await page.mouse.down();
  for (let i = 1; i <= steps; i++) { await page.mouse.move(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps); await sleep(ms / steps); }
  await page.mouse.up();
}

for (const k of ks) {
  const vp = VPS[k];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  const rec = { steps: [] };
  const drag = vp.mobile ? touchDrag : mouseDrag;
  await page.goto(BASE + "/map", { waitUntil: "networkidle" });
  await sleep(4500); // prologue
  rec.steps.push({ s: "overview", ...(await ui(page)) });
  await shot(page, `map-${k}-01-overview`);
  // scroll the index below the map (phone: does touch scroll work?)
  if (vp.mobile) { await touchDrag(page, 200, 700, 200, 300, 10, 300); await sleep(900); rec.steps.push({ s: "after touch scroll", scrollY: await page.evaluate(() => scrollY) }); await shot(page, `map-${k}-01b-scrolled`); await page.evaluate(() => scrollTo(0, 0)); await sleep(600); }
  else { await page.evaluate(() => scrollTo(0, innerHeight)); await sleep(900); await shot(page, `map-${k}-01b-index`); await page.evaluate(() => scrollTo(0, 0)); await sleep(600); }
  // Take the walk
  await page.getByRole("button", { name: /take the walk/i }).click();
  await sleep(2500);
  rec.steps.push({ s: "walk started +2.5s", ...(await ui(page)) });
  await shot(page, `map-${k}-02-walk`);
  // watch auto-cycle
  const seen = [];
  for (let i = 0; i < 16; i++) { await sleep(750); seen.push(await page.evaluate(() => document.querySelector('[aria-label^="Enter Spot"]')?.getAttribute("aria-label")?.slice(0, 13))); }
  rec.autoCycle = seen;
  await shot(page, `map-${k}-03-walk-later`);
  // drag cards mid-walk
  const cardY = vp.mobile ? vp.height - 120 : vp.height - 200;
  const trackPos = () => page.evaluate(() => { const t = document.querySelector('[aria-label^="Enter Spot"], [aria-label^="Focus Spot"]')?.closest("[class*=slider], .keen-slider, [class*=track]") || document.querySelector('[aria-label^="Enter Spot"]')?.parentElement?.parentElement; const first = document.querySelector('[aria-label^="Focus Spot 01"], [aria-label^="Enter Spot 01"]'); return first ? Math.round(first.getBoundingClientRect().x) : null; });
  const before = await trackPos();
  const dragP = drag(page, Math.round(vp.width * 0.75), cardY, Math.round(vp.width * 0.25), cardY, 14, 300);
  await dragP;
  const t0 = performance.now();
  const samples = [];
  const uiNow = await ui(page);
  rec.steps.push({ s: "immediately after drag", ...uiNow });
  for (let i = 0; i < 26; i++) { samples.push(await trackPos()); await sleep(16); }
  rec.dragSamples = { before, samples };
  await sleep(900);
  rec.steps.push({ s: "after drag +1s", ...(await ui(page)) });
  await shot(page, `map-${k}-04-dragged`);
  // does it stay paused? watch 6s
  const seen2 = [];
  for (let i = 0; i < 8; i++) { await sleep(750); seen2.push(await page.evaluate(() => document.querySelector('[aria-label^="Enter Spot"]')?.getAttribute("aria-label")?.slice(0, 13))); }
  rec.pausedWatch = seen2;
  // Continue
  const cont = page.getByRole("button", { name: /continue/i });
  rec.hasContinue = await cont.count();
  if (rec.hasContinue) {
    await cont.first().click();
    const seen3 = [];
    for (let i = 0; i < 12; i++) { await sleep(750); seen3.push(await page.evaluate(() => document.querySelector('[aria-label^="Enter Spot"]')?.getAttribute("aria-label")?.slice(0, 13))); }
    rec.afterContinue = seen3;
    rec.steps.push({ s: "after Continue", ...(await ui(page)) });
    await shot(page, `map-${k}-05-continued`);
  }
  // Stop the walk
  const stop = page.getByRole("button", { name: /stop the walk/i });
  if (await stop.count()) {
    await stop.first().click();
    const mv = [];
    for (let i = 0; i < 10; i++) { await sleep(150); mv.push(await page.evaluate(() => { const m = window.__troyMap; const mm = m?.map || m; return mm?.isMoving?.(); })); }
    rec.afterStopMoving = mv;
    rec.steps.push({ s: "after Stop", ...(await ui(page)) });
    await shot(page, `map-${k}-06-stopped`);
  }
  // Back
  const back = page.getByRole("button", { name: /^back( to map)?$/i });
  rec.hasBack = await back.count();
  if (rec.hasBack) { await back.first().click(); await sleep(2500); rec.steps.push({ s: "after Back", ...(await ui(page)) }); await shot(page, `map-${k}-07-back`); }
  // 1858 lens
  const lens = page.getByRole("button", { name: /1858/i });
  if (await lens.count()) {
    await lens.first().click();
    await sleep(2500);
    rec.steps.push({ s: "lens open", ...(await ui(page)) });
    await shot(page, `map-${k}-08-lens`);
    rec.lensImg = await page.evaluate(() => { const im = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.src) || /troy-1858/.test(i.currentSrc)); if (!im) return null; const r = im.getBoundingClientRect(); const v = im.closest("[style*=overflow], [class*=overflow]") || im.parentElement; const vr = v.getBoundingClientRect(); return { img: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], viewer: [Math.round(vr.x), Math.round(vr.y), Math.round(vr.width), Math.round(vr.height)], natural: [im.naturalWidth, im.naturalHeight], src: im.currentSrc.split("/").pop(), transform: getComputedStyle(im).transform }; });
    // pan + zoom
    const cx = vp.width / 2, cy = vp.height / 2;
    await drag(page, cx, cy, cx - 150, cy - 100, 10, 300);
    await sleep(600);
    if (vp.mobile) {
      // pinch
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: cx - 40, y: cy, id: 1 }, { x: cx + 40, y: cy, id: 2 }] });
      for (let i = 1; i <= 10; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: cx - 40 - i * 10, y: cy, id: 1 }, { x: cx + 40 + i * 10, y: cy, id: 2 }] }); await sleep(25); }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await cdp.detach();
    } else { await page.mouse.move(cx, cy); await page.mouse.wheel(0, -400); }
    await sleep(900);
    rec.lensAfter = await page.evaluate(() => { const im = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.currentSrc)); if (!im) return null; const r = im.getBoundingClientRect(); return { img: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], transform: getComputedStyle(im).transform }; });
    await shot(page, `map-${k}-09-lens-zoomed`);
    // keyboard: 0 resets
    await page.keyboard.press("0"); await sleep(700);
    rec.lensReset = await page.evaluate(() => { const im = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.currentSrc)); if (!im) return null; const r = im.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; });
    const today = page.getByRole("button", { name: /back to today/i });
    rec.hasBackToToday = await today.count();
    if (rec.hasBackToToday) { await today.first().click(); await sleep(1500); rec.steps.push({ s: "after Back to today", ...(await ui(page)) }); await shot(page, `map-${k}-10-today`); }
  }
  // tap a marker → card → Enter → chapter (curtain)
  rec.log = log.filter((l) => !/ERR_ABORTED/.test(l));
  R[k] = rec;
  save(`map-${k}.json`, rec);
  await c.close();
}
console.log(JSON.stringify(R, null, 1));
await browser.close();
