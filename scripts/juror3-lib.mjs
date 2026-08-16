// juror3 shared helpers — fresh-eyed juror pass 3 (live GH Pages build 3396185)
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
export const OUT = path.resolve("docs/v7/qa/juror-pass3");
fs.mkdirSync(OUT, { recursive: true });

export const VIEWPORTS = {
  p390: { width: 390, height: 844, mobile: true },
  p360: { width: 360, height: 800, mobile: true },
  land: { width: 844, height: 390, mobile: true },
  t768: { width: 768, height: 1024, mobile: true },
  t1024: { width: 1024, height: 768, mobile: true },
  d1440: { width: 1440, height: 900, mobile: false },
  d1920: { width: 1920, height: 1080, mobile: false },
  zoom200: { width: 720, height: 450, mobile: false },
};

export async function launch(opts = {}) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", ...(opts.args || [])],
  });
  return browser;
}

export async function newPage(browser, vpKey, extra = {}) {
  const vp = VIEWPORTS[vpKey];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: extra.dpr ?? (vp.mobile ? 2 : 1),
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    reducedMotion: extra.reducedMotion || "no-preference",
    userAgent: vp.mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
    ...extra.ctx,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[console.error] ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
  page.on("requestfailed", (r) => {
    const u = r.url();
    if (!u.includes("mapbox") && !u.includes("google")) errors.push(`[reqfail] ${u} ${r.failure()?.errorText}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().startsWith(BASE)) errors.push(`[http ${r.status()}] ${r.url()}`);
  });
  page.__errors = errors;
  page.__vp = vpKey;
  return page;
}

export async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: !!opts.fullPage, ...opts });
  console.log("  shot", path.relative(process.cwd(), file));
  return file;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function goto(page, route, opts = {}) {
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000, ...opts });
}

export function log(...a) {
  console.log(...a);
}

export function report(page, label) {
  const e = page.__errors || [];
  console.log(`  console/net errors @${label}: ${e.length}` + (e.length ? "\n    " + e.slice(0, 12).join("\n    ") : ""));
  return e.length;
}

// CDP touch helpers (real touch drags on mobile contexts)
export async function cdp(page) {
  return page.context().newCDPSession(page);
}
export async function touchDrag(session, from, to, steps = 12, holdMs = 0) {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from.x, y: from.y }] });
  if (holdMs) await sleep(holdMs);
  for (let i = 1; i <= steps; i++) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await sleep(16);
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
export async function touchTap(session, x, y) {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await sleep(40);
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
