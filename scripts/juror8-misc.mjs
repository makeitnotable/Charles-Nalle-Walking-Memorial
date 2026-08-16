import { launch, ctx, VPS, sleep, go, shot, BASE } from "./juror8-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.d1440); const page = await c.newPage();
// G-L3 trailing slash
await page.goto(BASE + "/bakery/", { waitUntil: "load" }); await sleep(2500); console.log("trailing slash →", page.url());
// C12 mansion audio subtitle
await go(page, "/mansion", 2000); console.log("mansion player text:", await page.evaluate(() => { const b = document.querySelector("button[aria-label^='Play narration']"); return b?.getAttribute("aria-label") + " | " + b?.parentElement?.textContent.trim().replace(/\s+/g, " ").slice(0, 80); }));
// L4 lens keyboard: + - 0 arrows
await go(page, "/map", 5000);
const lb = await page.locator("button:visible:has-text('1858')").first().boundingBox(); await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2); await sleep(2000);
const tf = () => page.evaluate(() => { const img = [...document.querySelectorAll("img")].filter((i) => /1858/.test(i.src) && i.getBoundingClientRect().width > 0)[0]; return img ? getComputedStyle(img).transform : null; });
const t0 = await tf(); await page.keyboard.press("+"); await sleep(500); const t1 = await tf(); await page.keyboard.press("ArrowRight"); await sleep(500); const t2 = await tf(); await page.keyboard.press("-"); await sleep(500); const t3 = await tf(); await page.keyboard.press("0"); await sleep(600); const t4 = await tf();
console.log("lens kbd", { t0, t1, t2, t3, t4 });
// which element has focus after approach in the museum + does the ring show
await go(page, "/paintings", 4000);
await page.evaluate(() => { const c = document.querySelector("canvas"); window.scrollTo(0, c.getBoundingClientRect().top + scrollY); }); await sleep(800);
await page.evaluate(() => window.__museum.approach(0)); await sleep(1500);
console.log("focus after approach:", await page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + " " + (a.getAttribute("aria-label") || a.textContent.trim().slice(0, 30)) + " focus-visible=" + a.matches(":focus-visible") : null; }));
await c.close(); await browser.close();
