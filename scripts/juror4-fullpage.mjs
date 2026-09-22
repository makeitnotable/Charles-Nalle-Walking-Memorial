import { launch, ctx, watch, shot, sleep, save, goto, VPS } from "./juror4-lib.mjs";
// node scripts/juror4-fullpage.mjs /bakery d1440 [scrollFirst]
const route = process.argv[2], vpk = process.argv[3], scrollFirst = process.argv[4] === "scroll";
const vp = VPS[vpk];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, route); await sleep(1000);
if (scrollFirst) {
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < docH; y += 400) { await page.evaluate((yy) => scrollTo(0, yy), y); await sleep(120); }
  await page.evaluate(() => scrollTo(0, 0)); await sleep(600);
}
await shot(page, `${route.replace(/\//g, "") || "home"}-${vpk}-full`, true);
console.log("LOG", log);
await browser.close();
