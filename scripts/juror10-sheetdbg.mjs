import { launch, ctx, VIEWPORTS, BASE, sleep } from "./juror10-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VIEWPORTS.p390); const page = await c.newPage();
await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(3000);
await page.evaluate(() => scrollTo({ top: 3000, behavior: "instant" })); await sleep(1500);
await page.evaluate(() => window.__museum.approach(3)); await sleep(2500);
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll("#museum-slot *")].filter((e) => /Mark Priest|Gilbert/i.test(e.textContent) && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height < 700).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName}.${(e.className||"").toString().slice(0,60)} [${e.getAttribute("aria-label")||""}] kids=${e.children.length} pos=${getComputedStyle(e).position} @${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} "${e.textContent.trim().slice(0,40)}"`; })), null, 1));
await browser.close();
