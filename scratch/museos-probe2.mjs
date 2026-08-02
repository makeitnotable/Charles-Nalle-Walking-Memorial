#!/usr/bin/env node
// Probe 2: homepage mouse-trail + slider; detail page at scroll positions (1440 + 390);
// interaction probes (hover, press-and-hold); DOM/audio inspection on detail page.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "docs/qa/inspiration/museos";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name + ".png") });
  console.log("shot:", name);
}

// ---------- 1440 desktop ----------
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://museos.arteyeducacion.org/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3500);

// mouse trail: sweep the cursor across the hero
for (let i = 0; i <= 10; i++) {
  await page.mouse.move(200 + i * 100, 400 + Math.sin(i) * 150, { steps: 5 });
  await page.waitForTimeout(90);
}
await shot(page, "probe-home-trail--1440");

// try wheel to see if slider advances (intro layer may hand off to slider)
await page.mouse.wheel(0, 800);
await page.waitForTimeout(1500);
await page.mouse.wheel(0, 800);
await page.waitForTimeout(1500);
await shot(page, "probe-home-afterwheel--1440");

// hover a slider card (force — fixed intro overlay may still intercept)
const card = page.locator("a[href='/resurgimiento-de-la-patria']").first();
if (await card.count()) {
  await card.hover({ force: true, timeout: 5000 }).catch((e) => console.log("hover failed:", e.message.split("\n")[0]));
  await page.waitForTimeout(900);
  await shot(page, "probe-home-cardhover--1440");
}

// ---------- detail page 1440 ----------
await page.goto("https://museos.arteyeducacion.org/resurgimiento-de-la-patria", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(4000);
const detail = await page.evaluate(() => {
  const html = document.documentElement;
  const audios = [...document.querySelectorAll("audio")].map((a) => ({ src: a.currentSrc?.slice(0, 140) }));
  const audioBtns = [...document.querySelectorAll("button")].map((b) => ({
    text: b.textContent.trim().slice(0, 70),
    cls: b.className.toString().slice(0, 90),
  }));
  const sections = [...document.querySelectorAll("section")].map((s) => ({
    cls: s.className.toString().slice(0, 110),
    h: s.scrollHeight,
    firstText: s.textContent.trim().slice(0, 90),
  }));
  const sticky = [...document.querySelectorAll("*")].filter((e) => {
    const p = getComputedStyle(e).position;
    return p === "sticky";
  }).slice(0, 10).map((e) => e.tagName + "." + e.className.toString().slice(0, 60));
  const bg = getComputedStyle(document.body).backgroundColor;
  const color = getComputedStyle(document.body).color;
  return { docHeight: html.scrollHeight, audios, audioBtns, sections, sticky, bg, color, title: document.title };
});
console.log("DETAIL:", JSON.stringify(detail, null, 2));

const H = detail.docHeight;
const positions = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
for (let i = 0; i < positions.length; i++) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round((H - 900) * positions[i]));
  await page.waitForTimeout(1600);
  await shot(page, `probe-detail-scroll${i}--1440`);
}

// press-and-hold probe: mousedown in center of viewport over the artwork area, hold 1.5s
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(1200);
await page.mouse.move(720, 450);
await page.mouse.down();
await page.waitForTimeout(1500);
await shot(page, "probe-detail-presshold--1440");
await page.mouse.up();
await page.waitForTimeout(600);

// look for clickable audio/play controls and click first one
const playBtn = page.locator("button:has-text('play'), button[class*=play], [class*=audio] button, button:has-text('Escuchar'), button:has-text('escuchar')").first();
if (await playBtn.count()) {
  await playBtn.scrollIntoViewIfNeeded();
  await playBtn.click().catch(() => {});
  await page.waitForTimeout(1200);
  await shot(page, "probe-detail-audioclick--1440");
}
await page.close();

// ---------- detail page 390 mobile ----------
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("https://museos.arteyeducacion.org/resurgimiento-de-la-patria", { waitUntil: "networkidle", timeout: 60000 });
await m.waitForTimeout(4000);
const mh = await m.evaluate(() => document.documentElement.scrollHeight);
console.log("mobile detail height:", mh);
const mpos = [0, 0.2, 0.4, 0.6, 0.8];
for (let i = 0; i < mpos.length; i++) {
  await m.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round((mh - 844) * mpos[i]));
  await m.waitForTimeout(1500);
  await shot(m, `probe-detail-scroll${i}--390`);
}
await m.close();
await browser.close();
