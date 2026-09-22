import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
export const OUT = path.resolve("docs/v7/qa/juror-pass7");
fs.mkdirSync(OUT, { recursive: true });

export const VIEWPORTS = {
  "390": { width: 390, height: 844, mobile: true },
  "360": { width: 360, height: 800, mobile: true },
  "768": { width: 768, height: 1024, mobile: true },
  "1024": { width: 1024, height: 768, mobile: false },
  "1440": { width: 1440, height: 900, mobile: false },
  "1920": { width: 1920, height: 1080, mobile: false },
  "720z": { width: 720, height: 450, mobile: false },
};

export async function launch(extra = {}) {
  return chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader"],
    ...extra,
  });
}

export async function ctx(browser, vp, extra = {}) {
  const v = VIEWPORTS[vp];
  const c = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: v.mobile ? 2 : 1,
    hasTouch: !!v.mobile,
    isMobile: !!v.mobile,
    ...extra,
  });
  return c;
}

export function attachConsole(page, tag, sink) {
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") sink.push({ tag, type: m.type(), text: m.text().slice(0, 300) });
  });
  page.on("pageerror", (e) => sink.push({ tag, type: "pageerror", text: String(e).slice(0, 300) }));
  page.on("requestfailed", (r) => sink.push({ tag, type: "requestfailed", text: r.url().slice(0, 200) + " " + (r.failure()?.errorText || "") }));
}

export async function shot(page, name, opts = {}) {
  const p = path.join(OUT, name + ".png");
  await page.screenshot({ path: p, ...opts });
  return p;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function goto(page, route, opts = {}) {
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000, ...opts });
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

export function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT, name + ".json"), JSON.stringify(data, null, 2));
}
