import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const out = {};
for (const k of ["d1440", "p390"]) {
  const vp = VPS[k]; const c = await ctx(browser, vp); const page = await c.newPage();
  await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(1500);
  const geo = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
  await page.evaluate((y) => scrollTo(0, y), geo.top + (geo.h - vp.height) * 0.4); await sleep(1500);
  const ring = (sel) => page.evaluate((sel) => { const b = document.querySelector(sel); if (!b) return null; const cs = getComputedStyle(b); return { fv: b.matches(":focus-visible"), f: b.matches(":focus"), outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor, shadow: cs.boxShadow.slice(0, 60) }; }, sel);
  // mouse-click a dot → approach → Back focused by script
  const dot = page.locator('button[aria-label^="Approach"]').nth(4);
  if (vp.mobile) { const b = await dot.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); } else { await dot.click(); }
  await sleep(2400);
  out[k] = { backAfterPointerApproach: await ring('button[aria-label*="Back to the hall"]'), active: await page.evaluate(() => document.activeElement?.getAttribute("aria-label")) };
  await shot(page, `focus-${k}-back-after-pointer`);
  // pointer-click Back → dot focused by script
  const back = page.getByRole("button", { name: /back to the hall/i });
  if (vp.mobile) { const b = await back.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); } else { await back.click(); }
  await sleep(1800);
  out[k].dotAfterPointerBack = await page.evaluate(() => { const b = document.activeElement; const cs = getComputedStyle(b); return { label: b.getAttribute("aria-label"), fv: b.matches(":focus-visible"), outline: cs.outlineStyle + " " + cs.outlineWidth, shadow: cs.boxShadow.slice(0, 60) }; });
  await shot(page, `focus-${k}-dot-after-pointer-back`);
  await c.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
