// /map visitor walk-through at one viewport.
import { launch, ctx, VPS, goto, shot, watch, sleep, save, FLOATING_JS, touchDrag, touchTap } from "./juror6-lib.mjs";

const vpName = process.argv[2] || "p390";
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/map");
await sleep(6000); // let the map + prologue settle
await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

const CTRLS = () => [...document.querySelectorAll("button, a, [role=button]")].map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); let op = 1, p = e; while (p && p !== document.body) { op *= parseFloat(getComputedStyle(p).opacity || 1); if (getComputedStyle(p).visibility === "hidden" || getComputedStyle(p).display === "none") op = 0; p = p.parentElement; } return { t: (e.getAttribute("aria-label") || e.innerText || "").trim().replace(/\s+/g, " ").slice(0, 45), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), op: Math.round(op * 100) / 100, pos: cs.position }; }).filter(b => b.w > 0 && b.h > 0 && b.op > 0.05 && b.y < innerHeight && b.y + b.h > 0);
const MARKERS = () => [...document.querySelectorAll(".mapboxgl-marker, [class*=marker]")].map(m => { const r = m.getBoundingClientRect(); return { t: (m.getAttribute("aria-label") || m.innerText || "").replace(/\s+/g, " ").slice(0, 40), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inView: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });

await shot(page, `map-${vpName}-1-overview`);
console.log("overview controls:", JSON.stringify(await page.evaluate(CTRLS)));
console.log("markers:", JSON.stringify(await page.evaluate(MARKERS)));

// scroll past the map to the spot index
const docH = await page.evaluate(() => document.documentElement.scrollHeight);
console.log("docH", docH);
await page.evaluate(() => scrollTo(0, innerHeight)); await sleep(800);
await shot(page, `map-${vpName}-2-below`);
await page.evaluate(() => scrollTo(0, innerHeight * 2)); await sleep(800);
await shot(page, `map-${vpName}-3-index`);
const idx = await page.evaluate(() => [...document.querySelectorAll("main h1, main h2, main h3, main li, main p")].filter(e => e.getBoundingClientRect().top > -50 && e.getBoundingClientRect().top < innerHeight * 3).map(e => ({ tag: e.tagName, t: e.innerText.replace(/\s+/g, " ").slice(0, 60), lines: (() => { const rg = document.createRange(); rg.selectNodeContents(e); return new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size; })() })));
console.log("index text:", JSON.stringify(idx.slice(0, 40)));
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(600);
await shot(page, `map-${vpName}-4-bottom`);

// back to top, scroll down a little (120px), press Take the walk
await page.evaluate(() => scrollTo(0, 0)); await sleep(500);
await page.evaluate(() => scrollTo(0, 140)); await sleep(500);
await shot(page, `map-${vpName}-5-scrolled140`);
const walkBtn = page.locator("button:has-text('Take the walk'):visible, a:has-text('Take the walk'):visible").first();
console.log("take the walk visible?", await walkBtn.isVisible().catch(() => false), JSON.stringify(await walkBtn.boundingBox().catch(() => null)));
await walkBtn.click();
await sleep(3500);
console.log("after Take the walk: scrollY", await page.evaluate(() => scrollY));
await shot(page, `map-${vpName}-6-walk`);
console.log("walk controls:", JSON.stringify(await page.evaluate(CTRLS)));
console.log("markers:", JSON.stringify(await page.evaluate(MARKERS)));
// wait for it to step to stop 2
await sleep(5000);
await shot(page, `map-${vpName}-7-walk-step2`);
const cards = await page.evaluate(() => [...document.querySelectorAll("[class*=keen-slider__slide], [class*=slide]")].map(s => { const r = s.getBoundingClientRect(); return { t: (s.innerText || "").replace(/\s+/g, " ").slice(0, 40), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(s).opacity, tf: getComputedStyle(s).transform.slice(0, 40) }; }).filter(s => s.w > 50));
console.log("cards:", JSON.stringify(cards));
// active marker vs cards
const mk = await page.evaluate(MARKERS);
const cardTop = Math.min(...cards.map(c => c.y));
console.log("cardTop", cardTop, "markers", JSON.stringify(mk));

// drag the cards mid-walk
const strip = cards.find(c => c.x >= 0 && c.x < vp.width) || cards[0];
const y = strip.y + strip.h / 2;
const x0 = Math.min(vp.width - 40, strip.x + strip.w - 30);
const stopBtnTxt = async () => page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(b => /stop the walk|continue|walk again/i.test(b.innerText || b.getAttribute("aria-label") || "")); return b ? (b.innerText || b.getAttribute("aria-label")).trim() : null; });
console.log("button before drag:", await stopBtnTxt());
// sample slider position during and after drag
await page.evaluate(() => { window.__pos = []; const el = document.querySelector("[class*=keen-slider]"); window.__el = el; });
if (vp.mobile) { await touchDrag(page, { x: x0, y }, { x: x0 - 220, y }, 14, 16, 30); }
else { await page.mouse.move(x0, y); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(x0 - 220 * i / 14, y); await sleep(16); } await page.mouse.up(); }
const tAfterDrag = await stopBtnTxt();
console.log("button right after drag:", tAfterDrag);
// sample the strip's transform for 500ms to catch snap-back
const samples = await page.evaluate(async () => { const out = []; const sl = document.querySelector("[class*=keen-slider__slide]"); for (let i = 0; i < 30; i++) { const r = sl.getBoundingClientRect(); out.push(Math.round(r.left)); await new Promise(r => requestAnimationFrame(r)); await new Promise(r => setTimeout(r, 16)); } return out; });
console.log("first-slide left samples after drag:", samples.join(","));
await sleep(1200);
await shot(page, `map-${vpName}-8-after-drag`);
console.log("button 1.2s after drag:", await stopBtnTxt());
console.log("controls:", JSON.stringify(await page.evaluate(CTRLS)));
// press Continue
const cont = page.locator("button:has-text('Continue')").first();
if (await cont.isVisible().catch(() => false)) { await cont.click(); await sleep(2500); console.log("after Continue:", await stopBtnTxt()); await shot(page, `map-${vpName}-9-continued`); }
// Stop the walk
const stop = page.locator("button:has-text('Stop the walk')").first();
if (await stop.isVisible().catch(() => false)) { await stop.click(); await sleep(1500); console.log("after Stop:", await stopBtnTxt()); }
// Back
const back = page.locator("button[aria-label='Back to map'], button:has-text('Back')").first();
console.log("back btn:", JSON.stringify(await back.boundingBox().catch(() => null)));
await back.click(); await sleep(2500);
await shot(page, `map-${vpName}-10-back`);
console.log("after Back controls:", JSON.stringify(await page.evaluate(CTRLS)));

