import { launch, ctx, watch, sleep, VPS, BASE } from "./juror5-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.d1440); const page = await c.newPage(); const log = watch(page);
await page.goto(BASE + "/bakery/", { waitUntil: "load" }); await sleep(2500);
console.log(JSON.stringify({ url: page.url(), title: await page.title(), h1: await page.evaluate(() => document.querySelector("h1")?.innerText.replace(/\n/g, " ")) }));
await c.close(); await browser.close();
