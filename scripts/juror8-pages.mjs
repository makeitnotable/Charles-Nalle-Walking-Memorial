// /people /about /404 at a viewport + menu close spin + console sweep of all routes
import { launch, ctx, VPS, watch, shot, sleep, go, save } from "./juror8-lib.mjs";
const key = process.argv[2] || "p390";
const vp = VPS[key];
const out = {};
const browser = await launch();
for (const route of ["/people", "/about", "/404-nope"]) {
  const tag = `pg-${route.replace(/\W/g, "")}-${key}`;
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await go(page, route, 2500);
  await shot(page, `${tag}-01-top`);
  const o = { title: await page.title(), log };
  o.h1 = await page.evaluate(() => { const h = document.querySelector("h1"); if (!h) return null; const rg = document.createRange(); rg.selectNodeContents(h); const rects = [...rg.getClientRects()]; const tops = [...new Set(rects.map((r) => Math.round(r.top)))]; return { txt: h.textContent.trim().replace(/\s+/g, " "), lines: tops.length }; });
  o.copy = await page.evaluate(() => {
    const t = document.body.textContent;
    return { theirStory: /Their story lives on/i.test(t), standWhere: /Stand where they stood/i.test(t), walkTheStory: (t.match(/Walk the story/gi) || []).length, streetsWaiting: /The streets are waiting/i.test(t), twoAndHalf: /Two and a half miles/i.test(t), fortyFive: /forty-five minutes/i.test(t), spotLinks: [...document.querySelectorAll("a")].filter((a) => /^Spot \d/.test(a.textContent.trim())).length, emDash: (t.match(/—/g) || []).length, afterword: /Afterword/i.test(t), rails: [...document.querySelectorAll("[class*=spine], nav a, aside a")].map((a) => a.textContent.trim().replace(/\s+/g, " ")).filter((s) => /\(0\d\)/.test(s)).slice(0, 12) };
  });
  // menu open + close spin
  const burger = page.locator(".cnwm-menu-burger");
  await burger.click(); await sleep(700);
  await shot(page, `${tag}-02-menu`);
  const closeBtn = page.locator(".cnwm-menu-close");
  const cb = await closeBtn.boundingBox();
  const spin = [];
  await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
  for (let i = 0; i < 12; i++) { spin.push(await page.evaluate(() => { const b = document.querySelector(".cnwm-menu-close"); const ic = b?.querySelector("svg, span, i") || b; return ic ? getComputedStyle(ic).transform : null; })); await sleep(30); }
  o.closeSpin = spin;
  await sleep(600);
  o.menuClosedAria = await page.evaluate(() => document.querySelector(".cnwm-menu-burger")?.getAttribute("aria-expanded"));
  // scroll to the closer / bottom
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight - innerHeight * 1.6)); await sleep(1200);
  await shot(page, `${tag}-03-closer`);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(1000);
  await shot(page, `${tag}-04-footer`);
  // burger hidden after scroll down, back after small up
  o.burgerAfterDown = await page.evaluate(() => getComputedStyle(document.querySelector(".cnwm-menu")).opacity);
  await page.mouse.wheel(0, -60); await sleep(700);
  o.burgerAfterUp = await page.evaluate(() => getComputedStyle(document.querySelector(".cnwm-menu")).opacity);
  if (route === "/people") { await page.evaluate(() => scrollTo(0, innerHeight * 1.2)); await sleep(900); await shot(page, `${tag}-05-cards`); }
  if (route === "/about") { await page.evaluate(() => { const h = [...document.querySelectorAll("h2, p")].find((e) => /In Troy, many residents/.test(e.textContent)); h && h.scrollIntoView({ block: "center" }); }); await sleep(900); await shot(page, `${tag}-05-quote`); }
  out[route] = o;
  await c.close();
}
// console sweep across all routes (rest + scroll to bottom)
const c = await ctx(browser, vp);
const page = await c.newPage();
const clog = watch(page);
const errs = {};
for (const r of ["/", "/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop", "/map", "/people", "/paintings", "/about", "/404-nope"]) {
  const before = clog.length;
  await go(page, r, 2500);
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
  await sleep(1200);
  errs[r] = clog.slice(before).filter((l) => !/ERR_ABORTED/.test(l));
}
out.console = errs;
await c.close();
await browser.close();
save(`pages-${key}.json`, out);
console.log(JSON.stringify(out, null, 1));
