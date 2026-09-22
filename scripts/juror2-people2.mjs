import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
for (const vpk of (process.argv[2] || "d1440,p390").split(",")) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/people", 2000);
  const ops = () => page.evaluate(() => [...document.querySelectorAll("h3")].slice(0, 6).map((h) => { const a = h.closest("article") || h; return `${h.textContent.trim().slice(0, 12)}:${getComputedStyle(a).opacity}`; }).join(" "));
  // jump straight past (like a spine anchor or a hard flick), wait, then come back up slowly
  await page.evaluate(() => scrollTo(0, 3200)); await sleep(1500);
  console.log(vpk, "after jump to 3200:", await ops());
  for (let y = 3200; y >= 800; y -= 100) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(60); }
  await sleep(1200);
  console.log(vpk, "after scrolling back up slowly:", await ops());
  await shot(page, `people2-${vpk}-backup`);
  // Now the fast-forward case: step 0.7vh with 100ms
  await page.reload({ waitUntil: "load" }); await sleep(1500);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += Math.round(vp.height * 0.7)) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(100); }
  await sleep(1000);
  console.log(vpk, "after 0.7vh/100ms pass:", await ops());
  // wheel-based scroll (real input) fast
  await page.reload({ waitUntil: "load" }); await sleep(1500);
  await page.mouse.move(vp.width / 2, vp.height / 2);
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 600); await sleep(40); }
  await sleep(1500);
  console.log(vpk, "after fast wheel:", await ops(), "scrollY=", await page.evaluate(() => scrollY));
  await c.close();
}
await browser.close();
