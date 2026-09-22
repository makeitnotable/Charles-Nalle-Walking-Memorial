// extra shots: 1920 (map, paintings approach-from-top, chapter, people, footer) and 360 (bakery/barbershop arrival, moral, onward)
import { launch, ctx, VPS, watch, shot, sleep, go, save } from "./juror8-lib.mjs";
const out = {};
const browser = await launch();
{
  const vp = VPS.d1920; const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await go(page, "/map", 6000); await shot(page, "x-map-d1920-overview");
  await go(page, "/paintings", 5000); await shot(page, "x-paintings-d1920-top");
  const r0 = await page.evaluate(() => { const r = window.__museum.paintingRect(0); const c = document.querySelector("canvas").getBoundingClientRect(); return { cx: (r.left + r.right) / 2, cy: (r.top + r.bottom) / 2, canvasTop: c.top }; });
  out.p0_1920 = r0;
  await page.mouse.click(Math.min(1900, r0.cx), Math.min(1070, r0.cy)); await sleep(2500);
  await shot(page, "x-paintings-d1920-approach-from-top");
  out.approach1920 = await page.evaluate(() => ({ mode: window.__museum.state.mode, scrollY, back: !![...document.querySelectorAll("button")].find((b) => /Back to the hall/.test(b.textContent) && b.getBoundingClientRect().width > 0) }));
  await page.keyboard.press("Escape"); await sleep(800);
  await go(page, "/barbershop", 2500); await shot(page, "x-barbershop-d1920-hero");
  await page.locator("#moral-heading").evaluate((el) => el.scrollIntoView({ block: "center" })); await sleep(1300); await shot(page, "x-barbershop-d1920-moral");
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(1000); await shot(page, "x-barbershop-d1920-footer");
  await go(page, "/people", 2500); await shot(page, "x-people-d1920-top");
  await go(page, "/about", 2500); await shot(page, "x-about-d1920-top");
  out.log1920 = log.filter((l) => !/ERR_ABORTED|preloaded/.test(l));
  await c.close();
}
{
  const vp = VPS.p360; const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await go(page, "/bakery", 2500); await shot(page, "x-bakery-p360-hero");
  await page.locator("#scene-0 h2").first().evaluate((el) => el.scrollIntoView({ block: "start" })); await page.evaluate(() => scrollBy(0, -100)); await sleep(900); await shot(page, "x-bakery-p360-head");
  await page.locator("#moral-heading").evaluate((el) => el.scrollIntoView({ block: "center" })); await sleep(1300); await shot(page, "x-bakery-p360-moral");
  await page.locator("#onward").evaluate((el) => el.scrollIntoView({ block: "start" })); await sleep(3500); await shot(page, "x-bakery-p360-onward");
  await go(page, "/barbershop", 2500); await shot(page, "x-barbershop-p360-hero");
  await go(page, "/people", 2500); await shot(page, "x-people-p360-top");
  await go(page, "/about", 2500); await shot(page, "x-about-p360-top");
  await go(page, "/paintings", 4000); await shot(page, "x-paintings-p360-top");
  out.log360 = log.filter((l) => !/ERR_ABORTED|preloaded/.test(l));
  await c.close();
}
{
  const vp = VPS.t768; const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await go(page, "/people", 2500); await shot(page, "x-people-t768-top");
  await page.evaluate(() => scrollTo(0, innerHeight * 1.1)); await sleep(900); await shot(page, "x-people-t768-cards");
  await go(page, "/about", 2500); await shot(page, "x-about-t768-top");
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight - innerHeight * 1.5)); await sleep(900); await shot(page, "x-about-t768-closer");
  await go(page, "/paintings", 4000); await shot(page, "x-paintings-t768-top");
  await go(page, "/404-nope", 2500); await shot(page, "x-404-t768");
  out.log768 = log.filter((l) => !/ERR_ABORTED|preloaded|404/.test(l));
  await c.close();
}
await browser.close();
save("extra.json", out);
console.log(JSON.stringify(out, null, 1));
