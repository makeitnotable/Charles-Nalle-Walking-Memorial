#!/usr/bin/env node
/** Map interaction probe: marker pill spec, Take-the-walk behavior, bakery embed render. */
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// --- /map marker pill anatomy ---
await page.goto("http://localhost:4321/map", { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(8000);
const marker = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el);
  const m = document.querySelector(".mapboxgl-marker");
  if (!m) return null;
  const all = [...m.querySelectorAll("*")];
  const pill = all.find((e) => cs(e).borderRadius === "30px" || parseInt(cs(e).borderRadius) >= 20);
  const chip = all.find((e) => (cs(e).borderRadius === "50%" || cs(e).borderRadius.includes("999") || cs(e).borderRadius.includes("infinity")) && cs(e).backgroundColor !== "rgba(0, 0, 0, 0)");
  const stem = all.find((e) => e.getBoundingClientRect().width <= 3 && e.getBoundingClientRect().height >= 20);
  const label = all.find((e) => /[A-Za-z]/.test(e.textContent) && e.children.length === 0 && e !== chip?.firstChild);
  const info = (e) => e ? { tag: e.tagName, bg: cs(e).backgroundColor, color: cs(e).color, border: cs(e).borderColor + "/" + cs(e).borderWidth, radius: cs(e).borderRadius, font: cs(e).fontFamily.split(",")[0], size: cs(e).fontSize, w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height), transform: cs(e).transform } : null;
  return { pill: info(pill), chip: info(chip), stem: info(stem), label: info(label), html: m.innerHTML.slice(0, 400) };
});
console.log("marker:", JSON.stringify(marker, null, 1));

// --- Take the walk ---
const btn = page.locator("text=Take the walk").first();
if (await btn.count()) {
  await btn.click();
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => ({
    slider: !!document.querySelector(".keen-slider"),
    slides: document.querySelectorAll(".keen-slider__slide").length,
    fixedBottom: [...document.querySelectorAll("div,section,nav")].filter((e) => {
      const s = getComputedStyle(e);
      return s.position === "fixed" && parseInt(s.bottom) === 0 && e.offsetHeight > 40 && e.offsetHeight < 400;
    }).map((e) => (e.className || "").toString().slice(0, 60)),
  }));
  console.log("afterTakeWalk:", JSON.stringify(after));
  await page.screenshot({ path: "scratch/map-390-after-walk.png" });
  // active marker styles
  const active = await page.evaluate(() => {
    const cs = (el) => getComputedStyle(el);
    return [...document.querySelectorAll(".mapboxgl-marker")].map((m) => {
      const pill = [...m.querySelectorAll("*")].find((e) => parseInt(cs(e).borderRadius) >= 20);
      return pill ? { t: m.textContent.trim().slice(0, 22), bg: cs(pill).backgroundColor, color: cs(pill).color, border: cs(pill).borderColor, scale: cs(pill.closest('[style*="scale"]') || pill).transform } : null;
    });
  });
  console.log("markersAfterWalk:", JSON.stringify(active));
}

// --- bakery embedded map render ---
const p2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p2.goto("http://localhost:4321/bakery", { waitUntil: "networkidle" }).catch(() => {});
await p2.evaluate(() => document.querySelector('[aria-label="Continue the walk"], #where-heading, section:last-of-type')?.scrollIntoView());
await p2.mouse.wheel(0, 400);
await p2.waitForTimeout(9000);
const embed = await p2.evaluate(() => {
  const wraps = [...document.querySelectorAll(".mapboxgl-map")];
  return wraps.map((w) => ({
    box: (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(w.getBoundingClientRect()),
    markers: [...w.querySelectorAll(".mapboxgl-marker")].map((m) => m.textContent.trim().slice(0, 20)),
  }));
});
console.log("bakeryEmbed:", JSON.stringify(embed));
await p2.screenshot({ path: "scratch/bakery-390-embed.png" });

await browser.close();
