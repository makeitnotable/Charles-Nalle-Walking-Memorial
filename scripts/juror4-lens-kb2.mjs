import { launch, ctx, watch, shot, sleep, goto, VPS } from "./juror4-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.d1440); const page = await c.newPage(); const log = watch(page);
await goto(page, "/map"); await sleep(3500);
await page.locator('button:has-text("See Troy in 1858"):visible').first().click(); await sleep(2000);
const info = () => page.evaluate(() => { const img = [...document.querySelectorAll("img")].find((i) => /1858|troy/i.test(i.currentSrc) && i.getBoundingClientRect().width > 0); let e = img, chain = []; while (e && chain.length < 5) { const t = getComputedStyle(e).transform; chain.push(`${e.tagName}.${(e.className || "").toString().slice(0, 25)} tf=${t.slice(0, 50)} tab=${e.getAttribute("tabindex")} role=${e.getAttribute("role")} al=${(e.getAttribute("aria-label") || "").slice(0, 30)}`); e = e.parentElement; } const a = document.activeElement; return { active: a && (a.tagName + " " + (a.getAttribute("aria-label") || a.innerText || a.className.toString()).slice(0, 40)), chain, imgRect: img && (() => { const r = img.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; })() }; });
console.log("opened", await info());
const focusables = await page.evaluate(() => [...document.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top < innerHeight && r.bottom > 0; }).map((e) => `${e.tagName} ${(e.getAttribute("aria-label") || e.innerText || "").replace(/\s+/g, " ").slice(0, 30)} tab=${e.getAttribute("tabindex")}`));
console.log("focusables in view", focusables);
await page.locator('button:has-text("+")').first().click(); await sleep(600); console.log("after + click", (await info()).imgRect, (await info()).chain[1]);
const img = page.locator("img[src*='1858'], img[src*='troy']").first(); const b = await img.boundingBox();
await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.wheel(0, -400); await sleep(700); console.log("after wheel", (await info()).imgRect);
await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 - 200, b.y + b.height / 2 - 100, { steps: 10 }); await page.mouse.up(); await sleep(500); console.log("after drag", (await info()).imgRect);
// keyboard: focus the viewer (if focusable) and press keys
const viewer = page.locator('[aria-label*="1858" i], [role="img"], [tabindex="0"]').first();
console.log("viewer count", await viewer.count(), await viewer.getAttribute("aria-label").catch(() => null), await viewer.getAttribute("tabindex").catch(() => null));
if (await viewer.count()) { await viewer.focus(); await page.keyboard.press("+"); await sleep(400); console.log("kb + on viewer", (await info()).imgRect); await page.keyboard.press("ArrowLeft"); await sleep(400); console.log("kb left", (await info()).imgRect); await page.keyboard.press("0"); await sleep(400); console.log("kb 0", (await info()).imgRect); }
console.log("LOG", log.filter((l) => !/pbf|mp3|glb/.test(l)));
await browser.close();
