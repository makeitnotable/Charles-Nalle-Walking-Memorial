import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
const sample = (page) => page.evaluate(() => { const active = document.querySelector("[aria-label^='Enter Spot']"); const ar = active?.getBoundingClientRect(); const strip = active?.closest("[class*=slider], [class*=keen]") || active?.parentElement?.parentElement; const sr = strip?.getBoundingClientRect(); const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9; for (const e of [m, ...m.querySelectorAll("*")]) { const r = e.getBoundingClientRect(); if (r.width < 2) continue; x1 = Math.min(x1, r.left); y1 = Math.min(y1, r.top); x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom); } return { lab: (m.textContent || "").trim().replace(/\s+/g, " ").slice(0, 16), x1: Math.round(x1), y1: Math.round(y1), x2: Math.round(x2), y2: Math.round(y2) }; }); const cards = [...document.querySelectorAll("[aria-label^='Enter Spot'],[aria-label^='Focus Spot']")].map((c) => c.getBoundingClientRect()).filter((r) => r.right > 0 && r.left < innerWidth); const over = markers.filter((m) => cards.some((r) => m.y2 > r.top && m.y1 < r.bottom && m.x2 > r.left && m.x1 < r.right)); const btn = [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).find((t) => /Continue|Stop the walk|Walk again/.test(t)); return `${active?.getAttribute("aria-label")?.slice(11, 24)} btn=${btn} cardTop=${ar && Math.round(ar.top)} over=${over.map((o) => o.lab + "@y" + o.y1 + "-" + o.y2).join("|")}`; });
for (const vpk of (process.argv[2] || "t1024,d1440,d1920,p390,t768,land").split(",")) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/map", 6000);
  await page.locator('button:visible:has-text("Take the walk")').click();
  const t0 = Date.now(); let hits = 0;
  for (let i = 0; i < 18; i++) { await sleep(1000); const s = await sample(page); const hit = /over=.+/.test(s); if (hit) hits++; console.log(vpk, `${Date.now() - t0}ms`, s); if (hit && hits <= 3) await shot(page, `walkover-${vpk}-${i}`); }
  await c.close();
}
await browser.close();
