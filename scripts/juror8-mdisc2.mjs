import { launch, ctx, VPS, sleep, go } from "./juror8-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.d1440); const page = await c.newPage();
await go(page, "/paintings", 5000);
console.log(await page.evaluate(() => JSON.stringify([window.__museum.paintingRect(0), window.__museum.paintingRect(1), JSON.stringify(window.__museum.placements).slice(0,300)])));
await c.close(); await browser.close();
