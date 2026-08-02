// Phase 6 FINAL — addendum probes:
// A. tap the VISIBLE Ferry pill (nearest the relocated hint) — must focus stop 4
// B. drag the map after settle — does the hint auto-dismiss on first map touch?
// C. /ferry burger position over time (probe1 saw it offscreen at 2.2s)
// D. glyph-level: press-hold hint line boxes vs burger rect
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const OUT = fileURLToPath(new URL("../docs/qa/phase6-ux/", import.meta.url));
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log("[FIX2]", ...a);
const browser = await chromium.launch({ headless: true });
const newCtx = () =>
  browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

const hintState = (page) =>
  page.evaluate(() => {
    const hintP = [...document.querySelectorAll("p")].find((p) => /Drag to explore/.test(p.textContent));
    return { hintPresent: !!hintP, url: location.pathname + location.search };
  });

// ————— A: tap the visible Ferry pill —————
{
  const ctx = await newCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(9000);
  const ferry = await page.evaluate(() => {
    const m = [...document.querySelectorAll(".mapboxgl-marker")].find((m) => /Ferry/.test(m.getAttribute("aria-label") || m.innerText || ""));
    if (!m) return null;
    // the visible pill is the first child div; measure it, not the anchor box
    const pill = m.querySelector("div") || m;
    const r = pill.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  });
  log("A ferry visible pill rect:", JSON.stringify(ferry));
  await page.touchscreen.tap(ferry.x + ferry.w / 2, ferry.y + ferry.h / 2);
  await page.waitForTimeout(2500);
  const st = await hintState(page);
  log("A after tapping ferry pill:", JSON.stringify(st));
  await page.screenshot({ path: OUT + "f1e-ferry-pill-tap.png" });
  await ctx.close();
}

// ————— B: drag the map after settle — hint auto-dismiss? —————
{
  const ctx = await newCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(9000);
  const before = await hintState(page);
  // touch drag across empty map (avoid markers/hint): from (300,420) to (240,520)
  const cdp = await ctx.newCDPSession(page);
  const seq = async (type, x, y) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });
  await seq("touchStart", 300, 420);
  for (let i = 1; i <= 6; i++) await seq("touchMove", 300 - i * 10, 420 + i * 16);
  await seq("touchEnd", 240, 516);
  await page.waitForTimeout(1500);
  const after = await hintState(page);
  log("B hint before drag:", before.hintPresent, "| after drag:", after.hintPresent, "| dismissed on drag:", before.hintPresent && !after.hintPresent);
  await page.screenshot({ path: OUT + "f1f-after-drag.png" });
  await ctx.close();
}

// ————— C: /ferry burger position over time —————
{
  const ctx = await newCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + "/ferry", { waitUntil: "networkidle", timeout: 60000 });
  for (const t of [1000, 2500, 5000]) {
    await page.waitForTimeout(t === 1000 ? 1000 : 1500);
    const b = await page.evaluate(() => {
      const el = document.querySelector("button.cnwm-menu-burger");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inVp: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, opacity: getComputedStyle(el).opacity };
    });
    log(`C /ferry burger @~${t}ms:`, JSON.stringify(b));
  }
  await page.screenshot({ path: OUT + "fC-ferry-hero.png" });
  await ctx.close();
}

// ————— D: glyph-level press-hold hint vs burger —————
{
  const ctx = await newCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + "/commissioners-office", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(4000);
  const d = await page.evaluate(() => {
    const span = [...document.querySelectorAll("span")].find((s) => /Press and hold/.test(s.textContent));
    const burger = document.querySelector("button.cnwm-menu-burger");
    if (!span || !burger) return null;
    const br = burger.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(span);
    const lines = [...range.getClientRects()].map((r) => ({
      left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom),
      overlapsBurger: r.left < br.right && r.right > br.left && r.top < br.bottom && r.bottom > br.top,
      overlapPx: Math.max(0, Math.min(r.bottom, br.bottom) - Math.max(r.top, br.top)) * (r.right > br.left && r.left < br.right ? 1 : 0),
    }));
    return { burger: { left: Math.round(br.left), top: Math.round(br.top) }, lines };
  });
  log("D press-hold text line boxes vs burger:", JSON.stringify(d, null, 1));
  await ctx.close();
}

await browser.close();
log("DONE");
