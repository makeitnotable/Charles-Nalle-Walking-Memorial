// Phase 6 FINAL — reduced-motion spot check (/bakery, /map) + lazy-video + console scan
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase6-motion";
fs.mkdirSync(OUT, { recursive: true });
const LIVE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";

const browser = await chromium.launch();

// ——— A. reduced motion ———
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const errs = [];

  // /bakery
  {
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errs.push("rm-bakery: " + e.message));
    await p.goto(LIVE + "/bakery", { waitUntil: "networkidle" });
    await p.waitForTimeout(1200);
    const hero = await p.evaluate(() => {
      const media = document.querySelector("main img, .hero img, header img, img");
      return {
        heroTransform: media ? getComputedStyle(media).transform : "n/a",
        interludeTransform: (() => {
          const i = document.querySelector(".interlude-img");
          return i ? getComputedStyle(i).transform : "missing";
        })(),
        pressRevealHint: document.body.innerText.match(/tap to reveal/i) ? "tap-affordance" : "hold-affordance?",
      };
    });
    await p.screenshot({ path: `${OUT}/rm-bakery-top.png` });
    // full-page scroll: every reveal must end visible
    await p.evaluate(async () => {
      const step = innerHeight / 2;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 220));
      }
    });
    await p.waitForTimeout(600);
    const reveals = await p.evaluate(() => {
      const all = [...document.querySelectorAll(".reveal, .reveal-quote")];
      const notIn = all.filter((e) => !e.classList.contains("is-in"));
      const invisible = all.filter((e) => {
        const s = getComputedStyle(e);
        return +s.opacity < 0.9 || s.visibility === "hidden";
      });
      return { total: all.length, notIn: notIn.length, invisible: invisible.length };
    });
    await p.evaluate(() => {
      const el = document.querySelector(".painting-interlude");
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 100);
    });
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/rm-bakery-interlude.png` });
    console.log("rm /bakery:", JSON.stringify({ ...hero, reveals }));
    await p.close();
  }

  // /map
  {
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errs.push("rm-map: " + e.message));
    await p.goto(LIVE + "/map", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(2500); // settled state should be immediate once loaded
    const scale = await p.evaluate(() => document.querySelector(".mapboxgl-ctrl-scale")?.textContent?.trim());
    await p.screenshot({ path: `${OUT}/rm-map-settled.png` });
    // marker interaction: click a stop pill → instant jump + carousel
    await p.getByText("Ferry Landing", { exact: false }).first().click();
    await p.waitForTimeout(900);
    const focused = await p.evaluate(() => ({
      scale: document.querySelector(".mapboxgl-ctrl-scale")?.textContent?.trim(),
      carousel: !!document.querySelector(".keen-slider"),
      url: location.search,
    }));
    await p.screenshot({ path: `${OUT}/rm-map-focused.png` });
    console.log("rm /map:", JSON.stringify({ settledScale: scale, afterMarkerClick: focused }));
    await p.close();
  }
  console.log("rm pageerrors:", errs.length ? errs : "none");
  await ctx.close();
}

// ——— B. lazy-video: films must start after window load (normal motion) ———
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push("home: " + e.message));
  await p.goto(LIVE + "/", { waitUntil: "load" });
  const before = await p.evaluate(() => {
    const v = document.querySelector("video");
    return v ? { hasSrc: !!(v.currentSrc || v.src), readyState: v.readyState } : null;
  });
  await p.waitForTimeout(3500);
  const after = await p.evaluate(() => {
    const v = document.querySelector("video");
    if (!v) return null;
    return {
      hasSrc: !!(v.currentSrc || v.src),
      readyState: v.readyState,
      currentTime: +v.currentTime.toFixed(2),
      paused: v.paused,
      display: getComputedStyle(v).display,
    };
  });
  console.log("home splash video — at load:", JSON.stringify(before), "→ +3.5s:", JSON.stringify(after));
  await p.screenshot({ path: `${OUT}/home-splash-3500ms.png` });
  console.log("home pageerrors:", errs.length ? errs : "none");
  await ctx.close();
}

// ——— C. console error scan, normal motion, key routes ———
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  for (const path of ["/", "/bakery", "/map", "/about"]) {
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 160)));
    p.on("console", (m) => {
      if (m.type() === "error") errs.push("console: " + m.text().slice(0, 160));
    });
    await p.goto(LIVE + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(2500);
    console.log("console scan", path.padEnd(10), errs.length ? JSON.stringify(errs) : "clean");
    await p.close();
  }
  await ctx.close();
}

await browser.close();
console.log("reduced/video/console done");
