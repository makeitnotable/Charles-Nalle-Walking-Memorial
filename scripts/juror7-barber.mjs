import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, VIEWPORTS } from "./juror7-lib.mjs";
const vp = process.argv[2] || "390"; const V = VIEWPORTS[vp];
const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const errs = []; attachConsole(page, "barber", errs);
const log = {};
await goto(page, "/barbershop"); await sleep(2200);
await shot(page, `barber-${vp}-01-arrival`);
log.storyOrder = await page.evaluate(() => { const hint = [...document.querySelectorAll("p,span,div")].find((e) => /tap or click a paragraph/i.test(e.textContent || "") && e.children.length <= 1); const root = hint?.closest("section"); const kids = [...root.querySelectorAll("p.t-prose, figure, img, picture")].filter((e) => !e.closest("figure") || e.tagName === "FIGURE"); return kids.map((e) => e.tagName === "P" ? "T" : "I").join(""); });
log.heroFocus = await page.evaluate(() => { const m = document.querySelector("#hero video, #hero img, #hero-media video, #hero-media img, header video, header img"); return m ? { tag: m.tagName, op: getComputedStyle(m).objectPosition } : null; });
await page.evaluate(() => document.querySelector("#moral")?.scrollIntoView({ block: "start", behavior: "instant" })); await sleep(1300);
await shot(page, `barber-${vp}-02-moral`);
const h = page.locator("#moral h2").first(); const hb = await h.boundingBox();
if (hb) await shot(page, `barber-${vp}-03-moral-heading`, { clip: { x: Math.max(0, hb.x - 8), y: Math.max(0, hb.y - 8), width: Math.min(V.width - hb.x + 8, hb.width + 16), height: hb.height + 24 } });
log.moral = await page.evaluate(() => { const s = document.querySelector("#moral"); const h = s.querySelector("h2"); const p = s.querySelector("p.t-prose"); const fig = s.querySelector("figure"); const cap = fig?.querySelector("p, figcaption"); return { h: h.textContent.trim().replace(/\s+/g, " "), hColor: getComputedStyle(h).color, pColor: getComputedStyle(p).color, figCls: fig?.className.slice(0, 80) }; });
// interlude credit chip
await page.evaluate(() => { const f = [...document.querySelectorAll("figure, section")].find((e) => /Rensselaer|Hart Cluett|Library|Courtesy|Collection/i.test(e.textContent) && e.querySelector("img")); f?.scrollIntoView({ block: "center", behavior: "instant" }); }); await sleep(1500);
await shot(page, `barber-${vp}-04-interlude`);
log.credit = await page.evaluate(() => [...document.querySelectorAll(".t-meta")].filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().top >= 0 && e.getBoundingClientRect().top < innerHeight && e.closest("figure")).map((e) => ({ t: e.textContent.trim().slice(0, 60), bg: getComputedStyle(e).backgroundColor, color: getComputedStyle(e).color })));
writeJson(`barber-${vp}`, { log, errs }); console.log(JSON.stringify(log, null, 1)); await browser.close();
