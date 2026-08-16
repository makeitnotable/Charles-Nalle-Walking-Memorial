import { launch, ctx, watch, shot, sleep, goto, VPS } from "./juror4-lib.mjs";
const vpk = process.argv[2] || "p390"; const rm = process.argv[3] === "rm";
const browser = await launch(); const c = await ctx(browser, VPS[vpk], rm ? { reducedMotion: "reduce" } : {}); const page = await c.newPage(); const log = watch(page);
await goto(page, "/map"); await sleep(3500);
await page.evaluate(() => scrollTo(0, 180)); await sleep(800);
console.log("scrolled", await page.evaluate(() => scrollY));
await page.locator('button:has-text("Take the walk")').first().click({ force: true });
for (let i = 0; i < 6; i++) { await sleep(400); console.log(i, await page.evaluate(() => scrollY)); }
await shot(page, `walk-scrolled-${vpk}-${rm ? "rm" : "normal"}`);
// then tap a marker in overview after Back? Also: what happens if I tap "Back"?
await browser.close();
