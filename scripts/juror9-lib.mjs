// juror9 helpers — visitor-side only (no site source read).
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE = process.env.J9_BASE || "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
export const OUT = path.resolve(process.cwd(), "docs/v7/qa/juror-pass9");
fs.mkdirSync(OUT, { recursive: true });

export const VIEWPORTS = {
  p390: { width: 390, height: 844, mobile: true },
  p360: { width: 360, height: 800, mobile: true },
  p430: { width: 430, height: 932, mobile: true },
  p414: { width: 414, height: 896, mobile: true },
  t768: { width: 768, height: 1024, mobile: true },
  t1024: { width: 1024, height: 768, mobile: true },
  d1440: { width: 1440, height: 900, mobile: false },
  d1920: { width: 1920, height: 1080, mobile: false },
  z720: { width: 720, height: 450, mobile: false },
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch(vp, opts = {}) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", "--mute-audio"],
  });
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: opts.dpr ?? (vp.mobile ? 2 : 1),
    hasTouch: !!vp.mobile,
    isMobile: !!vp.mobile,
    reducedMotion: opts.reducedMotion || "no-preference",
    userAgent: vp.mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push({ url: page.url(), text: m.text().slice(0, 300) });
  });
  page.on("pageerror", (e) => errors.push({ url: page.url(), text: "PAGEERROR " + String(e).slice(0, 300) }));
  return { browser, ctx, page, errors };
}

export async function goto(page, route, wait = 1500) {
  await page.goto(BASE + route, { waitUntil: "load" });
  await sleep(wait);
}

export async function shot(page, name, full = false) {
  const p = path.join(OUT, name + ".png");
  await page.screenshot({ path: p, fullPage: full });
  return p;
}

// Real touch drag via CDP
export async function touchDrag(page, x0, y0, x1, y1, steps = 12, holdMs = 0, stepMs = 16) {
  const cdp = await page.context().newCDPSession(page);
  const tp = (x, y) => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [tp(x0, y0)] });
  if (holdMs) await sleep(holdMs);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [tp(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)],
    });
    await sleep(stepMs);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

export async function touchTap(page, x, y) {
  const cdp = await page.context().newCDPSession(page);
  const tp = (x, y) => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [tp(x, y)] });
  await sleep(40);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

// find visible element by text (buttons/links)
export async function byText(page, text, role = "button, a, [role=button]") {
  const els = page.locator(role, { hasText: text });
  const n = await els.count();
  for (let i = 0; i < n; i++) {
    const el = els.nth(i);
    if (await el.isVisible()) return el;
  }
  return null;
}

export async function rectOf(el) {
  const b = await el.boundingBox();
  return b;
}

// list of visible fixed/absolute UI with rects (for "what's on screen" notes)
export async function floating(page) {
  return page.evaluate(() => {
    const out = [];
    const vw = innerWidth, vh = innerHeight;
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
      const t = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50);
      out.push({ tag: el.tagName.toLowerCase(), cls: (el.className?.baseVal ?? el.className ?? "").toString().slice(0, 60), t, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  });
}

export function log(...a) {
  console.log(...a);
}

export function saveJson(name, data) {
  fs.writeFileSync(path.join(OUT, name + ".json"), JSON.stringify(data, null, 2));
}
