// reduced-motion at /, /bakery, /map, /paintings (390 + 1440) and 200% zoom (720x450) on key pages
import { launch, ctx, VPS, watch, shot, sleep, go, save } from "./juror8-lib.mjs";
const out = {};
const browser = await launch();
for (const key of ["p390", "d1440"]) {
  const vp = VPS[key];
  const c = await ctx(browser, vp, { reducedMotion: "reduce" });
  const page = await c.newPage();
  const log = watch(page);
  for (const r of ["/", "/bakery", "/map", "/paintings"]) {
    await go(page, r, 3000);
    const tag = `rm-${r.replace("/", "") || "home"}-${key}`;
    await shot(page, `${tag}-top`);
    const info = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll("h1, h2, p, .btn")].filter((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (cs.opacity === "0" || cs.visibility === "hidden"); }).map((e) => e.tagName + ":" + e.textContent.trim().slice(0, 30));
      const canvas = !!document.querySelector("canvas");
      const grid = document.querySelectorAll("button.painting-open").length;
      const stage = document.querySelector("canvas")?.getBoundingClientRect();
      return { hiddenAtTop: hidden.slice(0, 10), canvas, grid, stageH: stage ? Math.round(stage.height) : null };
    });
    out[tag] = info;
    if (r === "/bakery") { await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.55)); await sleep(1200); await shot(page, `${tag}-mid`); out[tag].midHidden = await page.evaluate(() => [...document.querySelectorAll("h2, p, img")].filter((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.width > 0 && (cs.opacity === "0" || cs.visibility === "hidden"); }).map((e) => e.tagName + ":" + (e.textContent || e.alt || "").trim().slice(0, 30))); }
    if (r === "/map") { const b = page.locator("button:visible:has-text('Take the walk')").first(); if (await b.count()) { const bb = await b.boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(2500); await shot(page, `${tag}-walk`); } }
    if (r === "/paintings") { await page.evaluate(() => scrollTo(0, innerHeight * 1.2)); await sleep(1200); await shot(page, `${tag}-scrolled`); }
    // click a link → transition instant?
    if (r === "/") { const a = page.locator("a:has-text('Walk the story')").first(); const bb = await a.boundingBox(); const t0 = Date.now(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForURL(/map/, { timeout: 15000 }); out[tag].navMs = Date.now() - t0; await sleep(1500); await shot(page, `${tag}-after-cta`); }
  }
  out[`rm-log-${key}`] = log.filter((l) => !/ERR_ABORTED|preloaded/.test(l));
  await c.close();
}
// 200% zoom
const c = await ctx(browser, VPS.z200);
const page = await c.newPage();
const log = watch(page);
for (const r of ["/", "/bakery", "/map", "/people", "/about"]) {
  await go(page, r, 2500);
  const tag = `z200-${r.replace("/", "") || "home"}`;
  await shot(page, `${tag}-top`);
  out[tag] = await page.evaluate(() => ({ overflowX: document.documentElement.scrollWidth > innerWidth, sw: document.documentElement.scrollWidth }));
  if (r === "/bakery") { const p = page.locator("button[aria-label^='Play narration']").first(); await p.scrollIntoViewIfNeeded(); await sleep(600); await shot(page, `${tag}-player`); await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight - innerHeight)); await sleep(800); await shot(page, `${tag}-footer`); }
  if (r === "/map") { await page.evaluate(() => scrollBy(0, 300)); await sleep(700); await shot(page, `${tag}-scrolled`); }
}
out.z200log = log.filter((l) => !/ERR_ABORTED|preloaded/.test(l));
await c.close();
await browser.close();
save("rm-zoom.json", out);
console.log(JSON.stringify(out, null, 1));
