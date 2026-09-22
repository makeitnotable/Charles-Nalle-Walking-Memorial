#!/usr/bin/env node
/**
 * UX walk (phone) — part 1: home splash + chapter deep-links (QR arrival).
 * Read-only against the running dev server. Screenshots + a JSON of measurements.
 * Usage: node scripts/uxwalk-phone-1-home-chapters.mjs
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:4321";
const OUT = "docs/v7/qa/uxwalk-phone";
mkdirSync(OUT, { recursive: true });

const VPS = [
  { name: "360", width: 360, height: 800 },
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "320", width: 320, height: 568 },
];
const results = {};
const log = (k, v) => {
  results[k] = v;
  console.log(k, JSON.stringify(v).slice(0, 600));
};

const rect = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
    display: cs.display, vis: cs.visibility, op: cs.opacity, fs: cs.fontSize, lh: cs.lineHeight,
    color: cs.color, txt: (el.textContent || "").trim().slice(0, 80),
  };
};

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });

for (const vp of VPS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: devices["Pixel 5"].userAgent,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text().slice(0, 200)}`); });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message.slice(0, 200)}`));

  // ---------- HOME ----------
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(OUT, `home-${vp.name}-01-first.png`) });
  const home = await page.evaluate((rectSrc) => {
    const rect = eval(rectSrc);
    const q = (s) => document.querySelector(s);
    const all = (s) => [...document.querySelectorAll(s)];
    const ctas = all("a,button").filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0;
    }).map((e) => ({ tag: e.tagName, ...rect(e), aria: e.getAttribute("aria-label"), href: e.getAttribute("href") }));
    const h1 = q("h1");
    const img = q("main img, header img, #hero img, picture img");
    const ps = all("main p, header p").filter((p) => p.getBoundingClientRect().height > 0).map(rect);
    return {
      title: document.title,
      docW: document.documentElement.scrollWidth, innerW: innerWidth, scrollH: document.documentElement.scrollHeight,
      h1: rect(h1), img: img ? { ...rect(img), objPos: getComputedStyle(img).objectPosition, natural: [img.naturalWidth, img.naturalHeight], src: img.currentSrc.slice(-60) } : null,
      ps, ctas,
      bodyText: document.body.innerText.slice(0, 600),
    };
  }, rect.toString());
  log(`home-${vp.name}`, home);
  // scroll to bottom of home
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(OUT, `home-${vp.name}-02-bottom.png`) });
  // full page
  await page.screenshot({ path: join(OUT, `home-${vp.name}-03-full.png`), fullPage: true });

  // ---------- CHAPTERS ----------
  for (const ch of ["bakery", "barbershop", "commissioners-office"]) {
    if (vp.name === "320" && ch !== "bakery") continue;
    await page.goto(`${BASE}/${ch}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-01-hero.png`) });
    const hero = await page.evaluate((rectSrc) => {
      const rect = eval(rectSrc);
      const q = (s) => document.querySelector(s);
      const img = q("#hero-media img, #hero img");
      const burger = q('button[aria-label="Open menu"]');
      const lock = q("#hero-lockup");
      const h1 = q("h1");
      return {
        docW: document.documentElement.scrollWidth, innerW: innerWidth,
        img: img ? { ...rect(img), objPos: getComputedStyle(img).objectPosition, natural: [img.naturalWidth, img.naturalHeight], src: img.currentSrc.slice(-70) } : null,
        burger: rect(burger), lock: rect(lock), h1: rect(h1),
        lockKids: lock ? [...lock.children].map(rect) : [],
      };
    }, rect.toString());
    log(`${ch}-${vp.name}-hero`, hero);

    // section census + slow scroll
    const sections = await page.evaluate((rectSrc) => {
      const rect = eval(rectSrc);
      const secs = [...document.querySelectorAll("header, section, footer")].filter((s) => s.id || s.tagName === "FOOTER").map((s) => {
        const r = s.getBoundingClientRect();
        return { id: s.id || s.tagName, top: Math.round(r.top + scrollY), h: Math.round(r.height), aria: s.getAttribute("aria-label") };
      });
      return { scrollH: document.documentElement.scrollHeight, secs };
    }, rect.toString());
    log(`${ch}-${vp.name}-sections`, sections);

    // slow scroll: 0.7 viewport steps, screenshot each
    const H = sections.scrollH;
    let step = 0;
    for (let y = 0; y < H; y += Math.round(vp.height * 0.8)) {
      await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
      await page.waitForTimeout(650);
      step++;
      if (vp.name === "390" || (vp.name === "360" && ch === "barbershop") || (vp.name === "430" && ch === "bakery")) {
        await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-scroll-${String(step).padStart(2, "0")}.png`) });
      }
    }
    // Ensure lines/heading masks reveal: measure heading overflow after full scroll
    const textChecks = await page.evaluate((rectSrc) => {
      const rect = eval(rectSrc);
      const heads = [...document.querySelectorAll("h1,h2,h3")].map((h) => {
        const r = h.getBoundingClientRect();
        const cs = getComputedStyle(h);
        // detect clipped descenders: any ancestor with overflow hidden whose rect is smaller than the text's line box
        let clipAnc = null;
        let a = h;
        while (a && a !== document.body) {
          const c = getComputedStyle(a);
          if (/hidden|clip/.test(c.overflow + c.overflowY) ) { clipAnc = a; break; }
          a = a.parentElement;
        }
        const lines = [...h.querySelectorAll("*")].filter((e) => /hidden|clip/.test(getComputedStyle(e).overflow + getComputedStyle(e).overflowY)).map((e) => ({ tag: e.tagName, cls: e.className.toString().slice(0, 40), h: Math.round(e.getBoundingClientRect().height), lh: getComputedStyle(e).lineHeight, fs: getComputedStyle(e).fontSize, txt: e.textContent.trim().slice(0, 40) }));
        return { id: h.id, tag: h.tagName, txt: h.innerText.replace(/\n/g, "⏎").slice(0, 60), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, lh: cs.lineHeight, tt: cs.textTransform, sw: h.scrollWidth, cw: h.clientWidth, clipAnc: clipAnc ? clipAnc.className.toString().slice(0, 40) : null, lines: lines.slice(0, 6) };
      });
      // orphans in paragraphs (last line one word)
      const paras = [...document.querySelectorAll("main p, section p")].filter((p) => p.getBoundingClientRect().height > 0);
      const orphans = [];
      for (const p of paras) {
        const words = p.innerText.trim().split(/\s+/);
        if (words.length < 6) continue;
        const range = document.createRange();
        const tn = [...p.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim());
        if (!tn) continue;
        const text = tn.textContent;
        const lastWord = text.trimEnd().split(/\s+/).pop();
        const idx = text.lastIndexOf(lastWord);
        range.setStart(tn, idx); range.setEnd(tn, idx + lastWord.length);
        const rl = range.getBoundingClientRect();
        // second last word
        const before = text.slice(0, idx).trimEnd();
        const prevWord = before.split(/\s+/).pop();
        const pidx = before.lastIndexOf(prevWord);
        const r2 = document.createRange(); r2.setStart(tn, pidx); r2.setEnd(tn, pidx + prevWord.length);
        const rp = r2.getBoundingClientRect();
        const pr = p.getBoundingClientRect();
        const lines = Math.round(pr.height / parseFloat(getComputedStyle(p).lineHeight));
        if (rl.top > rp.top + 2 && lines > 1) orphans.push({ sec: p.closest("section,footer,header")?.id || p.closest("section,footer,header")?.tagName, lastWord, lines, txt: p.innerText.slice(0, 50) });
      }
      const overflowers = [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && r.width > 0; }).slice(0, 10).map((e) => ({ tag: e.tagName, cls: e.className.toString().slice(0, 50), right: Math.round(e.getBoundingClientRect().right) }));
      return { heads, orphans, overflowers, docW: document.documentElement.scrollWidth };
    }, rect.toString());
    log(`${ch}-${vp.name}-text`, textChecks);

    // moral + onward + footer screenshots
    for (const id of ["history", "onward"]) {
      await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: "start", behavior: "instant" }), id);
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-${id}.png`) });
    }
    // moral section: find the section between history and onward
    const moralId = sections.secs.find((s, i) => sections.secs[i - 1]?.id === "history")?.id;
    if (moralId) {
      await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: "start", behavior: "instant" }), moralId);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-moral.png`) });
      const moral = await page.evaluate(({ rectSrc, id }) => {
        const rect = eval(rectSrc);
        const s = document.getElementById(id);
        const h = s.querySelector("h2,h3");
        const ps = [...s.querySelectorAll("p")].map(rect);
        const bg = getComputedStyle(s).backgroundColor;
        const bgImg = s.querySelector("img, picture, video");
        return { id, h: h ? { ...rect(h), tt: getComputedStyle(h).textTransform, ff: getComputedStyle(h).fontFamily.slice(0, 40) } : null, ps, bg, bgImg: bgImg ? rect(bgImg) : null, secH: Math.round(s.getBoundingClientRect().height), gapToOnward: Math.round(document.getElementById("onward").getBoundingClientRect().top - s.getBoundingClientRect().bottom) };
      }, { rectSrc: rect.toString(), id: moralId });
      log(`${ch}-${vp.name}-moral`, moral);
      // scroll a bit lower to see the moral bottom + gap
      await page.evaluate((i) => { const s = document.getElementById(i); window.scrollTo(0, s.offsetTop + s.offsetHeight - innerHeight * 0.6); }, moralId);
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-moral-end-gap.png`) });
    }
    // onward orange census
    await page.evaluate(() => document.getElementById("onward")?.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForTimeout(1500);
    const onward = await page.evaluate((rectSrc) => {
      const rect = eval(rectSrc);
      const s = document.getElementById("onward");
      const els = [...s.querySelectorAll("*")].filter((e) => e.getBoundingClientRect().height > 0);
      const orange = els.filter((e) => { const c = getComputedStyle(e); return /rgb\((2[0-9]{2}|1[89][0-9]), (1[0-9]{2}|[6-9][0-9]), ([0-9]{1,2})\)/.test(c.color + " " + c.backgroundColor + " " + c.borderColor) || /(rgb\(2[0-9]{2}, 1[0-4][0-9], [0-9]{1,2}\))/.test(c.backgroundColor); }).map((e) => ({ tag: e.tagName, cls: e.className.toString().slice(0, 40), color: getComputedStyle(e).color, bg: getComputedStyle(e).backgroundColor, txt: e.innerText?.slice(0, 30) }));
      const ctas = [...s.querySelectorAll("a,button")].map((e) => ({ tag: e.tagName, ...rect(e), href: e.getAttribute("href") }));
      const map = s.querySelector("canvas, .mapboxgl-map, iframe, [class*=embed]");
      return { orange, ctas, map: rect(map), secH: Math.round(s.getBoundingClientRect().height) };
    }, rect.toString());
    log(`${ch}-${vp.name}-onward`, onward);
    await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-onward-2.png`) });
    // footer
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-footer.png`) });
    const footer = await page.evaluate((rectSrc) => {
      const rect = eval(rectSrc);
      const f = document.querySelector("footer");
      if (!f) return null;
      const kids = [...f.querySelectorAll("a,p,span,small,div,button")].filter((e) => e.children.length === 0 && e.innerText?.trim()).map((e) => ({ tag: e.tagName, ...rect(e), lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight || 16)) }));
      return { h: Math.round(f.getBoundingClientRect().height), kids: kids.slice(0, 40) };
    }, rect.toString());
    log(`${ch}-${vp.name}-footer`, footer);

    // audio player: scroll to scene-0, click play, then scroll away
    if (vp.name === "390" || vp.name === "360") {
      await page.evaluate(() => document.getElementById("scene-0")?.scrollIntoView({ block: "start", behavior: "instant" }));
      await page.waitForTimeout(1200);
      await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-audio-01.png`) });
      const btn = page.locator("#scene-0 button").first();
      const audio = await page.evaluate((rectSrc) => {
        const rect = eval(rectSrc);
        const s = document.getElementById("scene-0");
        return { btns: [...s.querySelectorAll("button, [role=slider], input")].map((b) => ({ tag: b.tagName, ...rect(b), aria: b.getAttribute("aria-label") })) };
      }, rect.toString());
      log(`${ch}-${vp.name}-audio-controls`, audio);
      try {
        await btn.tap({ timeout: 3000 });
        await page.waitForTimeout(2500);
        await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-audio-02-playing.png`) });
        await page.evaluate(() => window.scrollBy(0, innerHeight * 2.2));
        await page.waitForTimeout(1500);
        await page.screenshot({ path: join(OUT, `${ch}-${vp.name}-audio-03-mini.png`) });
        const mini = await page.evaluate((rectSrc) => {
          const rect = eval(rectSrc);
          const m = document.querySelector(".fixed.bottom-4.left-4, [class*=fixed][class*=bottom-4]");
          return m ? { ...rect(m), btns: [...m.querySelectorAll("button")].map((b) => ({ ...rect(b), aria: b.getAttribute("aria-label") })) } : null;
        }, rect.toString());
        log(`${ch}-${vp.name}-audio-mini`, mini);
      } catch (e) {
        log(`${ch}-${vp.name}-audio-err`, String(e).slice(0, 200));
      }
    }
  }
  log(`errors-${vp.name}`, errors);
  await ctx.close();
}
await browser.close();
writeFileSync(join(OUT, "part1.json"), JSON.stringify(results, null, 1));
