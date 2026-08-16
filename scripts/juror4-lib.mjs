import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
export const OUT = path.resolve("docs/v7/qa/juror-pass4");
fs.mkdirSync(OUT, { recursive: true });

export const VPS = {
  p390: { width: 390, height: 844, mobile: true },
  p360: { width: 360, height: 800, mobile: true },
  t768: { width: 768, height: 1024, mobile: true },
  t1024: { width: 1024, height: 768, mobile: false },
  d1440: { width: 1440, height: 900, mobile: false },
  d1920: { width: 1920, height: 1080, mobile: false },
  land: { width: 844, height: 390, mobile: true },
  z200: { width: 720, height: 450, mobile: false },
};

export async function launch(extra = {}) {
  return chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader"],
    ...extra,
  });
}

export async function ctx(browser, vp, opts = {}) {
  return browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    hasTouch: !!vp.mobile,
    isMobile: !!vp.mobile,
    ...opts,
  });
}

export function watch(page, log = []) {
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") log.push(`[${m.type()}] ${m.text().slice(0, 300)}`);
  });
  page.on("crash", () => log.push("[CRASH] page crashed"));
  page.on("pageerror", (e) => log.push(`[pageerror] ${String(e).slice(0, 300)}`));
  page.on("requestfailed", (r) => log.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`));
  page.on("response", (r) => { if (r.status() >= 400) log.push(`[http ${r.status()}] ${r.url()}`); });
  return log;
}

export async function shot(page, name, full = false) {
  const p = path.join(OUT, name + ".png");
  try { await page.screenshot({ path: p, fullPage: full, timeout: 10000 }); } catch (e) { return null; }
  return p;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function save(name, obj) {
  fs.writeFileSync(path.join(OUT, name), typeof obj === "string" ? obj : JSON.stringify(obj, null, 2));
}

// Real touch drag through CDP
export async function touchDrag(page, x0, y0, x1, y1, steps = 12, ms = 240) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps, y = y0 + ((y1 - y0) * i) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await sleep(ms / steps);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
export async function touchTap(page, x, y) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await sleep(40);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

export async function goto(page, route, opts = {}) {
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000, ...opts });
}

// Summarise the visible floating UI (fixed/absolute-with-high-z) elements
export async function floating(page) {
  return page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || cs.visibility === "hidden" || cs.opacity === "0" || cs.display === "none") continue;
      if (r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) continue;
      out.push({ tag: el.tagName.toLowerCase(), cls: (el.className?.baseVal ?? el.className ?? "").toString().slice(0, 60), text: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 40), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  });
}
