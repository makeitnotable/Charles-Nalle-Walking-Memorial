#!/usr/bin/env node
/**
 * E4 instrument — the grayscale strip test.
 *
 * Typography has to carry the site with the paintings switched off. This
 * shoots every route with `filter: grayscale(1)` on the root, all imagery
 * hidden (img/video/canvas/background-image), and every reveal forced to its
 * finished state — so what remains is type, spacing, and hairlines. If the
 * page still reads as designed, the type system passes; if it reads as a
 * template, it fails (juror judges the shots).
 *
 * --keep-imagery leaves media visible (grayscale only) — that variant is the
 * Phase-3 map-route proof (route must read plainly without color).
 *
 * Usage: node scripts/strip.mjs <outdir> [--base URL] [--keep-imagery] [--routes /a,/b]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v5/elements/strip";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
const KEEP = args.includes("--keep-imagery");
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ROUTES = flag(
  "routes",
  "/,/bakery,/commissioners-office,/mansion,/ferry,/barbershop,/map,/people,/paintings,/about",
).split(",");
const VPS = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];

const STRIP_CSS = KEEP
  ? `html { filter: grayscale(1) !important; }`
  : `html { filter: grayscale(1) !important; }
     img, video, picture, canvas, svg image { visibility: hidden !important; }
     * { background-image: none !important; }`;

mkdirSync(outdir, { recursive: true });
const browser = await chromium.launch();
for (const vp of VPS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    const slug = route === "/" ? "home" : route.replace(/\//g, "");
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 40000 });
      await page.waitForTimeout(route.includes("map") ? 7000 : 1500);
      await page.addStyleTag({ content: STRIP_CSS });
      await page.evaluate(() => {
        document.querySelectorAll(".reveal,.reveal-quote,.lines,.home-seq").forEach((e) => {
          e.classList.add("is-in");
          e.style.opacity = "1";
          e.style.transform = "none";
        });
      });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: join(outdir, `${slug}--${vp.name}${KEEP ? "--imagery" : ""}.png`),
        fullPage: !route.includes("map"),
      });
      console.log(`✓ ${slug} @ ${vp.name}`);
    } catch (e) {
      console.error(`✗ ${slug} @ ${vp.name}: ${e.message.split("\n")[0]}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`\nstrips → ${outdir}`);
