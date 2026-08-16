// The map as a visitor: overview, Take the walk, drag mid-walk, Continue, Stop, lens, Back, menu.
import { launch, ctx, VPS, shot, go, sleep, watchConsole, OUT } from "./juror2-lib.mjs";
import fs from "node:fs";
import path from "node:path";
const errs = []; const notes = []; const N = (s) => { notes.push(s); console.log(s); };
const browser = await launch();
const vps = (process.argv[2] || "p390,p360,t768,t1024,d1440,d1920").split(",");

const btn = (page, label) => page.locator(`button:visible:has-text("${label}"), a:visible:has-text("${label}")`).first();
const visibleButtons = (page) => page.evaluate(() => [...document.querySelectorAll("button,a")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05; }).map((e) => `"${(e.getAttribute("aria-label") || e.textContent).trim().replace(/\s+/g, " ").slice(0, 34)}"@${Math.round(e.getBoundingClientRect().x)},${Math.round(e.getBoundingClientRect().y)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));

async function drag(page, vp, from, to, steps = 12, ms = 250) {
  if (vp.mobile) {
    const cdp = await page.context().newCDPSession(page);
    const pt = (x, y) => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pt(from.x, from.y)] });
    for (let i = 1; i <= steps; i++) { const x = from.x + (to.x - from.x) * i / steps, y = from.y + (to.y - from.y) * i / steps; await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [pt(x, y)] }); await sleep(ms / steps); }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
  } else {
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    for (let i = 1; i <= steps; i++) { await page.mouse.move(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps); await sleep(ms / steps); }
    await page.mouse.up();
  }
}

for (const vpk of vps) {
  const vp = VPS[vpk];
  const c = await ctx(browser, vp); const page = await c.newPage(); watchConsole(page, `map-${vpk}`, errs);
  await go(page, "/map", 6000);
  await shot(page, `map-${vpk}-01-overview`);
  N(`map@${vpk} overview buttons: ${(await visibleButtons(page)).join(" | ")}`);
  // Menu on the map page
  await page.locator('button[aria-label="Open menu"]').click(); await sleep(800); await shot(page, `map-${vpk}-02-menu`);
  await page.locator('button[aria-label="Close menu"]').click(); await sleep(600);
  // Scroll the page under the map (index below)
  await page.evaluate(() => scrollTo(0, innerHeight * 1.2)); await sleep(900); await shot(page, `map-${vpk}-03-index`);
  N(`map@${vpk} burger after scroll-down: ${await page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const w = b.closest("[class*=menu]") || b.parentElement; const r = b.getBoundingClientRect(); return `btnY=${Math.round(r.y)} wrapOpacity=${getComputedStyle(w).opacity} wrapTransform=${getComputedStyle(w).transform}`; })}`);
  await page.evaluate(() => scrollTo(0, 0)); await sleep(900);
  // Take the walk
  await btn(page, "Take the walk").click(); await sleep(2500);
  await shot(page, `map-${vpk}-04-walk-start`);
  await sleep(6000);
  await shot(page, `map-${vpk}-05-walk-mid`);
  N(`map@${vpk} walk buttons: ${(await visibleButtons(page)).filter((s) => !/Focus|Enter|Spot \d:/.test(s)).join(" | ")}`);
  // Which card is active now?
  const activeBefore = await page.evaluate(() => [...document.querySelectorAll("[aria-label^='Enter Spot']")].map((e) => e.getAttribute("aria-label")).join(","));
  // Drag the cards
  const card = await page.locator("[aria-label^='Enter Spot']").first().boundingBox();
  const cy = card.y + card.height / 2;
  const t0 = Date.now();
  await drag(page, vp, { x: card.x + card.width * 0.7, y: cy }, { x: card.x + card.width * 0.7 - Math.min(220, vp.width * 0.5), y: cy }, 14, 260);
  const label = async () => page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).find((t) => /Continue|Stop the walk|Walk again/.test(t)));
  N(`map@${vpk} label right after drag: ${await label()} (${Date.now() - t0}ms)`);
  // sample the active card x over 500ms for snap-back
  const xs = [];
  for (let i = 0; i < 20; i++) { xs.push(await page.evaluate(() => { const e = document.querySelector("[aria-label^='Enter Spot']") || document.querySelector("[aria-label^='Focus Spot']"); return Math.round(e.getBoundingClientRect().x); })); await sleep(25); }
  N(`map@${vpk} active-card x samples after release: ${xs.join(",")}`);
  await sleep(1200);
  await shot(page, `map-${vpk}-06-after-drag`);
  const activeAfter = await page.evaluate(() => [...document.querySelectorAll("[aria-label^='Enter Spot']")].map((e) => e.getAttribute("aria-label")).join(","));
  N(`map@${vpk} active before drag: ${activeBefore} → after: ${activeAfter}; label now: ${await label()}`);
  N(`map@${vpk} paused-state buttons: ${(await visibleButtons(page)).filter((s) => !/Focus|Enter|Spot \d:/.test(s)).join(" | ")}`);
  // Continue
  const cont = page.locator("button", { hasText: /^Continue$/ }).first();
  if (await cont.count()) { await cont.click(); await sleep(4500); N(`map@${vpk} after Continue 4.5s: active=${await page.evaluate(() => [...document.querySelectorAll("[aria-label^='Enter Spot']")].map((e) => e.getAttribute("aria-label")).join(","))} label=${await label()}`); await shot(page, `map-${vpk}-07-continued`); }
  // Stop the walk
  const stop = page.locator("button", { hasText: /Stop the walk/ }).first();
  if (await stop.count()) { await stop.click(); await sleep(1500); N(`map@${vpk} after Stop: label=${await label()} buttons=${(await visibleButtons(page)).filter((s) => !/Focus|Enter|Spot \d:/.test(s)).join(" | ")}`); await shot(page, `map-${vpk}-08-stopped`); }
  // Back
  const back = page.locator("button", { hasText: /^Back( to map)?$/ }).first();
  if (await back.count()) { await back.click(); await sleep(2500); await shot(page, `map-${vpk}-09-back-overview`); N(`map@${vpk} after Back: ${(await visibleButtons(page)).filter((s) => !/Focus|Enter|Spot \d:/.test(s)).join(" | ")}`); }
  // Lens
  await btn(page, "See Troy in 1858").click(); await sleep(2500);
  await shot(page, `map-${vpk}-10-lens-open`);
  N(`map@${vpk} lens buttons: ${(await visibleButtons(page)).filter((s) => !/Focus|Enter|Spot \d:/.test(s)).join(" | ")}`);
  const lensInfo = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.src) || /1858/.test(i.alt)); if (!img) return null; const r = img.getBoundingClientRect(); const p = img.parentElement.getBoundingClientRect(); return { img: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], viewer: [Math.round(p.x), Math.round(p.y), Math.round(p.width), Math.round(p.height)], src: img.currentSrc.split("/").pop(), natural: img.naturalWidth + "x" + img.naturalHeight, transform: getComputedStyle(img).transform }; });
  N(`map@${vpk} lens: ${JSON.stringify(lensInfo)}`);
  // pan the lens
  const centre = { x: vp.width / 2, y: vp.height / 2 };
  await drag(page, vp, centre, { x: centre.x + 120, y: centre.y + 80 }, 10, 300); await sleep(600);
  await shot(page, `map-${vpk}-11-lens-panned`);
  if (!vp.mobile) { await page.mouse.move(centre.x, centre.y); await page.mouse.wheel(0, -600); await sleep(800); await shot(page, `map-${vpk}-12-lens-zoomed`); }
  else { const cdp = await page.context().newCDPSession(page); const pt = (x, y, id) => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id }); await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pt(centre.x - 30, centre.y, 1), pt(centre.x + 30, centre.y, 2)] }); for (let i = 1; i <= 10; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [pt(centre.x - 30 - i * 8, centre.y, 1), pt(centre.x + 30 + i * 8, centre.y, 2)] }); await sleep(30); } await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cdp.detach(); await sleep(800); await shot(page, `map-${vpk}-12-lens-zoomed`); }
  N(`map@${vpk} lens after zoom: ${JSON.stringify(await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.src) || /1858/.test(i.alt)); return img && getComputedStyle(img).transform; }))}`);
  await btn(page, "Back to today").click(); await sleep(1500);
  await shot(page, `map-${vpk}-13-back-today`);
  // Tap a marker from the overview → focused; then Back
  const m3 = page.locator('button[aria-label^="Spot 3"]').first();
  if (await m3.count()) { const bb = await m3.boundingBox(); if (bb) { await page.mouse.click(bb.x + 1, bb.y + 1); await sleep(3000); await shot(page, `map-${vpk}-14-marker-focus`); N(`map@${vpk} focused via marker: ${(await visibleButtons(page)).filter((s) => !/Focus|Enter|Spot \d:/.test(s)).join(" | ")}`); } }
  await c.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, `map-notes-${vps.join("_")}.txt`), notes.concat(["", "CONSOLE:", ...errs.filter((e) => !/vector\.pbf|ERR_ABORTED/.test(e))]).join("\n"));
console.log("console:", errs.filter((e) => !/vector\.pbf|ERR_ABORTED/.test(e)).join("\n"));
