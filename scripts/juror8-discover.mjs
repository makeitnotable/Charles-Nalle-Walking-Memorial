import { launch, ctx, VPS, watch, shot, sleep, go, save } from "./juror8-lib.mjs";
const browser = await launch();
const c = await ctx(browser, VPS.p390);
const page = await c.newPage();
const log = watch(page);
await go(page, "/bakery", 2500);
const info = await page.evaluate(() => {
  const els = [...document.querySelectorAll("button, a, [role=button], audio, section[id], h2[id], .cnwm-menu")];
  return els.map((e) => {
    const r = e.getBoundingClientRect();
    return `${e.tagName}#${e.id}.${[...e.classList].slice(0, 4).join(".")} aria=${e.getAttribute("aria-label") || ""} txt=${(e.textContent || "").trim().slice(0, 40)} @${Math.round(r.x)},${Math.round(r.y + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}`;
  });
});
console.log(info.join("\n"));
console.log("H:", await page.evaluate(() => document.documentElement.scrollHeight));
console.log(log);
await c.close();
await browser.close();
