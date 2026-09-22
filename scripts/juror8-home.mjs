import { launch, ctx, VPS, watch, shot, sleep, go, save, rect } from "./juror8-lib.mjs";

const results = {};
const browser = await launch();
for (const key of ["p390", "p360", "t768", "t1024", "d1440", "d1920", "land"]) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await go(page, "/", 2500);
  await shot(page, `home-${key}`);
  const eyebrow = await page.evaluate(() => {
    const els = [...document.querySelectorAll("p, span, div")].filter((e) => /Troy, New York/.test(e.textContent || "") && e.children.length === 0);
    const e = els[0];
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { y: r.y, text: e.textContent.trim() };
  });
  const cta = await page.evaluate(() => {
    const a = [...document.querySelectorAll("a, button")].find((e) => /Walk the story/i.test(e.textContent || ""));
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, text: a.textContent.trim() };
  });
  const desc = await page.evaluate(() => {
    const p = document.querySelector(".home-desc") || [...document.querySelectorAll("p")].find((e) => (e.textContent || "").length > 80);
    if (!p) return null;
    const rects = [...(() => { const rg = document.createRange(); rg.selectNodeContents(p); return rg.getClientRects(); })()];
    const lines = new Set(rects.map((r) => Math.round(r.top)));
    return { lines: lines.size, text: p.textContent.trim().slice(0, 80), color: getComputedStyle(p).color, fs: getComputedStyle(p).fontSize };
  });
  results[key] = { eyebrow, cta, desc, log: [...log] };
  // menu open/close on home
  const burger = await page.$("button[aria-label*='menu' i], .cnwm-menu button");
  if (burger) {
    await burger.click();
    await sleep(700);
    await shot(page, `home-${key}-menu`);
    const closeBtn = await page.$("button[aria-label*='close' i]");
    if (closeBtn) { await closeBtn.click(); await sleep(600); }
    results[key].menuClosed = await page.evaluate(() => !document.querySelector("[aria-modal='true'], [data-open='true']"));
  } else results[key].menu = "no burger found";
  await c.close();
}
await browser.close();
save("home.json", results);
console.log(JSON.stringify(results, null, 1));
