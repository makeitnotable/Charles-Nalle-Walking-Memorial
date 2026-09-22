import { launch, ctx, watch, shot, sleep, save, goto, VPS } from "./juror5-lib.mjs";
// usage: node juror5-fullpage.mjs p390 /bakery,/people
const key = process.argv[2] || "p390";
const routes = (process.argv[3] || "/bakery").split(",");
const vp = VPS[key];
const browser = await launch();
const c = await ctx(browser, vp, { deviceScaleFactor: 1 });
const page = await c.newPage();
const out = {};
for (const route of routes) {
  const log = watch(page);
  await goto(page, route);
  await sleep(1200);
  // scroll through slowly to trigger reveals
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += Math.round(vp.height * 0.6)) {
    await page.evaluate((y) => window.scrollTo({ top: y }), y);
    await sleep(220);
  }
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await sleep(800);
  const name = route.replace(/\//g, "_").replace(/^_/, "") || "home";
  await shot(page, `full-${name}-${key}`, { fullPage: true });
  out[route] = { H, log, hScroll: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), texts: await page.evaluate(() => [...document.querySelectorAll("h1,h2,h3")].map((h) => h.tagName + " " + h.innerText.replace(/\n/g, " / ").slice(0, 60))) };
}
await c.close();
await browser.close();
save(`full-${key}.json`, out);
console.log(JSON.stringify(out, null, 1));
