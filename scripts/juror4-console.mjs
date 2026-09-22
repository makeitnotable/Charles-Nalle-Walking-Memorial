import { launch, ctx, watch, sleep, goto, VPS } from "./juror4-lib.mjs";
// one fresh browser per route: console errors on every route, with a scroll-through
const vpk = process.argv[2] || "d1440"; const vp = VPS[vpk];
const routes = ["/", "/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop", "/map", "/people", "/paintings", "/about", "/404"];
const out = {};
for (const r of routes) {
  const browser = await launch();
  const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  try {
    await goto(page, r); await sleep(1500);
    const docH = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < docH; y += Math.round(vp.height * 0.7)) { await page.evaluate((yy) => scrollTo(0, yy), y); await sleep(150); }
    await sleep(800);
    out[r] = { emdash: await page.evaluate(() => (document.body.innerText.match(/—/g) || []).length), hScroll: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), log: log.filter((l) => !/reqfail.*(mp3|pbf)|ERR_ABORTED/.test(l)) };
  } catch (e) { out[r] = { err: String(e).slice(0, 200), log }; }
  await browser.close();
  console.log(r, JSON.stringify(out[r]));
}
