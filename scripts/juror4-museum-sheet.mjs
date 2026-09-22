import { launch, ctx, watch, shot, sleep, goto, VPS, touchDrag, touchTap } from "./juror4-lib.mjs";
const vpk = process.argv[2] || "p390"; const vp = VPS[vpk];
const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
await goto(page, "/paintings"); await sleep(1500);
const slotTop = await page.evaluate(() => document.querySelector("#museum-slot").offsetTop);
await page.evaluate((y) => scrollTo(0, y), slotTop + 300); await sleep(1500);
const M = () => page.evaluate(() => { const s = window.__museum.state; return { mode: s.mode, approached: s.approached, sheet: s.sheet, alive: s.alive, zoom: s.zoom }; });
const sheetInfo = () => page.evaluate(() => { const h = document.querySelector('#museum-slot [aria-label*="plaque" i]'); const r = h?.getBoundingClientRect(); const texts = [...document.querySelectorAll("#museum-slot p, #museum-slot blockquote, #museum-slot h2, #museum-slot h3")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.top < innerHeight && b.bottom > 0 && getComputedStyle(e).opacity !== "0"; }).map((e) => { const b = e.getBoundingClientRect(); return `${e.innerText.replace(/\s+/g, " ").slice(0, 50)} @${Math.round(b.top)} h${Math.round(b.height)}`; }); return { header: h && { label: h.getAttribute("aria-label"), y: Math.round(r.top), h: Math.round(r.height) }, texts, rect: window.__museum.paintingRect(window.__museum.state.approached ?? 0) }; });
// approach work 0 via the first dot
await page.locator('#museum-slot button[aria-label^="Approach"]').first().click({ force: true }); await sleep(2500);
await shot(page, `mus-${vpk}-20-w0-peek`);
console.log("peek", await M(), await sheetInfo());
const h = await page.locator('#museum-slot [aria-label*="plaque" i]').first().boundingBox();
// tap header
await touchTap(page, h.x + h.width / 2, h.y + 20); await sleep(1000);
await shot(page, `mus-${vpk}-21-w0-tapped`);
console.log("tapped", await M(), await sheetInfo());
// drag header down
const h2 = await page.locator('#museum-slot [aria-label*="plaque" i]').first().boundingBox();
await touchDrag(page, h2.x + h2.width / 2, h2.y + 20, h2.x + h2.width / 2, vp.height - 20, 12, 320); await sleep(1000);
await shot(page, `mus-${vpk}-22-w0-dragged-down`);
console.log("dragdown", await M(), await sheetInfo());
// drag header up
const h3 = await page.locator('#museum-slot [aria-label*="plaque" i]').first().boundingBox();
await touchDrag(page, h3.x + h3.width / 2, h3.y + 20, h3.x + h3.width / 2, Math.max(60, h3.y - 350), 12, 320); await sleep(1000);
await shot(page, `mus-${vpk}-23-w0-dragged-up`);
console.log("dragup", await M(), await sheetInfo());
// tap the painting while sheet full → alive?
const r = (await sheetInfo()).rect;
await touchTap(page, (r.left + r.right) / 2, (r.top + r.bottom) / 2); await sleep(1500);
await shot(page, `mus-${vpk}-24-w0-alive`);
console.log("alive", await M());
// pinch-zoom? skip. Back to the hall
await page.locator('#museum-slot button:has-text("Back to the hall")').click(); await sleep(1200);
console.log("back", await M());
console.log("LOG", log);
await browser.close();
