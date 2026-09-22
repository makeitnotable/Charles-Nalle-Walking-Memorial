import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
export const OUT = path.resolve("docs/v7/qa/juror-pass8");
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
    if (m.type() === "error" || m.type() === "warning") log.push(`[${m.type()}] ${page.url().replace(BASE, "")} ${m.text().slice(0, 300)}`);
  });
  page.on("crash", () => log.push("[CRASH] page crashed"));
  page.on("pageerror", (e) => log.push(`[pageerror] ${page.url().replace(BASE, "")} ${String(e).slice(0, 300)}`));
  page.on("requestfailed", (r) => log.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`));
  page.on("response", (r) => { if (r.status() >= 400) log.push(`[http ${r.status()}] ${r.url()}`); });
  return log;
}

export async function shot(page, name, full = false) {
  const p = path.join(OUT, name + ".png");
  try { await page.screenshot({ path: p, fullPage: full, timeout: 10000 }); } catch (e) { console.log("shot fail", name, String(e).slice(0, 100)); return null; }
  return p;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function save(name, obj) {
  fs.writeFileSync(path.join(OUT, name), typeof obj === "string" ? obj : JSON.stringify(obj, null, 2));
}

export async function go(page, route, wait = 1500) {
  await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
  await sleep(wait);
}

// Rect helper: returns bounding rect of first element matching selector or text
export async function rect(page, sel) {
  return page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, r: r.right, text: (el.textContent || "").trim().slice(0, 60) };
  }, sel);
}

export async function touchDrag(page, x1, y1, x2, y2, steps = 12, stepMs = 16) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x1, y: y1 }] });
  for (let i = 1; i <= steps; i++) {
    const x = x1 + ((x2 - x1) * i) / steps;
    const y = y1 + ((y2 - y1) * i) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await sleep(stepMs);
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

// list visible fixed/absolute UI with rects (for collision eyeballing)
export async function floating(page) {
  return page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("button, a, [role=button], .cnwm-menu, [class*=chip], [class*=pill]")) {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "absolute") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      if (cs.visibility === "hidden" || cs.opacity === "0" || cs.display === "none") continue;
      if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      out.push({ t: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  });
}
