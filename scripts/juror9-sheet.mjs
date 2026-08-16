import { launch, goto, shot, sleep, byText, VIEWPORTS, log, saveJson, touchDrag, touchTap } from "./juror9-lib.mjs";
const key = process.argv[2] || "p390";
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp);
const st = () => page.evaluate(() => { const s = JSON.parse(JSON.stringify(window.__museum.state)); return { mode: s.mode, approached: s.approached, sheet: s.sheet, alive: s.alive, zoom: s.zoom }; });
const prect = (i) => page.evaluate((i) => { const r = window.__museum?.paintingRect(i); return r && { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }; }, i);
const sheetRect = () => page.evaluate(() => { const e = document.querySelector("[aria-label*='plaque' i]"); const r = e?.getBoundingClientRect(); const p = e?.parentElement?.getBoundingClientRect(); return r && { handle: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], parent: p && [Math.round(p.left), Math.round(p.top), Math.round(p.width), Math.round(p.height)], label: e.getAttribute("aria-label") }; });
await goto(page, "/paintings", 5000);
await page.evaluate(() => window.__museum.approach(3));
await sleep(2500);
log("approach", await st(), await prect(3), await sheetRect());
await shot(page, `${key}-sheet-0-peek`);
const h = await sheetRect();
const hx = h.handle[0] + h.handle[2] / 2, hy = h.handle[1] + 20;
// tap the header
await touchTap(page, hx, hy); await sleep(1200);
log("after tap", await st(), await prect(3), await sheetRect());
await shot(page, `${key}-sheet-1-after-tap`);
// tap again to collapse
const h2 = await sheetRect();
await touchTap(page, h2.handle[0] + h2.handle[2] / 2, h2.handle[1] + 20); await sleep(1200);
log("after tap2", await st(), await prect(3), await sheetRect());
await shot(page, `${key}-sheet-2-after-tap2`);
// drag the header up
const h3 = await sheetRect();
await touchDrag(page, h3.handle[0] + h3.handle[2] / 2, h3.handle[1] + 20, h3.handle[0] + h3.handle[2] / 2, h3.handle[1] - 300, 16, 0, 16);
await sleep(1200);
log("after drag up", await st(), await prect(3), await sheetRect());
await shot(page, `${key}-sheet-3-after-drag-up`);
// try to scroll body of sheet
const h4 = await sheetRect();
await touchDrag(page, vp.width / 2, h4.parent[1] + h4.parent[3] * 0.7, vp.width / 2, h4.parent[1] + h4.parent[3] * 0.3, 10, 0, 16);
await sleep(800);
log("after body scroll", await st(), await sheetRect(), await page.evaluate(() => scrollY));
await shot(page, `${key}-sheet-4-body-scroll`);
// drag down
const h5 = await sheetRect();
await touchDrag(page, h5.handle[0] + h5.handle[2] / 2, h5.handle[1] + 20, h5.handle[0] + h5.handle[2] / 2, h5.handle[1] + 300, 16, 0, 16);
await sleep(1200);
log("after drag down", await st(), await prect(3), await sheetRect());
await shot(page, `${key}-sheet-5-after-drag-down`);
// pinch zoom the painting? skip. tap painting -> alive
const pr = await prect(3);
await touchTap(page, (pr.l + pr.r) / 2, (pr.t + pr.b) / 2); await sleep(2000);
log("after painting tap", await st());
await shot(page, `${key}-sheet-6-alive`);
// Back to the hall
const back = await byText(page, /Back to the hall/i);
const b = await back.boundingBox();
await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); await sleep(1500);
log("after back", await st(), await page.evaluate(() => scrollY));
await shot(page, `${key}-sheet-7-back`);
// landscape check for later
log(errors);
await browser.close();
