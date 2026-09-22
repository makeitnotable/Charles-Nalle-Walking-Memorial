import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep } from "./juror11-lib.mjs";
const browser = await launch();
const jobs = [
  ["land", "/map", 6000], ["land", "/bakery", 1500], ["land", "/paintings", 4000],
  ["p390", "/about", 1500], ["t768", "/about", 1500], ["d1440", "/about", 1500], ["d1920", "/about", 1500],
  ["p390", "/404", 1000], ["d1440", "/404", 1000],
  ["p390", "/mansion", 1500], ["d1920", "/ferry", 1500], ["t1024", "/bakery", 1500], ["d1920", "/map", 6000], ["d1920", "/paintings", 4000], ["p390", "/bakery/", 1500],
];
for (const [key, route, wait] of jobs) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const errs = watchConsole(page, `${route}-${key}`);
  await goto(page, route, wait);
  const name = `misc-${route.replace(/\//g, "-").replace(/^-/, "") || "home"}-${key}`;
  await shot(page, `${name}-01`);
  const of = await overflowCheck(page);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = Math.min(6, Math.floor(total / vp.height));
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), Math.round((total - vp.height) * i / steps));
    await sleep(700);
    await shot(page, `${name}-${String(i + 1).padStart(2, "0")}`);
  }
  const of2 = await overflowCheck(page);
  log(key, route, "url:", page.url().replace(/.*Memorial/, ""), "title:", await page.title(), "| overflow:", of.bodySW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean", of2.offenders.length ? JSON.stringify(of2.offenders) : "", "| errs:", errs.length ? errs : "none");
  await c.close();
}
await browser.close();
