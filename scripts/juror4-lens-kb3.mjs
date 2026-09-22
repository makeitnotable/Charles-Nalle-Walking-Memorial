import { launch, ctx, watch, shot, sleep, goto, VPS } from "./juror4-lib.mjs";
const vpk = process.argv[2] || "d1440"; const vp = VPS[vpk];
const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
await goto(page, "/map"); await sleep(3500);
await page.locator('button:has-text("See Troy in 1858"):visible').first().click(); await sleep(2000);
const rect = () => page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858|troy/i.test(i.currentSrc) && i.getBoundingClientRect().width > 0); const r = img.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
const app = page.locator('div[role="application"]').first();
const ab = await app.boundingBox();
console.log("app box", ab, "img", await rect());
// wheel over the application
await page.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2);
for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, -120); await sleep(120); }
await sleep(500); console.log("after 5 wheel ticks", await rect());
// drag with mouse
await page.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2); await page.mouse.down();
for (let i = 1; i <= 10; i++) { await page.mouse.move(ab.x + ab.width / 2 - 25 * i, ab.y + ab.height / 2 - 12 * i); await sleep(30); }
await page.mouse.up(); await sleep(500); console.log("after mouse drag", await rect());
// keyboard on the application
await app.focus(); await sleep(200);
console.log("focused", await page.evaluate(() => document.activeElement?.getAttribute("aria-label")));
await page.keyboard.press("+"); await sleep(400); console.log("kb +", await rect());
await page.keyboard.press("ArrowLeft"); await sleep(400); console.log("kb ArrowLeft", await rect());
await page.keyboard.press("ArrowUp"); await sleep(400); console.log("kb ArrowUp", await rect());
await page.keyboard.press("-"); await sleep(400); console.log("kb -", await rect());
await page.keyboard.press("0"); await sleep(400); console.log("kb 0", await rect());
// touch drag on phones
if (vp.mobile) { const { touchDrag } = await import("./juror4-lib.mjs"); await touchDrag(page, ab.x + ab.width / 2, ab.y + ab.height / 2, ab.x + ab.width / 2 - 150, ab.y + ab.height / 2 - 80, 12, 300); await sleep(500); console.log("after touch drag", await rect()); }
console.log("LOG", log.filter((l) => !/pbf|mp3|glb/.test(l)));
await browser.close();
