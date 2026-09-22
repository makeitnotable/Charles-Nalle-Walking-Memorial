#!/usr/bin/env node
/**
 * UX walk (tablet + desktop) — script 01: page shots + text metrics.
 * READ-ONLY on the site. Output: docs/v7/qa/uxwalk-desk/<route>-<vp>-<step>.png
 * plus docs/v7/qa/uxwalk-desk/01-metrics.json (line boxes, titles, console).
 *
 * Usage: node scripts/uxwalk-desk-01-shots.mjs [--vp 768,1024,1280,1440,1920] [--routes /,/bakery,...]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = "http://localhost:4321";
const OUT = "docs/v7/qa/uxwalk-desk";
mkdirSync(OUT, { recursive: true });
const ALL_VP = {
  768: { width: 768, height: 1024 },
  1024: { width: 1024, height: 768 },
  1280: { width: 1280, height: 800 },
  1440: { width: 1440, height: 900 },
  1920: { width: 1920, height: 1080 },
};
const VPS = flag("vp", "768,1024,1280,1440,1920").split(",").map((n) => ({ name: n, ...ALL_VP[n] }));
const ROUTES = flag("routes", "/,/bakery,/commissioners-office,/mansion,/ferry,/barbershop,/people,/about,/404,/paintings").split(",");
const slugOf = (r) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/\//g, "-"));

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
const report = {};

/** Per-line boxes for an element (via Range on text nodes) — rag/orphan check. */
const LINES_FN = () => {
  const lineBoxes = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    // merge by top
    const lines = [];
    for (const r of rects) {
      const l = lines.find((x) => Math.abs(x.top - r.top) < r.height * 0.5);
      if (l) {
        l.left = Math.min(l.left, r.left);
        l.right = Math.max(l.right, r.right);
      } else lines.push({ top: r.top, left: r.left, right: r.right, h: r.height });
    }
    return lines.map((l) => ({ w: Math.round(l.right - l.left), top: Math.round(l.top) }));
  };
  const lastWords = (el) => {
    const t = (el.innerText || "").trim().replace(/\s+/g, " ");
    return t.split(" ").slice(-2).join(" ");
  };
  const out = [];
  const sel = "h1, h2, h3, .t-display, .t-title, .t-title-sm, .t-quote, figcaption, .t-prose, p, blockquote";
  document.querySelectorAll(sel).forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 5) return;
    const txt = (el.innerText || "").trim().replace(/\s+/g, " ");
    if (!txt) return;
    // skip nested duplicates: only leaf-ish blocks
    if (el.querySelector("p, h1, h2, h3, blockquote")) return;
    const lines = lineBoxes(el);
    if (lines.length < 2 && !el.matches("h1,h2,.t-display")) return;
    const widths = lines.map((l) => l.w);
    const max = Math.max(...widths);
    const last = widths[widths.length - 1];
    out.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className && el.className.baseVal === undefined ? el.className : "").toString().split(" ").filter((c) => c.startsWith("t-") || c === "lines").join(" "),
      text: txt.slice(0, 90),
      lines: lines.length,
      widths,
      lastRatio: max ? +(last / max).toFixed(2) : null,
      lastWords: lastWords(el),
      fontSize: parseFloat(cs.fontSize),
      lineHeight: cs.lineHeight,
      overflowClip: cs.overflow !== "visible" || cs.overflowY !== "visible",
      x: Math.round(r.x + scrollX),
      y: Math.round(r.y + scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
    });
  });
  return out;
};

