import { launch, ctx, watch, shot, sleep, save, goto, VPS, floating } from "./juror4-lib.mjs";
const vpk = process.argv[2] || "p390";
const vp = VPS[vpk];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/commissioners-office"); await sleep(1200);
const order = await page.evaluate(() => [...document.querySelectorAll("main > *[id], main section[id], main header[id]")].map((e) => e.id));
const spine = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.innerText.replace(/\s+/g, " ").trim()).filter((t, i, arr) => arr.indexOf(t) === i));
const headings = await page.evaluate(() => [...document.querySelectorAll("h1,h2")].map((h) => `${h.tagName} ${h.innerText.replace(/\s+/g, " / ").trim().slice(0, 60)}`));
console.log({ order, spine, headings });
const plays = { nth: (i) => page.locator(`button[aria-label^="Play narration"][aria-label*="Pt ${i + 1}"]`) };
await plays.nth(0).scrollIntoViewIfNeeded(); await sleep(300); await plays.nth(0).click(); await sleep(2000);
// scroll to part 2
await plays.nth(1).scrollIntoViewIfNeeded(); await sleep(500);
await page.evaluate(() => scrollBy(0, -250)); await sleep(500);
await shot(page, `co-${vpk}-01-part2-inview-part1-playing`);
const st1 = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ src: a.currentSrc.split("/").pop(), paused: a.paused, t: Math.round(a.currentTime) })));
const fl1 = await floating(page);
console.log("before part2 click", st1, fl1.filter((f) => !/curtain|menu/.test(f.cls)));
await plays.nth(1).click(); await sleep(2000);
const st2 = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ src: a.currentSrc.split("/").pop(), paused: a.paused, t: Math.round(a.currentTime) })));
await shot(page, `co-${vpk}-02-part2-playing`);
console.log("after part2 click", st2);
await page.evaluate(() => scrollBy(0, 900)); await sleep(700);
const fl2 = await floating(page);
const minis = await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => /Pause narration|Play narration/.test(b.getAttribute("aria-label") || "")).map((b) => { const r = b.getBoundingClientRect(); return { l: b.getAttribute("aria-label"), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), vis: r.width > 0 && r.top >= 0 && r.bottom <= innerHeight }; }).filter((m) => m.vis));
console.log("minis visible after scroll", minis, fl2.filter((f) => !/curtain|menu/.test(f.cls)));
await shot(page, `co-${vpk}-03-part2-mini`);
// part 2 hero and part 2 heading shots
await page.evaluate(() => scrollTo(0, document.querySelector("#hero-2, [id^=hero-2], #scene-1").getBoundingClientRect().top + scrollY)); await sleep(800);
await shot(page, `co-${vpk}-04-part2-hero`);
await page.evaluate(() => scrollTo(0, document.querySelector("#scene-1").getBoundingClientRect().top + scrollY + 40)); await sleep(800);
await shot(page, `co-${vpk}-05-part2-heading`);
// moral-0 heading INJUSTICE clip check: screenshot heading region
for (const id of ["moral-0-heading", "moral-1-heading"]) {
  const el = page.locator("#" + id);
  if (await el.count()) { await el.scrollIntoViewIfNeeded(); await sleep(900); await el.screenshot({ path: `docs/v7/qa/juror-pass4/co-${vpk}-${id}.png` }); }
}
console.log("LOG", log.filter((l) => !/reqfail/.test(l)));
await browser.close();
