import { launch, ctx, sleep, goto, VPS } from "./juror4-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.d1440); const page = await c.newPage();
for (const r of ["/barbershop", "/bakery", "/mansion"]) {
  await goto(page, r); await sleep(800);
  const order = await page.evaluate(() => [...document.querySelectorAll("#scene-0 p.t-prose, #scene-0 figure, #scene-0 picture, #scene-0 img")].filter((e) => !e.closest("figure") || e.tagName === "FIGURE").map((e) => e.tagName === "P" ? "T" : "I").join(""));
  const dropcap = await page.evaluate(() => { const p = document.querySelector("#scene-0 p.t-prose"); const cs = getComputedStyle(p, "::first-letter"); return { fs: cs.fontSize, ff: cs.fontFamily.slice(0, 30), float: cs.float, il: cs.initialLetter }; });
  const heroFocus = await page.evaluate(() => { const v = document.querySelector("#hero video, #hero img"); return v && { tag: v.tagName, pos: getComputedStyle(v).objectPosition }; });
  console.log(r, order, dropcap, heroFocus);
}
await browser.close();
