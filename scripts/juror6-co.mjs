// /commissioners-office end to end: section order, two players, only one mini at a time.
import { launch, ctx, VPS, goto, shot, watch, sleep, save, FLOATING_JS } from "./juror6-lib.mjs";

const vpName = process.argv[2] || "p390";
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/commissioners-office");
await sleep(1500);
const order = await page.evaluate(() => [...document.querySelectorAll("main [id], body > [id], section[id]")].map(e => ({ id: e.id, y: Math.round(e.getBoundingClientRect().top + scrollY), tag: e.tagName })).filter(e => e.id && !/curtain/.test(e.id)));
console.log("id order:", order.map(o => `${o.id}@${o.y}`).join(" → "));
const heads = await page.evaluate(() => [...document.querySelectorAll("h1,h2")].map(e => `${e.tagName} "${e.innerText.replace(/\s+/g, " ").slice(0, 50)}" @${Math.round(e.getBoundingClientRect().top + scrollY)}`));
console.log("heads:", heads.join("\n  "));
const spine = await page.evaluate(() => [...document.querySelectorAll("nav a, aside a, [class*=spine] a, [class*=spine] li")].map(e => e.innerText.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 20));
console.log("spine:", spine);
const plays = page.locator("button[aria-label^='Play narration']");
console.log("play buttons:", await plays.count(), await plays.evaluateAll(b => b.map(x => x.getAttribute("aria-label"))));

// play part 1
await plays.nth(0).scrollIntoViewIfNeeded(); await sleep(400);
await plays.nth(0).click(); await sleep(2000);
await page.evaluate(() => scrollBy(0, 900)); await sleep(700);
await shot(page, `co-${vpName}-1-part1-mini`);
let fl = await page.evaluate(FLOATING_JS);
console.log("floating after part1 play + scroll:", JSON.stringify(fl.filter(f => f.pos === "fixed" && !/curtain/.test(f.t))));
// scroll to part 2 player, play it
const p2 = page.locator("button[aria-label='Play narration: Commissioner’s Office, Pt 2']").first();
await p2.scrollIntoViewIfNeeded(); await sleep(600);
await shot(page, `co-${vpName}-2-part2-player`);
await p2.click(); await sleep(2000);
const audios = await page.evaluate(() => [...document.querySelectorAll("audio")].map(a => ({ src: a.currentSrc.slice(-30), paused: a.paused, t: Math.round(a.currentTime) })));
console.log("audios after part2 play:", JSON.stringify(audios));
await page.evaluate(() => scrollBy(0, 900)); await sleep(700);
await shot(page, `co-${vpName}-3-part2-mini`);
fl = await page.evaluate(FLOATING_JS);
console.log("floating after part2 play + scroll:", JSON.stringify(fl.filter(f => f.pos === "fixed" && !/curtain/.test(f.t))));
const minis = await page.evaluate(() => [...document.querySelectorAll("button")].filter(b => /pause narration|play narration/i.test(b.getAttribute("aria-label") || "")).map(b => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); let op = 1, e = b; while (e && e !== document.body) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; } return { t: b.getAttribute("aria-label"), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), effOp: Math.round(op * 100) / 100, onscreen: r.top < innerHeight && r.bottom > 0 }; }));
console.log("all narration buttons:", JSON.stringify(minis));
// scroll back up to part 1: mini should show part 2 (most recently played)
await page.evaluate(() => document.getElementById("scene-0").scrollIntoView()); await sleep(800);
const minis2 = await page.evaluate(() => [...document.querySelectorAll("button")].filter(b => /pause narration|play narration/i.test(b.getAttribute("aria-label") || "")).map(b => { const r = b.getBoundingClientRect(); let op = 1, e = b; while (e && e !== document.body) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; } return { t: b.getAttribute("aria-label"), y: Math.round(r.top), w: Math.round(r.width), effOp: Math.round(op * 100) / 100, onscreen: r.top < innerHeight && r.bottom > 0 }; }));
console.log("back at scene-0:", JSON.stringify(minis2));
await shot(page, `co-${vpName}-4-back-at-part1`);

// full page filmstrip
const docH = await page.evaluate(() => document.documentElement.scrollHeight);
let n = 0;
for (let y = 0; y < docH; y += vp.height) {
  await page.evaluate((y) => scrollTo(0, y), y); await sleep(500);
  await shot(page, `co-${vpName}-strip-${String(n++).padStart(2, "0")}`);
}
console.log("errors:", log.errors, "failed:", log.failed.filter(f => !/mp3|pbf/.test(f)));
await browser.close();
