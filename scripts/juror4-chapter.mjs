import { launch, ctx, watch, shot, sleep, save, goto, VPS, floating } from "./juror4-lib.mjs";
// usage: node scripts/juror4-chapter.mjs /bakery p390 [full]
const route = process.argv[2] || "/bakery";
const vpk = process.argv[3] || "p390";
const full = process.argv[4] === "full";
const slug = route.replace("/", "");
const vp = VPS[vpk];
const R = { route, vpk, steps: [] };
const step = (name, data) => { R.steps.push({ name, ...data }); console.log(name, JSON.stringify(data).slice(0, 400)); };

const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, route);
await sleep(1200);

const pauseOnScreen = () => page.evaluate(() => {
  const els = [...document.querySelectorAll("button")].filter((b) => /pause/i.test(b.getAttribute("aria-label") || b.innerText || ""));
  return els.filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && cs.visibility !== "hidden" && cs.opacity !== "0"; }).map((b) => { const r = b.getBoundingClientRect(); return { label: b.getAttribute("aria-label"), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; });
});
const burgerRect = () => page.evaluate(() => { const b = document.querySelector(".cnwm-menu-burger"); if (!b) return null; const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), op: cs.opacity, vis: cs.visibility, tf: cs.transform, pe: cs.pointerEvents }; });

// 1. arrival
await shot(page, `${slug}-${vpk}-01-arrival`);
step("arrival", { burger: await burgerRect(), floating: await floating(page) });

// 2. burger hide on scroll-down / return on scroll-up
await page.mouse.wheel(0, 600); await sleep(300); await page.mouse.wheel(0, 400); await sleep(600);
const bAfterDown = await burgerRect();
await page.mouse.wheel(0, -80); await sleep(600);
const bAfterUp = await burgerRect();
step("burger-scroll", { afterDown: bAfterDown, afterUp: bAfterUp });

// 3. play narration part 1
const plays = page.locator('button[aria-label^="Play narration"]');
const nPlays = await plays.count();
step("players", { nPlays, labels: await plays.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label"))) });
await plays.first().scrollIntoViewIfNeeded(); await sleep(400);
await page.evaluate(() => scrollBy(0, -200)); await sleep(500);
await shot(page, `${slug}-${vpk}-02-player`);
await plays.first().click(); await sleep(2500);
const audioState = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ src: a.currentSrc.split("/").pop(), paused: a.paused, t: a.currentTime, dur: a.duration, ready: a.readyState })));
step("play", { audioState, pauseOnScreen: await pauseOnScreen() });
await shot(page, `${slug}-${vpk}-03-playing`);
// tap a paragraph
const paras = page.locator("#scene-0 p.t-prose");
const nP = await paras.count();
if (nP > 2) {
  const before = await page.evaluate(() => document.querySelector("audio").currentTime);
  await paras.nth(2).scrollIntoViewIfNeeded(); await sleep(300);
  await paras.nth(2).click({ position: { x: 20, y: 10 } }); await sleep(900);
  const after = await page.evaluate(() => ({ t: document.querySelector("audio").currentTime, paused: document.querySelector("audio").paused, active: [...document.querySelectorAll("#scene-0 p")].findIndex((p) => /active|current|narration-active/.test(p.className)) }));
  step("tap-paragraph", { before, after, nP });
  await shot(page, `${slug}-${vpk}-04-tapped`);
}
// scroll through the whole page in viewport steps; check pause control on screen at every step
const docH = await page.evaluate(() => document.documentElement.scrollHeight);
const misses = []; let i = 0; const shotsAt = [];
for (let y = 0; y < docH; y += Math.round(vp.height * 0.8)) {
  await page.evaluate((yy) => scrollTo(0, yy), y); await sleep(350);
  const p = await pauseOnScreen();
  const paused = await page.evaluate(() => [...document.querySelectorAll("audio")].every((a) => a.paused));
  if (!p.length && !paused) misses.push({ y, pct: Math.round((100 * y) / docH) });
  i++;
}
step("pause-visible-sweep", { docH, misses, playing: !(await page.evaluate(() => document.querySelector("audio").paused)) });
// mid-story shot with mini-player
await page.evaluate(() => scrollTo(0, document.querySelector("#history").getBoundingClientRect().top + scrollY - 200)); await sleep(500);
await shot(page, `${slug}-${vpk}-05-history-mini`);
step("history-floating", { floating: await floating(page) });

