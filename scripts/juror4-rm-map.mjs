import { launch, ctx, watch, shot, sleep, goto, VPS } from "./juror4-lib.mjs";
const vpk = process.argv[2] || "p390"; const rm = process.argv[3] !== "normal";
const browser = await launch(); const c = await ctx(browser, VPS[vpk], rm ? { reducedMotion: "reduce" } : {}); const page = await c.newPage(); const log = watch(page);
await goto(page, "/map"); await sleep(3500);
const st = () => page.evaluate(() => ({ scrollY, active: document.activeElement && (document.activeElement.tagName + " " + (document.activeElement.getAttribute("aria-label") || document.activeElement.innerText || "").slice(0, 40)), shellH: document.querySelector(".mapboxgl-map")?.getBoundingClientRect().height, shellTop: document.querySelector(".mapboxgl-map")?.getBoundingClientRect().top }));
console.log("before", await st());
await page.locator('button:has-text("Take the walk")').first().click();
for (let i = 0; i < 8; i++) { await sleep(300); console.log(i, await st()); }
await shot(page, `rm-map-${vpk}-${rm ? "rm" : "normal"}-walk2`);
// simulate scrolling up as a user would (wheel up)
await page.mouse.wheel(0, -400); await sleep(800);
console.log("after wheel up", await st());
await shot(page, `rm-map-${vpk}-${rm ? "rm" : "normal"}-walk3`);
console.log("LOG", log.filter((l) => !/mp3|pbf/.test(l)));
await browser.close();
