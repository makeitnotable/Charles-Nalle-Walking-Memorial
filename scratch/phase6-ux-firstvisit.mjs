// Phase 6 FINAL — first-visit sanity on LIVE (390x844):
// home -> Continue -> map (via curtain) -> focus a stop -> enter its chapter via the
// active card (two-tap behavior), curtain covering each navigation.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const OUT = fileURLToPath(new URL("../docs/qa/phase6-ux/", import.meta.url));
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log("[FV]", ...a);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGE ERROR: " + e.message));
page.on("console", (m) => m.type() === "error" && errors.push("CONSOLE: " + m.text().slice(0, 160)));

const curtain = () =>
  page.evaluate(() => {
    const p = document.getElementById("curtain-panel");
    if (!p) return { missing: true, path: location.pathname };
    const r = p.getBoundingClientRect();
    return { covering: r.top <= 2 && r.bottom >= innerHeight - 2, top: Math.round(r.top), path: location.pathname };
  }).catch(() => ({ ctx: "navigating" }));

// ——— 1. Home ———
await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT + "s1-home.png" });
const home = await page.evaluate(() => {
  const a = [...document.querySelectorAll("a")].find((a) => /continue/i.test(a.innerText));
  const r = a?.getBoundingClientRect();
  return a ? { text: a.innerText.trim(), href: a.getAttribute("href"), w: Math.round(r.width), h: Math.round(r.height), inVp: r.top >= 0 && r.bottom <= innerHeight } : null;
});
log("home CTA:", JSON.stringify(home));

// ——— 2. Continue -> map, curtain covering ———
await page.tap('a[href$="/map"]');
const samples = [];
for (let i = 0; i < 8; i++) { samples.push(await curtain()); await page.waitForTimeout(150); }
await page.waitForURL("**/map**", { timeout: 15000 });
log("curtain samples during home->map:", JSON.stringify(samples.filter((s) => !s.ctx)));
log("curtain covered at some point:", samples.some((s) => s.covering));
await page.waitForTimeout(9000); // prologue flight settles
await page.screenshot({ path: OUT + "s2-map-arrived.png" });
log("arrived:", page.url());

// ——— 3. First tap on a marker: FOCUS (not navigate) ———
const marker2 = await page.evaluate(() => {
  const m = [...document.querySelectorAll(".mapboxgl-marker")].find((m) => /Stop 2/.test(m.getAttribute("aria-label") || ""));
  const pill = m?.querySelector("div") || m;
  const r = pill?.getBoundingClientRect();
  return r ? { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + 14), label: m.getAttribute("aria-label") } : null;
});
log("tapping marker:", JSON.stringify(marker2));
await page.touchscreen.tap(marker2.x, marker2.y);
await page.waitForTimeout(3000); // dive
const focusState = await page.evaluate(() => {
  const overview = [...document.querySelectorAll("button")].find((b) => /overview/i.test(b.innerText));
  const active = document.querySelector(".keen-slider__slide .scale-100");
  const activeText = active ? active.innerText.trim().slice(0, 80).replace(/\n/g, " / ") : null;
  return { url: location.pathname + location.search, overviewPill: !!overview, activeCard: activeText };
});
log("after first marker tap:", JSON.stringify(focusState, null, 1));
log("STILL ON MAP (focus, not navigate):", /\/map/.test(focusState.url));
await page.screenshot({ path: OUT + "s3-stop2-focused.png" });

// ——— 4. Tap the centered active card -> chapter, via curtain ———
const card = await page.evaluate(() => {
  const active = document.querySelector('.keen-slider__slide .scale-100 [role="button"]') || document.querySelector(".keen-slider__slide .scale-100");
  if (!active) return null;
  const r = active.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), label: active.getAttribute("aria-label") || active.innerText.slice(0, 60) };
});
log("active card:", JSON.stringify(card));
await page.touchscreen.tap(card.x, card.y);
const samples2 = [];
for (let i = 0; i < 10; i++) { samples2.push(await curtain()); await page.waitForTimeout(160); }
await page.waitForURL("**/commissioners-office**", { timeout: 15000 });
log("curtain samples during card->chapter:", JSON.stringify(samples2.filter((s) => !s.ctx)));
log("curtain covered at some point:", samples2.some((s) => s.covering));
await page.waitForTimeout(2500);
log("landed on:", page.url());
await page.screenshot({ path: OUT + "s4-chapter-via-card.png" });

log("errors during journey:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
log("DONE");
