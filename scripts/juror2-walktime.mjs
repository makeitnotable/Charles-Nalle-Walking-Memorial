// Sample the walk over time: does the active stop's marker/label ever sit on the card strip once settled?
import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
for (const vpk of (process.argv[2] || "d1440,t1024").split(",")) {
  const vp = VPS[vpk];
  const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/map", 6000);
  await page.locator('button:visible:has-text("Take the walk")').click();
  const t0 = Date.now();
  for (let i = 0; i < 26; i++) {
    await sleep(1000);
    const s = await page.evaluate(() => {
      const active = document.querySelector("[aria-label^='Enter Spot']");
      const ar = active?.getBoundingClientRect();
      const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); const lab = (m.textContent || "").trim().replace(/\s+/g, " ").slice(0, 22); return { lab, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) }; });
      const over = markers.filter((m) => ar && m.bottom > ar.top && m.y < ar.bottom && m.x + m.w > ar.left && m.x < ar.right && m.w > 0);
      const btn = [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).find((t) => /Continue|Stop the walk|Walk again/.test(t));
      return { active: active?.getAttribute("aria-label")?.slice(0, 22), cardTop: ar && Math.round(ar.top), btn, over: over.map((o) => `${o.lab}@${o.x},${o.y}-${o.bottom}`), n: markers.length };
    });
    console.log(vpk, `${Date.now() - t0}ms`, JSON.stringify(s));
    if (s.over.length) await shot(page, `walktime-${vpk}-${i}`);
  }
  await c.close();
}
await browser.close();
