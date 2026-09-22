// Commissioner's Office end to end: order of sections, two players, play Pt2 then scroll up into Pt1
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson } from "./juror7-lib.mjs";

const vp = process.argv[2] || "390";
const tag = "co-" + vp;
const errs = [];
const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, tag, errs);
await goto(page, "/commissioners-office");
await sleep(1500);
log.order = await page.evaluate(() => [...document.querySelectorAll("main section[id], main [id^='scene'], main [id^='moral'], #history, #onward, #hero, #hero-2, [id^='hero']")].map((s) => s.id).filter(Boolean));
log.spine = await page.evaluate(() => [...document.querySelectorAll("nav.rail a, nav a[href^='#']")].slice(0, 8).map((a) => a.textContent.trim().replace(/\s+/g, " ")));
log.partHeadings = await page.evaluate(() => [...document.querySelectorAll("h2")].map((h) => h.textContent.trim().replace(/\s+/g, " ")).filter((t) => /PART|MOB|CROWD/i.test(t)));
const btnsVisible = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.1; })
      .map((b) => ({ label: (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60), rect: [Math.round(b.getBoundingClientRect().x), Math.round(b.getBoundingClientRect().y), Math.round(b.getBoundingClientRect().width), Math.round(b.getBoundingClientRect().height)] }))
  );
// Part 2 hero
await page.evaluate(() => document.querySelector("#hero-2, [id^='hero-']")?.scrollIntoView({ block: "start", behavior: "instant" }));
await sleep(1200);
await shot(page, `${tag}-01-part2-hero`);
// play part 2
const play2 = page.locator('button[aria-label^="Play narration"]').nth(1);
await play2.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
await sleep(700);
await shot(page, `${tag}-02-part2-player`);
const pb = await play2.boundingBox();
await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2);
await sleep(2000);
log.audioAfterPlay2 = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime * 10) / 10, src: a.currentSrc.split("/").pop() })));
log.btnsPlaying2 = await btnsVisible();
await shot(page, `${tag}-03-part2-playing`);
// scroll UP into part 1 story
await page.evaluate(() => document.querySelector("#scene-0")?.scrollIntoView({ block: "start", behavior: "instant" }));
await sleep(1000);
log.btnsInPart1WhilePt2Plays = await btnsVisible();
await shot(page, `${tag}-04-in-part1-while-pt2-plays`);
// scroll into part 1's paragraphs
await page.evaluate(() => scrollBy(0, innerHeight * 1.2));
await sleep(1000);
log.btnsInPart1ParasWhilePt2Plays = await btnsVisible();
await shot(page, `${tag}-05-part1-paras-while-pt2-plays`);
// now press play on Part 1 -> does Pt2 stop? only one mini-player?
const play1 = page.locator('button[aria-label^="Play narration"], button[aria-label^="Pause narration"]').first();
await play1.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
await sleep(600);
const p1b = await play1.boundingBox();
log.play1Label = await play1.getAttribute("aria-label");
await page.mouse.click(p1b.x + p1b.width / 2, p1b.y + p1b.height / 2);
await sleep(1500);
log.audioAfterPlay1 = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime * 10) / 10, src: a.currentSrc.split("/").pop() })));
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(900);
log.btnsAtTopAfterPlay1 = await btnsVisible();
log.fixedCount = await page.evaluate(() => [...document.querySelectorAll("*")].filter((el) => getComputedStyle(el).position === "fixed" && el.getBoundingClientRect().height > 20 && parseFloat(getComputedStyle(el).opacity) > 0.1).map((el) => (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40)));
await shot(page, `${tag}-06-top-after-play1`);
// morals
for (const id of ["moral-0", "moral-1"]) {
  await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" }), id);
  await sleep(1300);
  await shot(page, `${tag}-07-${id}`);
}
log.moralColors = await page.evaluate(() => ["moral-0", "moral-1"].map((id) => { const s = document.getElementById(id); const h = s?.querySelector("h2"); const p = s?.querySelector("p.t-prose"); return { id, h: h?.textContent.trim().replace(/\s+/g, " "), hColor: h && getComputedStyle(h).color, pColor: p && getComputedStyle(p).color }; }));
// history part
await page.evaluate(() => document.getElementById("history")?.scrollIntoView({ block: "start", behavior: "instant" }));
await sleep(1000);
await shot(page, `${tag}-08-history`);
// clipped letterforms check on moral headings: measure glyph ink vs box for the J in INJUSTICE
log.moralHeadingBoxes = await page.evaluate(() => [...document.querySelectorAll("[id^='moral'] h2 .line-box, [id^='moral'] h2 span")].slice(0, 8).map((el) => ({ t: el.textContent.trim().slice(0, 30), overflow: getComputedStyle(el).overflow, pb: getComputedStyle(el).paddingBottom, clip: getComputedStyle(el).clipPath })));
await page.evaluate(() => document.getElementById("moral-0")?.scrollIntoView({ block: "start", behavior: "instant" }));
await sleep(1200);
const h = page.locator("#moral-0 h2").first();
const hb = await h.boundingBox();
if (hb) await shot(page, `${tag}-09-moral0-heading-zoom`, { clip: { x: Math.max(0, hb.x - 10), y: Math.max(0, hb.y - 10), width: Math.min(hb.width + 20, VIEW(vp) - hb.x + 10), height: hb.height + 30 } });
function VIEW(v) { return v === "1440" ? 1440 : v === "768" ? 768 : v === "1024" ? 1024 : v === "1920" ? 1920 : v === "360" ? 360 : 390; }
writeJson(`co-${vp}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
console.log("ERRS", JSON.stringify(errs.filter((e) => !/ERR_ABORTED/.test(e.text)), null, 1));
await browser.close();
