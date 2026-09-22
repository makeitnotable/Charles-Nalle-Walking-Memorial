import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const out = {};
for (const route of ["/", "/bakery", "/map", "/paintings", "/people", "/about", "/404x"]) {
  const c = await ctx(browser, VPS.z200); const page = await c.newPage(); const log = watch(page);
  await page.goto(BASE + route, { waitUntil: "networkidle" }); await sleep(1500);
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight }));
  await shot(page, `zoom200${route.replace(/\//g, "-") || "-home"}-top`);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.5)); await sleep(800);
  await shot(page, `zoom200${route.replace(/\//g, "-") || "-home"}-mid`);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(800);
  await shot(page, `zoom200${route.replace(/\//g, "-") || "-home"}-end`);
  out[route] = { ...r, overflow: r.sw > r.cw, log: log.filter((l) => !/ERR_ABORTED|404/.test(l)) };
  await c.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
