// Commissioner's Office end to end. usage: node scripts/juror8-co.mjs p390
import { launch, ctx, VPS, watch, shot, sleep, go, save } from "./juror8-lib.mjs";
const key = process.argv[2] || "p390";
const vp = VPS[key];
const tag = `co-${key}`;
const out = { steps: [] };
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
const state = async (label) => {
  const s = await page.evaluate(() => {
    const audios = [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: +a.currentTime.toFixed(1), src: (a.currentSrc || "").split("/").pop() }));
    const btns = [...document.querySelectorAll("button")].filter((b) => /pause|play/i.test(b.getAttribute("aria-label") || "")).map((b) => {
      const r = b.getBoundingClientRect();
      let vis = r.width > 0 && r.bottom > 0 && r.top < innerHeight;
      let e = b; while (e && vis) { const cs = getComputedStyle(e); if (cs.visibility === "hidden" || cs.opacity === "0" || cs.display === "none") vis = false; e = e.parentElement; }
      return { aria: b.getAttribute("aria-label").slice(0, 30), onscreen: vis, x: Math.round(r.x), y: Math.round(r.y) };
    }).filter((b) => b.onscreen);
    return { scrollY: Math.round(scrollY), audios, btns };
  });
  out.steps.push({ label, ...s });
  return s;
};
await go(page, "/commissioners-office", 2500);
out.order = await page.evaluate(() => [...document.querySelectorAll("main section[id], section[id], div[id^=hero]")].map((s) => s.id).filter(Boolean));
out.spine = await page.evaluate(() => [...document.querySelectorAll("#scene-0 a.group")].map((a) => a.textContent.trim().replace(/\s+/g, " ")));
await shot(page, `${tag}-01-top`);
// Part 1 heading + quote
const h1 = page.locator("#scene-0 h2").first();
await h1.evaluate((el) => el.scrollIntoView({ block: "start" })); await page.evaluate(() => scrollBy(0, -120)); await sleep(900);
await shot(page, `${tag}-02-part1-head`);
// history
await page.locator("#history").evaluate((el) => el.scrollIntoView({ block: "start" })); await sleep(900);
await shot(page, `${tag}-03-history`);
// moral 0
await page.locator("#moral-0-heading").evaluate((el) => el.scrollIntoView({ block: "center" })); await sleep(1300);
await shot(page, `${tag}-04-moral0`);
// part 2 hero
const hero2 = page.locator("#hero-2, [id^=hero-2], section:has(#scene-1)").first();
await page.locator("#scene-1").evaluate((el) => { const prev = el.previousElementSibling; (prev || el).scrollIntoView({ block: "start" }); }); await sleep(1300);
await shot(page, `${tag}-05-part2-hero`);
const h2 = page.locator("#scene-1 h2").first();
await h2.evaluate((el) => el.scrollIntoView({ block: "start" })); await page.evaluate(() => scrollBy(0, -120)); await sleep(900);
await shot(page, `${tag}-06-part2-head`);
// play part 2
const play2 = page.locator("#scene-1 button[aria-label^='Play narration']").first();
await play2.scrollIntoViewIfNeeded(); await page.evaluate(() => scrollBy(0, -200)); await sleep(500);
const pb = await play2.boundingBox();
await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2);
await sleep(3000);
await state("part2 playing");
await shot(page, `${tag}-07-part2-playing`);
// scroll up into Part 1 (its player)
const play1 = page.locator("#scene-0 button[aria-label^='Play narration'], #scene-0 button[aria-label^='Pause narration']").first();
await play1.evaluate((el) => el.scrollIntoView({ block: "center" })); await sleep(1200);
await state("scrolled up to part1 player while part2 plays");
await shot(page, `${tag}-08-up-into-part1`);
// scroll further up into part 1 prose
await page.evaluate(() => scrollBy(0, 500)); await sleep(1000);
await state("part1 prose, part2 playing");
await shot(page, `${tag}-09-part1-prose`);
// now press play on part 1
const pb1 = await play1.boundingBox();
if (pb1) { await play1.evaluate((el) => el.scrollIntoView({ block: "center" })); await sleep(600); const b = await play1.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(2000); }
await state("pressed part1 play");
await shot(page, `${tag}-10-part1-playing`);
// scroll far down (part 2 area) — which mini shows?
await page.locator("#moral-1-heading").evaluate((el) => el.scrollIntoView({ block: "center" })); await sleep(1300);
await state("at moral 1");
await shot(page, `${tag}-11-moral1`);
await page.locator("#onward").evaluate((el) => el.scrollIntoView({ block: "start" })); await sleep(3000);
await state("onward");
await shot(page, `${tag}-12-onward`);
out.log = log;
save(`${tag}.json`, out);
console.log(JSON.stringify(out, null, 1));
await c.close(); await browser.close();
