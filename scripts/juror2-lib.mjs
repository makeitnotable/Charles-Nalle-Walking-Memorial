import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
export const OUT = path.resolve("docs/v7/qa/juror-pass2");
fs.mkdirSync(OUT, { recursive: true });

export const VPS = {
  p390: { width: 390, height: 844, mobile: true },
  p360: { width: 360, height: 800, mobile: true },
  land: { width: 844, height: 390, mobile: true },
  t768: { width: 768, height: 1024, mobile: true },
  t1024: { width: 1024, height: 768, mobile: true },
  d1440: { width: 1440, height: 900, mobile: false },
  d1920: { width: 1920, height: 1080, mobile: false },
};

export async function launch(extra = {}) {
  return chromium.launch({
    headless: true,
    ...(process.env.JUROR_CHROME ? { channel: "chrome" } : {}),
    args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader"],
    ...extra,
  });
}

export async function ctx(browser, vp, opts = {}) {
  const c = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    hasTouch: !!vp.mobile,
    isMobile: !!vp.mobile,
    ...opts,
  });
  return c;
}

export function watchConsole(page, tag, sink) {
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") sink.push(`[${tag}] ${m.type()}: ${m.text().slice(0, 300)}`);
  });
  page.on("pageerror", (e) => sink.push(`[${tag}] pageerror: ${String(e).slice(0, 300)}`));
  page.on("requestfailed", (r) => sink.push(`[${tag}] reqfail: ${r.url().slice(0, 200)} ${r.failure()?.errorText}`));
  page.on("response", (r) => {
    if (r.status() >= 400) sink.push(`[${tag}] http${r.status()}: ${r.url().slice(0, 200)}`);
  });
}

export async function shot(page, name, opts = {}) {
  const p = path.join(OUT, name + ".png");
  await page.screenshot({ path: p, ...opts });
  return p;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function go(page, route, wait = 1500) {
  await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
  await sleep(wait);
}

export function log(...a) {
  console.log(...a);
}
