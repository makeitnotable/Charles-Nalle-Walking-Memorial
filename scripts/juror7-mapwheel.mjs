import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, VIEWPORTS } from "./juror7-lib.mjs";
const vp = process.argv[2] || "1440"; const V = VIEWPORTS[vp];
const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const errs = []; attachConsole(page, "mw", errs);
await goto(page, "/map"); await sleep(5000);
const log = {};
const cue = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => e.children.length === 0 && e.getBoundingClientRect().top > innerHeight - 40 && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 40).map((e) => ({ tag: e.tagName, t: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 30), cls: String(e.className).slice(0, 40), rect: e.getBoundingClientRect().toJSON() })).map((x) => ({ ...x, rect: [Math.round(x.rect.x), Math.round(x.rect.y), Math.round(x.rect.width), Math.round(x.rect.height)] })));
log.bottomEdgeEls = cue;
await page.mouse.move(V.width / 2, V.height / 2); await page.mouse.wheel(0, 600); await sleep(1200);
log.wheelCenter = await page.evaluate(() => Math.round(scrollY));
await shot(page, `map-${vp}-50-after-wheel-center`);
await page.mouse.move(V.width / 2, V.height - 10); await page.mouse.wheel(0, 600); await sleep(1200);
log.wheelBottomEdge = await page.evaluate(() => Math.round(scrollY));
await page.mouse.move(V.width * 0.9, V.height * 0.5); await page.mouse.wheel(0, 600); await sleep(1200);
log.wheelRightSide = await page.evaluate(() => Math.round(scrollY));
// keyboard
await page.keyboard.press("PageDown"); await sleep(1000); log.pageDown = await page.evaluate(() => Math.round(scrollY));
// mouse drag on the map = pan; is there any 'scroll' hint text?
log.hints = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => e.children.length === 0 && /scroll|below|index|five spots/i.test(e.textContent || "") && e.getBoundingClientRect().height > 0).map((e) => e.textContent.trim().slice(0, 60)));
writeJson(`mapwheel-${vp}`, { log, errs }); console.log(JSON.stringify(log, null, 1)); await browser.close();
