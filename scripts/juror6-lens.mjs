// 1858 lens only, at a viewport.
import { launch, ctx, VPS, goto, shot, watch, sleep } from "./juror6-lib.mjs";
const vpName = process.argv[2] || "p390";
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/map");
await sleep(5000);
const lens = page.locator("button:has-text('1858'):visible, a:has-text('1858'):visible").first();
console.log("lens btn:", JSON.stringify(await lens.boundingBox().catch(() => null)));
await lens.click(); await sleep(3000);
await shot(page, `lens-${vpName}-1-open`);
const info = await page.evaluate(() => {
  const img = [...document.querySelectorAll("img")].find(i => /1858/i.test(i.src + i.alt));
  const r = img && img.getBoundingClientRect();
  const viewer = img && img.closest("[style*=overflow], [class*=overflow-hidden]");
  const vr = viewer && viewer.getBoundingClientRect();
  const texts = [...document.querySelectorAll("p, span, div, button")].filter(e => e.children.length === 0 && e.innerText && /1858|Library|Drag|pinch|scroll|Back|zoom|reset/i.test(e.innerText)).map(e => { const b = e.getBoundingClientRect(); if (b.width === 0) return null; const rg = document.createRange(); rg.selectNodeContents(e); return { t: e.innerText.replace(/\s+/g, " ").slice(0, 60), x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), lines: new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size }; }).filter(Boolean);
  const btns = [...document.querySelectorAll("button")].filter(b => b.getBoundingClientRect().width > 0 && getComputedStyle(b).visibility !== "hidden").map(b => { const r = b.getBoundingClientRect(); return { t: (b.getAttribute("aria-label") || b.innerText).replace(/\s+/g, " ").slice(0, 30), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; });
  return { img: img && { alt: img.alt, nat: img.naturalWidth + "x" + img.naturalHeight, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), tf: getComputedStyle(img).transform, ptf: getComputedStyle(img.parentElement).transform }, viewer: vr && { x: Math.round(vr.left), y: Math.round(vr.top), w: Math.round(vr.width), h: Math.round(vr.height), areaPct: Math.round(100 * vr.width * vr.height / (innerWidth * innerHeight)) }, texts, btns };
});
console.log(JSON.stringify(info, null, 0));
// keyboard: + zoom, arrows, 0 reset
await page.keyboard.press("+"); await sleep(400); await page.keyboard.press("ArrowLeft"); await sleep(400);
const after = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find(i => /1858/i.test(i.src + i.alt)); return getComputedStyle(img.parentElement).transform + " | " + getComputedStyle(img).transform; });
console.log("after + and ArrowLeft:", after);
await shot(page, `lens-${vpName}-2-zoomed`);
await page.keyboard.press("0"); await sleep(400);
const reset = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find(i => /1858/i.test(i.src + i.alt)); return getComputedStyle(img.parentElement).transform + " | " + getComputedStyle(img).transform; });
console.log("after 0:", reset);
const back2 = page.locator("button:has-text('Back to today'):visible").first();
console.log("back to today:", JSON.stringify(await back2.boundingBox().catch(() => null)));
await back2.click(); await sleep(1500);
await shot(page, `lens-${vpName}-3-today`);
console.log("errors:", log.errors);
await browser.close();