// 1858 lens
const lens = page.locator("button:has-text('1858'):visible, a:has-text('1858'):visible").first();
console.log("lens btn:", JSON.stringify(await lens.boundingBox().catch(() => null)));
await lens.click(); await sleep(2500);
await shot(page, `map-${vpName}-11-lens`);
const lensInfo = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find(i => /1858|troy/i.test(i.src) || /1858/i.test(i.alt)); const r = img && img.getBoundingClientRect(); const caps = [...document.querySelectorAll("p, span, div")].filter(e => /1858|Library of Congress|Drag to explore|pinch/i.test(e.innerText) && e.children.length === 0).map(e => { const b = e.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(e); return { t: e.innerText.replace(/\s+/g, " "), x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), lines: new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size }; }); return { img: img && { alt: img.alt, src: img.currentSrc.slice(-40), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), nat: img.naturalWidth + "x" + img.naturalHeight, tf: getComputedStyle(img).transform.slice(0, 60), parentTf: getComputedStyle(img.parentElement).transform.slice(0, 60) }, caps }; });
console.log("lens:", JSON.stringify(lensInfo));
console.log("lens controls:", JSON.stringify(await page.evaluate(CTRLS)));
const back2 = page.locator("button:has-text('Back to today'):visible").first();
console.log("back to today:", JSON.stringify(await back2.boundingBox().catch(() => null)));
await back2.click(); await sleep(1500);
await shot(page, `map-${vpName}-12-today`);
console.log("errors:", log.errors, "failed:", log.failed.filter(f => !/pbf|ERR_ABORTED/.test(f)));
await browser.close();
