#!/usr/bin/env node
/**
 * Phase 2+3 Visual Design review — measurement probe.
 * For each route x viewport: computed type-role metrics, token colors,
 * pixel samples (via sharp), hard-break + widow checks, section order, spacing.
 * Read-only. Writes nothing to src/.
 */
import { chromium } from "playwright";
import sharp from "sharp";

const BASE = "http://localhost:4321";
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];
const ROUTES = process.argv[2] ? process.argv[2].split(",")
  : ["/", "/bakery", "/commissioners-office", "/map", "/people", "/paintings", "/about"];

const browser = await chromium.launch();

function fmt(o) { return JSON.stringify(o); }

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(BASE + route, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(route === "/map" ? 7000 : 1500);

    const data = await page.evaluate(() => {
      const out = { route: location.pathname };
      const cs = (el) => (el ? getComputedStyle(el) : null);
      const probe = (el) => {
        if (!el) return null;
        const s = cs(el);
        const r = el.getBoundingClientRect();
        return {
          text: (el.innerText || "").slice(0, 40).replace(/\n/g, "\\n"),
          font: s.fontFamily.split(",")[0].replace(/"/g, ""),
          size: s.fontSize, lh: s.lineHeight, weight: s.fontWeight,
          track: s.letterSpacing, color: s.color, bg: s.backgroundColor,
          transform: s.textTransform, wrap: s.textWrap,
          box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        };
      };
      // widow check: word count of last rendered line of a display element
      const lastLine = (el) => {
        if (!el) return null;
        const words = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const txt = node.textContent;
          let m; const re = /\S+/g;
          while ((m = re.exec(txt))) {
            const range = document.createRange();
            range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
            const rect = range.getBoundingClientRect();
            words.push({ w: m[0], top: Math.round(rect.top) });
          }
        }
        if (!words.length) return null;
        const lines = [];
        for (const w of words) {
          const line = lines.find((l) => Math.abs(l.top - w.top) < 6);
          if (line) line.words.push(w.w); else lines.push({ top: w.top, words: [w.w] });
        }
        lines.sort((a, b) => a.top - b.top);
        return { lines: lines.map((l) => l.words.join(" ")), lastCount: lines.at(-1).words.length };
      };

      out.bodyBg = cs(document.body).backgroundColor;
      out.htmlBg = cs(document.documentElement).backgroundColor;

      const h1 = document.querySelector("main h1, h1");
      out.h1 = probe(h1);
      if (h1) out.h1lines = lastLine(h1);

      out.displays = [...document.querySelectorAll(".type-display")].slice(0, 6).map((el) => ({
        ...probe(el), lines: lastLine(el)?.lines,
      }));
      out.label = probe(document.querySelector(".type-label"));
      out.body = probe(document.querySelector(".type-body, main p"));
      out.progress = probe(document.querySelector(".type-progress"));
      out.cardTitle = probe(document.querySelector(".type-card-title"));
      out.firstWord = probe(document.querySelector(".first-word"));

      const badge = [...document.querySelectorAll("div")].find((d) => {
        const s = cs(d); return s.borderRadius.includes("9999") || s.borderRadius === "50%" ?
          s.backgroundColor === "rgb(228, 91, 39)" : false;
      });
      out.badge = badge ? { bg: cs(badge).backgroundColor, box: badge.getBoundingClientRect().width } : null;

      const frame = document.querySelector("#hero-media, .frame");
      if (frame) {
        const s = cs(frame);
        out.heroFrame = { border: s.borderColor + " / " + s.borderWidth, radius: s.borderRadius,
          box: probe(frame).box };
      }
      const player = document.querySelector('[class*="rounded-3xl"][class*="border-primary-6"]');
      if (player) {
        const s = cs(player);
        out.playerCard = { bg: s.backgroundColor, border: s.borderColor + " / " + s.borderWidth,
          radius: s.borderRadius, box: probe(player).box };
      }
      // section order within main
      const main = document.querySelector("main") || document.body;
      out.order = [...main.querySelectorAll("header#hero, section, astro-island")].slice(0, 14).map((el) => {
        const label = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") ||
          el.getAttribute("component-url")?.split("/").pop().split(".")[0] || el.id || el.className.split(" ")[0];
        return (el.tagName + ":" + label).slice(0, 46);
      });
      // spacing rhythm: margins/paddings of top-level sections
      out.spacing = [...main.querySelectorAll("section")].slice(0, 8).map((el) => {
        const s = cs(el);
        return { sec: (el.getAttribute("aria-label") || el.id || el.className.split(" ")[0]).slice(0, 24),
          mt: s.marginTop, mb: s.marginBottom, pt: s.paddingTop, pb: s.paddingBottom, px: s.paddingLeft };
      });
      // narrative para gap
      const narrCol = document.querySelector('[class*="gap-y-8"]');
      if (narrCol) out.narrGap = { rowGap: cs(narrCol).rowGap, colGap: cs(narrCol).columnGap };

      // buttons
      out.buttons = [...document.querySelectorAll("a,button")].filter((b) => /rounded-full|min-w/.test(b.className))
        .slice(0, 4).map((b) => {
          const s = cs(b);
          return { t: (b.innerText || "").slice(0, 22), font: s.fontFamily.split(",")[0], size: s.fontSize,
            color: s.color, bg: s.backgroundColor, border: s.borderColor, py: s.paddingTop, px: s.paddingLeft };
        });

      // map extras
      if (location.pathname.includes("map")) {
        out.markers = [...document.querySelectorAll(".mapboxgl-marker")].slice(0, 6).map((m) => {
          const pill = m.querySelector("div,button,a,span");
          const s = pill ? cs(pill) : null;
          return { text: (m.innerText || "").replace(/\n/g, " ").slice(0, 30),
            bg: s?.backgroundColor, color: s?.color, border: s?.borderColor, font: s?.fontFamily.split(",")[0],
            size: s?.fontSize, radius: s?.borderRadius };
        });
        out.slider = !!document.querySelector(".keen-slider");
        out.sliderCards = [...document.querySelectorAll('[class*="keen-slider__slide"], [class*="slide"]')].length;
      }
      // home specifics
      if (location.pathname === "/" || location.pathname === "") {
        const wordmark = [...document.querySelectorAll("h1,div,p,span")].find((e) => e.childElementCount <= 3 && /CHARLES/.test(e.innerText || "") && /NALLE/.test(e.innerText || ""));
        out.wordmark = probe(wordmark);
        const bgLayer = [...document.querySelectorAll("div")].find((d) => (cs(d).backgroundImage || "").includes("url"));
        if (bgLayer) { const s = cs(bgLayer); out.homeBgLayer = { filter: s.filter, opacity: s.opacity, border: s.borderColor + "/" + s.borderWidth, radius: s.borderRadius }; }
        const cta = [...document.querySelectorAll("a,button")].find((b) => /continue/i.test(b.innerText || ""));
        if (cta) { const s = cs(cta); out.homeCta = { bg: s.backgroundColor, color: s.color, border: s.borderColor, size: s.fontSize, font: s.fontFamily.split(",")[0], w: Math.round(cta.getBoundingClientRect().width) }; }
        const mission = [...document.querySelectorAll("p")].find((p) => /Walking Memorial is a digital/.test(p.innerText || ""));
        if (mission) { const s = cs(mission); out.mission = { size: s.fontSize, color: s.color, maxW: s.maxWidth, html: mission.innerHTML.slice(0, 160) }; }
      }
      return out;
    });

    // pixel samples from screenshot at element-informed points
    const shot = await page.screenshot();
    const img = sharp(shot);
    const { data: raw, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const px = (x, y) => {
      x = Math.max(0, Math.min(info.width - 1, Math.round(x)));
      y = Math.max(0, Math.min(info.height - 1, Math.round(y)));
      const i = (y * info.width + x) * info.channels;
      return "#" + [raw[i], raw[i + 1], raw[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("");
    };
    const samples = {};
    samples.pageBg_topLeft = px(4, vp.height * 0.55);
    samples.pageBg_low = px(vp.width / 2, vp.height - 4);
    if (data.playerCard?.box) {
      const b = data.playerCard.box;
      if (b.y < vp.height && b.y + b.h > 0) {
        samples.playerBorder = px(b.x + 1, Math.min(vp.height - 2, Math.max(2, b.y + b.h / 2)));
        samples.playerBg = px(b.x + 30, Math.min(vp.height - 8, b.y + b.h - 30));
      }
    }
    if (data.heroFrame?.box) {
      const b = data.heroFrame.box;
      if (b.y < vp.height && b.y + b.h > 0)
        samples.heroBorder = px(b.x, Math.max(2, Math.min(vp.height - 2, b.y + b.h / 2)));
    }
    data.pixelSamples = samples;

    console.log(`\n===== ${route} @ ${vp.name} =====`);
    for (const [k, v] of Object.entries(data)) console.log(k + ": " + fmt(v));
    await page.close();
  }
}
await browser.close();
