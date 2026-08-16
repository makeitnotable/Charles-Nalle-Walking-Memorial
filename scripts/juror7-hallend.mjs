import { launch, ctx, goto, attachConsole, shot, sleep, VIEWPORTS, BASE } from "./juror7-lib.mjs";
const browser = await launch();
for (const vp of ["1440", "390"]) {
  const c = await ctx(browser, vp); const page = await c.newPage(); const errs = []; attachConsole(page, "he", errs);
  await goto(page, "/paintings"); await sleep(3500);
  // walk the rail to the end using wheel / touch in steps
  const st = () => page.evaluate(() => window.__museum?.state && { mode: window.__museum.state.mode, railT: Math.round(window.__museum.state.railT * 100) / 100, railIdx: window.__museum.state.railIdx });
  for (let i = 0; i < 40; i++) { if (VIEWPORTS[vp].mobile) await page.evaluate(() => scrollBy(0, 400)); else await page.mouse.wheel(0, 400); await sleep(120); const s = await st(); if (!s || s.mode !== "rail" || s.railT >= 0.999) break; }
  await sleep(1500);
  console.log(vp, "end", JSON.stringify(await st()));
  await shot(page, `museum-${vp}-30-rail-end`);
  // a bit before the end
  for (let i = 0; i < 4; i++) { if (VIEWPORTS[vp].mobile) await page.evaluate(() => scrollBy(0, -300)); else await page.mouse.wheel(0, -300); await sleep(120); }
  await sleep(1200); console.log(vp, "near-end", JSON.stringify(await st()));
  await shot(page, `museum-${vp}-31-rail-near-end`);
  await c.close();
}
// trailing slash
const c = await ctx(browser, "1440"); const page = await c.newPage();
const resp = await page.goto(BASE + "/bakery/", { waitUntil: "networkidle" }).catch((e) => null); await sleep(2500);
console.log("trailing slash /bakery/ ->", resp && resp.status(), page.url(), (await page.title()));
const resp2 = await page.goto(BASE + "/nonexistent-page", { waitUntil: "networkidle" }).catch(() => null); await sleep(1000);
console.log("404 ->", resp2 && resp2.status(), page.url(), await page.title());
await browser.close();
