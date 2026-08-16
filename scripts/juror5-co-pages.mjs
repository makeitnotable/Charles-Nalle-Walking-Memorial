import { launch, ctx, watch, shot, sleep, save, goto, VPS, FLOATING_JS } from "./juror5-lib.mjs";
const key = process.argv[2] || "p390";
const vp = VPS[key];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
const R = {};
const minis = () => page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => /pause|play/i.test(b.getAttribute("aria-label") || "")).filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05; }).map((b) => { const r = b.getBoundingClientRect(); return { l: b.getAttribute("aria-label").slice(0, 44), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), fixed: !!b.closest("[class*='fixed']") }; }));
await goto(page, "/commissioners-office");
await sleep(1500);
const plays = await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => /^play narration/i.test(b.getAttribute("aria-label") || "")).map((b) => { const r = b.getBoundingClientRect(); return { l: b.getAttribute("aria-label"), top: Math.round(r.top + scrollY), x: Math.round(r.x + r.width / 2), h: r.height }; }));
R.plays = plays;
// play part 1
await page.evaluate((y) => window.scrollTo({ top: y - innerHeight * 0.4 }), plays[0].top); await sleep(700);
await page.mouse.click(plays[0].x, plays[0].top - (await page.evaluate(() => scrollY)) + plays[0].h / 2); await sleep(2000);
R.afterPlay1 = { audio: await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime) }))) };
// scroll to part 2's hero + player
const hero2 = await page.evaluate(() => { const h = document.querySelector("#hero-2"); return h ? Math.round(h.getBoundingClientRect().top + scrollY) : null; });
await page.evaluate((y) => window.scrollTo({ top: y }), hero2); await sleep(1200);
await shot(page, `co-${key}-01-hero2`);
R.hero2Minis = await minis();
await page.evaluate((y) => window.scrollTo({ top: y - innerHeight * 0.4 }), plays[1].top); await sleep(900);
await shot(page, `co-${key}-02-pt2-player`);
R.pt2Minis = await minis();
await page.mouse.click(plays[1].x, plays[1].top - (await page.evaluate(() => scrollY)) + plays[1].h / 2); await sleep(2000);
R.afterPlay2 = { audio: await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime) }))), minis: await minis() };
// scroll further into part 2 text: how many minis?
await page.evaluate(() => window.scrollBy({ top: innerHeight * 1.5 })); await sleep(900);
R.pt2Scrolled = { minis: await minis(), floating: (await page.evaluate(FLOATING_JS)).filter((f) => f.pos === "fixed") };
await shot(page, `co-${key}-03-pt2-scrolled`);
// scroll back up to part 1's text: which mini?
await page.evaluate((y) => window.scrollTo({ top: y + innerHeight }), plays[0].top); await sleep(900);
R.backToPt1 = { minis: await minis(), audio: await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime) }))) };
await shot(page, `co-${key}-04-back-pt1`);
// tap a pt2 paragraph -> should switch to pt2 audio
const p2paras = await page.evaluate((top) => [...document.querySelectorAll(".t-prose")].filter((p) => p.getBoundingClientRect().top + scrollY > top).slice(0, 4).map((p) => { const r = p.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), x: Math.round(r.x + 30) }; }), plays[1].top);
if (p2paras[1]) { await page.evaluate((y) => window.scrollTo({ top: y - innerHeight * 0.4 }), p2paras[1].top); await sleep(600); await page.mouse.click(p2paras[1].x, p2paras[1].top - (await page.evaluate(() => scrollY)) + 8); await sleep(1500); R.tapPt2 = { audio: await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime) }))), minis: await minis(), active: await page.evaluate(() => { const a = document.querySelector(".narration-active"); return a ? a.innerText.slice(0, 40) : null; }) }; await shot(page, `co-${key}-05-tap-pt2`); }
R.log = log;

// People / About / 404 shots
for (const route of ["/people", "/about", "/404-nope"]) {
  const l = watch(page);
  await goto(page, route); await sleep(1200);
  const name = route.replace(/\W/g, "");
  await shot(page, `pg-${name}-${key}-top`);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += Math.round(vp.height * 0.7)) { await page.evaluate((y) => window.scrollTo({ top: y }), y); await sleep(160); }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight })); await sleep(900);
  await shot(page, `pg-${name}-${key}-foot`);
  R[route] = { H, log: l, title: await page.title(), h1: await page.evaluate(() => [...document.querySelectorAll("h1")].filter((h) => h.getBoundingClientRect().width > 0).map((h) => h.innerText.replace(/\n/g, " / "))), hScroll: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), links: await page.evaluate(() => [...document.querySelectorAll("main a, footer a")].map((a) => a.textContent.trim().replace(/\s+/g, " ").slice(0, 30) + " -> " + a.getAttribute("href")).slice(0, 30)) };
  if (route === "/people") { await page.evaluate(() => window.scrollTo({ top: innerHeight * 1.2 })); await sleep(900); await shot(page, `pg-people-${key}-cards`); R.peopleCards = await page.evaluate(() => [...document.querySelectorAll("h3")].slice(0, 3).map((h) => { const card = h.parentElement; return card.innerText.replace(/\n+/g, " | ").slice(0, 160); })); }
  if (route === "/about") { const q = await page.evaluate(() => { const b = document.querySelector("blockquote, .t-quote"); return b ? Math.round(b.getBoundingClientRect().top + scrollY) : null; }); if (q) { await page.evaluate((y) => window.scrollTo({ top: y - 200 }), q); await sleep(900); await shot(page, `pg-about-${key}-quote`); } R.aboutSections = await page.evaluate(() => [...document.querySelectorAll("section")].map((s) => { const n = s.querySelector("[class*='spine'], .t-meta"); return (s.id || "") + " " + (n ? n.innerText.replace(/\n/g, " ").slice(0, 30) : "") + " @" + Math.round(s.getBoundingClientRect().top + scrollY); })); }
}
await c.close(); await browser.close();
save(`co-pages-${key}.json`, R);
console.log(JSON.stringify(R, null, 1));
