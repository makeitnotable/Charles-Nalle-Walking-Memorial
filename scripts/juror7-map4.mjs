// After closing the lens: are the zoom controls still around?
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, VIEWPORTS } from "./juror7-lib.mjs";
const vp = process.argv[2] || "1440";
const V = VIEWPORTS[vp];
const errs = []; const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, "map4-" + vp, errs);
await goto(page, "/map"); await sleep(5000);
const zoomState = () => page.evaluate(() => [...document.querySelectorAll('button[aria-label="Zoom in"], button[aria-label="Reset view"]')].map((b) => { const cs = getComputedStyle(b); let el = b, op = 1, vis = cs.visibility, disp = cs.display, pe = cs.pointerEvents; while (el && el !== document.body) { const s = getComputedStyle(el); op *= parseFloat(s.opacity); if (s.visibility === "hidden") vis = "hidden"; if (s.display === "none") disp = "none"; el = el.parentElement; } const r = b.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { label: b.getAttribute("aria-label"), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], effOpacity: op, vis, disp, pe, hitTop: top ? (top.getAttribute("aria-label") || top.tagName + "." + String(top.className).slice(0, 30)) : null, inert: b.closest("[inert]") != null, ariaHidden: b.closest("[aria-hidden='true']") != null }; }));
log.before = await zoomState();
const lensBtn = page.locator("button", { hasText: "1858" }).locator("visible=true").first();
const lb = await lensBtn.boundingBox(); await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2); await sleep(2000);
log.open = await zoomState();
const backT = page.locator("button", { hasText: "Back to today" }).locator("visible=true").first();
const bt = await backT.boundingBox(); await page.mouse.click(bt.x + bt.width / 2, bt.y + bt.height / 2); await sleep(3000);
log.closed3s = await zoomState();
await shot(page, `map-${vp}-31-after-lens-close-topright`, { clip: { x: V.width - 260, y: 0, width: 260, height: 220 } });
// Tab through: does focus land on the hidden zoom buttons?
await page.keyboard.press("Tab"); const seq = [];
for (let i = 0; i < 14; i++) { seq.push(await page.evaluate(() => { const a = document.activeElement; return (a.getAttribute("aria-label") || a.textContent || a.tagName).trim().slice(0, 30); })); await page.keyboard.press("Tab"); }
log.tabSeqAfterClose = seq;
writeJson(`map4-${vp}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
await browser.close();
