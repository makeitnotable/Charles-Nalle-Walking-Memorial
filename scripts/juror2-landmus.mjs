import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
for (const [vpk, vp] of [["land", VPS.land], ["z200", { width: 720, height: 450, mobile: false }]]) {
  const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/paintings", 2500);
  const slot = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
  await page.evaluate((y) => scrollTo(0, y), slot.top + 60); await sleep(1800);
  const info = await page.evaluate(() => { const skip = [...document.querySelectorAll("button")].find((b) => /Skip/.test(b.textContent)); const chip = [...document.querySelectorAll("*")].find((e) => /Scroll to walk/i.test(e.textContent) && e.children.length <= 3 && e.getBoundingClientRect().height < 60 && e.getBoundingClientRect().width > 0); const r = (e) => e && (({ x, y, width, height }) => [Math.round(x), Math.round(y), Math.round(width), Math.round(height)])(e.getBoundingClientRect()); return { skip: r(skip), chip: r(chip), chipText: chip && chip.textContent.trim() }; });
  console.log(vpk, JSON.stringify(info));
  await shot(page, `musland-${vpk}-rail`);
  await c.close();
}
await browser.close();
