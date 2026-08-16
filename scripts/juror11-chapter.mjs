import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, rect, sleep } from "./juror11-lib.mjs";

const vpKey = process.argv[2] || "p390";
const route = process.argv[3] || "/bakery";
const vp = VPS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const errs = watchConsole(page, `${route}-${vpKey}`);
const tag = route.replace("/", "") + "-" + vpKey;

await goto(page, route, 2500);
await shot(page, `${tag}-01-arrival`);
log("title:", await page.title());
const of = await overflowCheck(page);
log("overflow:", of.bodySW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean");

// find visible-state helper
const state = async () => page.evaluate(() => {
  const vis = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], vis: r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.opacity !== "0" && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth, txt: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40) }; };
  const pauseBtns = [...document.querySelectorAll("button")].filter((b) => /pause/i.test(b.getAttribute("aria-label") || b.textContent || ""));
  const playBtns = [...document.querySelectorAll("button")].filter((b) => /play|listen/i.test(b.getAttribute("aria-label") || b.textContent || ""));
  const audios = [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime * 10) / 10, src: a.currentSrc.split("/").pop() }));
  const fixed = [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 0).map((e) => ({ tag: e.tagName, cls: String(e.className).slice(0, 50), r: vis(e).r, txt: vis(e).txt }));
  return { scrollY: Math.round(scrollY), pause: pauseBtns.map(vis), play: playBtns.map(vis).filter((v) => v.vis).slice(0, 4), audios, fixed: fixed.slice(0, 8) };
});

// Scroll to the first story section and play
const play = page.locator("button", { hasText: /listen|play/i }).first();
const playBtn = await page.$$("button[aria-label*='Play'], button[aria-label*='play'], button[aria-label*='Listen'], button[aria-label*='listen']");
log("play buttons:", playBtn.length);
// scroll first paragraph into view
const firstP = page.locator("#scene-0 p, [id^=scene] p").first();
await firstP.scrollIntoViewIfNeeded().catch(() => {});
await sleep(800);
await shot(page, `${tag}-02-story-top`);
// find the main play button in the story block
const mainPlay = page.locator("[id^=scene] button").filter({ hasText: /listen|play/i }).first();
let mp = await mainPlay.count();
if (!mp) {
  const alt = page.locator("[id^=scene] button[aria-label]").first();
  log("scene buttons:", await page.locator("[id^=scene] button").count(), await page.locator("[id^=scene] button").evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-label") || b.textContent.trim()).slice(0, 8)));
}
const btnList = await page.locator("[id^=scene] button").evaluateAll((bs) => bs.map((b, i) => ({ i, l: b.getAttribute("aria-label") || b.textContent.trim().slice(0, 30), r: b.getBoundingClientRect().toJSON() })));
log("scene buttons", JSON.stringify(btnList.slice(0, 6)));
const playIdx = btnList.findIndex((b) => /play|listen/i.test(b.l));
const pb = page.locator("[id^=scene] button").nth(playIdx >= 0 ? playIdx : 0);
await pb.scrollIntoViewIfNeeded();
await sleep(400);
const pbb = await pb.boundingBox();
await page.mouse.click(pbb.x + pbb.width / 2, pbb.y + pbb.height / 2);
await sleep(2500);
let s = await state();
log("after play:", JSON.stringify(s));
await shot(page, `${tag}-03-playing`);

// tap a paragraph (3rd)
const paras = page.locator("[id^=scene] p.t-prose, [id^=scene] .t-prose");
const pc = await paras.count();
log("paragraphs:", pc);
if (pc > 2) {
  const p3 = paras.nth(2);
  await p3.scrollIntoViewIfNeeded();
  await sleep(300);
  const b = await p3.boundingBox();
  const before = (await state()).audios;
  await page.mouse.click(b.x + 40, b.y + 10);
  await sleep(1200);
  const after = (await state()).audios;
  log("tap paragraph seek:", JSON.stringify(before), "->", JSON.stringify(after));
  await shot(page, `${tag}-04-tapped-para`);
}
// scroll UP away from the player (to the hero)
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(1200);
s = await state();
log("scrolled up (top):", JSON.stringify({ pause: s.pause, fixed: s.fixed }));
await shot(page, `${tag}-05-up-away`);
// scroll DOWN away
await page.evaluate(() => { const h = document.querySelector("#history") || document.querySelector("[id^=moral]"); h && h.scrollIntoView({ behavior: "instant" }); });
await sleep(1200);
s = await state();
log("scrolled down to history:", JSON.stringify({ scrollY: s.scrollY, pause: s.pause, fixed: s.fixed }));
await shot(page, `${tag}-06-down-away`);
// moral section
const moral = await page.evaluate(() => {
  const sec = document.querySelector("[id^=moral]") || [...document.querySelectorAll("section")].find((s) => /moral/i.test(s.id));
  if (!sec) return null;
  sec.scrollIntoView({ behavior: "instant" });
  const h = sec.querySelector("h2, h3");
  const p = sec.querySelector("p.t-prose, p");
  const cs = (e) => e && { color: getComputedStyle(e).color, fs: getComputedStyle(e).fontSize };
  return { id: sec.id, heading: h?.textContent.trim().replace(/\s+/g, " "), hStyle: cs(h), pText: p?.textContent.trim().slice(0, 50), pStyle: cs(p) };
});
await sleep(1500);
log("moral:", JSON.stringify(moral));
await shot(page, `${tag}-07-moral`);
s = await state();
log("at moral:", JSON.stringify({ pause: s.pause, fixed: s.fixed }));
// onward
await page.evaluate(() => document.querySelector("#onward")?.scrollIntoView({ behavior: "instant" }));
await sleep(1500);
await shot(page, `${tag}-08-onward`);
s = await state();
log("at onward:", JSON.stringify({ pause: s.pause, fixed: s.fixed }));
// footer
await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
await sleep(1200);
await shot(page, `${tag}-09-footer`);
s = await state();
log("at footer:", JSON.stringify({ pause: s.pause, fixed: s.fixed }));
const footer = await page.evaluate(() => {
  const f = document.querySelector("footer");
  if (!f) return null;
  const links = [...f.querySelectorAll("a")].map((a) => ({ t: a.textContent.trim().replace(/\s+/g, " ").slice(0, 40), r: a.getBoundingClientRect().toJSON() }));
  const fixed = [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 0).map((e) => e.getBoundingClientRect().toJSON());
  const covered = links.filter((l) => fixed.some((fr) => !(fr.right < l.r.left || fr.left > l.r.right || fr.bottom < l.r.top || fr.top > l.r.bottom)));
  return { links: links.map((l) => l.t), covered: covered.map((l) => l.t), footerRect: f.getBoundingClientRect().toJSON(), text: f.innerText.replace(/\s+/g, " ").slice(0, 300) };
});
log("footer:", JSON.stringify(footer));
// Continue
const cont = page.locator("#onward a", { hasText: /continue/i }).first();
if (await cont.count()) {
  await cont.scrollIntoViewIfNeeded();
  await sleep(300);
  const b = await cont.boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await sleep(2600);
  log("after Continue url:", page.url());
  await shot(page, `${tag}-10-after-continue`);
}
log("console errors:", errs.length ? errs : "none");
await browser.close();
