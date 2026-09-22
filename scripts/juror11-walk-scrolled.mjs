import { launch, ctx, VPS, shot, goto, watchConsole, log, sleep } from "./juror11-lib.mjs";
const browser = await launch();
const vp = VPS.d1440; const c = await ctx(browser, vp); const page = await c.newPage(); const errs = watchConsole(page, "ws");
await goto(page, "/map", 6000);
await page.evaluate(() => scrollTo({ top: 260, behavior: "instant" })); await sleep(800);
await shot(page, "walk-d1440-scrolled-before");
const tw = page.locator("button:visible, a:visible", { hasText: /Take the walk/i }).first(); const b = await tw.boundingBox();
await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(2500);
log("scrollY after Take the walk:", await page.evaluate(() => scrollY));
await shot(page, "walk-d1440-scrolled-after");
// full walk timeline
const t0 = Date.now(); const tl = []; let last = null;
while (Date.now() - t0 < 22000) { const cur = await page.evaluate(() => { const a = [...document.querySelectorAll(".keen-slider__slide")].map((s, i) => ({ i, x: s.getBoundingClientRect().x, w: s.getBoundingClientRect().width })); const c = a.find((s) => Math.abs(s.x + s.w / 2 - innerWidth / 2) < s.w / 2); return c ? c.i : null; }); if (cur !== last && cur !== null) { tl.push([Date.now() - t0, cur]); last = cur; } await sleep(100); }
log("timeline:", JSON.stringify(tl));
log("end button:", await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().top < 100 && b.getBoundingClientRect().width > 0).map((b) => b.textContent.trim() + " [" + b.getAttribute("aria-label") + "]")));
await shot(page, "walk-d1440-end");
log("errs:", errs); await browser.close();
