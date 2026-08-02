import { chromium } from "playwright";
import fs from "fs";

const OUT = "docs/qa/inspiration/rewild";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function probe(width, height, tag, offsets) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("https://rewildyourself.com/", { waitUntil: "networkidle", timeout: 90000 });
  // wait out the loader: poll until a loader/preloader element is gone or 45s
  await page.waitForTimeout(3000);
  try {
    await page.waitForFunction(() => {
      const cands = document.querySelectorAll('[class*="load"],[class*="Load"],[id*="load"],[class*="preload"]');
      for (const c of cands) {
        const cs = getComputedStyle(c);
        if (cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.1 && c.getBoundingClientRect().height > 200) return false;
      }
      return true;
    }, { timeout: 45000 });
  } catch (e) { console.log(tag, "loader wait timed out"); }
  await page.waitForTimeout(2000);

  if (tag === "1440") {
    // TECH INSPECTION (once)
    const tech = await page.evaluate(() => {
      const canvases = [...document.querySelectorAll("canvas")].map(c => {
        let ctx = "unknown";
        try {
          if (c.getContext("2d", { willReadFrequently: false })) ctx = "2d";
        } catch (e) {}
        return { w: c.width, h: c.height, cls: c.className, id: c.id, ctxGuess: ctx, parent: c.parentElement?.className };
      });
      const scripts = [...document.querySelectorAll("script[src]")].map(s => s.src);
      const libs = {
        gsap: !!window.gsap, gsapVersion: window.gsap?.version,
        ScrollTrigger: !!window.ScrollTrigger || !!window.gsap?.plugins?.scrollTrigger,
        Lenis: !!window.Lenis || !!window.lenis,
        locomotive: !!window.LocomotiveScroll,
        pixi: !!window.PIXI, three: !!window.THREE,
        jquery: !!window.jQuery,
        barba: !!window.barba,
      };
      const bodyH = document.body.scrollHeight;
      const docH = document.documentElement.scrollHeight;
      const fixed = [...document.querySelectorAll("*")].filter(el => {
        const cs = getComputedStyle(el);
        return (cs.position === "fixed" || cs.position === "sticky") && el.getBoundingClientRect().height > 40;
      }).slice(0, 20).map(el => ({ tag: el.tagName, cls: String(el.className).slice(0, 80), pos: getComputedStyle(el).position, h: Math.round(el.getBoundingClientRect().height) }));
      // sample elements with transforms
      return { canvases, scriptCount: scripts.length, scripts: scripts.slice(0, 25), libs, bodyH, docH, viewportH: innerHeight, fixed };
    });
    console.log("TECH", JSON.stringify(tech, null, 2));
  }

  const total = await page.evaluate(() => document.body.scrollHeight - innerHeight);
  console.log(tag, "scrollable px:", total);

  for (const frac of offsets) {
    const y = Math.round(total * frac);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(1800);
    const name = `${OUT}/probe-${tag}-p${String(Math.round(frac * 100)).padStart(2, "0")}.png`;
    await page.screenshot({ path: name });
    console.log("shot", name, "y=", y);
  }

  // fine-grained triplet around 30% to see transform deltas (same section, 3 offsets)
  if (tag === "1440") {
    for (const frac of [0.28, 0.30, 0.32]) {
      const y = Math.round(total * frac);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
      await page.waitForTimeout(1200);
      // record transforms of visible moving elements
      const moving = await page.evaluate(() => {
        return [...document.querySelectorAll("*")].filter(el => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return cs.transform !== "none" && r.width > 60 && r.height > 60 && r.top < innerHeight && r.bottom > 0;
        }).slice(0, 12).map(el => ({ cls: String(el.className).slice(0, 60), transform: getComputedStyle(el).transform.slice(0, 60), top: Math.round(el.getBoundingClientRect().top) }));
      });
      console.log(`transforms @${frac}:`, JSON.stringify(moving));
      await page.screenshot({ path: `${OUT}/probe-${tag}-fine${Math.round(frac * 100)}.png` });
    }
  }
  await page.close();
}

await probe(1440, 900, "1440", [0.06, 0.14, 0.24, 0.38, 0.52, 0.66, 0.80, 0.94]);
await probe(390, 844, "390", [0.10, 0.30, 0.55, 0.85]);
await browser.close();
