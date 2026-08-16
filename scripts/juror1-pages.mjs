// /people /about /404 full-page at six viewports; menu open/close + scroll-hide on every route at 390 + 1440;
// drop caps + interlude + study on bakery/barbershop at 390/768/1440.
import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const R = { pages: {}, menu: {}, details: {} };
const only = process.argv[2];

if (!only || only === "pages") {
  for (const [k, vp] of Object.entries(VPS)) {
    for (const route of ["/people", "/about"]) {
      const c = await ctx(browser, vp);
      const page = await c.newPage();
      const log = watch(page);
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await sleep(1200);
      // force reveals by scrolling through
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += vp.height * 0.7) { await page.evaluate((y) => window.scrollTo(0, y), y); await sleep(250); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(800);
      await shot(page, `page${route.replace("/", "-")}-${k}`, true);
      const info = await page.evaluate(() => ({
        h1: document.querySelector("h1")?.innerText,
        h2s: [...document.querySelectorAll("h2")].map((e) => e.innerText.replace(/\n/g, " / ")),
        eyebrows: [...document.querySelectorAll("p.t-meta, span.t-meta")].map((e) => e.textContent.trim()).filter((t) => t.length > 3 && t.length < 60).slice(0, 40),
        ctas: [...document.querySelectorAll("a.btn, a.btn-solid")].map((a) => a.textContent.trim()),
        spotLinks: [...document.querySelectorAll("a")].filter((a) => /^Spot \d/.test(a.textContent.trim())).length,
        emdash: (document.body.innerText.match(/—/g) || []).length,
      }));
      R.pages[`${route}-${k}`] = { ...info, log: log.filter((l) => !/ERR_ABORTED/.test(l)) };
      await c.close();
    }
  }
}

if (!only || only === "menu") {
  for (const k of ["p390", "d1440"]) {
    for (const route of ["/", "/bakery", "/map", "/people", "/paintings", "/about", "/404x"]) {
      const c = await ctx(browser, VPS[k]);
      const page = await c.newPage();
      const log = watch(page);
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await sleep(1500);
      const rec = {};
      const burger = page.locator('button[aria-label="Open menu"]');
      rec.hasBurger = (await burger.count()) > 0;
      if (rec.hasBurger) {
        const vis = async () => page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const w = b.closest(".cnwm-menu") || b.parentElement; const cs = getComputedStyle(w); const r = b.getBoundingClientRect(); return { op: cs.opacity, tf: cs.transform, vis: cs.visibility, x: Math.round(r.x), y: Math.round(r.y), inView: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth, pe: cs.pointerEvents, hidden: w.hasAttribute("data-hidden") || w.className.includes("hidden"), attrs: [...w.attributes].map((a) => a.name + "=" + a.value).join(" ") }; });
        rec.rest = await vis();
        await burger.click();
        await sleep(900);
        await shot(page, `menu${route.replace(/\//g, "-") || "-home"}-${k}-open`);
        rec.open = await page.evaluate(() => ({ links: [...document.querySelectorAll(".cnwm-menu a, nav a, [role=dialog] a")].filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.textContent.trim().replace(/\s+/g, " ")), focus: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 30) }));
        // close spin
        const close = page.locator('button[aria-label="Close menu"]');
        const samples = [];
        await close.click({ noWaitAfter: true });
        for (let i = 0; i < 8; i++) { samples.push(await page.evaluate(() => { const b = document.querySelector('button[aria-label="Close menu"]'); const ic = b?.querySelector("svg, span, i") || b; return { t: performance.now() | 0, tf: getComputedStyle(ic).transform, btf: getComputedStyle(b).transform, vis: getComputedStyle(b).visibility, op: getComputedStyle(b).opacity }; })); await sleep(40); }
        rec.closeSamples = samples;
        await sleep(600);
        rec.afterClose = await vis();
        // scroll-hide (only if page scrolls)
        const sh = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
        rec.scrollable = sh;
        if (sh > 400) {
          await page.mouse.wheel(0, 300); await sleep(150);
          await page.mouse.wheel(0, 300); await sleep(150);
          await page.mouse.wheel(0, 300); await sleep(700);
          rec.afterDown = await vis();
          await shot(page, `menu${route.replace(/\//g, "-") || "-home"}-${k}-scrolled-down`);
          await page.mouse.wheel(0, -80); await sleep(700);
          rec.afterUp = await vis();
          await shot(page, `menu${route.replace(/\//g, "-") || "-home"}-${k}-scrolled-up`);
        }
      }
      rec.log = log.filter((l) => !/ERR_ABORTED/.test(l));
      R.menu[`${route}-${k}`] = rec;
      await c.close();
    }
  }
}

