#!/usr/bin/env node
// Probe 3: press-and-hold reveal inside the pinned detail-tour section + rolling date digits.
import { chromium } from "playwright";
import { join } from "node:path";

const OUT = "docs/qa/inspiration/museos";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://museos.arteyeducacion.org/resurgimiento-de-la-patria", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3500);

// Find the inverted press-hold section and scroll into it
const secTop = await page.evaluate(() => {
  const sec = [...document.querySelectorAll("section")].find((s) => s.className.includes("user-select-none"));
  return sec ? sec.getBoundingClientRect().top + window.scrollY : null;
});
console.log("tour section top:", secTop);
await page.evaluate((y) => window.scrollTo({ top: y + 50, behavior: "instant" }), secTop);
await page.waitForTimeout(1800);
await page.screenshot({ path: join(OUT, "probe-tour-before-hold--1440.png") });

await page.mouse.move(720, 500);
await page.mouse.down();
await page.waitForTimeout(1800);
await page.screenshot({ path: join(OUT, "probe-tour-during-hold--1440.png") });
await page.mouse.up();
await page.waitForTimeout(1000);
await page.screenshot({ path: join(OUT, "probe-tour-after-hold--1440.png") });

// Rolling date digits section
const dateTop = await page.evaluate(() => {
  const sec = [...document.querySelectorAll("section")].find((s) => s.textContent.includes("Fecha de la obra"));
  return sec ? sec.getBoundingClientRect().top + window.scrollY : null;
});
console.log("date section top:", dateTop);
await page.evaluate((y) => window.scrollTo({ top: y - 250, behavior: "instant" }), dateTop);
await page.waitForTimeout(2500);
await page.screenshot({ path: join(OUT, "probe-date-digits--1440.png") });

// what drives the tour? inspect inline styles inside the tour section
const tourDom = await page.evaluate(() => {
  const sec = [...document.querySelectorAll("section")].find((s) => s.className.includes("user-select-none"));
  if (!sec) return null;
  const kids = [...sec.querySelectorAll("*")].slice(0, 40).map((e) => ({
    tag: e.tagName,
    cls: e.className?.toString?.().slice(0, 80),
    style: e.getAttribute("style")?.slice(0, 120),
  })).filter((k) => k.style);
  return kids;
});
console.log(JSON.stringify(tourDom, null, 2));
await browser.close();
