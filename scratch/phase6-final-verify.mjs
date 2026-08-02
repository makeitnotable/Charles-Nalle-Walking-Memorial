#!/usr/bin/env node
/**
 * Phase 6 FINAL live-deploy verification probe.
 * Verifies the phase23 fixes on https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial:
 *  1. /map marker pill label font-size + padding at 390/768/1440 (expect 12 -> 15 -> 18)
 *  2. Home atmosphere layers: contour overlay (homepage-overlay) + bottom gradient at 390/1440
 *  3. /people h1 last-line widow at 390
 *  4. /bakery Where-to-next embed: destination marker in view when settled
 * Read-only.
 */
import { chromium } from "playwright";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

const browser = await chromium.launch();
const log = (...a) => console.log(...a);

// ---------- 1. Map marker pills ----------
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(8000); // let the flight settle
  const pills = await page.evaluate(() => {
    return [...document.querySelectorAll(".mapboxgl-marker")].map((m) => {
      // find the deepest text-bearing element = label
      const label = m.querySelector("p") || m.querySelector("span") || m.querySelector("div");
      const pill = label ? label.closest("div") : null;
      const ls = label ? getComputedStyle(label) : null;
      const ps = pill ? getComputedStyle(pill) : null;
      const chip = [...m.querySelectorAll("div,span")].find((el) => {
        const s = getComputedStyle(el);
        return s.backgroundColor === "rgb(228, 91, 39)";
      });
      return {
        text: (m.innerText || "").replace(/\n/g, " ").trim().slice(0, 30),
        labelTag: label?.tagName,
        labelSize: ls?.fontSize,
        labelFont: ls?.fontFamily.split(",")[0].replace(/"/g, ""),
        labelWeight: ls?.fontWeight,
        labelColor: ls?.color,
        pillPadding: ps?.padding,
        pillBg: ps?.backgroundColor,
        pillBorder: ps?.borderColor + " " + ps?.borderWidth,
        pillRadius: ps?.borderRadius,
        chipSize: chip ? Math.round(chip.getBoundingClientRect().width) : null,
      };
    });
  });
  log(`\n===== /map pills @ ${vp.name} =====`);
  for (const p of pills) log(JSON.stringify(p));
  await page.close();
}

// ---------- 2. Home atmosphere ----------
for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const home = await page.evaluate(() => {
    const out = { layers: [] };
    for (const d of document.querySelectorAll("div,section,header,span")) {
      const s = getComputedStyle(d);
      const bi = s.backgroundImage || "";
      if (bi !== "none" && bi !== "") {
        out.layers.push({
          bi: bi.slice(0, 140),
          opacity: s.opacity,
          filter: s.filter.slice(0, 90),
          cls: (d.className || "").toString().slice(0, 70),
          size: Math.round(d.getBoundingClientRect().width) + "x" + Math.round(d.getBoundingClientRect().height),
        });
      }
    }
    const imgs = [...document.querySelectorAll("img")].map((i) => ({
      src: i.currentSrc.split("/").pop(),
      opacity: getComputedStyle(i).opacity,
      filter: getComputedStyle(i).filter.slice(0, 90),
      cls: (i.className || "").toString().slice(0, 70),
    }));
    out.imgs = imgs;
    out.hasOverlayAsset = out.layers.some((l) => /overlay/i.test(l.bi)) || imgs.some((i) => /overlay/i.test(i.src));
    out.hasBottomGradient = out.layers.some((l) => /linear-gradient/.test(l.bi) && /rgba?\(16, 10, 6/.test(l.bi));
    out.gradients = out.layers.filter((l) => /gradient/.test(l.bi)).map((l) => l.bi);
    return out;
  });
  log(`\n===== home layers @ ${vp.name} =====`);
  log("hasOverlayAsset:", home.hasOverlayAsset, " hasBottomGradient:", home.hasBottomGradient);
  for (const l of home.layers) log("LAYER", JSON.stringify(l));
  for (const i of home.imgs) log("IMG", JSON.stringify(i));
  await page.close();
}

// ---------- 3. /people h1 widow @390 ----------
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + "/people", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const h1 = await page.evaluate(() => {
    const el = document.querySelector("main h1, h1");
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
    const lines = [];
    for (const w of words) {
      const line = lines.find((l) => Math.abs(l.top - w.top) < 6);
      if (line) line.words.push(w.w); else lines.push({ top: w.top, words: [w.w] });
    }
    lines.sort((a, b) => a.top - b.top);
    return { text: el.innerText.replace(/\n/g, " / "), lines: lines.map((l) => l.words.join(" ")), lastCount: lines.at(-1).words.length };
  });
  log(`\n===== /people h1 @ 390 =====`);
  log(JSON.stringify(h1, null, 2));
  await page.close();
}

// ---------- 4. /bakery embed destination ----------
for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  // scroll to the where-to-next embed and let the flight settle
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("section")].find((s) =>
      /where/i.test(s.getAttribute("aria-label") || "") || /next/i.test(s.innerText.slice(0, 200)));
    (el || document.body).scrollIntoView?.();
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(9000);
  const embed = await page.evaluate(() => {
    const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => {
      const r = m.getBoundingClientRect();
      const mapEl = m.closest(".mapboxgl-map");
      const mr = mapEl ? mapEl.getBoundingClientRect() : null;
      return {
        text: (m.innerText || "").replace(/\n/g, " ").trim().slice(0, 30),
        inMapView: mr ? r.left >= mr.left - 5 && r.right <= mr.right + 5 && r.top >= mr.top - 5 && r.bottom <= mr.bottom + 5 : null,
        rel: mr ? { x: Math.round(r.x - mr.x), y: Math.round(r.y - mr.y), mapW: Math.round(mr.width), mapH: Math.round(mr.height) } : null,
      };
    });
    return { markers };
  });
  log(`\n===== /bakery embed @ ${vp.name} =====`);
  for (const m of embed.markers) log(JSON.stringify(m));
  await page.close();
}

await browser.close();
