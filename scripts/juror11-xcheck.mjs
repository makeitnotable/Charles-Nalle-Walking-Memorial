import { launch, ctx, VPS, shot, goto, log, sleep } from "./juror11-lib.mjs";
const browser = await launch();
for (const key of ["t768", "t1024"]) {
  const c = await ctx(browser, VPS[key]); const page = await c.newPage();
  await goto(page, "/people", 1500);
  const r = await page.evaluate(() => [...document.querySelectorAll("p.t-meta, .t-meta")].filter((e) => /attorney|employer|railroad|alarm|center|crowd/i.test(e.textContent)).map((e) => { const r = e.getBoundingClientRect(); let col = e.parentElement; while (col && col.getBoundingClientRect().width < 200) col = col.parentElement; const cr = col.getBoundingClientRect(); const rule = e.closest("li, article, div"); return { t: e.textContent.trim().replace(/\s+/g, " "), right: Math.round(r.right), colRight: Math.round(cr.right), lines: Math.round(r.height / parseFloat(getComputedStyle(e).lineHeight)), over: r.right > cr.right + 1, sw: e.scrollWidth > e.clientWidth + 1 }; }));
  log(key, JSON.stringify(r));
  await c.close();
}
for (const key of ["p390", "d1440", "d1920"]) {
  const c = await ctx(browser, VPS[key]); const page = await c.newPage();
  await goto(page, "/map", 500);
  for (const t of [2500, 4000, 6000]) {
    await sleep(t === 2500 ? 2000 : 1500);
    const info = await page.evaluate(() => { const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05; }; const chips = [...document.querySelectorAll("div, span, p")].filter((e) => vis(e) && e.children.length === 0 && /Drag to explore/i.test(e.textContent)).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], op: getComputedStyle(e).opacity }; }); const pills = [...document.querySelectorAll(".mapboxgl-marker *")].filter((e) => vis(e) && e.getBoundingClientRect().width > 20 && e.getBoundingClientRect().width < 300).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 20), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; }); const ov = (a, b) => !(a[0] + a[2] < b[0] || b[0] + b[2] < a[0] || a[1] + a[3] < b[1] || b[1] + b[3] < a[1]); const hits = []; for (const ch of chips) for (const p of pills) if (ov(ch.r, p.r)) hits.push(ch.t + " × " + p.t); return { chips, hits }; });
    log(key, t + "ms", JSON.stringify(info));
    await shot(page, `xcheck-hint-${key}-${t}`);
  }
  await c.close();
}
await browser.close();
