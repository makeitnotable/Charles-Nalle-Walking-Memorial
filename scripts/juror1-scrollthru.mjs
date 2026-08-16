// Scroll through a route at a viewport, capturing viewport shots (reveals fire naturally).
import { launch, ctx, watch, shot, sleep, BASE, VPS } from "./juror1-lib.mjs";
const routes = (process.argv[2] || "/people,/about").split(",");
const vps = (process.argv[3] || "p390,d1440").split(",");
const opts = process.argv[4] === "rm" ? { reducedMotion: "reduce" } : {};
const browser = await launch();
for (const k of vps) {
  for (const route of routes) {
    const c = await ctx(browser, VPS[k], opts);
    const page = await c.newPage();
    const log = watch(page);
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await sleep(1500);
    const tag = `thru${route.replace(/\//g, "-") || "-home"}-${k}${opts.reducedMotion ? "-rm" : ""}`;
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.floor(VPS[k].height * 0.85);
    let i = 0;
    for (let y = 0; y < H && i < 40; y += step, i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
      await sleep(700);
      await shot(page, `${tag}-${String(i).padStart(2, "0")}`);
    }
    console.log(tag, "H", H, "shots", i, "log", log.filter((l) => !/ERR_ABORTED/.test(l)));
    await c.close();
  }
}
await browser.close();
