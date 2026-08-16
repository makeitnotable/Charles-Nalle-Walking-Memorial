// juror 11 — shared helpers (live site, fresh-eyes visitor pass)
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
export const OUT = path.resolve("docs/v7/qa/juror-pass11");
fs.mkdirSync(OUT, { recursive: true });

export const VPS = {
  p390: { width: 390, height: 844, mobile: true },
  p360: { width: 360, height: 800, mobile: true },
  land: { width: 844, height: 390, mobile: true },
  t768: { width: 768, height: 1024, mobile: true },
  t1024: { width: 1024, height: 768, mobile: false },
  d1440: { width: 1440, height: 900, mobile: false },
  d1920: { width: 1920, height: 1080, mobile: false },
  z720: { width: 720, height: 450, mobile: false },
};

export async function launch(extra = {}) {
  return chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader"],
    ...extra,
  });
}

export async function ctx(browser, vp, opts = {}) {
  const c = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: opts.dpr ?? (vp.mobile ? 2 : 1),
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
    reducedMotion: opts.reducedMotion ?? "no-preference",
    userAgent: vp.mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
    ...opts.ctx,
  });
  return c;
}

export function watchConsole(page, tag) {
  const errs = [];
  page.on("console", (m) => {
    if (m.type() === "error") errs.push(`[${tag}] ${m.text().slice(0, 200)}`);
  });
  page.on("pageerror", (e) => errs.push(`[${tag}] PAGEERROR ${String(e).slice(0, 200)}`));
  return errs;
}

export async function shot(page, name, opts = {}) {
  const p = path.join(OUT, name + ".png");
  await page.screenshot({ path: p, ...opts });
  return p;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function goto(page, route, wait = 1200) {
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 }).catch(async () => {
    await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
  });
  await sleep(wait);
}

// Horizontal overflow: body.scrollWidth AND every element's right edge vs innerWidth
export async function overflowCheck(page) {
  return page.evaluate(() => {
    const iw = innerWidth;
    const out = { bodySW: document.body.scrollWidth, docSW: document.documentElement.scrollWidth, iw, offenders: [] };
    const all = document.querySelectorAll("body *");
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > iw + 1 && cs.visibility !== "hidden" && cs.opacity !== "0") {
        // ignore things intentionally offscreen inside overflow-hidden containers
        let p = el.parentElement, clipped = false;
        while (p && p !== document.body) {
          const pcs = getComputedStyle(p);
          if (/(hidden|clip|auto|scroll)/.test(pcs.overflowX) || /(hidden|clip|auto|scroll)/.test(pcs.overflow)) { clipped = true; break; }
          p = p.parentElement;
        }
        if (!clipped) out.offenders.push({ tag: el.tagName, cls: (el.className && el.className.baseVal === undefined ? el.className : "").toString().slice(0, 60), right: Math.round(r.right), text: (el.textContent || "").trim().slice(0, 40) });
      }
    }
    out.offenders = out.offenders.slice(0, 12);
    return out;
  });
}

// CDP touch helpers
export async function cdp(page) {
  return page.context().newCDPSession(page);
}
export async function touchDrag(session, from, to, steps = 12, stepMs = 16) {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from.x, y: from.y }] });
  for (let i = 1; i <= steps; i++) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await sleep(stepMs);
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
export async function touchTap(session, x, y) {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await sleep(40);
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

export function log(...a) {
  console.log(...a);
}
export function rect(r) {
  return r ? `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}` : "none";
}