if (!only || only === "details") {
  for (const k of ["p390", "t768", "d1440"]) {
    for (const route of ["/bakery", "/barbershop", "/commissioners-office", "/ferry"]) {
      const c = await ctx(browser, VPS[k]);
      const page = await c.newPage();
      const log = watch(page);
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await sleep(1000);
      const tag = `det${route.replace("/", "-")}-${k}`;
      // drop cap: first prose paragraph in each scene
      const scenes = await page.locator("section[id^=scene-]").count();
      for (let s = 0; s < scenes; s++) {
        const p = page.locator(`#scene-${s} p.t-prose`).first();
        await p.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
        await sleep(700);
        await shot(page, `${tag}-dropcap-${s}`);
      }
      // interlude (archival) — find figure/video with credit
      const fig = page.locator("figure, .wipe, video.lazy-video").filter({ hasNot: page.locator("#hero-media") });
      // scroll slowly through page to trigger wipes; shoot the region between scene-0 and history
      const y1 = await page.evaluate(() => document.getElementById("history")?.getBoundingClientRect().top + scrollY);
      const y0 = await page.evaluate(() => { const s = document.getElementById("scene-0"); return s.getBoundingClientRect().bottom + scrollY; });
      for (let y = y0 - 600; y < y1; y += 250) { await page.evaluate((y) => window.scrollTo(0, y), y); await sleep(120); }
      await page.evaluate((y) => window.scrollTo(0, y - innerHeight * 0.55), (y0 + y1) / 2);
      await sleep(900);
      await shot(page, `${tag}-interlude`);
      // moral + study
      await page.evaluate(() => { const m = document.getElementById("moral-0") || document.querySelector("section[id^=moral]"); m.scrollIntoView({ behavior: "instant" }); });
      await sleep(400);
      const study = page.locator("section[id^=moral] figure").first();
      if (await study.count()) { await study.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" })); await sleep(900); await shot(page, `${tag}-study`); }
      // heading → quote gap
      await page.evaluate(() => document.getElementById("scene-0").scrollIntoView({ behavior: "instant" }));
      await sleep(600);
      const gap = await page.evaluate(() => { const h = document.querySelector("#scene-0 h2"); const q = document.querySelector("#scene-0 blockquote, #scene-0 .t-quote"); return h && q ? Math.round(q.getBoundingClientRect().top - h.getBoundingClientRect().bottom) : null; });
      const moralGap = await page.evaluate(() => { const ms = [...document.querySelectorAll("section[id^=moral]")]; const m = ms[ms.length - 1]; const o = document.getElementById("onward"); const oh = o.querySelector("h2, .t-meta, .t-spine, span"); return { moralBottomToOnwardTop: Math.round(o.getBoundingClientRect().top - m.getBoundingClientRect().bottom), moralLastTextToOnwardFirstText: (() => { const texts = [...m.querySelectorAll("p, figcaption, h2")].filter((e) => e.getBoundingClientRect().height > 0); const last = texts[texts.length - 1]; return Math.round(oh.getBoundingClientRect().top - last.getBoundingClientRect().bottom); })() }; });
      R.details[tag] = { gapHeadingToQuote: gap, ...moralGap, log: log.filter((l) => !/ERR_ABORTED/.test(l)) };
      await c.close();
    }
  }
}

save(`pages-${only || "all"}.json`, R);
console.log(JSON.stringify(R, null, 1));
await browser.close();
