// Repro: does a stop stay "active" after Back is pressed mid-walk? usage: node scripts/juror8-backrace.mjs p390 <delayMs>
import { launch, ctx, VPS, watch, shot, sleep, go, save, touchTap } from "./juror8-lib.mjs";
const key = process.argv[2] || "p390";
const delays = (process.argv[3] || "1500,3000,4500,6000,7500").split(",").map(Number);
const vp = VPS[key];
const out = [];
const browser = await launch();
for (const d of delays) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await go(page, "/map", 6000);
  const tap = async (loc) => { const b = await loc.boundingBox(); if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };
  const activeInfo = () => page.evaluate(() => {
    const ms = [...document.querySelectorAll(".mapboxgl-marker")];
    return ms.map((m) => { const btn = m.querySelector("button"); const label = m.textContent.trim().replace(/\s+/g, " "); const cs = btn ? getComputedStyle(btn) : null; return { label, bg: cs?.backgroundColor, ariaPressed: btn?.getAttribute("aria-pressed"), ariaCurrent: btn?.getAttribute("aria-current"), cls: (btn?.className || "").toString().slice(0, 80) }; });
  });
  await tap(page.locator("button:visible:has-text('Take the walk')").first());
  await sleep(d);
  const before = await activeInfo();
  const moving = await page.evaluate(() => (window.__map && window.__map.isMoving && window.__map.isMoving()) ?? null);
  await tap(page.locator("button:visible[aria-label='Back to map'], button:visible:has-text('Back')").first());
  await sleep(3500);
  const after = await activeInfo();
  const stray = after.filter((a) => /[A-Za-z]/.test(a.label));
  await shot(page, `backrace-${key}-${d}`);
  out.push({ delay: d, before: before.map((b) => b.label), moving, after: after.map((a) => a.label + " " + a.bg), stray: stray.map((s) => s.label) });
  console.log(JSON.stringify(out[out.length - 1]));
  await c.close();
}
await browser.close();
save(`backrace-${key}.json`, out);
