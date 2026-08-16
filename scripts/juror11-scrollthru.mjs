// scroll through a route in viewport-height steps and capture every Nth frame
import { launch, ctx, VPS, shot, goto, watchConsole, log, sleep } from "./juror11-lib.mjs";
const vpKey = process.argv[2] || "p390";
const route = process.argv[3] || "/barbershop";
const every = Number(process.argv[4] || 1);
const vp = VPS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const errs = watchConsole(page, `${route}-${vpKey}`);
await goto(page, route, 2000);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const step = Math.round(vp.height * 0.9);
let i = 0;
for (let y = 0; y < total; y += step) {
  await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
  await sleep(700);
  if (i % every === 0) await shot(page, `thru-${route.slice(1) || "home"}-${vpKey}-${String(i).padStart(2, "0")}`);
  i++;
}
log("frames:", i, "total px:", total, "errs:", errs.length ? errs : "none");
await browser.close();
