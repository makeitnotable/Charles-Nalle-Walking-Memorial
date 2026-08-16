import { launch, ctx, watch, shot, sleep, save, goto, VPS, FLOATING_JS, rect } from "./juror5-lib.mjs";

const which = process.argv[2] ? process.argv[2].split(",") : ["p390"];
const chapter = process.argv[3] || "bakery";
const results = {};
const browser = await launch();

const findPlay = async (page) =>
  page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].filter((b) => /play|listen/i.test(b.getAttribute("aria-label") || b.textContent || ""));
    return btns.map((b) => { const r = b.getBoundingClientRect(); return { label: b.getAttribute("aria-label") || b.textContent.trim().slice(0, 30), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + scrollY) }; });
  });

for (const key of which) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  const R = (results[key] = {});
  await goto(page, `/${chapter}`);
  await sleep(1500);
  R.docH = await page.evaluate(() => document.documentElement.scrollHeight);

  // sections order
  R.sections = await page.evaluate(() => [...document.querySelectorAll("section[id], div[id^='scene'], [id^='moral'], #history, #onward, #hero, #hero-2")].map((s) => s.id + "@" + Math.round(s.getBoundingClientRect().top + scrollY)));

  // scroll slowly to the story
  const play = await findPlay(page);
  R.playButtons = play;
  if (play.length) {
    await page.evaluate((y) => window.scrollTo({ top: y - innerHeight * 0.4 }), play[0].top);
    await sleep(900);
    await shot(page, `ch-${chapter}-${key}-01-story`);
    // press play
    const btn = page.locator("button").filter({ has: page.locator(`[aria-label]`) }).first();
    await page.mouse.click(play[0].x + play[0].w / 2, (await page.evaluate((t) => t - scrollY, play[0].top)) + play[0].h / 2);
    await sleep(2500);
    R.audio1 = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ src: a.currentSrc.split("/").pop(), paused: a.paused, t: a.currentTime, dur: a.duration })));
    await shot(page, `ch-${chapter}-${key}-02-playing`);
    // drop cap + first paragraph metrics
    R.firstPara = await page.evaluate(() => {
      const p = document.querySelector(".t-prose");
      if (!p) return null;
      const cs = getComputedStyle(p, "::first-letter");
      return { text: p.innerText.slice(0, 40), fl: { fs: cs.fontSize, ff: cs.fontFamily.slice(0, 30), float: cs.cssFloat, color: cs.color }, fs: getComputedStyle(p).fontSize, color: getComputedStyle(p).color, lines: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)) };
    });
    // tap a later paragraph to seek
    const paras = await page.evaluate(() => [...document.querySelectorAll(".t-prose")].slice(0, 6).map((p) => { const r = p.getBoundingClientRect(); return { t: p.innerText.slice(0, 30), top: Math.round(r.top + scrollY), h: Math.round(r.height), x: Math.round(r.x), w: Math.round(r.width) }; }));
    R.paras = paras;
    if (paras[2]) {
      await page.evaluate((y) => window.scrollTo({ top: y - innerHeight * 0.4 }), paras[2].top);
      await sleep(600);
      const y = await page.evaluate((t) => t - scrollY, paras[2].top);
      await page.mouse.click(paras[2].x + 30, y + 10);
      await sleep(1200);
      R.audioAfterTap = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime })));
      R.activePara = await page.evaluate(() => { const a = document.querySelector(".narration-active, [data-active='true'], .is-active"); return a ? a.innerText.slice(0, 40) : null; });
      await shot(page, `ch-${chapter}-${key}-03-tapped`);
    }
    // scroll to the end in steps; check a pause control is on-screen at each step
    const steps = [];
    const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let f = 0.15; f <= 1.001; f += 0.085) {
      await page.evaluate((y) => window.scrollTo({ top: y }), Math.round(H * f));
      await sleep(650);
      const st = await page.evaluate(() => {
        const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05; };
        const pauses = [...document.querySelectorAll("button")].filter((b) => /pause/i.test(b.getAttribute("aria-label") || b.textContent || "")).filter(vis).map((b) => { const r = b.getBoundingClientRect(); return { l: (b.getAttribute("aria-label") || b.textContent).trim().slice(0, 30), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
        const audio = [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime) }));
        const burger = document.querySelector('button[aria-label*="menu" i]');
        const br = burger ? burger.getBoundingClientRect() : null;
        return { y: scrollY, pauses, audio, burger: br ? { y: Math.round(br.top), vis: vis(burger), op: getComputedStyle(burger).opacity, tf: getComputedStyle(burger).transform } : null };
      });
      steps.push(st);
      if (Math.abs(f - 0.49) < 0.05 || Math.abs(f - 0.83) < 0.05) await shot(page, `ch-${chapter}-${key}-04-scroll${Math.round(f * 100)}`);
    }
    R.scrollSteps = steps;
    // now scroll up a bit -> burger should return
    await page.evaluate(() => window.scrollBy({ top: -120 }));
    await sleep(700);
    R.burgerAfterUp = await page.evaluate(() => { const b = document.querySelector('button[aria-label*="menu" i]'); const r = b.getBoundingClientRect(); return { y: Math.round(r.top), op: getComputedStyle(b).opacity, tf: getComputedStyle(b).transform, vis: getComputedStyle(b).visibility }; });
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight }));
    await sleep(900);
    await shot(page, `ch-${chapter}-${key}-05-foot`);
    R.foot = await page.evaluate(FLOATING_JS);
    R.footerLinks = await page.evaluate(() => [...document.querySelectorAll("footer a, footer button")].map((a) => { const r = a.getBoundingClientRect(); return { t: a.textContent.trim().replace(/\s+/g, " ").slice(0, 40), href: a.getAttribute("href"), y: Math.round(r.top), h: Math.round(r.height), covered: (() => { const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return el && !a.contains(el) && !el.contains(a) ? (el.getAttribute("aria-label") || el.className?.toString().slice(0, 30) || el.tagName) : null; })() }; }));
    R.continueBtn = await page.evaluate(() => { const a = [...document.querySelectorAll("a,button")].find((e) => /^continue/i.test(e.textContent.trim())); if (!a) return null; const r = a.getBoundingClientRect(); return { t: a.textContent.trim(), href: a.getAttribute("href"), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; });
    // footer wordmark lines and disclaimer runt
    R.footerText = await page.evaluate(() => [...document.querySelectorAll("footer p, footer span, footer a")].filter((e) => e.children.length === 0 && e.textContent.trim().length > 8).map((e) => ({ t: e.textContent.trim().slice(0, 60), lines: e.getClientRects().length, fs: getComputedStyle(e).fontSize, color: getComputedStyle(e).color, op: getComputedStyle(e).opacity })));
  }
  // moral section: heading vs body color
  R.moral = await page.evaluate(() => {
    const out = [];
    for (const h of document.querySelectorAll("[id^='moral'] h2, [id^='moral'] h3, h2[id*='moral']")) {
      const sec = h.closest("section") || h.parentElement;
      const body = sec.querySelector(".t-prose, p");
      const cap = sec.querySelector("figcaption, .t-meta");
      const img = sec.querySelector("img");
      out.push({ h: h.innerText.replace(/\n/g, " ").slice(0, 50), hColor: getComputedStyle(h).color, body: body?.innerText.slice(0, 40), bodyColor: body ? getComputedStyle(body).color : null, capColor: cap ? getComputedStyle(cap).color : null, cap: cap?.innerText.slice(0, 40), top: Math.round(sec.getBoundingClientRect().top + scrollY), h_: Math.round(sec.getBoundingClientRect().height), img: img ? { pos: getComputedStyle(img).objectPosition, tf: getComputedStyle(img).transform } : null });
    }
    return out;
  });
  if (R.moral[0]) {
    await page.evaluate((y) => window.scrollTo({ top: y }), R.moral[0].top);
    await sleep(1200);
    await shot(page, `ch-${chapter}-${key}-06-moral`);
    // parallax probe: transform before/after a scroll
    const t1 = await page.evaluate(() => { const img = document.querySelector("[id^='moral'] img"); return img ? getComputedStyle(img).transform : null; });
    await page.evaluate(() => window.scrollBy({ top: 300 }));
    await sleep(500);
    const t2 = await page.evaluate(() => { const img = document.querySelector("[id^='moral'] img"); return img ? getComputedStyle(img).transform : null; });
    R.moralParallax = { t1, t2 };
  }
  // interlude credit
  R.interlude = await page.evaluate(() => {
    const figs = [...document.querySelectorAll("figure")].filter((f) => f.querySelector("img") && f.querySelector("figcaption"));
    return figs.map((f) => { const cap = f.querySelector("figcaption"); const r = cap.getBoundingClientRect(); return { cap: cap.innerText.slice(0, 60), color: getComputedStyle(cap).color, bg: getComputedStyle(cap).backgroundColor, top: Math.round(f.getBoundingClientRect().top + scrollY), h: Math.round(f.getBoundingClientRect().height) }; });
  });
  if (R.interlude[0]) {
    await page.evaluate((y) => window.scrollTo({ top: y - 80 }), R.interlude[0].top);
    await sleep(1400);
    await shot(page, `ch-${chapter}-${key}-07-interlude`);
  }
  // Where to next
  const onward = await page.evaluate(() => { const o = document.querySelector("#onward"); return o ? Math.round(o.getBoundingClientRect().top + scrollY) : null; });
  if (onward) {
    await page.evaluate((y) => window.scrollTo({ top: y - 40 }), onward);
    await sleep(1400);
    await shot(page, `ch-${chapter}-${key}-08-onward`);
    R.onwardFloating = await page.evaluate(FLOATING_JS);
  }
  // menu open/close on chapter, at mid-page
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await sleep(600);
  const burger = page.locator('button[aria-label*="menu" i]').first();
  await burger.click();
  await sleep(800);
  await shot(page, `ch-${chapter}-${key}-09-menu`);
  R.menuOpen = await page.evaluate(() => ({ expanded: [...document.querySelectorAll("[aria-expanded]")].map((e) => (e.getAttribute("aria-label") || "") + "=" + e.getAttribute("aria-expanded")), links: [...document.querySelectorAll("a")].filter((a) => { const b = a.getBoundingClientRect(); return b.width > 0 && b.top >= 0 && b.top < innerHeight; }).map((a) => a.textContent.trim().replace(/\s+/g, " ").slice(0, 30)) }));
  const closeBtn = page.locator('button[aria-label*="close" i]').first();
  if (await closeBtn.count()) { await closeBtn.click(); } else await page.keyboard.press("Escape");
  await sleep(700);
  R.menuClosed = await page.evaluate(() => [...document.querySelectorAll("[aria-expanded]")].map((e) => (e.getAttribute("aria-label") || "") + "=" + e.getAttribute("aria-expanded")));
  R.log = log;
  await c.close();
}
await browser.close();
save(`chapter-${chapter}-${which.join("_")}.json`, results);
console.log(JSON.stringify(results, null, 1));
