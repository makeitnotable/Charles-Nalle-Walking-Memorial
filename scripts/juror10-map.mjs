// /map visitor pass: overview, wheel, index, walk, drag, continue/back, lens
import { launch, ctx, VIEWPORTS, BASE, shot, sleep, watchConsole, overflow, touchDrag, touchTap } from "./juror10-lib.mjs";

const which = process.argv[2] ? process.argv[2].split(",") : Object.keys(VIEWPORTS);
const errs = [];

const markerInfo = (page) => page.evaluate(() => {
  const ms = [...document.querySelectorAll(".mapboxgl-marker")];
  return ms.map((m) => {
    const b = m.querySelector("button") || m;
    // find the visible label/pill child
    const kids = [...m.querySelectorAll("*")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
    let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
    for (const k of kids) { const r = k.getBoundingClientRect(); minL = Math.min(minL, r.left); minT = Math.min(minT, r.top); maxR = Math.max(maxR, r.right); maxB = Math.max(maxB, r.bottom); }
    return { label: b.getAttribute("aria-label"), cls: m.className.toString().slice(0, 80) + " | " + (b.className.toString().slice(0, 80)), current: b.getAttribute("aria-current") || b.getAttribute("aria-pressed") || b.dataset.active, box: [Math.round(minL), Math.round(minT), Math.round(maxR), Math.round(maxB)], inView: minL >= 0 && minT >= 0 && maxR <= innerWidth && maxB <= innerHeight };
  });
});
const btnInfo = (page) => page.evaluate(() => [...document.querySelectorAll("main button, main a.btn")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; }).map((b) => { const r = b.getBoundingClientRect(); return `${(b.getAttribute("aria-label") || b.textContent.trim()).slice(0, 40)} @${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; }));
const cardStrip = (page) => page.evaluate(() => {
  const cards = [...document.querySelectorAll('[aria-label^="Focus Spot"], [aria-label^="Enter Spot"]')];
  if (!cards.length) return null;
  const rs = cards.map((c) => c.getBoundingClientRect());
  const top = Math.min(...rs.map((r) => r.top)), bottom = Math.max(...rs.map((r) => r.bottom));
  return { top: Math.round(top), bottom: Math.round(bottom), cards: cards.map((c, i) => ({ l: c.getAttribute("aria-label").slice(0, 30), left: Math.round(rs[i].left), right: Math.round(rs[i].right), w: Math.round(rs[i].width), scale: getComputedStyle(c.parentElement).transform })) };
});
const trackSample = async (page, ms = 500) => page.evaluate(async (ms) => {
  const cards = [...document.querySelectorAll('[aria-label^="Focus Spot"], [aria-label^="Enter Spot"]')];
  const el = cards[0];
  const out = [];
  const t0 = performance.now();
  while (performance.now() - t0 < ms) { const live = document.querySelectorAll('[aria-label^="Focus Spot"], [aria-label^="Enter Spot"]')[0]; out.push(+live.getBoundingClientRect().left.toFixed(1)); await new Promise((r) => requestAnimationFrame(r)); }
  // detect reversal
  let dir = 0, reversals = 0, maxRev = 0;
  for (let i = 1; i < out.length; i++) { const d = out[i] - out[i - 1]; if (Math.abs(d) < 0.3) continue; const nd = Math.sign(d); if (dir && nd !== dir) { reversals++; maxRev = Math.max(maxRev, Math.abs(d)); } dir = nd; }
  return { n: out.length, first: out[0], last: out[out.length - 1], reversals, maxRev, samples: out };
}, ms);

for (const k of which) {
  const vp = VIEWPORTS[k];
  const browser = await launch();
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  watchConsole(page, `map-${k}`, errs);
  console.log("\n########", k);
  await page.goto(BASE + "/map", { waitUntil: "networkidle" });
  await sleep(4000);
  await shot(page, `map-overview-${k}`);
  const mk = await markerInfo(page);
  console.log("markers:", JSON.stringify(mk.map((m) => ({ l: m.label.slice(0, 20), box: m.box, inView: m.inView }))));
  console.log("buttons:", JSON.stringify(await btnInfo(page)));
  console.log("overflow", JSON.stringify(await overflow(page)));

  if (!vp.mobile) {
    // wheel over the map
    const mapBox = await page.evaluate(() => { const r = document.querySelector(".mapboxgl-canvas").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.move(mapBox.x, mapBox.y);
    const y0 = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 400); await sleep(400);
    const y1 = await page.evaluate(() => scrollY);
    await shot(page, `map-wheel-${k}`);
    const notice = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => e.children.length === 0 && /scroll|zoom|⌘|Ctrl/i.test(e.textContent || "") && e.getBoundingClientRect().width > 0 && getComputedStyle(e).opacity !== "0").map((e) => e.textContent.trim().slice(0, 80)));
    console.log(`wheel: scrollY ${y0} -> ${y1}; notice: ${JSON.stringify(notice)}`);
    await page.evaluate(() => scrollTo(0, 0)); await sleep(600);
    await page.mouse.move(mapBox.x, mapBox.y);
    const z0 = await page.evaluate(() => window.__map?.getZoom?.() ?? null);
    await page.keyboard.down("Control"); await page.mouse.wheel(0, -300); await page.keyboard.up("Control"); await sleep(900);
    const z1 = await page.evaluate(() => window.__map?.getZoom?.() ?? null);
    await shot(page, `map-ctrlwheel-${k}`);
    console.log(`ctrl+wheel zoom: ${z0} -> ${z1} (null = no debug hook; judge from shot)`);
    await page.evaluate(() => scrollTo(0, 0)); await sleep(500);
  }
  // scroll past map to the index
  await page.evaluate(() => scrollTo({ top: innerHeight * 1.2, behavior: "instant" })); await sleep(1200);
  await shot(page, `map-index-${k}`);
  const idx = await page.evaluate(() => [...document.querySelectorAll(".map-index-title")].map((e) => ({ t: e.textContent.trim().replace(/\s+/g, " "), lines: e.getClientRects().length, right: Math.round(e.getBoundingClientRect().right), iw: innerWidth })));
  console.log("index titles:", JSON.stringify(idx));
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(500);
  // scroll down a little then Take the walk
  await page.evaluate(() => scrollTo({ top: 220, behavior: "instant" })); await sleep(600);
  const twk = page.locator("button:visible", { hasText: "Take the walk" }).first();
  const tb = await twk.boundingBox();
  console.log("Take the walk box:", JSON.stringify(tb));
  await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await sleep(2500);
  console.log("scrollY after Take the walk:", await page.evaluate(() => scrollY));
  await shot(page, `map-walk-start-${k}`);
  console.log("walk buttons:", JSON.stringify(await btnInfo(page)));
  await sleep(4000);
  await shot(page, `map-walk-mid-${k}`);
  const strip = await cardStrip(page);
  const mk2 = await markerInfo(page);
  console.log("strip:", JSON.stringify(strip));
  console.log("markers in walk:", JSON.stringify(mk2.map((m) => ({ l: m.label.slice(0, 22), box: m.box }))));
  const clash = mk2.filter((m) => strip && m.box[3] > strip.top && m.box[1] < strip.bottom && m.box[0] < innerWidth);
  console.log("marker overlapping card strip:", JSON.stringify(clash.map((m) => m.label.slice(0, 30) + " " + m.box)));
  // burger visible during walk?
  console.log("burger:", JSON.stringify(await page.evaluate(() => { const b = document.querySelector(".cnwm-menu-burger"); const r = b.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left), inView: r.top < innerHeight && r.bottom > 0, op: getComputedStyle(b.parentElement).opacity, vis: getComputedStyle(b).visibility }; })));
  // drag cards mid-walk
  const s0 = strip;
  const cy = (s0.top + s0.bottom) / 2;
  const cx = vp.width / 2;
  if (vp.mobile) await touchDrag(page, cx + 60, cy, cx - 100, cy, 16, 220);
  else { await page.mouse.move(cx + 60, cy); await page.mouse.down(); for (let i = 1; i <= 16; i++) { await page.mouse.move(cx + 60 - (160 * i) / 16, cy); await sleep(14); } await page.mouse.up(); }
  const samp = await trackSample(page, 700);
  await sleep(300);
  console.log("after drag: track sample:", JSON.stringify(samp));
  console.log("buttons after drag:", JSON.stringify(await btnInfo(page)));
  await shot(page, `map-walk-dragged-${k}`);
  console.log("strip after drag:", JSON.stringify(await cardStrip(page)));
  // wait — does it stay paused (no auto-advance)?
  const before = await cardStrip(page);
  await sleep(4500);
  const after = await cardStrip(page);
  console.log("paused stays? card0 left before/after 4.5s:", before?.cards[0].left, after?.cards[0].left);
  // Continue
  const cont = page.locator("button:visible", { hasText: /^Continue/ }).first();
  const cbb = await cont.boundingBox();
  console.log("Continue box:", JSON.stringify(cbb));
  if (cbb) { await page.mouse.click(cbb.x + cbb.width / 2, cbb.y + cbb.height / 2); }
  await sleep(3500);
  await shot(page, `map-walk-continued-${k}`);
  console.log("buttons after continue:", JSON.stringify(await btnInfo(page)));
  // Back
  const back = page.locator("button:visible", { hasText: /^Back/ }).first();
  const bbb = await back.boundingBox();
  console.log("Back box:", JSON.stringify(bbb));
  await page.mouse.click(bbb.x + bbb.width / 2, bbb.y + bbb.height / 2);
  await sleep(3000);
  await shot(page, `map-after-back-${k}`);
  const mk3 = await markerInfo(page);
  console.log("markers after back:", JSON.stringify(mk3.map((m) => ({ l: m.label.slice(0, 20), cls: m.cls, cur: m.current }))));
  console.log("buttons after back:", JSON.stringify(await btnInfo(page)));
  // Lens
  const lens = page.locator("button:visible", { hasText: "See Troy in 1858" }).first();
  const lb = await lens.boundingBox();
  console.log("lens btn:", JSON.stringify(lb));
  await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2);
  await sleep(3500);
  await shot(page, `map-lens-${k}`);
  console.log("lens buttons:", JSON.stringify(await btnInfo(page)));
  const lensInfo = await page.evaluate(() => {
    const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.currentSrc || i.src));
    const r = img?.getBoundingClientRect();
    const cap = [...document.querySelectorAll("p, span, div")].filter((e) => e.children.length === 0 && /Library of Congress|Drag to explore/i.test(e.textContent || "")).map((e) => ({ t: e.textContent.trim(), lines: e.getClientRects().length, box: [Math.round(e.getBoundingClientRect().left), Math.round(e.getBoundingClientRect().top), Math.round(e.getBoundingClientRect().right), Math.round(e.getBoundingClientRect().bottom)] }));
    // floating things over the plate
    const viewer = img?.closest("[style*=overflow], [class*=overflow]") || img?.parentElement;
    const vr = viewer?.getBoundingClientRect();
    const floats = [...document.querySelectorAll("body *")].filter((e) => { const cs = getComputedStyle(e); return (cs.position === "fixed" || cs.position === "absolute") && e.getBoundingClientRect().width > 8 && cs.opacity !== "0" && cs.visibility !== "hidden" && !viewer?.contains(e) && !e.contains(viewer); }).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent.trim()).slice(0, 30), box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], overPlate: vr && r.left < vr.right && r.right > vr.left && r.top < vr.bottom && r.bottom > vr.top } ; }).filter((f) => f.overPlate && f.t);
    return { img: img && { src: img.currentSrc.split("/").pop(), rect: r && [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], transform: getComputedStyle(img).transform.slice(0, 60) }, viewer: vr && [Math.round(vr.left), Math.round(vr.top), Math.round(vr.width), Math.round(vr.height)], caption: cap, floats: floats.slice(0, 12) };
  });
  console.log("lens:", JSON.stringify(lensInfo));
  const bt = page.locator("button:visible", { hasText: "Back to today" }).first();
  const btb = await bt.boundingBox();
  await page.mouse.click(btb.x + btb.width / 2, btb.y + btb.height / 2);
  await sleep(1500);
  await shot(page, `map-lens-closed-${k}`);
  console.log("buttons after lens close:", JSON.stringify(await btnInfo(page)));
  await c.close();
  await browser.close();
}
console.log("CONSOLE", JSON.stringify(errs, null, 1));