// moral: heading vs body color
const morals = await page.evaluate(() => [...document.querySelectorAll('section[id^="moral"]')].map((s) => {
  const h = s.querySelector("h2"); const ps = [...s.querySelectorAll("p")];
  const cap = s.querySelector("figcaption");
  return { id: s.id, heading: h?.innerText.replace(/\s+/g, " ").slice(0, 60), hColor: h && getComputedStyle(h).color, body: ps.map((p) => ({ t: p.innerText.slice(0, 40), color: getComputedStyle(p).color, fs: getComputedStyle(p).fontSize })), cap: cap && { t: cap.innerText.slice(0, 60), color: getComputedStyle(cap).color } };
}));
step("moral-colors", { morals });
for (const m of morals) {
  await page.evaluate((id) => scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY + 40), m.id); await sleep(700);
  await shot(page, `${slug}-${vpk}-06-${m.id}`);
  const fl = await floating(page);
  step("moral-floating", { id: m.id, fl });
}
// onward
await page.evaluate(() => scrollTo(0, document.querySelector("#onward").getBoundingClientRect().top + scrollY - 40)); await sleep(800);
await shot(page, `${slug}-${vpk}-07-onward-top`);
const cont = page.locator('a:has-text("Continue")').first();
await cont.scrollIntoViewIfNeeded(); await sleep(700);
await page.evaluate(() => scrollBy(0, -160)); await sleep(700);
await shot(page, `${slug}-${vpk}-08-onward-cta`);
step("onward", { floating: await floating(page), contRect: await cont.boundingBox() });
// footer with mini-player latched
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(800);
await shot(page, `${slug}-${vpk}-09-footer`);
const footerOverlap = await page.evaluate(() => {
  const fixed = [...document.querySelectorAll("body *")].filter((e) => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 4 && getComputedStyle(e).opacity !== "0" && getComputedStyle(e).visibility !== "hidden");
  const targets = [...document.querySelectorAll("footer a, footer button, footer p")].filter((e) => e.getBoundingClientRect().width > 0);
  const hits = [];
  for (const f of fixed) { const a = f.getBoundingClientRect(); for (const t of targets) { const b = t.getBoundingClientRect(); if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) hits.push({ fixed: (f.getAttribute("aria-label") || f.className.toString()).slice(0, 40), target: t.innerText.slice(0, 40) }); } }
  return { nFixed: fixed.length, hits, footerText: document.querySelector("footer")?.innerText.replace(/\s+/g, " ").slice(0, 400) };
});
step("footer", footerOverlap);
// menu open / close on chapter page (scroll up first so burger is back)
await page.evaluate(() => scrollBy(0, -300)); await sleep(700);
const burger = page.locator(".cnwm-menu-burger");
step("burger-before-menu", { rect: await burgerRect() });
await burger.click({ force: true }); await sleep(800);
await shot(page, `${slug}-${vpk}-10-menu`);
step("menu-open", { floating: await floating(page), expanded: await burger.getAttribute("aria-expanded") });
const closeBtn = page.locator(".cnwm-menu-close");
await closeBtn.click(); await sleep(700);
step("menu-closed", { expanded: await burger.getAttribute("aria-expanded"), pauseOnScreen: await pauseOnScreen() });
// Continue → next chapter (curtain)
if (full) {
  await cont.scrollIntoViewIfNeeded(); await sleep(400);
  const t0 = Date.now();
  await cont.click();
  const frames = [];
  for (let k = 0; k < 14; k++) { await sleep(120); frames.push({ t: Date.now() - t0, url: page.url().split("/").pop(), cover: await page.evaluate(() => { const p = document.querySelector("#curtain-panel"); if (!p) return null; const r = p.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), txt: document.querySelector("#curtain-text-content")?.innerText.replace(/\s+/g, " ").slice(0, 60), op: getComputedStyle(document.querySelector("#curtain-text")).opacity }; }).catch(() => "nav") });
  }
  await sleep(1500);
  step("continue-curtain", { frames, url: page.url() });
  await shot(page, `${slug}-${vpk}-11-after-continue`);
}
R.log = log;
save(`${slug}-${vpk}.json`, R);
console.log("LOG", log);
await browser.close();
