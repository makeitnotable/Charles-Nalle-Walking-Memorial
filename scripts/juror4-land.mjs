import { launch, ctx, watch, shot, sleep, goto, VPS, floating } from "./juror4-lib.mjs";
const vp = VPS.land;
{ const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await goto(page, "/bakery"); await sleep(1200); await shot(page, "land-bakery-hero");
  const p = page.locator('button[aria-label^="Play narration"]').first(); await p.scrollIntoViewIfNeeded(); await page.evaluate(() => scrollBy(0, -100)); await sleep(400); await shot(page, "land-bakery-player"); await p.click(); await sleep(1500);
  await page.evaluate(() => scrollTo(0, document.querySelector("#moral").offsetTop + 60)); await sleep(800); await shot(page, "land-bakery-moral");
  await page.evaluate(() => scrollTo(0, document.querySelector("#onward").offsetTop + 300)); await sleep(800); await shot(page, "land-bakery-onward");
  console.log("bakery floating", await floating(page), log.filter((l) => !/mp3/.test(l))); await browser.close(); }
{ const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await goto(page, "/map"); await sleep(3500); await shot(page, "land-map-overview");
  await page.locator('button:has-text("Take the walk")').first().click(); await sleep(3000); await shot(page, "land-map-walk");
  console.log("map walk btns", await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width > 0 && !/marker/.test(b.className)).map((b) => { const r = b.getBoundingClientRect(); return `${b.innerText.trim() || b.getAttribute("aria-label")} @${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; })), log.filter((l) => !/pbf|glb/.test(l))); await browser.close(); }
{ const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await goto(page, "/paintings"); await sleep(1500); const top = await page.evaluate(() => document.querySelector("#museum-slot").offsetTop); await page.evaluate((y) => scrollTo(0, y + 400), top); await sleep(1500); await shot(page, "land-museum-rail");
  await page.locator('#museum-slot button[aria-label^="Approach"]').first().click({ force: true }); await sleep(2500); await shot(page, "land-museum-approach");
  const r = await page.evaluate(() => window.__museum.paintingRect(0)); console.log("land approach rect", r, await page.evaluate(() => [...document.querySelectorAll("#museum-slot button, #museum-slot p")].filter((e) => e.getBoundingClientRect().width > 0 && !/Approach/.test(e.getAttribute("aria-label") || "")).map((e) => { const b = e.getBoundingClientRect(); return `${(e.getAttribute("aria-label") || e.innerText).replace(/\s+/g, " ").slice(0, 40)} @${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}x${Math.round(b.height)}`; })), log); await browser.close(); }
