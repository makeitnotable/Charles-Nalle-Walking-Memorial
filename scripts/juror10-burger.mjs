import { launch, ctx, VIEWPORTS, BASE, sleep, shot } from "./juror10-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VIEWPORTS.d1440); const page = await c.newPage();
await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(3000);
const bg = () => page.evaluate(() => { const b = document.querySelector(".cnwm-menu-burger"); return { op: getComputedStyle(b.parentElement).opacity, y: scrollY, mode: window.__museum.state.mode, idx: window.__museum.state.railIdx }; });
for (let i = 0; i < 6; i++) { await page.mouse.move(720, 450); await page.mouse.wheel(0, 500); await sleep(250); }
await sleep(1000); console.log("after rail scroll:", JSON.stringify(await bg()));
const r = await page.evaluate(() => window.__museum.paintingRect(2));
await page.evaluate(() => window.__museum.approach(2)); await sleep(2000);
console.log("approach:", JSON.stringify(await bg()));
await page.mouse.wheel(0, -120); await sleep(800);
console.log("approach + wheel up 120:", JSON.stringify(await bg()));
await page.mouse.wheel(0, 300); await sleep(800);
console.log("approach + wheel down 300:", JSON.stringify(await bg()));
await shot(page, "museum-approach-after-wheel-d1440");
// now: from a rest state, scroll to a painting slowly (rail) then click it — is burger visible?
await page.keyboard.press("Escape"); await sleep(1000);
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(600);
for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 300); await sleep(300); }
await sleep(800);
console.log("after 1200 rail scroll:", JSON.stringify(await bg()));
await page.mouse.wheel(0, -60); await sleep(800);
console.log("after 60 up:", JSON.stringify(await bg()));
await browser.close();
