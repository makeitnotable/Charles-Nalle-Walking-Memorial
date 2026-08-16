import { launch, goto, shot, sleep, byText, VIEWPORTS, log } from "./juror9-lib.mjs";
const key = process.argv[2] || "p390";
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp, { reducedMotion: "reduce", dpr: 1 });
const hidden = () => page.evaluate(() => { const out = []; for (const e of document.querySelectorAll("h1,h2,h3,p,a,button")) { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue; const cs = getComputedStyle(e); if (parseFloat(cs.opacity) < 0.5 || cs.visibility === "hidden") out.push({ t: (e.textContent || "").trim().slice(0, 40), op: cs.opacity, vis: cs.visibility }); } return out.slice(0, 10); });
for (const r of ["/", "/bakery", "/map", "/paintings"]) {
  await goto(page, r, r === "/paintings" || r === "/map" ? 5000 : 2500);
  const slug = r === "/" ? "home" : r.replace(/\W/g, "");
  await shot(page, `${key}-rm-${slug}-top`);
  log(slug, "hidden@top", JSON.stringify(await hidden()));
  await page.evaluate(() => scrollTo(0, innerHeight * 1.2)); await sleep(700);
  await shot(page, `${key}-rm-${slug}-scrolled`);
  log(slug, "hidden@scrolled", JSON.stringify(await hidden()));
  if (r === "/paintings") {
    log("paintings.museum", JSON.stringify(await page.evaluate(() => ({ canvas: !!document.querySelector("canvas"), museum: !!window.__museum, tiles: document.querySelectorAll("button[aria-label^='View']").length }))));
    await page.evaluate(() => scrollTo(0, innerHeight * 2.5)); await sleep(700);
    await shot(page, `${key}-rm-paintings-grid`);
  }
  if (r === "/bakery") {
    const c = await byText(page, /^Continue/); await c.scrollIntoViewIfNeeded(); await sleep(500);
    const b = await c.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await sleep(150); await shot(page, `${key}-rm-bakery-continue-150ms`);
    await sleep(1500); log("rm continue url", page.url()); await shot(page, `${key}-rm-after-continue`);
  }
  if (r === "/map") {
    const t = await byText(page, /Take the walk/i); const b = await t.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(2500);
    await shot(page, `${key}-rm-map-walk`);
  }
}
log("errors", JSON.stringify(errors));
await browser.close();
