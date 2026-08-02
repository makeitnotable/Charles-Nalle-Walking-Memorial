#!/usr/bin/env node
/**
 * Phase 6 FINAL probe #2: exact pill-label element enumeration + /people h1 raw HTML.
 */
import { chromium } from "playwright";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(8000);
  const data = await page.evaluate(() => {
    const markers = [...document.querySelectorAll(".mapboxgl-marker")].slice(0, 2);
    return markers.map((m) => {
      const els = [...m.querySelectorAll("*")].map((el) => {
        const s = getComputedStyle(el);
        const ownText = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
        return {
          tag: el.tagName,
          cls: (el.className || "").toString().slice(0, 60),
          ownText: ownText.slice(0, 26),
          fs: s.fontSize,
          pad: s.padding,
          bg: s.backgroundColor,
          border: s.borderColor + "/" + s.borderWidth,
          radius: s.borderRadius.slice(0, 12),
          transform: s.transform === "none" ? "" : s.transform.slice(0, 40),
          w: Math.round(el.getBoundingClientRect().width),
          h: Math.round(el.getBoundingClientRect().height),
        };
      });
      return { html: m.outerHTML.slice(0, 1200), els };
    });
  });
  console.log(`\n===== /map marker DOM @ ${vp.name} =====`);
  for (const m of data) {
    console.log("HTML:", m.html.replace(/\n/g, " "));
    for (const e of m.els) console.log("  EL", JSON.stringify(e));
  }
  await page.close();
}

// /people h1 raw HTML + visible-line reconstruction excluding sr-only
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + "/people", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const h1 = await page.evaluate(() => {
    const el = document.querySelector("main h1, h1");
    if (!el) return null;
    const visWords = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      // skip visually hidden ancestors
      let p = node.parentElement, hidden = false;
      while (p && p !== el.parentElement) {
        const s = getComputedStyle(p);
        if (s.position === "absolute" && (parseInt(s.width) <= 1 || s.clipPath !== "none" || s.clip !== "auto")) hidden = true;
        if (s.display === "none" || s.visibility === "hidden") hidden = true;
        p = p.parentElement;
      }
      if (hidden) continue;
      const txt = node.textContent;
      let m; const re = /\S+/g;
      while ((m = re.exec(txt))) {
        const range = document.createRange();
        range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0) visWords.push({ w: m[0], top: Math.round(rect.top) });
      }
    }
    const lines = [];
    for (const w of visWords) {
      const line = lines.find((l) => Math.abs(l.top - w.top) < 6);
      if (line) line.words.push(w.w); else lines.push({ top: w.top, words: [w.w] });
    }
    lines.sort((a, b) => a.top - b.top);
    return {
      outerHTML: el.outerHTML,
      visibleLines: lines.map((l) => l.words.join(" ")),
      lastCount: lines.length ? lines.at(-1).words.length : null,
    };
  });
  console.log(`\n===== /people h1 raw @ 390 =====`);
  console.log(JSON.stringify(h1, null, 2));
  await page.close();
}

await browser.close();
