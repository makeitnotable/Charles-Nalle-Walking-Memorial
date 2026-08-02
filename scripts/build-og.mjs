#!/usr/bin/env node
/**
 * Regenerates public/og.png to the v4 lockup: the interlocked wordmark, the
 * date rule, and the meta line — the same three-stack the home page opens on.
 * Rendered from the real fonts via Playwright so it cannot drift from the site.
 *
 * Usage: node scripts/build-og.mjs   (run from the repo root)
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const font = (p) => readFileSync(`node_modules/@fontsource/${p}`).toString("base64");
const sansB = font("martel-sans/files/martel-sans-latin-800-normal.woff2");
const poppins = font("poppins/files/poppins-latin-500-normal.woff2");
const bg = readFileSync("public/media/site/home-bg-800.avif").toString("base64");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:MS;src:url(data:font/woff2;base64,${sansB}) format('woff2');font-weight:800}
@font-face{font-family:PP;src:url(data:font/woff2;base64,${poppins}) format('woff2');font-weight:500}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#1d1411;position:relative;overflow:hidden;
  display:flex;align-items:center;justify-content:center}
.bg{position:absolute;inset:0;background:url(data:image/avif;base64,${bg}) center/cover;
  filter:grayscale(100%) brightness(.5) sepia(.1);opacity:.42}
.wrap{position:relative;display:flex;flex-direction:column;align-items:center;gap:26px}
.wm{font-family:MS;font-weight:800;font-size:132px;line-height:.88;letter-spacing:-.03em;
  text-transform:uppercase;color:#f6f3ee}
.two{display:flex;flex-direction:column}
.two span:last-child{align-self:flex-end;margin-top:-.06em}
.rule{display:flex;align-items:center;gap:14px;font-family:PP;font-weight:500;font-size:15px;
  letter-spacing:.1em;text-transform:uppercase;color:#ff9770}
.rule i{display:block;width:44px;height:1px;background:#e45b27}
.meta{font-family:PP;font-weight:500;font-size:15px;letter-spacing:.1em;text-transform:uppercase;
  color:#b7b3ab;margin-top:6px}
</style></head><body>
<div class="bg"></div>
<div class="wrap">
  <div class="wm two"><span>Charles</span><span>Nalle</span></div>
  <div class="rule"><span>1821</span><i></i><span>1875</span></div>
  <div class="meta">Walking Memorial · Troy, NY · April 27, 1860</div>
</div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.setContent(html, { waitUntil: "load" });
await p.waitForTimeout(600);
const raw = await p.screenshot();
await b.close();
// A 1200×630 photographic PNG lands near 450KB unquantised; the palette
// version is visually identical at a fifth of the weight and social scrapers
// fetch it on every share.
const sharp = (await import("sharp")).default;
await sharp(raw).png({ palette: true, quality: 88, effort: 9 }).toFile("public/og.png");
console.log("build-og: public/og.png written");
