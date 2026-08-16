import { launch, newPage, shot, goto, sleep, report, cdp, touchDrag, VIEWPORTS } from "./juror3-lib.mjs";

const vp = process.argv[2] || "p390";
const V = VIEWPORTS[vp];
const tag = `map-${vp}`;
const browser = await launch();
const page = await newPage(browser, vp);
const session = await cdp(page);

const markers = () => page.evaluate(() => {
  const ms = [...document.querySelectorAll(".mapboxgl-marker")];
  return ms.map((m) => {
    const b = m.querySelector("button") || m;
    // union of children rects
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const el of m.querySelectorAll("*")) { const r = el.getBoundingClientRect(); if (r.width === 0) continue; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }
    return { label: (b.getAttribute("aria-label") || "").slice(0, 30), x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0), text: m.textContent.trim().slice(0, 30), inView: x0 >= 0 && y0 >= 0 && x1 <= innerWidth && y1 <= innerHeight };
  });
});
const floating = () => page.evaluate(() => [...document.querySelectorAll("button,a,[role=button]")].filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.visibility !== "hidden" && +cs.opacity > 0.05 && r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0; }).map((el) => { const r = el.getBoundingClientRect(); return `"${(el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34)}" @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`; }));
const walkBtn = () => page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((b) => /Stop the walk|Continue|Walk again/.test(b.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return { text: b.textContent.trim(), aria: b.getAttribute("aria-label"), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }; });
const cardStrip = () => page.evaluate(() => { const cards = [...document.querySelectorAll('[aria-label^="Focus Spot"], [aria-label^="Enter Spot"]')]; if (!cards.length) return null; const tops = cards.map((c) => c.getBoundingClientRect().top); const active = cards.find((c) => /^Enter/.test(c.getAttribute("aria-label"))); return { top: Math.round(Math.min(...tops)), n: cards.length, active: active?.getAttribute("aria-label"), activeRect: active && (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(active.getBoundingClientRect()), lefts: cards.map((c) => Math.round(c.getBoundingClientRect().left)) }; });

await goto(page, "/map");
await sleep(5000); // let the prologue camera settle
await shot(page, `${tag}-01-overview`);
console.log("markers overview:", await markers());
console.log("controls overview:", await floating());

// 2. scroll past the map on the phone → spot index
await page.evaluate(() => window.scrollTo(0, innerHeight + 40));
await sleep(1200);
await shot(page, `${tag}-02-index-top`);
const idx = await page.evaluate(() => [...document.querySelectorAll('a[href*="/bakery"], a[href*="/commissioners-office"], a[href*="/mansion"], a[href*="/ferry"], a[href*="/barbershop"]')].filter((a) => a.getBoundingClientRect().height > 100).map((a) => { const h = a.querySelector("h2,h3,.t-title,.t-title-sm"); const r = document.createRange(); if (!h) return a.textContent.trim().slice(0, 40); r.selectNodeContents(h); const rects = [...r.getClientRects()]; const tops = [...new Set(rects.map((x) => Math.round(x.top)))]; return `${h.textContent.trim().replace(/\s+/g, " ")} → ${tops.length} line(s)`; }));
console.log("index titles:", idx);
await page.evaluate(() => window.scrollTo(0, innerHeight * 2));
await sleep(900);
await shot(page, `${tag}-03-index-mid`);
console.log("menu while scrolled down (index):", await page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const w = b.closest(".cnwm-menu") || b.parentElement; const cs = getComputedStyle(w); return { op: cs.opacity, pe: cs.pointerEvents }; }));
await page.evaluate(() => window.scrollBy(0, -120));
await sleep(700);
console.log("menu after scroll up:", await page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const w = b.closest(".cnwm-menu") || b.parentElement; const cs = getComputedStyle(w); return { op: cs.opacity, pe: cs.pointerEvents }; }));
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(800);

// 3. Take the walk
const take = await page.$('button:has-text("Take the walk")');
await take.click();
await sleep(1800);
await shot(page, `${tag}-04-walk-start`);
console.log("walk btn:", await walkBtn(), "cards:", await cardStrip());
console.log("controls walk:", await floating());
// wait for the auto-walk to advance to stop 2 and settle
for (let i = 0; i < 12; i++) { await sleep(1000); const c = await cardStrip(); if (c && /02/.test(c.active || "")) break; }
await sleep(2500);
await shot(page, `${tag}-05-walk-stop2`);
const m2 = await markers(); const c2 = await cardStrip();
console.log("stop2 markers:", m2, "cards:", c2);
const active = m2.find((m) => /Spot 2/.test(m.label));
if (active && c2) console.log(`ACTIVE marker bottom ${active.y + active.h} vs card strip top ${c2.top} → clear=${active.y + active.h < c2.top}`);

