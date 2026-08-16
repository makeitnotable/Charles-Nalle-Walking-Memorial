import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
export const OUT = path.resolve("docs/v7/qa/juror-pass10");
fs.mkdirSync(OUT, { recursive: true });

export const VIEWPORTS = {
  p390: { width: 390, height: 844, mobile: true },
  p360: { width: 360, height: 800, mobile: true },
  t768: { width: 768, height: 1024, mobile: true },
  t1024: { width: 1024, height: 768, mobile: false },
  d1440: { width: 1440, height: 900, mobile: false },
  d1920: { width: 1920, height: 1080, mobile: false },
};

export async function launch(extra = {}) {
  return chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"],
    ...extra,
  });
}

export async function ctx(browser, vp, opts = {}) {
  const c = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: opts.dpr ?? (vp.mobile ? 2 : 1),
    hasTouch: !!vp.mobile,
    isMobile: !!vp.mobile,
    reducedMotion: opts.reducedMotion ?? "no-preference",
    userAgent: vp.mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
  });
  return c;
}

export function watchConsole(page, label, sink) {
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") sink.push({ label, type: m.type(), text: m.text().slice(0, 300) });
  });
  page.on("pageerror", (e) => sink.push({ label, type: "pageerror", text: String(e).slice(0, 300) }));
}

export async function shot(page, name, opts = {}) {
  const p = path.join(OUT, name + ".png");
  await page.screenshot({ path: p, ...opts });
  return p;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function overflow(page) {
  return page.evaluate(() => {
    const iw = window.innerWidth;
    const bad = [];
    const all = document.querySelectorAll("body *");
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.position === "fixed") continue;
      if (r.right > iw + 1 && r.left < iw) {
        // check any ancestor with overflow hidden/clip/auto that would clip
        let a = el.parentElement, clipped = false;
        while (a) { const s = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) { clipped = true; break; } a = a.parentElement; }
        if (!clipped) bad.push({ tag: el.tagName, cls: (el.className && el.className.baseVal === undefined ? el.className : "").toString().slice(0, 60), right: Math.round(r.right), text: (el.textContent || "").trim().slice(0, 40) });
      }
    }
    return { bodyScrollWidth: document.body.scrollWidth, docScrollWidth: document.documentElement.scrollWidth, innerWidth: iw, offenders: bad.slice(0, 15) };
  });
}

// touch helpers via CDP
export async function touchDrag(page, x1, y1, x2, y2, steps = 20, ms = 300) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x1, y: y1 }] });
  for (let i = 1; i <= steps; i++) {
    const x = x1 + ((x2 - x1) * i) / steps, y = y1 + ((y2 - y1) * i) / steps;
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
