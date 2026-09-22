import { launch, ctx, watch, sleep, goto, VPS } from "./juror4-lib.mjs";
const browser = await launch();
const c = await ctx(browser, VPS.d1440);
const page = await c.newPage(); const log = watch(page);
await goto(page, "/paintings"); await sleep(1500);
await page.evaluate(() => scrollTo(0, document.querySelector("#museum-slot").offsetTop)); await sleep(2500);
const info = await page.evaluate(() => {
  const m = window.__museum; if (!m) return "no hook";
  const keys = Object.keys(m);
  let state; try { state = typeof m.state === "function" ? m.state() : m.state; } catch (e) { state = String(e); }
  let rect; try { rect = m.paintingRect(0); } catch (e) { rect = String(e); }
  return { keys, state, rect };
});
console.log(JSON.stringify(info, null, 1).slice(0, 3000));
const dom = await page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && cs.visibility !== "hidden" && cs.opacity !== "0"; };
  return [...document.querySelectorAll("#museum-slot button, #museum-slot [role=status], #museum-slot p, #museum-slot canvas, #museum-slot div[class*=fixed], #museum-slot div[class*=absolute]")].filter(vis).slice(0, 40).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName} ${(e.getAttribute("aria-label") || e.innerText || "").replace(/\s+/g, " ").slice(0, 50)} [${e.className.toString().slice(0, 50)}] @${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
});
console.log(dom.join("\n"));
console.log("LOG", log);
await browser.close();