// 4. Drag the cards mid-walk
const strip = c2?.activeRect;
const y = strip ? strip.y + strip.h / 2 : V.height - 120;
const x0 = V.width * 0.7, x1 = V.width * 0.25;
const samples = [];
const sampler = page.evaluate(async () => {
  const out = [];
  const t0 = performance.now();
  const track = document.querySelector('[aria-label^="Enter Spot"], [aria-label^="Focus Spot"]');
  while (performance.now() - t0 < 1500) { out.push({ t: Math.round(performance.now() - t0), x: Math.round(track.getBoundingClientRect().left) }); await new Promise((r) => requestAnimationFrame(r)); }
  return out;
});
if (V.mobile) await touchDrag(session, { x: x0, y }, { x: x1, y }, 14);
else { await page.mouse.move(x0, y); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(x0 + ((x1 - x0) * i) / 14, y); await sleep(16); } await page.mouse.up(); }
await sleep(120);
console.log("walk btn right after drag:", await walkBtn());
const pos = await sampler;
// detect reversal (snap-back): sign changes of dx greater than 3px after the drag end
let reversals = 0; let dir = 0;
for (let i = 1; i < pos.length; i++) { const dx = pos[i].x - pos[i - 1].x; if (Math.abs(dx) < 3) continue; const d = Math.sign(dx); if (dir && d !== dir) reversals++; dir = d; }
console.log("track x samples (first/last):", pos.slice(0, 3), pos.slice(-3), "reversals:", reversals);
await sleep(1500);
await shot(page, `${tag}-06-walk-paused`);
console.log("after drag: btn", await walkBtn(), "cards", await cardStrip());
// 5. Continue
const cont = await page.$('button:has-text("Continue")');
if (cont) { await cont.click(); await sleep(400); console.log("after Continue btn:", await walkBtn()); await sleep(6000); await shot(page, `${tag}-07-walk-continued`); console.log("cards after continue:", await cardStrip()); }
// Stop the walk
const stop = await page.$('button:has-text("Stop the walk")');
if (stop) { await stop.click(); await sleep(1500); console.log("after Stop:", await walkBtn()); await shot(page, `${tag}-08-walk-stopped`); }
// menu while focused (phone: hidden?)
console.log("menu in walk mode:", await page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const w = b.closest(".cnwm-menu") || b.parentElement; const cs = getComputedStyle(w); const r = b.getBoundingClientRect(); return { op: cs.opacity, pe: cs.pointerEvents, x: Math.round(r.x), y: Math.round(r.y) }; }));
// Back
const back = await page.$('button[aria-label="Back to map"], button:has-text("Back")');
if (back) { await back.click(); await sleep(2500); await shot(page, `${tag}-09-back-overview`); console.log("controls after Back:", await floating()); }

// 6. Lens
const lens = await page.$('button:has-text("See Troy in 1858"):visible');
if (lens) {
  await lens.click();
  await sleep(2500);
  await shot(page, `${tag}-10-lens`);
  const lensInfo = await page.evaluate(() => {
    const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.currentSrc || i.src));
    const r = img?.getBoundingClientRect();
    const box = img?.parentElement?.getBoundingClientRect();
    const caps = [...document.querySelectorAll("p,span,div,figcaption")].filter((el) => el.children.length === 0 && /1858|Library of Congress|Drag|pinch/i.test(el.textContent)).map((el) => { const rr = document.createRange(); rr.selectNodeContents(el); const lines = [...new Set([...rr.getClientRects()].map((x) => Math.round(x.top)))].length; return `${el.textContent.trim()} (${lines} line)`; });
    return { imgSrc: img?.currentSrc?.split("/").pop(), img: r && { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, transform: img && getComputedStyle(img).transform, box: box && { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height), area: Math.round((box.width * box.height) / (innerWidth * innerHeight) * 100) + "%" }, caps };
  });
  console.log("lens:", JSON.stringify(lensInfo));
  console.log("controls lens:", await floating());
  // zoom in via wheel or pinch? use keyboard +
  await page.keyboard.press("+"); await sleep(400); await page.keyboard.press("+"); await sleep(600);
  await shot(page, `${tag}-11-lens-zoomed`);
  await page.keyboard.press("0"); await sleep(600);
  const backToday = await page.$('button:has-text("Back to today")');
  if (backToday) { await backToday.click(); await sleep(1500); await shot(page, `${tag}-12-back-today`); }
}
// 7. Menu on the map
const open = await page.$('button[aria-label="Open menu"]');
await open.click(); await sleep(900); await shot(page, `${tag}-13-menu-open`);
await page.keyboard.press("Escape"); await sleep(700);
report(page, tag);
await browser.close();
