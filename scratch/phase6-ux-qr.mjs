// Phase 6 FINAL — compressed QR walkthrough on LIVE (390x844):
// deep-link /commissioners-office -> orientation visible without scrolling
// -> audio playing within 2 taps -> next-stop path (Continue the walk + Get Directions, correct destination)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const OUT = fileURLToPath(new URL("../docs/qa/phase6-ux/", import.meta.url));
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log("[QR]", ...a);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGE ERROR: " + e.message));
page.on("console", (m) => m.type() === "error" && errors.push("CONSOLE: " + m.text().slice(0, 160)));

// ——— STEP 1: QR arrival ———
await page.goto(BASE + "/commissioners-office", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT + "q1-qr-arrival.png" });
const orient = await page.evaluate(() => {
  const p = [...document.querySelectorAll("p")].find((p) => /Walking Memorial · Troy, NY · Stop/.test(p.textContent));
  if (!p) return { found: false };
  const r = p.getBoundingClientRect();
  return { found: true, text: p.textContent.trim(), top: Math.round(r.top), bottom: Math.round(r.bottom), scrollY: Math.round(scrollY), visibleNoScroll: scrollY === 0 && r.top >= 0 && r.bottom <= innerHeight, opacity: getComputedStyle(p).opacity };
});
log("orientation line:", JSON.stringify(orient));

// ——— STEP 2: audio within 2 taps ———
let taps = 0;
const play = page.locator('button[aria-label^="Play narration"]').first();
await play.waitFor({ state: "attached", timeout: 15000 });
await play.scrollIntoViewIfNeeded(); // scrolling is free; taps are the budget
await page.waitForTimeout(800);
await play.tap(); taps++;
await page.waitForTimeout(1500);
const audio = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime * 10) / 10 })));
log("audio after", taps, "tap(s):", JSON.stringify(audio), "| PLAYING:", audio.some((a) => !a.paused));
await page.screenshot({ path: OUT + "q2-audio-playing.png" });

// mini-player sanity while scrolled (visual viewport!)
await page.evaluate(() => scrollBy(0, 1400));
await page.waitForTimeout(900);
const mini = await page.evaluate(() => {
  const els = [...document.querySelectorAll("body *")].filter((e) => getComputedStyle(e).position === "fixed" && /narration|CHAPTER/i.test(e.innerText || "") && e.getBoundingClientRect().width > 200);
  return els.map((e) => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), fullyVisible: r.top >= 0 && r.bottom <= 844 && r.left >= 0 && r.right <= 390 }; });
});
log("mini-player while scrolled:", JSON.stringify(mini));
await page.screenshot({ path: OUT + "q3-miniplayer.png" });

// ——— STEP 3: next-stop path ———
await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(2500);
const next = await page.evaluate(() => {
  const el = document.querySelector('section[aria-label="Continue the walk"]');
  if (!el) return { found: false };
  const links = [...el.querySelectorAll("a")].map((a) => {
    const r = a.getBoundingClientRect();
    return { text: a.innerText.trim().replace(/\n/g, " "), href: a.getAttribute("href"), w: Math.round(r.width), h: Math.round(r.height) };
  });
  return { found: true, heading: el.querySelector("h2")?.innerText, label: el.querySelector(".type-label")?.innerText, links };
});
log("next-stop block:", JSON.stringify(next, null, 1));
const cont = next.links?.find((l) => /continue the walk/i.test(l.text));
const dir = next.links?.find((l) => /directions/i.test(l.text));
log("Continue the walk -> ", cont?.href, "| correct (mansion):", /\/mansion$/.test(cont?.href || ""));
log("Get Directions -> ", dir?.href);
log("directions walking:", /travelmode=walking/.test(dir?.href || ""), "| dest = mansion coords (42.7243182,-73.6933753):", (dir?.href || "").includes("42.7243182") && (dir?.href || "").includes("-73.6933753"));
const nextBlock = page.locator('section[aria-label="Continue the walk"]');
await nextBlock.scrollIntoViewIfNeeded();
await page.waitForTimeout(2200);
await page.screenshot({ path: OUT + "q4-where-to-next.png" });

// ——— STEP 4: Continue the walk tap -> mansion (completes the journey) ———
await page.tap('section[aria-label="Continue the walk"] a[href$="/mansion"]'); taps++;
await page.waitForURL("**/mansion", { timeout: 15000 });
await page.waitForTimeout(2200);
log("continued to:", page.url(), "| total taps for full journey:", taps);
await page.screenshot({ path: OUT + "q5-arrived-mansion.png" });

log("errors during journey:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
log("DONE");
