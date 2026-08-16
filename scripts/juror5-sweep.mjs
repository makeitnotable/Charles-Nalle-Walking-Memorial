import { launch, ctx, watch, sleep, save, goto, VPS } from "./juror5-lib.mjs";
const key = process.argv[2] || "p390";
const vp = VPS[key];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const R = {};
for (const ch of ["bakery", "commissioners-office", "mansion", "ferry", "barbershop"]) {
  const log = watch(page);
  await goto(page, `/${ch}`); await sleep(1000);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += Math.round(vp.height * 0.7)) { await page.evaluate((y) => window.scrollTo({ top: y }), y); await sleep(120); }
  await sleep(500);
  R[ch] = await page.evaluate(() => {
    const cs = (e) => getComputedStyle(e);
    const r = (e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y + scrollY), w: Math.round(b.width), h: Math.round(b.height) }; };
    // drop caps: first .t-prose in each AudioStory
    const firsts = [...document.querySelectorAll("[id^='scene']")].map((s) => { const p = s.querySelector(".t-prose"); if (!p) return null; const fl = getComputedStyle(p, "::first-letter"); return { text: p.innerText.slice(0, 20), flSize: fl.fontSize, flFont: fl.fontFamily.slice(0, 22), pSize: cs(p).fontSize }; });
    // archival credit
    const credits = [...document.querySelectorAll("figcaption, .t-meta")].filter((e) => /archival|record|courtesy|collection|library|museum|photo/i.test(e.textContent) && e.getBoundingClientRect().width > 0 && e.closest("figure")).map((e) => ({ t: e.textContent.trim().slice(0, 40), color: cs(e).color, bg: cs(e).backgroundColor, bgParent: cs(e.parentElement).backgroundColor }));
    // moral(s)
    const morals = [...document.querySelectorAll("[id^='moral']")].filter((s) => s.tagName === "SECTION" || s.querySelector("h2")).map((s) => { const h = s.querySelector("h2"); const body = [...s.querySelectorAll("p")].find((p) => p.innerText.length > 60); const study = s.querySelector("figure img"); const cap = s.querySelector("figure figcaption, figure p"); return { h: h?.innerText.replace(/\n/g, " ").slice(0, 40), hColor: h && cs(h).color, bodyColor: body && cs(body).color, bodyText: body?.innerText.slice(0, 30), study: study && r(study), cap: cap && r(cap), capColor: cap && cs(cap).color, capText: cap?.innerText.slice(0, 40) }; });
    const ids = [...document.querySelectorAll("section[id], div[id]")].filter((e) => /hero|scene|history|moral|onward|interlude/.test(e.id)).map((e) => e.id + "@" + Math.round(e.getBoundingClientRect().top + scrollY));
    const gaps = (() => { const secs = [...document.querySelectorAll("#history, [id^='moral'], #onward")].filter((e) => e.tagName === "SECTION"); return secs.map((s, i) => s.id + ":" + Math.round(s.getBoundingClientRect().top + scrollY) + "-" + Math.round(s.getBoundingClientRect().bottom + scrollY)); })();
    const emd = [...document.querySelectorAll("body *")].filter((e) => e.children.length === 0 && /—/.test(e.textContent) && e.getBoundingClientRect().width > 0).map((e) => e.textContent.trim().slice(0, 40));
    const heroVid = document.querySelector("video");
    return { firsts, credits, morals, ids, gaps, emd, heroVideoPos: heroVid ? cs(heroVid).objectPosition : null, heroImgPos: (() => { const i = document.querySelector("img"); return i ? cs(i).objectPosition : null; })(), title: document.title };
  });
  R[ch].errors = log.errors;
}
await c.close(); await browser.close();
save(`sweep-${key}.json`, R);
console.log(JSON.stringify(R, null, 1));
