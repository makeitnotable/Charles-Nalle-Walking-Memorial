import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
for (const vpk of (process.argv[2] || "d1440").split(",")) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/people", 2000);
  const ops = () => page.evaluate(() => [...document.querySelectorAll("h3")].slice(0, 6).map((h) => { const a = h.closest("article") || h; return `${h.textContent.trim().slice(0, 12)}:${getComputedStyle(a).opacity}`; }).join(" "));
  await page.mouse.move(vp.width / 2, vp.height / 2);
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 600); await sleep(40); }
  await sleep(1500);
  console.log(vpk, "after fast wheel down:", await ops(), "scrollY=", await page.evaluate(() => scrollY));
  for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, -100); await sleep(80); const y = await page.evaluate(() => scrollY); if (y < 1400) break; }
  await sleep(1500);
  console.log(vpk, "after wheel back up:", await ops(), "scrollY=", await page.evaluate(() => scrollY));
  await shot(page, `people3-${vpk}-after-wheel-up`);
  // wheel down slowly from top
  await page.reload({ waitUntil: "load" }); await sleep(1500);
  for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, 120); await sleep(120); }
  await sleep(1200);
  console.log(vpk, "after slow wheel down:", await ops(), "scrollY=", await page.evaluate(() => scrollY));
  await shot(page, `people3-${vpk}-slow-wheel`);
  await c.close();
}
await browser.close();
