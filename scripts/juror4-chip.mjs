import { launch, ctx, watch, shot, sleep, goto, VPS } from "./juror4-lib.mjs";
for (const [w, h, mobile] of [[720, 450, false], [768, 1024, true], [640, 900, false], [700, 900, false], [800, 600, false], [844, 390, true], [1024, 768, false]]) {
  const browser = await launch(); const c = await ctx(browser, { width: w, height: h, mobile }); const page = await c.newPage();
  await goto(page, "/paintings"); await sleep(1200);
  await page.evaluate(() => scrollTo(0, document.querySelector("#museum-slot").offsetTop + 300)); await sleep(1500);
  const r = await page.evaluate(() => { const rect = (e) => { const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom) }; }; const chip = [...document.querySelectorAll("#museum-slot p")].find((p) => /SCROLL TO WALK/i.test(p.innerText)); const skip = document.querySelector('#museum-slot button'); const menu = document.querySelector(".cnwm-menu"); return { chip: chip && { t: chip.innerText, ...rect(chip) }, skip: skip && { t: skip.innerText, ...rect(skip) }, menu: menu && rect(menu) }; });
  const overlap = r.chip && r.skip && r.chip.l < r.skip.r && r.chip.r > r.skip.l && r.chip.t < r.skip.b && r.chip.b > r.skip.t;
  const overlapMenu = r.chip && r.menu && r.chip.l < r.menu.r && r.chip.r > r.menu.l && r.chip.t < r.menu.b && r.chip.b > r.menu.t;
  console.log(`${w}x${h}`, JSON.stringify(r), "OVERLAP skip:", overlap, "menu:", overlapMenu);
  if (overlap || overlapMenu) await shot(page, `chip-collide-${w}x${h}`);
  await browser.close();
}
