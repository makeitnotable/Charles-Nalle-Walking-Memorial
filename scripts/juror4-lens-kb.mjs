import { launch, ctx, watch, shot, sleep, goto, VPS } from "./juror4-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.d1440); const page = await c.newPage(); const log = watch(page);
await goto(page, "/map"); await sleep(3500);
// keyboard: tab to the lens door and Enter
const lens = page.locator('button:has-text("See Troy in 1858"):visible').first();
await lens.focus(); await page.keyboard.press("Enter"); await sleep(2000);
const info = () => page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858|troy/i.test(i.currentSrc) && i.getBoundingClientRect().width > 0); const a = document.activeElement; return { active: a && (a.tagName + " " + (a.getAttribute("aria-label") || a.innerText || a.className.toString()).slice(0, 50)), tf: img && getComputedStyle(img).transform.slice(0, 80), w: img && Math.round(img.getBoundingClientRect().width) }; });
console.log("opened", await info());
await page.keyboard.press("+"); await sleep(500); console.log("after +", await info());
await page.keyboard.press("+"); await sleep(500); console.log("after ++", await info());
await page.keyboard.press("ArrowRight"); await sleep(500); console.log("after right", await info());
await page.keyboard.press("-"); await sleep(500); console.log("after -", await info());
await page.keyboard.press("0"); await sleep(500); console.log("after 0", await info());
// tab from here: where does focus go?
const tabs = []; for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); await sleep(100); tabs.push((await info()).active); }
console.log("tabs", tabs);
// wheel zoom on the viewer
const img = page.locator("img[src*='1858'], img[src*='troy']").first(); const b = await img.boundingBox();
await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.wheel(0, -300); await sleep(600); console.log("after wheel", await info());
await shot(page, "lens-d1440-wheelzoom");
// drag pan
await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 - 200, b.y + b.height / 2 - 100, { steps: 10 }); await page.mouse.up(); await sleep(500); console.log("after drag", await info());
await page.keyboard.press("Escape"); await sleep(800); console.log("after Esc", await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.innerText.trim()).filter(Boolean)));
console.log("LOG", log.filter((l) => !/pbf|mp3/.test(l)));
await browser.close();
