import { launch, ctx, watch, shot, sleep, save, goto, VPS } from "./juror5-lib.mjs";
// node juror5-spot.mjs <vp> <route> <name> [selectorToScroll] [offset]
const [, , key, route, name, sel, off] = process.argv;
const vp = VPS[key];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, route); await sleep(1200);
let info = null;
if (sel) {
  await page.evaluate(({ sel, off }) => { const el = document.querySelector(sel); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - (parseInt(off) || 0) }); }, { sel, off });
  await sleep(1500);
  info = await page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { text: el.innerText.slice(0, 80), lines: el.getClientRects().length, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(el).fontSize }; }, sel);
}
await shot(page, `spot-${name}-${key}`);
console.log(JSON.stringify({ info, errors: log.errors }));
await c.close(); await browser.close();
