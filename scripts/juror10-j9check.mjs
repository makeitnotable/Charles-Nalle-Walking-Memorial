import { launch, ctx, VIEWPORTS, BASE, sleep, shot } from "./juror10-lib.mjs";
const browser = await launch();
// 390: progress bar above the curtain at hold?
{
  const c = await ctx(browser, VIEWPORTS.p390); const page = await c.newPage();
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle" }); await sleep(1200);
  const cont = page.locator("#onward a.btn-solid"); await cont.scrollIntoViewIfNeeded(); await sleep(300); await page.evaluate(() => scrollBy(0, -200)); await sleep(600);
  const cb = await cont.boundingBox();
  await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await sleep(750);
  const info = await page.evaluate(() => { const bar = [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return cs.position === "fixed" && r.top <= 2 && r.height <= 8 && r.width > 100 && cs.opacity !== "0"; }).map((e) => ({ cls: e.className.toString().slice(0, 40), z: getComputedStyle(e).zIndex, h: e.getBoundingClientRect().height })); const panel = document.querySelector(".curtain-panel"); return { bar, panelZ: getComputedStyle(panel).zIndex, panelTop: panel.getBoundingClientRect().top, url: location.pathname }; });
  console.log("390 mid-crossing:", JSON.stringify(info));
  await shot(page, "j9-p390-continue-mid");
  await sleep(2500);
  await c.close();
}
// 720x450 map overview
{
  const c = await ctx(browser, { width: 720, height: 450, mobile: false }); const page = await c.newPage();
  await page.goto(BASE + "/map", { waitUntil: "networkidle" }); await sleep(4000);
  const mk = await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const kids = [...m.querySelectorAll("*")].filter((e) => e.getBoundingClientRect().width > 4); let minL = 1e9, minT = 1e9, maxR = -1e9, maxB = -1e9; for (const k of kids) { const r = k.getBoundingClientRect(); minL = Math.min(minL, r.left); minT = Math.min(minT, r.top); maxR = Math.max(maxR, r.right); maxB = Math.max(maxB, r.bottom); } return { l: m.querySelector("button")?.getAttribute("aria-label").slice(0, 8), box: [Math.round(minL), Math.round(minT), Math.round(maxR), Math.round(maxB)], inView: minL >= 0 && minT >= 0 && maxR <= innerWidth && maxB <= innerHeight }; }));
  console.log("720x450 markers:", JSON.stringify(mk));
  await shot(page, "j9-z720-map-overview");
  await c.close();
}
await browser.close();
