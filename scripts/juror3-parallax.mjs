import { launch, newPage, goto, sleep } from "./juror3-lib.mjs";
const browser = await launch();
for (const [vp, rm] of [["d1440", "no-preference"], ["p390", "no-preference"], ["d1440", "reduce"]]) {
  const page = await newPage(browser, vp, { reducedMotion: rm });
  await goto(page, "/bakery"); await sleep(800);
  const get = () => page.evaluate(() => { const m = document.querySelector("#moral"); const img = m.querySelector("img, picture img, video"); return { t: getComputedStyle(img).transform, top: Math.round(m.getBoundingClientRect().top) }; });
  await page.evaluate(() => { const m = document.querySelector("#moral"); window.scrollTo(0, m.getBoundingClientRect().top + scrollY - innerHeight * 0.8); }); await sleep(600);
  const a = await get();
  await page.evaluate(() => window.scrollBy(0, 500)); await sleep(600);
  const b = await get();
  await page.evaluate(() => window.scrollBy(0, 500)); await sleep(600);
  const c = await get();
  console.log(vp, rm, a, b, c);
  await page.close();
}
await browser.close();
