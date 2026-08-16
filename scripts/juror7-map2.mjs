// Map follow-ups: touch-swipe past the map on phone, the 1858 lens, index card titles
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, cdp, touchDrag, VIEWPORTS } from "./juror7-lib.mjs";

const vp = process.argv[2] || "390";
const V = VIEWPORTS[vp];
const tag = "map-" + vp;
const errs = [];
const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, tag, errs);
const session = await cdp(page);
const controls = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("button, a.btn, [role=button]")]
      .filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.1; })
      .map((b) => ({ label: (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50), rect: [Math.round(b.getBoundingClientRect().x), Math.round(b.getBoundingClientRect().y), Math.round(b.getBoundingClientRect().width), Math.round(b.getBoundingClientRect().height)] }))
  );
await goto(page, "/map");
await sleep(6000);
if (V.mobile) {
  // one-finger swipe up on the map body
  const y0 = V.height * 0.6;
  await touchDrag(session, { x: V.width / 2, y: y0 }, { x: V.width / 2, y: y0 - 300 }, 16, 16);
  await sleep(1200);
  log.scrollAfterSwipeOnMap = await page.evaluate(() => Math.round(scrollY));
  await shot(page, `${tag}-20-after-swipe-on-map`);
  log.mapCanvasTouchAction = await page.evaluate(() => { const cv = document.querySelector("canvas"); return { ta: getComputedStyle(cv).touchAction, parentTa: getComputedStyle(cv.parentElement).touchAction, h: cv.getBoundingClientRect().height, docH: document.documentElement.scrollHeight }; });
  log.hints = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => e.children.length === 0 && /scroll|swipe|below|down/i.test(e.textContent || "") && e.getBoundingClientRect().top < innerHeight && e.getBoundingClientRect().height > 0).map((e) => e.textContent.trim().slice(0, 50)));
  // second: swipe from the bottom lane (below/around the button)
  await touchDrag(session, { x: V.width * 0.5, y: V.height - 60 }, { x: V.width * 0.5, y: V.height - 360 }, 16, 16);
  await sleep(1200);
  log.scrollAfterSwipeBottomLane = await page.evaluate(() => Math.round(scrollY));
  // two-finger? just check the page's scrollable height
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await sleep(800);
}
// lens
const lensBtn = page.locator("button", { hasText: "1858" }).locator("visible=true").first();
log.lensBtnCount = await page.locator("button", { hasText: "1858" }).count();
const lb = await lensBtn.boundingBox();
log.lensBtnBox = lb;
await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2);
await sleep(2500);
await shot(page, `${tag}-21-lens-open`);
log.lensControls = await controls();
log.lensCaption = await page.evaluate(() => [...document.querySelectorAll("p,span,div,figcaption")].filter((e) => /Library of Congress|Drag to explore|pinch/.test(e.textContent || "") && e.children.length <= 3 && e.getBoundingClientRect().height < 120 && e.getBoundingClientRect().height > 0).map((e) => ({ t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 100), h: Math.round(e.getBoundingClientRect().height), lh: parseFloat(getComputedStyle(e).lineHeight), rect: [Math.round(e.getBoundingClientRect().x), Math.round(e.getBoundingClientRect().y), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)] })).slice(0, 4));
log.lensImg = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.currentSrc || i.src) || /1858/.test(i.alt || "")); if (!img) return null; const r = img.getBoundingClientRect(); const box = img.parentElement.getBoundingClientRect(); return { src: (img.currentSrc || img.src).split("/").pop(), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], parent: [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)], transform: getComputedStyle(img).transform, natural: [img.naturalWidth, img.naturalHeight], parentOverflow: getComputedStyle(img.parentElement).overflow }; });
log.chipWhileLens = await page.evaluate(() => [...document.querySelectorAll("div,span,p")].filter((e) => /April 27, 1860|Five spots/.test(e.textContent || "") && e.children.length <= 2 && e.getBoundingClientRect().height < 60 && e.getBoundingClientRect().height > 0).map((e) => ({ t: e.textContent.trim(), op: getComputedStyle(e).opacity })).slice(0, 3));
// interact: drag the plate (touch or mouse), zoom with keyboard
if (V.mobile) await touchDrag(session, { x: V.width / 2, y: V.height / 2 }, { x: V.width / 2 - 120, y: V.height / 2 - 80 }, 12, 16);
else { await page.mouse.move(V.width / 2, V.height / 2); await page.mouse.down(); await page.mouse.move(V.width / 2 - 120, V.height / 2 - 80, { steps: 12 }); await page.mouse.up(); }
await sleep(500);
log.lensImgAfterDrag = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.currentSrc || i.src) || /1858/.test(i.alt || "")); return img ? getComputedStyle(img).transform : null; });
await page.keyboard.press("+"); await sleep(300); await page.keyboard.press("+"); await sleep(300); await page.keyboard.press("+"); await sleep(600);
log.lensImgAfterZoom = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.currentSrc || i.src) || /1858/.test(i.alt || "")); return img ? getComputedStyle(img).transform : null; });
await shot(page, `${tag}-22-lens-zoomed`);
await page.keyboard.press("0"); await sleep(600);
log.lensImgAfterReset = await page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858/.test(i.currentSrc || i.src) || /1858/.test(i.alt || "")); return img ? getComputedStyle(img).transform : null; });
const backT = page.locator("button", { hasText: "Back to today" }).locator("visible=true").first();
const bt = await backT.boundingBox();
await page.mouse.click(bt.x + bt.width / 2, bt.y + bt.height / 2);
await sleep(1500);
await shot(page, `${tag}-23-back-today`);
log.afterLensControls = await controls();
// index cards: title boxes
await page.evaluate(() => scrollTo({ top: document.querySelector('a[href$="/commissioners-office"]').getBoundingClientRect().top + scrollY - 40, behavior: "instant" }));
await sleep(800);
await shot(page, `${tag}-24-index-cards`);
log.indexCards = await page.evaluate(() => [...document.querySelectorAll('a[href$="/bakery"], a[href$="/commissioners-office"], a[href$="/mansion"], a[href$="/ferry"], a[href$="/barbershop"]')].filter((a) => a.closest("footer") == null && (a.textContent || "").includes("Spot")).map((a) => { const els = [...a.querySelectorAll("*")].filter((e) => e.children.length === 0 && e.textContent.trim().length > 3); return els.map((e) => ({ t: e.textContent.trim().slice(0, 40), cls: e.className.toString().slice(0, 40), lines: e.getClientRects().length, sw: e.scrollWidth, cw: e.clientWidth, w: Math.round(e.getBoundingClientRect().width) })); }));
writeJson(`map2-${vp}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
console.log("ERRS", JSON.stringify(errs.filter((e) => !/ERR_ABORTED/.test(e.text)), null, 1));
await browser.close();