for (const vp of VPS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrs = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") consoleErrs.push({ type: m.type(), text: m.text().slice(0, 300) });
  });
  page.on("pageerror", (e) => consoleErrs.push({ type: "pageerror", text: String(e).slice(0, 300) }));

  for (const route of ROUTES) {
    const slug = slugOf(route);
    const key = `${slug}-${vp.name}`;
    const rep = (report[key] = { route, vp: vp.name, shots: [], console: [] });
    consoleErrs.length = 0;
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
    } catch (e) {
      rep.error = String(e).slice(0, 200);
      await page.goto(BASE + route, { waitUntil: "load", timeout: 45000 }).catch(() => {});
    }
    await page.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" }).catch(() => {});
    await page.waitForTimeout(1200);
    rep.title = await page.title();
    rep.favicon = await page.evaluate(() => [...document.querySelectorAll("link[rel*='icon']")].map((l) => ({ rel: l.rel, href: l.getAttribute("href"), type: l.type, sizes: l.getAttribute("sizes") })));
    rep.docHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    const shot = async (step, opts = {}) => {
      const f = `${slug}-${vp.name}-${step}.png`;
      await page.screenshot({ path: join(OUT, f), ...opts });
      rep.shots.push(f);
      return f;
    };

    await shot("00-top");

    if (slug === "home") {
      rep.hero = await page.evaluate(() => {
        const img = document.querySelector("#hero img, header img, main img, picture img");
        const h1 = document.querySelector("h1");
        const p = [...document.querySelectorAll("p")].find((p) => (p.innerText || "").length > 80);
        const meta = [...document.querySelectorAll("p")].find((p) => /Troy, New York/.test(p.innerText || ""));
        const cta = [...document.querySelectorAll("a,button")].filter((a) => {
          const r = a.getBoundingClientRect();
          return r.width > 40 && r.top < innerHeight;
        }).map((a) => ({ text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 40), rect: a.getBoundingClientRect().toJSON(), bg: getComputedStyle(a).backgroundColor, color: getComputedStyle(a).color }));
        const box = (el) => (el ? el.getBoundingClientRect().toJSON() : null);
        return {
          img: img ? { src: img.currentSrc, rect: box(img), objectPosition: getComputedStyle(img).objectPosition, natural: [img.naturalWidth, img.naturalHeight] } : null,
          h1: h1 ? { text: h1.innerText, rect: box(h1), fs: getComputedStyle(h1).fontSize } : null,
          meta: meta ? { text: meta.innerText, rect: box(meta) } : null,
          desc: p ? { text: p.innerText, rect: box(p), color: getComputedStyle(p).color, fs: getComputedStyle(p).fontSize, maxWidth: getComputedStyle(p).maxWidth } : null,
          cta,
        };
      });
    }

    // Menu open shot on first route per vp and on map later
    if (slug === "home" || slug === "bakery") {
      const burger = page.locator(".cnwm-menu-burger");
      if (await burger.count()) {
        await burger.first().click();
        await page.waitForTimeout(700);
        await shot("01-menu-open");
        rep.menu = await page.evaluate(() => {
          const panel = document.querySelector(".cnwm-menu-panel");
          const burger = document.querySelector(".cnwm-menu-burger");
          const close = document.querySelector(".cnwm-menu-close");
          const scrim = document.querySelector(".cnwm-menu-scrim");
          return {
            panel: panel?.getBoundingClientRect().toJSON(),
            burger: burger?.getBoundingClientRect().toJSON(),
            burgerVisible: burger ? getComputedStyle(burger).visibility + "/" + getComputedStyle(burger).opacity : null,
            close: close?.getBoundingClientRect().toJSON(),
            scrim: scrim ? { hidden: scrim.hidden, bg: getComputedStyle(scrim).backgroundColor, opacity: getComputedStyle(scrim).opacity } : null,
            expanded: burger?.getAttribute("aria-expanded"),
          };
        });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
        rep.menuAfterEsc = await page.evaluate(() => ({ expanded: document.querySelector(".cnwm-menu-burger")?.getAttribute("aria-expanded"), panelHidden: document.querySelector(".cnwm-menu-panel")?.classList.contains("hidden") }));
        if (rep.menuAfterEsc.expanded === "true") {
          await page.locator(".cnwm-menu-close").first().click().catch(() => {});
          await page.waitForTimeout(500);
        }
      }
    }

    // scroll walk: chapters + people + about + paintings + 404
    const isChapter = ["bakery", "commissioners-office", "mansion", "ferry", "barbershop"].includes(slug);
    if (isChapter) {
      // sections
      const anchors = await page.evaluate(() =>
        [...document.querySelectorAll("section[id], header[id], footer, .painting-interlude, figure")].map((s) => ({
          id: s.id || s.className.toString().slice(0, 30),
          tag: s.tagName.toLowerCase(),
          top: Math.round(s.getBoundingClientRect().top + scrollY),
          h: Math.round(s.getBoundingClientRect().height),
        })),
      );
      rep.anchors = anchors;
      // menu hide-on-scroll test
      await page.evaluate(() => scrollTo(0, 900));
      await page.waitForTimeout(600);
      rep.menuOnScrollDown = await page.evaluate(() => {
        const b = document.querySelector(".cnwm-menu-burger");
        const r = b.getBoundingClientRect();
        const cs = getComputedStyle(b);
        return { rect: r.toJSON(), opacity: cs.opacity, transform: cs.transform, visibility: cs.visibility };
      });
      await page.evaluate(() => scrollTo(0, 700));
      await page.waitForTimeout(600);
      rep.menuOnScrollUp = await page.evaluate(() => {
        const b = document.querySelector(".cnwm-menu-burger");
        const r = b.getBoundingClientRect();
        const cs = getComputedStyle(b);
        return { rect: r.toJSON(), opacity: cs.opacity, transform: cs.transform, visibility: cs.visibility };
      });

      // Slow scroll through the page to trigger reveals, in viewport-height steps
      const H = vp.height;
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      let step = 0;
      for (let y = 0; y < total; y += Math.round(H * 0.85)) {
        await page.evaluate((yy) => scrollTo(0, yy), y);
        await page.waitForTimeout(350);
        step++;
      }
      // Now take key shots by section id
      const ids = ["scene-0", "scene-1", "history", "moral", "moral-0", "moral-1", "onward"];
      let n = 10;
      for (const id of ids) {
        const exists = await page.locator(`#${id}`).count();
        if (!exists) continue;
        await page.evaluate((i) => {
          const el = document.getElementById(i);
          scrollTo(0, el.getBoundingClientRect().top + scrollY);
        }, id);
        await page.waitForTimeout(900);
        await shot(`${n++}-${id}`);
        // second shot one viewport further for long sections
        const secH = await page.evaluate((i) => document.getElementById(i).getBoundingClientRect().height, id);
        if (secH > H * 1.2) {
          await page.evaluate((i) => {
            const el = document.getElementById(i);
            scrollTo(0, el.getBoundingClientRect().top + scrollY + innerHeight * 0.9);
          }, id);
          await page.waitForTimeout(700);
          await shot(`${n++}-${id}-b`);
        }
        if (secH > H * 2.2) {
          await page.evaluate((i) => {
            const el = document.getElementById(i);
            scrollTo(0, el.getBoundingClientRect().top + scrollY + innerHeight * 1.8);
          }, id);
          await page.waitForTimeout(700);
          await shot(`${n++}-${id}-c`);
        }
      }
      // interlude
      await page.evaluate(() => {
        const el = document.querySelector(".painting-interlude");
        if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.1);
      });
      await page.waitForTimeout(900);
      await shot(`${n++}-interlude`);
      rep.interludeCredit = await page.evaluate(() => {
        const p = document.querySelector(".painting-interlude p");
        if (!p) return null;
        const r = p.getBoundingClientRect();
        return { text: p.innerText, rect: r.toJSON(), color: getComputedStyle(p).color, fs: getComputedStyle(p).fontSize };
      });
      // sketch figure alignment
      rep.sketchFigure = await page.evaluate(() => {
        return [...document.querySelectorAll("figure.reveal.mt-20, figure.mt-20")].map((f) => {
          const img = f.querySelector("img");
          const cap = f.querySelector("figcaption");
          return {
            fig: f.getBoundingClientRect().toJSON(),
            img: img?.getBoundingClientRect().toJSON(),
            cap: cap?.getBoundingClientRect().toJSON(),
            capText: cap?.innerText.slice(0, 80),
          };
        });
      });
      // moral text metrics + heading clip
      rep.moral = await page.evaluate(() => {
        return [...document.querySelectorAll("section[id^='moral']")].map((s) => {
          const h = s.querySelector("h2");
          const p = s.querySelector("p.t-prose");
          const hr = h.getBoundingClientRect();
          // detect clipping: any ancestor with overflow hidden and the h2's lines
          const clipAnc = [];
          let n = h;
          while (n && n !== document.body) {
            const cs = getComputedStyle(n);
            if (cs.overflow !== "visible" || cs.overflowY !== "visible" || cs.overflowX !== "visible") clipAnc.push({ tag: n.tagName, cls: n.className.toString().slice(0, 40), ov: cs.overflow + "/" + cs.overflowY });
            n = n.parentElement;
          }
          const spans = [...h.querySelectorAll("span, .line, div")].map((sp) => ({ t: sp.innerText.slice(0, 40), r: sp.getBoundingClientRect().toJSON(), ov: getComputedStyle(sp).overflow, lh: getComputedStyle(sp).lineHeight, fs: getComputedStyle(sp).fontSize, pb: getComputedStyle(sp).paddingBottom }));
          return {
            id: s.id,
            heading: h.innerText,
            hRect: hr.toJSON(),
            hFont: getComputedStyle(h).fontSize + " / " + getComputedStyle(h).lineHeight,
            clipAnc,
            spans,
            bodyColor: p ? getComputedStyle(p).color : null,
            bodyFs: p ? getComputedStyle(p).fontSize : null,
            secTop: s.getBoundingClientRect().top + scrollY,
            secH: s.getBoundingClientRect().height,
          };
        });
      });
      // onward: count oranges + rhythm
      rep.onward = await page.evaluate(() => {
        const s = document.getElementById("onward");
        const prev = s.previousElementSibling;
        const r = s.getBoundingClientRect();
        const first = s.querySelector("h2");
        const gapFromPrev = first.getBoundingClientRect().top - prev.getBoundingClientRect().bottom;
        const oranges = [...s.querySelectorAll("*")]
          .filter((el) => {
            const cs = getComputedStyle(el);
            const c = cs.backgroundColor + " " + cs.color + " " + cs.borderColor;
            return /rgb\((2[0-5]\d|1[6-9]\d), (1[0-4]\d|[6-9]\d), ([0-9]|[1-6]\d)\)/.test(c);
          })
          .map((el) => ({ tag: el.tagName, cls: el.className.toString().slice(0, 40), text: (el.innerText || "").slice(0, 30), bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color }));
        const player = document.querySelector("[class*='mini'], .audio-mini, [data-mini-player]");
        return { onwardTop: r.top + scrollY, onwardH: r.height, gapFromPrev: Math.round(gapFromPrev), oranges: oranges.slice(0, 20), player: player ? player.getBoundingClientRect().toJSON() : null };
      });
      // footer
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(900);
      await shot(`${n++}-footer`);
      // sticky player position at footer
      rep.stickyAtFooter = await page.evaluate(() => {
        const fixed = [...document.querySelectorAll("*")].filter((el) => {
          const cs = getComputedStyle(el);
          return (cs.position === "fixed" || cs.position === "sticky") && el.getBoundingClientRect().width > 30 && el.getBoundingClientRect().height > 20 && cs.visibility !== "hidden" && +cs.opacity > 0.05;
        });
        return fixed.map((el) => ({ tag: el.tagName, cls: el.className.toString().slice(0, 50), text: (el.innerText || "").replace(/\s+/g, " ").slice(0, 40), rect: el.getBoundingClientRect().toJSON() }));
      });
      // audio: press play in scene-0, capture the highlight
      await page.evaluate(() => {
        const el = document.getElementById("scene-0");
        scrollTo(0, el.getBoundingClientRect().top + scrollY + innerHeight * 0.6);
      });
      await page.waitForTimeout(600);
      const play = page.locator("#scene-0 button").filter({ hasText: /play|listen/i }).first();
      const playAria = page.locator("#scene-0 button[aria-label*='lay' i]").first();
      const btn = (await play.count()) ? play : (await playAria.count()) ? playAria : null;
      if (btn) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(6000);
        await shot(`${n++}-audio-playing`);
        rep.audio = await page.evaluate(() => {
          const s = document.getElementById("scene-0");
          const hl = [...s.querySelectorAll("[data-active], .is-active, [aria-current], .active, span, p")].filter((el) => {
            const cs = getComputedStyle(el);
            return el.matches("span, p") && cs.color !== getComputedStyle(s).color;
          });
          const btns = [...s.querySelectorAll("button")].map((b) => ({ label: b.getAttribute("aria-label") || b.innerText.slice(0, 30), rect: b.getBoundingClientRect().toJSON() }));
          return { hlCount: hl.length, btns };
        });
        // scroll to bottom to see mini-player at onward
        await page.evaluate(() => {
          const el = document.getElementById("onward");
          scrollTo(0, el.getBoundingClientRect().top + scrollY);
        });
        await page.waitForTimeout(900);
        await shot(`${n++}-onward-with-player`);
      }
    } else if (slug === "people" || slug === "about" || slug === "paintings" || slug === "404") {
      const H = vp.height;
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      let n = 10;
      for (let y = 0; y < total; y += Math.round(H * 0.85)) {
        await page.evaluate((yy) => scrollTo(0, yy), y);
        await page.waitForTimeout(400);
      }
      // shots at ~ each viewport
      let k = 0;
      for (let y = 0; y < total && k < 9; y += Math.round(H * 0.9)) {
        await page.evaluate((yy) => scrollTo(0, yy), y);
        await page.waitForTimeout(500);
        await shot(`${n++}-scroll${k++}`);
      }
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(600);
      await shot(`${n++}-footer`);
      if (slug === "people") {
        rep.peopleH1 = await page.evaluate(() => {
          const h = document.querySelector("h1");
          const range = document.createRange();
          range.selectNodeContents(h);
          const rects = [...range.getClientRects()];
          const lines = [];
          for (const r of rects) {
            const l = lines.find((x) => Math.abs(x.top - r.top) < r.height * 0.5);
            if (l) { l.left = Math.min(l.left, r.left); l.right = Math.max(l.right, r.right); } else lines.push({ top: r.top, left: r.left, right: r.right, h: r.height });
          }
          return { text: h.innerText, html: h.innerHTML.slice(0, 300), lines: lines.map((l) => Math.round(l.right - l.left)), fs: getComputedStyle(h).fontSize };
        });
        rep.peopleGrid = await page.evaluate(() => {
          const cards = [...document.querySelectorAll("article, li, [class*='person'], [class*='card']")].filter((el) => el.querySelector("img") && el.getBoundingClientRect().height > 100);
          return cards.slice(0, 12).map((c) => ({ rect: c.getBoundingClientRect().toJSON(), y: Math.round(c.getBoundingClientRect().top + scrollY), links: [...c.querySelectorAll("a")].map((a) => a.innerText.trim().slice(0, 40)) }));
        });
      }
      if (slug === "about") {
        rep.aboutPortraits = await page.evaluate(() => {
          const imgs = [...document.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 100);
          return imgs.map((i) => ({ src: i.currentSrc.split("/").pop(), natural: [i.naturalWidth, i.naturalHeight], rendered: [Math.round(i.getBoundingClientRect().width), Math.round(i.getBoundingClientRect().height)], y: Math.round(i.getBoundingClientRect().top + scrollY) }));
        });
        rep.aboutQuoteGap = await page.evaluate(() => {
          const q = document.querySelector("blockquote, .t-quote");
          const imgs = [...document.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 100);
          if (!q) return null;
          const qt = q.getBoundingClientRect().top + scrollY;
          const before = imgs.map((i) => i.getBoundingClientRect().bottom + scrollY).filter((b) => b < qt).sort((a, b) => b - a)[0];
          return { quoteTop: Math.round(qt), lastImgBottomBefore: Math.round(before), gap: Math.round(qt - before), quote: q.innerText.slice(0, 80) };
        });
      }
    }

    // text metrics over the whole page (after all reveals)
    rep.lines = await page.evaluate(LINES_FN);
    rep.console = [...consoleErrs];
    console.log(`${key} done · ${rep.shots.length} shots · ${rep.console.length} console`);
  }
  await context.close();
}
writeFileSync(join(OUT, "01-metrics.json"), JSON.stringify(report, null, 1));
await browser.close();
console.log("wrote", join(OUT, "01-metrics.json"));
