import { launch, ctx, VIEWPORTS, BASE, shot, sleep } from "./juror10-lib.mjs";
const browser = await launch();
for (const k of ["p390", "d1440", "t768"]) {
  const c = await ctx(browser, VIEWPORTS[k]); const p = await c.newPage();
  for (const r of ["/bakery", "/barbershop", "/ferry"]) {
    await p.goto(BASE + r, { waitUntil: "networkidle" }); await sleep(1200);
    const info = await p.evaluate(() => {
      const scene = document.querySelector("#scene-0"); const hist = document.querySelector("#history");
      let el = scene.nextElementSibling; const out = [];
      while (el && el !== hist) { out.push({ tag: el.tagName, id: el.id, cls: (el.className || "").toString().slice(0, 50), top: Math.round(el.getBoundingClientRect().top + scrollY), h: Math.round(el.getBoundingClientRect().height), text: el.textContent.trim().replace(/\s+/g, " ").slice(0, 80), credit: (() => { const c = el.querySelector(".t-meta, figcaption"); if (!c) return null; const cs = getComputedStyle(c); const r = c.getBoundingClientRect(); return { t: c.textContent.trim().slice(0, 60), color: cs.color, bg: cs.backgroundColor, l: Math.round(r.left), r: Math.round(r.right), lines: c.getClientRects().length }; })() }); el = el.nextElementSibling; }
      return out;
    });
    console.log(k, r, JSON.stringify(info));
    const inter = info.find((x) => x.credit);
    if (inter) { await p.evaluate((t) => scrollTo({ top: t - 60, behavior: "instant" }), inter.top); await sleep(2200); await shot(p, `interlude${r.replace("/", "-")}-${k}`); await p.evaluate(({ t, h }) => scrollTo({ top: t + h - innerHeight + 40, behavior: "instant" }), { t: inter.top, h: inter.h }); await sleep(1500); await shot(p, `interlude${r.replace("/", "-")}-end-${k}`); }
  }
  await c.close();
}
await browser.close();
