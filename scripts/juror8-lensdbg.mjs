import { launch, ctx, VPS, watch, shot, sleep, go } from "./juror8-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.p390); const page = await c.newPage();
await go(page, "/map", 5000);
console.log(await page.evaluate(() => [...document.querySelectorAll("button, a")].filter(e => /1858|walk|today/i.test(e.textContent + (e.getAttribute("aria-label")||""))).map(e => `${e.tagName} txt="${e.textContent.trim()}" aria="${e.getAttribute("aria-label")}" cls=${e.className.toString().slice(0,80)} r=${JSON.stringify(e.getBoundingClientRect())}`)));
await c.close(); await browser.close();
