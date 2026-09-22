import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, VIEWPORTS, BASE, OUT } from "./juror7-lib.mjs";
import sharp from "sharp"; import path from "node:path";
const browser = await launch(); const log = {};
// H6: choreography timing from load event
for (const vp of ["390", "1440"]) {
  const c = await ctx(browser, vp); const page = await c.newPage();
  await page.addInitScript(() => { window.__ctaT = null; const tick = () => { const a = document.querySelector('a[href$="/map"]'); if (a) { let el = a, o = 1; while (el && el !== document.body) { o *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; } if (o > 0.9 && window.__ctaT == null) { window.__ctaT = performance.now(); return; } } requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await goto(page, "/"); await sleep(3000);
  log["h6-" + vp] = await page.evaluate(() => { const nav = performance.getEntriesByType("navigation")[0]; return { ctaVisibleAt: Math.round(window.__ctaT), domContentLoaded: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), fromDCL: Math.round(window.__ctaT - nav.domContentLoadedEventEnd), fromLoad: Math.round(window.__ctaT - nav.loadEventEnd) }; });
  await c.close();
}
// favicon rendering: fetch svg, render 16/32/180
const c = await ctx(browser, "1440"); const page = await c.newPage();
const svg = await page.evaluate(async (u) => (await fetch(u)).text(), BASE + "/favicon.svg");
const buf = Buffer.from(svg);
const tiles = [];
for (const s of [16, 32, 64, 180]) tiles.push(await sharp(buf).resize(s, s).png().toBuffer());
const big = await Promise.all(tiles.map((t, i) => sharp(t).resize([16, 32, 64, 180][i] * (i < 2 ? 8 : i === 2 ? 3 : 1), null, { kernel: "nearest" }).png().toBuffer()));
const comps = []; let x = 0;
for (const b of big) { const m = await sharp(b).metadata(); comps.push({ input: b, left: x, top: 0 }); x += m.width + 16; }
await sharp({ create: { width: x, height: 260, channels: 4, background: "#ffffff" } }).composite(comps).png().toFile(path.join(OUT, "favicon-render.png"));
// also the ico + apple icon + og
for (const f of ["favicon-32.png", "apple-touch-icon.png", "icon-192.png", "og.png"]) { const b = await page.evaluate(async (u) => { const r = await fetch(u); const ab = await r.arrayBuffer(); return Array.from(new Uint8Array(ab)); }, BASE + "/" + f); const bb = Buffer.from(b); const m = await sharp(bb).metadata(); log[f] = { w: m.width, h: m.height, format: m.format, hasAlpha: m.hasAlpha }; }
await sharp(Buffer.from(await page.evaluate(async (u) => Array.from(new Uint8Array(await (await fetch(u)).arrayBuffer())), BASE + "/apple-touch-icon.png"))).toFile(path.join(OUT, "apple-touch-icon-copy.png"));
// index card title overflow at 360
await c.close();
const c2 = await ctx(browser, "360"); const p2 = await c2.newPage();
await goto(p2, "/map"); await sleep(3000);
await p2.evaluate(() => { const a = [...document.querySelectorAll("main a")].find((x) => /commissioners-office/.test(x.href) && /Spot 02/.test(x.textContent)); scrollTo({ top: a.getBoundingClientRect().top + scrollY - 40, behavior: "instant" }); }); await sleep(900);
await shot(p2, "map-360-index-cards");
log.indexTitle360 = await p2.evaluate(() => { const a = [...document.querySelectorAll("main a")].find((x) => /commissioners-office/.test(x.href) && /Spot 02/.test(x.textContent)); const t = a.querySelector(".t-title-sm"); const arrow = a.querySelector("svg"); return { titleRect: t.getBoundingClientRect().toJSON(), sw: t.scrollWidth, cw: t.clientWidth, arrowRect: arrow?.getBoundingClientRect().toJSON(), fs: getComputedStyle(t).fontSize }; });
await c2.close(); await browser.close();
writeJson("misc", log); console.log(JSON.stringify(log, null, 1));
