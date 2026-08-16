import { launch, goto, shot, sleep, byText, VIEWPORTS, log, touchTap } from "./juror9-lib.mjs";
const key = process.argv[2] || "d1440";
const vp = VIEWPORTS[key];
const { browser, page } = await launch(vp, { dpr: 1 });
await goto(page, "/map", 5000);
const t = await byText(page, /Take the walk/i); const b = await t.boundingBox();
if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
const t0 = Date.now();
for (let i = 0; i < 26; i++) {
  await sleep(1000);
  const info = await page.evaluate(() => {
    const ms = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); const lab = m.querySelector("[class*=label], span, div"); const lr = lab?.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), lab: lr ? [Math.round(lr.left), Math.round(lr.top), Math.round(lr.width), Math.round(lr.height)] : null, cls: (m.firstElementChild?.className || "").toString().slice(0, 80) }; });
    const btn = [...document.querySelectorAll("button")].find((b) => /Stop the walk|Continue|Walk again/.test(b.textContent));
    return { ms, btn: btn?.textContent.trim() };
  });
  log(Math.round((Date.now() - t0) / 100) / 10, JSON.stringify(info));
  if (i % 2 === 1) await shot(page, `${key}-wf-${String(i).padStart(2, "0")}`);
}
await browser.close();
