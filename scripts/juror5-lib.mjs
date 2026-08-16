// Juror 5 — shared helpers. Visitor-only: no source reading, just the live site.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE = process.env.BASE || "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
export const OUT = path.resolve("docs/v7/qa/juror-pass5");
fs.mkdirSync(OUT, { recursive: true });

export const VPS = {
  p390: { width: 390, height: 844, mobile: true },
  p360: { width: 360, height: 800, mobile: true },
  t768: { width: 768, height: 1024, mobile: true },
  t1024: { width: 1024, height: 768, mobile: true },
  d1440: { width: 1440, height: 900, mobile: false },
  d1920: { width: 1920, height: 1080, mobile: false },
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch(extra = []) {
  return chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader", ...extra],
  });
}

export async function ctx(browser, vp, opts = {}) {
  return browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    hasTouch: !!vp.mobile,
    isMobile: !!vp.mobile,
    userAgent: vp.mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
    ...opts,
  });
}

export function watch(page) {
  const log = { errors: [], warnings: [], failed: [] };
  page.on("console", (m) => {
    if (m.type() === "error") log.errors.push(m.text().slice(0, 300));
    else if (m.type() === "warning") log.warnings.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => log.errors.push("PAGEERROR " + String(e).slice(0, 300)));
  page.on("requestfailed", (r) => log.failed.push(r.url().slice(0, 200) + " " + (r.failure()?.errorText || "")));
  page.on("response", (r) => { if (r.status() >= 400) log.failed.push(r.status() + " " + r.url().slice(0, 200)); });
  return log;
}

export async function goto(page, route, wait = "load") {
  const url = BASE + route;
  await page.goto(url, { waitUntil: wait, timeout: 60000 });
}

export async function shot(page, name, opts = {}) {
  const file = path.join(OUT, name + ".png");
  await page.screenshot({ path: file, ...opts });
  return file;
}

export function save(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 1));
}

// Real touch drag via CDP
export async function touchDrag(page, from, to, steps = 12, stepMs = 16, holdMs = 0) {
  const cdp = await page.context().newCDPSession(page);
  const pt = (x, y) => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pt(from.x, from.y)] });
  if (holdMs) await sleep(holdMs);
  for (let i = 1; i <= steps; i++) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [pt(x, y)] });
    await sleep(stepMs);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

export async function touchTap(page, x, y) {
  const cdp = await page.context().newCDPSession(page);
  const pt = (x, y) => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pt(x, y)] });
  await sleep(40);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

// rects of all fixed/sticky visible elements (floating UI)
export const FLOATING_JS = () => {
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "absolute" && cs.position !== "sticky") continue;
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    const t = (el.getAttribute("aria-label") || el.innerText || el.className?.toString() || el.tagName).toString().replace(/\s+/g, " ").trim().slice(0, 40);
    const key = `${t}|${Math.round(r.left)}|${Math.round(r.top)}|${Math.round(r.width)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ t, tag: el.tagName, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), pos: cs.position, z: cs.zIndex });
  }
  return out;
};

export function rect(b) { return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null; }
