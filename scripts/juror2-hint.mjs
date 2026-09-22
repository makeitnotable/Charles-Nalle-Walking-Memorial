import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
for (const vpk of ["p360", "p390"]) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await page.goto("https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/map", { waitUntil: "load" });
  const t0 = Date.now();
  const st = () => page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => /Drag to explore/i.test(e.textContent) && e.children.length <= 2 && e.getBoundingClientRect().height < 80); if (!h) return "no hint"; const r = h.getBoundingClientRect(); const cs = getComputedStyle(h); const m4 = [...document.querySelectorAll(".mapboxgl-marker")].find((m) => /4/.test(m.textContent)); let mr = null; if (m4) { for (const e of [m4, ...m4.querySelectorAll("*")]) { const rr = e.getBoundingClientRect(); if (rr.width > 2 && (!mr || rr.width > mr.width)) mr = rr; } } return `hint op=${cs.opacity} vis=${cs.visibility} y=${Math.round(r.top)}-${Math.round(r.bottom)} x=${Math.round(r.left)}-${Math.round(r.right)} | m4=${mr && `${Math.round(mr.left)}-${Math.round(mr.right)},${Math.round(mr.top)}-${Math.round(mr.bottom)}`}`; });
  for (const t of [3000, 6000, 9000, 12000, 16000]) { await sleep(t - (Date.now() - t0)); console.log(vpk, `${t}ms`, await st()); }
  await shot(page, `hint-${vpk}-16s`);
  await c.close();
}
await browser.close();
