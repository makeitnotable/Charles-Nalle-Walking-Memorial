#!/usr/bin/env node
/**
 * Phase 2+3 QA smoke: page weight + map-bundle isolation.
 *  - /bakery at 390 (network idle, no scroll): total bytes + request count
 *  - mapbox-gl must NOT load on /, /people, /paintings, /about (even after
 *    full scroll); /bakery loads it legitimately for the embedded map when
 *    the "where to next" section scrolls into view.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:4321";
const browser = await chromium.launch();

async function measure(route, { scroll = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const entries = [];
  page.on("response", async (r) => {
    let bytes = 0;
    try {
      const b = await r.body();
      bytes = b.length;
    } catch { /* 204s, redirects */ }
    const cl = Number(r.headers()["content-length"] ?? 0);
    entries.push({ url: r.url(), status: r.status(), bytes, cl, type: r.request().resourceType() });
  });
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  if (scroll) {
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += 500) {
        window.scrollTo(0, y);
        await new Promise((res) => setTimeout(res, 150));
      }
    });
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }
  await context.close();
  const total = entries.reduce((s, e) => s + (e.bytes || e.cl), 0);
  const transfer = entries.reduce((s, e) => s + (e.cl || e.bytes), 0);
  const mapbox = entries.filter((e) => /mapbox/i.test(e.url));
  return { route, count: entries.length, total, transfer, mapbox, entries };
}

const fmt = (n) => `${(n / 1024).toFixed(0)} KB (${n.toLocaleString()} B)`;

// 1. /bakery weight at 390, initial load (network idle, no scroll)
const bakery = await measure("/bakery");
console.log(`\n/bakery @390 initial (network idle):`);
console.log(`  requests: ${bakery.count}`);
console.log(`  total body bytes: ${fmt(bakery.total)}`);
console.log(`  total content-length: ${fmt(bakery.transfer)}`);
console.log(`  mapbox requests on initial load: ${bakery.mapbox.length}`);
for (const m of bakery.mapbox) console.log(`    ${m.status} ${m.url}`);
console.log(`  top 10 heaviest:`);
for (const e of [...bakery.entries].sort((a, b) => (b.bytes || b.cl) - (a.bytes || a.cl)).slice(0, 10)) {
  console.log(`    ${fmt(e.bytes || e.cl).padStart(10)}  [${e.type}] ${e.url.replace(BASE, "")}`);
}

// 2. /bakery after full scroll — does the embed map (legitimately) load?
const bakeryScrolled = await measure("/bakery", { scroll: true });
const bakeryMapboxJs = bakeryScrolled.mapbox.filter((m) => /mapbox-gl.*\.js|\.js.*mapbox|mapbox.*chunk/i.test(m.url) || (m.type === "script" && /mapbox/i.test(m.url)));
console.log(`\n/bakery @390 after full scroll: ${bakeryScrolled.count} requests, mapbox-related: ${bakeryScrolled.mapbox.length}`);
for (const m of bakeryScrolled.mapbox.slice(0, 8)) console.log(`    ${m.status} [${m.type}] ${m.url.substring(0, 120)}`);

// 3. Non-map routes must never pull mapbox
for (const route of ["/", "/people", "/paintings", "/about"]) {
  const r = await measure(route, { scroll: true });
  const verdict = r.mapbox.length === 0 ? "CLEAN" : "VIOLATION";
  console.log(`\n${route} @390 full scroll: ${r.count} requests — mapbox: ${r.mapbox.length} [${verdict}]`);
  for (const m of r.mapbox) console.log(`    ${m.status} [${m.type}] ${m.url.substring(0, 140)}`);
}

await browser.close();
