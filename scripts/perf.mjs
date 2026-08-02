#!/usr/bin/env node
/**
 * Phase 5 performance gate: Lighthouse mobile (throttled 4G) on the routes
 * that matter — home, one chapter (the QR path), the map.
 *
 * Usage: node scripts/perf.mjs [--base http://localhost:4321] [--routes /,/bakery,/map] [--out docs/qa/phase5]
 * Bars (docs/PLAN.md): perf ≥90, a11y ≥95, LCP <2.5s on chapter pages.
 */
import fs from "node:fs";
import path from "node:path";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ROUTES = flag("routes", "/,/bakery,/map").split(",");
const OUT = flag("out", "docs/qa/phase5");
fs.mkdirSync(OUT, { recursive: true });

const chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
const results = [];

for (const route of ROUTES) {
  const url = BASE + route;
  const slug = route === "/" ? "home" : route.replace(/\//g, "");
  const { lhr } = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    formFactor: "mobile",
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2 },
    throttlingMethod: "simulate",
    onlyCategories: ["performance", "accessibility", "best-practices"],
  });
  const row = {
    route,
    performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((lhr.categories["best-practices"]?.score ?? 0) * 100),
    lcp_s: +(lhr.audits["largest-contentful-paint"]?.numericValue / 1000).toFixed(2),
    cls: +(lhr.audits["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(3),
    tbt_ms: Math.round(lhr.audits["total-blocking-time"]?.numericValue ?? 0),
    transfer_kb: Math.round(
      (lhr.audits["total-byte-weight"]?.numericValue ?? 0) / 1024,
    ),
  };
  results.push(row);
  fs.writeFileSync(path.join(OUT, `lighthouse-${slug}.json`), JSON.stringify(lhr, null, 1));
  console.log(
    `${slug}: perf ${row.performance} a11y ${row.accessibility} bp ${row.bestPractices} LCP ${row.lcp_s}s CLS ${row.cls} TBT ${row.tbt_ms}ms ${row.transfer_kb}KB`,
  );
}

await chrome.kill();
fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(results, null, 2));

const fails = results.filter(
  (r) => r.performance < 90 || r.accessibility < 95 || (r.route !== "/map" && r.lcp_s >= 2.5),
);
if (fails.length) {
  console.error(`\n${fails.length} route(s) below bar:`, fails.map((f) => f.route).join(", "));
  process.exit(1);
}
console.log("\nAll routes at or above the bar ✓");
