import { launch, ctx, VPS, sleep, go, save, shot } from "./juror8-lib.mjs";
const out = {};
const browser = await launch();
for (const key of (process.argv[2] || "t1024,d1440,d1920,land").split(",")) {
  const vp = VPS[key]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/paintings", 4000);
  await page.evaluate(() => { const c = document.querySelector("canvas"); window.scrollTo(0, c.getBoundingClientRect().top + scrollY); }); await sleep(800);
  out[key] = [];
  for (let i = 0; i < 10; i++) {
    await page.evaluate((i) => window.__museum.approach(i), i); await sleep(1500);
    const info = await page.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const els = [...document.querySelectorAll("h2, h3, .t-title-sm, .t-title, [class*=plaque] *, .museum-sheet *")].filter((e) => e.children.length === 0 && /[A-Za-z]/.test(e.textContent) && vis(e));
      return els.map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); const rects = [...rg.getClientRects()]; const tops = [...new Set(rects.map((r) => Math.round(r.top)))]; if (tops.length < 2) return null; const lastTop = tops[tops.length - 1]; const lastRects = rects.filter((r) => Math.round(r.top) === lastTop); const lastW = lastRects.reduce((s, r) => s + r.width, 0); const firstW = rects.filter((r) => Math.round(r.top) === tops[0]).reduce((s, r) => s + r.width, 0);
        // last line text approx: use word-by-word ranges
        const words = e.textContent.trim().split(/\s+/); let lastLine = []; const tn = e.firstChild; let pos = 0; const txt = tn.textContent; for (const w of words) { const idx = txt.indexOf(w, pos); if (idx < 0) continue; const r = document.createRange(); r.setStart(tn, idx); r.setEnd(tn, idx + w.length); const rr = r.getBoundingClientRect(); if (Math.round(rr.top) === lastTop) lastLine.push(w); pos = idx + w.length; }
        return { txt: e.textContent.trim().slice(0, 60), lines: tops.length, lastLine: lastLine.join(" "), ratio: +(lastW / firstW).toFixed(2), tag: e.tagName, cls: e.className.toString().slice(0, 30) }; }).filter(Boolean);
    });
    out[key].push({ i, info });
    if (key === "d1920" && (i === 5 || i === 9)) await shot(page, `plaque-${key}-${i}`);
  }
  await c.close();
}
await browser.close();
save("plaque-rag.json", out);
for (const k of Object.keys(out)) { console.log("==", k); for (const w of out[k]) for (const f of w.info) if (f.lines >= 2) console.log(w.i, JSON.stringify(f)); }
