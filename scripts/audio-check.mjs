#!/usr/bin/env node
/**
 * Narration check (v7 P4 gate): every chapter's player plays (the island's
 * REAL Play button, after scrolling it into view — `client:visible`), the
 * highlight lands, tap-to-seek seeks, Chapter 2's twin players never overlap
 * (starting one pauses the other), the mini-player collapses once the
 * transcript has scrolled away, and the console stays clean (the React
 * hydration mismatch is captured verbatim if it appears).
 *
 * Usage: node scripts/audio-check.mjs [--base URL] [--vp 1440|390]
 */
import { chromium } from "playwright";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const VP = flag("vp", "1440") === "390" ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const ROUTES = ["/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop"];

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
let fails = 0;
for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: VP });
  const errors = [];
  page.on("pageerror", (e) => errors.push("PE " + String(e).slice(0, 400)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 900)));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const n = await page.locator("section[id^='scene-']").count();
  const notes = [];
  for (let k = 0; k < n; k++) {
    // the scene's own main control (its label flips Play → Pause once playing)
    const btn = page.locator(`#scene-${k} button[aria-label*='Play'], #scene-${k} button[aria-label*='play']`).first();
    await btn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await btn.click();
    await page.waitForTimeout(2600);
    const st = await page.evaluate((k) => {
      const a = [...document.querySelectorAll("audio")];
      return {
        playing: a.map((x) => !x.paused),
        t: a.map((x) => +x.currentTime.toFixed(1)),
        active: document.querySelectorAll(".narration-active").length,
        minis: [...document.querySelectorAll(".fixed.z-\\[999\\]")].filter((e) => getComputedStyle(e).opacity !== "0").length,
      };
    }, k);
    const okPlay = st.playing[k] === true && st.t[k] > 1;
    const okOnly = st.playing.filter(Boolean).length === 1;
    notes.push(`player ${k + 1}: ${okPlay ? "plays" : "DID NOT PLAY"} t=${st.t[k]} · highlight ${st.active} · ${okOnly ? "only one playing" : "TWO PLAYING"}`);
    if (!okPlay || !okOnly) fails++;
    // tap-to-seek on the third paragraph of this scene
    const scene = page.locator(`#scene-${k}`);
    const paras = scene.locator("p[data-timing]");
    if ((await paras.count()) >= 3) {
      await paras.nth(2).scrollIntoViewIfNeeded();
      await paras.nth(2).click();
      await page.waitForTimeout(900);
      const s = await page.evaluate((k) => {
        const a = document.querySelectorAll("audio")[k];
        const act = document.querySelector(`#scene-${k} .narration-active`);
        return { t: +a.currentTime.toFixed(1), active: act?.getAttribute("data-timing") };
      }, k);
      const okSeek = s.active === "2";
      notes.push(`  seek→¶3: t=${s.t} active=${s.active} ${okSeek ? "✓" : "✗"}`);
      if (!okSeek) fails++;
    }
  }
  // mini collapse at Onward
  await page.evaluate(() => window.scrollTo({ top: document.getElementById("onward").offsetTop, behavior: "instant" }));
  await page.waitForTimeout(900);
  const mini = await page.evaluate(() =>
    [...document.querySelectorAll(".fixed.z-\\[999\\]")]
      .filter((e) => getComputedStyle(e).opacity !== "0")
      .map((e) => e.innerText.replace(/\s+/g, " ").trim()),
  );
  notes.push(`  minis at Onward: ${JSON.stringify(mini)} ${mini.length === 1 && !/\//.test(mini[0]) ? "(collapsed ✓)" : mini.length === 1 ? "(NOT collapsed)" : "(count ≠ 1)"}`);
  if (mini.length !== 1 || /\//.test(mini[0])) fails++;
  console.log(`${errors.length || notes.some((x) => /DID NOT|TWO|✗|NOT/.test(x)) ? "✗" : "✓"} ${route}\n  ` + notes.join("\n  "));
  if (errors.length) console.log("  console: " + errors.map((e) => e.replace(/\n/g, " ⏎ ").slice(0, 700)).join("\n  console: "));
  if (errors.length) fails++;
  await page.close();
}
await browser.close();
process.exit(fails ? 1 : 0);
