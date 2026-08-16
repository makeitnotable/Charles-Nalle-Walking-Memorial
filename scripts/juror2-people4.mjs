import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
for (const vpk of (process.argv[2] || "p390,d1440").split(",")) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/people", 2000);
  await page.mouse.move(vp.width / 2, vp.height / 2);
  let bad = 0;
  for (let i = 0; i < 60; i++) {
    await page.mouse.wheel(0, 100); await sleep(150);
    const s = await page.evaluate(() => [...document.querySelectorAll("article")].filter((a) => { const r = a.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }).map((a) => `${a.querySelector("h3")?.textContent.trim().slice(0, 12)}:${getComputedStyle(a).opacity}`));
    const unrevealed = s.filter((x) => !/:1$/.test(x));
    if (unrevealed.length) { bad++; console.log(vpk, `step ${i} scrollY=${await page.evaluate(() => scrollY)} fully-in-view but not revealed: ${unrevealed.join(" ")}`); if (bad <= 2) await shot(page, `people4-${vpk}-unrevealed-${i}`); }
  }
  console.log(vpk, "bad steps:", bad);
  await c.close();
}
await browser.close();
