import { launch, goto, shot, sleep, VIEWPORTS, log } from "./juror9-lib.mjs";
const key = process.argv[2] || "p390"; const route = process.argv[3] || "/people"; const dpr = +(process.argv[4] || 1);
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp, { dpr });
await goto(page, route, 2500);
await page.evaluate(() => scrollTo(0, 900)); await sleep(1200);
const r = await page.evaluate(() => {
  const out = { innerWidth, sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth, dpr: devicePixelRatio, vv: visualViewport.width };
  const ps = [...document.querySelectorAll("p")].filter((p) => p.getBoundingClientRect().height > 0);
  out.wide = ps.filter((p) => p.getBoundingClientRect().right > innerWidth + 1).slice(0, 5).map((p) => ({ t: p.textContent.trim().slice(0, 40), l: Math.round(p.getBoundingClientRect().left), r: Math.round(p.getBoundingClientRect().right), w: Math.round(p.getBoundingClientRect().width), sw: p.scrollWidth, cw: p.clientWidth }));
  // range-based: any text line whose rect right > innerWidth?
  const clip = [];
  for (const p of ps) { const rg = document.createRange(); rg.selectNodeContents(p); for (const rr of rg.getClientRects()) { if (rr.right > innerWidth + 0.5) { clip.push({ t: p.textContent.trim().slice(0, 30), right: Math.round(rr.right) }); break; } } }
  out.clip = clip.slice(0, 8);
  return out;
});
log(JSON.stringify(r, null, 1));
await shot(page, `${key}-ovf-${route.replace(/\W/g, "")}-dpr${dpr}`);
await browser.close();
