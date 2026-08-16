// Read a whole chapter as a visitor. usage: node scripts/juror8-chapter.mjs p390 /bakery
import { launch, ctx, VPS, watch, shot, sleep, go, save, floating } from "./juror8-lib.mjs";

const key = process.argv[2] || "p390";
const route = process.argv[3] || "/bakery";
const tag = `${route.replace("/", "")}-${key}`;
const vp = VPS[key];
const out = { key, route, steps: [] };
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);

const scrollBy = async (dy, steps = 6) => {
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await sleep(60); }
  await sleep(500);
};
const state = async (label) => {
  const s = await page.evaluate(() => {
    const audios = [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: +a.currentTime.toFixed(1), src: (a.currentSrc || "").split("/").pop() }));
    const btns = [...document.querySelectorAll("button")].filter((b) => /pause|play/i.test(b.getAttribute("aria-label") || "")).map((b) => {
      const r = b.getBoundingClientRect(); const cs = getComputedStyle(b);
      const vis = r.width > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== "hidden" && cs.opacity !== "0";
      return { aria: b.getAttribute("aria-label"), onscreen: vis, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    });
    const menu = document.querySelector(".cnwm-menu");
    const mr = menu ? menu.getBoundingClientRect() : null;
    const menuCs = menu ? getComputedStyle(menu) : null;
    return { scrollY: Math.round(scrollY), audios, btns, menu: mr ? { y: Math.round(mr.y), op: menuCs.opacity, tf: menuCs.transform, vis: menuCs.visibility } : null };
  });
  out.steps.push({ label, ...s });
  return s;
};

await go(page, route, 2500);
await shot(page, `${tag}-01-arrival`);
await state("arrival");
// menu open/close
const burger = page.locator(".cnwm-menu-burger");
await burger.click(); await sleep(700);
await shot(page, `${tag}-02-menu`);
await page.locator(".cnwm-menu-close").click(); await sleep(600);
await state("menu closed");

// scroll down through the hero, watching burger hide
await scrollBy(600, 8);
await state("after 600 down");
await scrollBy(-200, 4);
await state("after 200 up");

// scroll to the play button
const playBtn = page.locator("button[aria-label^='Play narration']").first();
await playBtn.scrollIntoViewIfNeeded();
await page.evaluate(() => scrollBy(0, -200));
await sleep(600);
await shot(page, `${tag}-03-player`);
const pb = await playBtn.boundingBox();
await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2);
await sleep(3500);
await shot(page, `${tag}-04-playing`);
await state("playing 3.5s");

// tap a paragraph further down (3rd prose paragraph)
const paras = page.locator("#scene-0 p.t-prose");
const n = await paras.count();
out.paraCount = n;
if (n >= 3) {
  const p3 = paras.nth(Math.min(3, n - 1));
  await p3.scrollIntoViewIfNeeded();
  await page.evaluate(() => scrollBy(0, -150)); await sleep(400);
  const bb = await p3.boundingBox();
  const before = await page.evaluate(() => document.querySelector("audio")?.currentTime);
  await page.mouse.click(bb.x + 40, bb.y + 12);
  await sleep(1200);
  const after = await page.evaluate(() => document.querySelector("audio")?.currentTime);
  out.tapSeek = { before, after };
  await shot(page, `${tag}-05-tapped-para`);
  await state("tapped paragraph");
}
// scroll UP away from the player (to hero)
await scrollBy(-1400, 10);
await shot(page, `${tag}-06-scrolled-up-away`);
await state("scrolled up away");
// scroll DOWN away past the player
await scrollBy(2600, 14);
await shot(page, `${tag}-07-scrolled-down-away`);
await state("scrolled down away");
// scroll UP a bit (menu should return)
await scrollBy(-300, 4);
await state("after small up");
await shot(page, `${tag}-08-after-small-up`);

// moral section
const moral = page.locator("section.moral, #moral, #moral-0").first();
await moral.scrollIntoViewIfNeeded();
await sleep(1200);
await shot(page, `${tag}-09-moral`);
out.moral = await page.evaluate(() => {
  const h = document.querySelector("#moral-heading, #moral-0-heading");
  const sec = h?.closest("section");
  const body = sec?.querySelector("p.t-prose, .t-prose");
  const cap = sec?.querySelector("figcaption, .t-meta");
  const c = (e) => e ? getComputedStyle(e).color : null;
  return { heading: c(h), body: c(body), bodyText: body?.textContent.trim().slice(0, 60), caption: c(cap), captionText: cap?.textContent.trim().slice(0, 60) };
});
await state("moral");
// full moral bottom (the sketch)
await scrollBy(600, 6);
await shot(page, `${tag}-10-moral-b`);

// onward
const onward = page.locator("#onward");
await onward.scrollIntoViewIfNeeded();
await sleep(1500);
await shot(page, `${tag}-11-onward`);
await state("onward");
await scrollBy(600, 6);
await shot(page, `${tag}-12-onward-b`);
await state("onward-b");
// footer
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
await sleep(1200);
await shot(page, `${tag}-13-footer`);
await state("footer");
out.footerFloating = await floating(page);

// Continue → curtain
const cont = page.locator("#onward a.btn-solid").first();
await cont.scrollIntoViewIfNeeded();
await page.evaluate(() => scrollBy(0, -200)); await sleep(500);
const cb = await cont.boundingBox();
out.continueText = await cont.textContent();
await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
for (let i = 0; i < 8; i++) { await sleep(180); await shot(page, `${tag}-14-curtain-${i}`); }
await sleep(1500);
out.landed = page.url();
await shot(page, `${tag}-15-landed`);
out.log = log;
save(`${tag}.json`, out);
console.log(JSON.stringify(out, null, 1));
await c.close();
await browser.close();
