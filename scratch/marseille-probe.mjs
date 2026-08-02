#!/usr/bin/env node
// Probe marseille.laphase5.com/en: wait out loader, dump tech, step through UI.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "docs/qa/inspiration/marseille";
mkdirSync(OUT, { recursive: true });

const vpName = process.argv[2] === "390" ? "390" : "1440";
const vp = vpName === "390" ? { width: 390, height: 844 } : { width: 1440, height: 900 };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const log = [];
const say = (s) => { log.push(s); console.log(s); };

const reqs = [];
page.on("request", (r) => reqs.push(r.url()));

await page.goto("https://marseille.laphase5.com/en", { waitUntil: "domcontentloaded", timeout: 60000 });

// Wait for loader to finish: poll body text for a lone number, up to 90s
say("waiting for loader...");
try {
  await page.waitForFunction(
    () => {
      const t = document.body.innerText.trim();
      return t.length > 8 && !/^\d+\s*%?$/.test(t);
    },
    { timeout: 90000, polling: 1000 }
  );
} catch { say("loader wait timed out"); }
await page.waitForTimeout(4000);
await page.screenshot({ path: join(OUT, `probe-${vpName}-01-loaded.png`) });

// Tech dump
const tech = await page.evaluate(() => {
  const scripts = [...document.querySelectorAll("script[src]")].map((s) => s.src);
  const canvases = [...document.querySelectorAll("canvas")].map((c) => {
    let kind = "none";
    for (const t of ["webgl2", "webgl", "2d"]) {
      try { if (c.getContext(t)) { kind = t; break; } } catch {}
    }
    return { w: c.width, h: c.height, cls: c.className, kind };
  });
  return {
    scripts,
    canvases,
    audio: document.querySelectorAll("audio").length,
    video: document.querySelectorAll("video").length,
    globals: ["THREE", "PIXI", "mapboxgl", "maplibregl", "L", "gsap", "Howl", "Howler", "__NUXT__", "__NEXT_DATA__"].filter((g) => g in window),
    title: document.title,
    bodyText: document.body.innerText.slice(0, 1500),
  };
});
say("TECH: " + JSON.stringify(tech, null, 2));

// List clickable things
async function listUI(tag) {
  const ui = await page.evaluate(() => {
    const els = [...document.querySelectorAll("button, a, [role=button], [class*=btn], [class*=Button]")];
    return els
      .filter((e) => e.offsetParent !== null || getComputedStyle(e).position === "fixed")
      .map((e) => ({ tag: e.tagName, text: (e.innerText || e.getAttribute("aria-label") || "").trim().slice(0, 60), cls: String(e.className).slice(0, 80) }))
      .filter((e) => e.text || e.cls);
  });
  say(`UI[${tag}]: ` + JSON.stringify(ui.slice(0, 40), null, 1));
  return ui;
}
await listUI("loaded");

// Try to advance: click likely CTA buttons in sequence, screenshot each state
const ctas = [
  /start|begin|explore|discover|enter|continue|skip|next|c'est parti|let's go|go/i,
];
for (let step = 2; step <= 8; step++) {
  const clicked = await page.evaluate((patSrc) => {
    const pat = new RegExp(patSrc, "i");
    const els = [...document.querySelectorAll("button, a, [role=button], [class*=btn]")].filter(
      (e) => e.offsetParent !== null
    );
    // prefer explicit CTA text
    let target = els.find((e) => pat.test(e.innerText || e.getAttribute("aria-label") || ""));
    if (!target) target = els.find((e) => (e.innerText || "").trim().length > 0 && (e.innerText || "").trim().length < 40);
    if (target) {
      const label = (target.innerText || target.getAttribute("aria-label") || target.className).trim().slice(0, 60);
      target.click();
      return label;
    }
    return null;
  }, "start|begin|explore|discover|enter|continue|skip|next|let.s go|go|commencer|passer");
  if (!clicked) { say(`step ${step}: nothing to click`); break; }
  say(`step ${step}: clicked "${clicked}"`);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: join(OUT, `probe-${vpName}-0${step}-after-${clicked.replace(/[^a-z0-9]+/gi, "_").slice(0, 20)}.png`) });
  await listUI(`step${step}`);
}

// Network summary: what asset types loaded
const summary = {};
for (const u of reqs) {
  const ext = (u.split("?")[0].match(/\.(\w{2,5})$/) || [])[1] || "other";
  summary[ext] = (summary[ext] || 0) + 1;
}
say("REQS by ext: " + JSON.stringify(summary));
say("SAMPLE glb/ktx/basis/mp3: " + JSON.stringify(reqs.filter((u) => /\.(glb|gltf|ktx2?|basis|mp3|ogg|aac|m4a|hdr|draco|bin)(\?|$)/.test(u)).slice(0, 25), null, 1));

writeFileSync(join(OUT, `probe-${vpName}-log.txt`), log.join("\n\n"));
await browser.close();
