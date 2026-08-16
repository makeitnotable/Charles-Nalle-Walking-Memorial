// Does closing the 1858 lens leave the page unscrollable?
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, cdp, touchDrag, VIEWPORTS } from "./juror7-lib.mjs";
const vp = process.argv[2] || "390";
const V = VIEWPORTS[vp];
const errs = [];
const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, "map3-" + vp, errs);
const session = await cdp(page);
const st = () => page.evaluate(() => ({ scrollY: Math.round(scrollY), htmlOv: getComputedStyle(document.documentElement).overflow, bodyOv: getComputedStyle(document.body).overflow, htmlStyle: document.documentElement.getAttribute("style"), bodyStyle: document.body.getAttribute("style"), htmlCls: document.documentElement.className, bodyCls: document.body.className, docH: document.documentElement.scrollHeight, bodyPos: getComputedStyle(document.body).position }));
await goto(page, "/map");
await sleep(5000);
log.s0 = await st();
await page.evaluate(() => scrollTo({ top: 600, behavior: "instant" }));
await sleep(500);
log.s1_scrolled_before_lens = await st();
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(500);
const lensBtn = page.locator("button", { hasText: "1858" }).locator("visible=true").first();
let lb = await lensBtn.boundingBox();
await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2);
await sleep(2000);
log.s2_lens_open = await st();
const backT = page.locator("button", { hasText: "Back to today" }).locator("visible=true").first();
const bt = await backT.boundingBox();
await page.mouse.click(bt.x + bt.width / 2, bt.y + bt.height / 2);
await sleep(2000);
log.s3_after_close = await st();
await page.evaluate(() => scrollTo({ top: 600, behavior: "instant" }));
await sleep(600);
log.s4_try_scroll = await st();
// try a real user gesture: touch swipe on the bottom lane / wheel on the page below
if (V.mobile) { await touchDrag(session, { x: V.width * 0.5, y: V.height - 60 }, { x: V.width * 0.5, y: V.height - 400 }, 16, 16); }
else { await page.mouse.move(V.width / 2, V.height - 30); await page.mouse.wheel(0, 800); }
await sleep(1000);
log.s5_after_gesture = await st();
await shot(page, `map-${vp}-30-after-lens-close-scroll`);
// Also: does Escape close the lens? and does the lens open scroll the page to top?
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(500);
lb = await lensBtn.boundingBox();
if (lb) { await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2); await sleep(1500); await page.keyboard.press("Escape"); await sleep(1200); log.escClosesLens = await page.locator("button", { hasText: "Back to today" }).locator("visible=true").count(); log.s6 = await st(); await page.evaluate(() => scrollTo({ top: 600, behavior: "instant" })); await sleep(500); log.s7_after_esc_scroll = await st(); }
writeJson(`map3-${vp}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
await browser.close();
