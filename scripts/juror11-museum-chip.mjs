import { launch, ctx, VPS, shot, goto, watchConsole, log, sleep } from "./juror11-lib.mjs";
const browser = await launch();
for (const key of ["p360", "p390", "land", "t768", "z720", "d1920"]) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const errs = watchConsole(page, key);
  await goto(page, "/paintings", 4000);
  // scroll so the stage is sticky (top of canvas at 0)
  const cTop = await page.evaluate(() => document.querySelector("canvas").getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo({ top: y + 10, behavior: "instant" }), cTop);
  await sleep(1500);
  const info = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight; };
    const chip = [...document.querySelectorAll("div, p, span, [role=status]")].filter((e) => vis(e) && /scroll to walk|The Museum/i.test(e.textContent) && e.children.length <= 4 && e.getBoundingClientRect().height < 80).sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height)[0];
    const r = chip?.getBoundingClientRect();
    const lh = chip && (parseFloat(getComputedStyle(chip).lineHeight) || 16);
    const skip = [...document.querySelectorAll("button, a")].find((b) => /Skip/i.test(b.textContent) && vis(b))?.getBoundingClientRect();
    const menu = document.querySelector(".cnwm-menu")?.getBoundingClientRect();
    const mop = document.querySelector(".cnwm-menu") && getComputedStyle(document.querySelector(".cnwm-menu")).opacity;
    const ov = (a, b) => a && b && !(a.right < b.left || b.right < a.left || a.bottom < b.top || b.bottom < a.top);
    return { chip: chip && { t: chip.textContent.trim().replace(/\s+/g, " "), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], lines: Math.round(r.height / lh) }, skip: skip && [Math.round(skip.x), Math.round(skip.y), Math.round(skip.width), Math.round(skip.height)], menu: menu && [Math.round(menu.x), Math.round(menu.y), Math.round(menu.width), Math.round(menu.height)], mop, chipSkip: ov(r, skip), chipMenu: ov(r, menu), skipMenu: ov(skip, menu), sw: document.body.scrollWidth, iw: innerWidth };
  });
  log(key, JSON.stringify(info));
  await shot(page, `museum-chip-${key}`);
  await c.close();
}
await browser.close();
