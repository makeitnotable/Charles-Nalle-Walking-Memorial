import { launch, ctx, VPS, sleep, go, touchDrag, shot } from "./juror8-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.p390); const page = await c.newPage();
await go(page, "/map", 5000);
const center0 = await page.evaluate(() => JSON.stringify(document.querySelector(".mapboxgl-canvas") && [...document.querySelectorAll(".mapboxgl-marker")].slice(0,1).map(m => m.getBoundingClientRect().y)));
await touchDrag(page, 195, 600, 195, 200, 12, 16); await sleep(1200);
const after = await page.evaluate(() => ({ scrollY, m1y: [...document.querySelectorAll(".mapboxgl-marker")].slice(0,1).map(m => Math.round(m.getBoundingClientRect().y)), ta: getComputedStyle(document.querySelector(".mapboxgl-canvas")).touchAction }));
console.log("swipe on map body:", { center0, after });
await shot(page, "mapswipe-p390-after-body-swipe");
// swipe starting in the bottom lane
await touchDrag(page, 195, 830, 195, 300, 12, 16); await sleep(1200);
console.log("swipe from bottom lane scrollY:", await page.evaluate(() => scrollY));
// cue under the button?
console.log(await page.evaluate(() => [...document.querySelectorAll("svg, [class*=chevron], [aria-hidden]")].filter(e => { const r = e.getBoundingClientRect(); return r.y > innerHeight - 40 && r.width > 0; }).map(e => e.tagName + " " + Math.round(e.getBoundingClientRect().y) + " " + (e.getAttribute("class")||"").slice(0,40))));
await c.close(); await browser.close();
