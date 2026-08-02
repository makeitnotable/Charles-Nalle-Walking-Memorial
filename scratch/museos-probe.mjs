#!/usr/bin/env node
// Probe museos.arteyeducacion.org: tech stack, scroll technique, links, DOM structure.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "docs/qa/inspiration/museos";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const requests = [];
page.on("request", (r) => requests.push(r.url()));
await page.goto("https://museos.arteyeducacion.org/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(4000);

const info = await page.evaluate(() => {
  const libs = {
    gsap: !!window.gsap,
    gsapVersion: window.gsap?.version,
    scrollTrigger: !!window.ScrollTrigger,
    lenis: !!(window.Lenis || window.lenis),
    barba: !!window.barba,
    swup: !!window.swup,
    jquery: !!window.jQuery,
    three: !!window.THREE,
    next: !!window.__NEXT_DATA__,
    nuxt: !!window.__NUXT__,
    gatsby: !!window.___gatsby,
    webflow: !!window.Webflow,
  };
  const scripts = [...document.querySelectorAll("script[src]")].map((s) => s.src);
  const body = document.body;
  const html = document.documentElement;
  const scrollInfo = {
    docHeight: html.scrollHeight,
    bodyHeight: body.scrollHeight,
    innerHeight: window.innerHeight,
    bodyOverflow: getComputedStyle(body).overflow,
    htmlOverflow: getComputedStyle(html).overflow,
    bodyPosition: getComputedStyle(body).position,
    fixedFullscreenDivs: [...document.querySelectorAll("body > div")].map((d) => ({
      cls: d.className?.toString().slice(0, 80),
      pos: getComputedStyle(d).position,
      h: d.scrollHeight,
      overflowY: getComputedStyle(d).overflowY,
    })),
  };
  const links = [...document.querySelectorAll("a[href]")]
    .map((a) => ({ href: a.getAttribute("href"), text: a.textContent.trim().slice(0, 60) }))
    .filter((l) => l.href && !l.href.startsWith("mailto"));
  const sections = [...document.querySelectorAll("section, main > div, [class*=section]")].slice(0, 30).map((s) => ({
    tag: s.tagName,
    cls: s.className?.toString().slice(0, 100),
  }));
  const canvases = document.querySelectorAll("canvas").length;
  const videos = [...document.querySelectorAll("video")].map((v) => ({ src: v.currentSrc?.slice(0, 120), autoplay: v.autoplay, loop: v.loop }));
  const imgs = [...document.querySelectorAll("img")].slice(0, 15).map((i) => i.currentSrc?.slice(0, 140));
  const title = document.title;
  const bg = getComputedStyle(body).backgroundColor;
  const fontFams = [...new Set([...document.querySelectorAll("h1,h2,h3,p,a")].slice(0, 40).map((e) => getComputedStyle(e).fontFamily))];
  return { libs, scripts, scrollInfo, links, sections, canvases, videos, imgs, title, bg, fontFams };
});
console.log(JSON.stringify(info, null, 2));
console.log("\n--- MEDIA/CDN requests sample ---");
console.log(requests.filter((u) => /\.(mp4|webm|jpg|jpeg|png|webp|avif|mp3)/i.test(u)).slice(0, 20).join("\n"));
await browser.close();
