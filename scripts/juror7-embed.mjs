import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, VIEWPORTS } from "./juror7-lib.mjs";
const vp = process.argv[2] || "390"; const route = process.argv[3] || "/barbershop"; const V = VIEWPORTS[vp];
const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const errs = []; attachConsole(page, "embed", errs);
await goto(page, route); await sleep(1500);
// visitor scrolls down to onward at reading pace: jump to just above, then step
await page.evaluate(() => scrollTo({ top: document.querySelector("#onward").getBoundingClientRect().top + scrollY - innerHeight, behavior: "instant" })); await sleep(1500);
for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 150); await sleep(150); }
const t0 = Date.now(); const rows = [];
for (const dt of [0, 1000, 2000, 3500, 5000, 7000]) {
  while (Date.now() - t0 < dt) await sleep(50);
  const info = await page.evaluate(() => { const em = document.querySelector("#onward canvas"); const box = em?.getBoundingClientRect(); const marker = document.querySelector("#onward .mapboxgl-marker"); const mr = marker?.getBoundingClientRect(); return { box: box && [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)], marker: mr && [Math.round(mr.x), Math.round(mr.y), Math.round(mr.width), Math.round(mr.height)], relY: box && mr ? Math.round(((mr.y + mr.height / 2 - box.y) / box.height) * 100) : null, relX: box && mr ? Math.round(((mr.x + mr.width / 2 - box.x) / box.width) * 100) : null }; });
  rows.push({ dt, ...info });
  await shot(page, `embed-${vp}-${route.slice(1)}-${dt}`);
}
console.log(JSON.stringify(rows)); await browser.close();
