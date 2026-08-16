import { launch, goto, shot, sleep, VIEWPORTS, log } from "./juror9-lib.mjs";
const key = process.argv[2] || "p360";
const vp = VIEWPORTS[key];
const { browser, page } = await launch(vp, { dpr: 2 });
await goto(page, "/people", 2500);
await page.evaluate(() => scrollTo(0, 700)); await sleep(1200);
log(JSON.stringify(await page.evaluate(() => {
  const p = [...document.querySelectorAll("p")].find((e) => /In Troy visiting/.test(e.textContent));
  const chain = [];
  let e = p;
  while (e && e !== document.body) { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); chain.push({ tag: e.tagName, cls: (e.className || "").toString().slice(0, 140), l: Math.round(r.left), w: Math.round(r.width), minW: cs.minWidth, maxW: cs.maxWidth, width: cs.width, grid: cs.gridTemplateColumns.slice(0, 60), ovf: cs.overflowX }); e = e.parentElement; }
  return chain;
}), null, 1));
await shot(page, `${key}-people-clip`);
await browser.close();
