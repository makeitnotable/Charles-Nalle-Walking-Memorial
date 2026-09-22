// viewport-by-viewport shots of a route (natural scroll, reveals fire)
import { launch, goto, shot, sleep, VIEWPORTS, log } from "./juror9-lib.mjs";
const key = process.argv[2] || "p390"; const route = process.argv[3] || "/people"; const maxN = +(process.argv[4] || 12);
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp, { dpr: 1 });
await goto(page, route, 2500);
const slug = route === "/" ? "home" : route.replace(/\W/g, "");
const H = await page.evaluate(() => document.body.scrollHeight);
let n = 0;
for (let y = 0; y < H && n < maxN; y += vp.height * 0.92) {
  await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
  await sleep(1100);
  await shot(page, `${key}-ss-${slug}-${String(n).padStart(2, "0")}`);
  n++;
}
log(slug, "H", H, "shots", n, "errors", errors);
await browser.close();
