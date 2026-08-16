import { launch, ctx, VPS, shot, goto, watchConsole, log, sleep } from "./juror11-lib.mjs";
const browser = await launch();
for (const [key, route] of [["p390", "/bakery"], ["p360", "/mansion"], ["t768", "/bakery"], ["p390", "/ferry"]]) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const errs = watchConsole(page, key);
  await goto(page, route, 1500);
  await page.evaluate(() => document.querySelector("#onward")?.scrollIntoView({ behavior: "instant" }));
  await sleep(4000);
  const info = await page.evaluate(() => {
    const on = document.querySelector("#onward");
    const map = on.querySelector(".mapboxgl-map, canvas")?.closest("div");
    const markers = [...on.querySelectorAll(".mapboxgl-marker, [class*=marker], [class*=pin]")].map((m) => ({ cls: String(m.className).slice(0, 40), r: m.getBoundingClientRect().toJSON(), txt: m.textContent.trim().slice(0, 30) }));
    const mapR = on.querySelector(".mapboxgl-map")?.getBoundingClientRect().toJSON();
    return { mapR, markers, onwardTop: on.getBoundingClientRect().top };
  });
  log(key, route, JSON.stringify(info));
  await shot(page, `embed-${route.slice(1)}-${key}`);
  await c.close();
}
await browser.close();
