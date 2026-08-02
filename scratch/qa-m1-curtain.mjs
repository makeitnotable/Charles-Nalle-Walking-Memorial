// Phase 2+3 motion audit — M1: curtain transition (4 nav samples + fail-open)
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase23-motion";
fs.mkdirSync(OUT, { recursive: true });
const B = "http://localhost:4321";
const browser = await chromium.launch();

async function curtainState(page) {
  return page
    .evaluate(() => {
      const p = document.getElementById("curtain-panel");
      const t = document.getElementById("curtain-text");
      if (!p) return { missing: true };
      const r = p.getBoundingClientRect();
      return {
        panelTop: Math.round(r.top),
        covering: r.top <= 2 && r.bottom >= window.innerHeight - 2,
        pe: p.style.pointerEvents || "css:" + getComputedStyle(p).pointerEvents,
        textOpacity: t ? getComputedStyle(t).opacity : null,
        text: t ? t.textContent.trim().replace(/\s+/g, " ") : null,
        flag: sessionStorage.getItem("cnwm-curtain"),
        path: location.pathname + location.search,
      };
    })
    .catch(() => ({ ctx: "navigating" }));
}

async function run(name, prep, click) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const t0s = [];
  await prep(page);
  const t0 = Date.now();
  await click(page);
  const log = [];
  for (let i = 0; i < 12; i++) {
    const st = await curtainState(page);
    st.t = Date.now() - t0;
    log.push(st);
    await page
      .screenshot({ path: `${OUT}/curtain-${name}-${String(i).padStart(2, "0")}.png` })
      .catch(() => {});
    await page.waitForTimeout(140);
  }
  await page.waitForTimeout(1200);
  const fin = await curtainState(page);
  fin.t = "final@" + (Date.now() - t0);
  log.push(fin);
  console.log(`\n=== ${name} ===`);
  log.forEach((l) => console.log(JSON.stringify(l)));
  await ctx.close();
}

// 1. home → map via Continue
await run(
  "home-map",
  async (p) => {
    await p.goto(B + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(2500); // let entry choreography finish
  },
  async (p) => p.click('a[href="/map"]'),
);

// 2. bakery → next chapter via "Continue the walk"
await run(
  "bakery-next",
  async (p) => {
    await p.goto(B + "/bakery", { waitUntil: "networkidle" });
    await p.evaluate(() => {
      document.querySelector('a[href="/commissioners-office"]')?.scrollIntoView({ block: "center" });
    });
    await p.waitForTimeout(1200);
  },
  async (p) => p.click('text=Continue the walk'),
);

// 3. menu → about (from /mansion, bottom-right menu)
await run(
  "menu-about",
  async (p) => {
    await p.goto(B + "/mansion", { waitUntil: "networkidle" });
    await p.click(".cnwm-menu-burger");
    await p.waitForTimeout(800);
  },
  async (p) => p.click('.cnwm-menu-panel a[href="/about"]'),
);

// 4. map carousel active card → chapter (two-tap: marker focuses, active card navigates)
await run(
  "map-card",
  async (p) => {
    await p.goto(B + "/map", { waitUntil: "networkidle" });
    await p.waitForTimeout(7000); // prologue settles
    await p.evaluate(() => {
      const btns = document.querySelectorAll("button.mapboxgl-marker");
      btns[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await p.waitForTimeout(6000); // dive completes
  },
  async (p) =>
    p.evaluate(() => {
      // the active (scale-100) card
      const card = document.querySelector('.keen-slider__slide .scale-100 [role="button"]');
      card?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }),
);

// 5. FAIL-OPEN: abort the navigation → panel must release within ~4s
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.route("**/map", (r) => r.abort());
  await page.goto(B + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const t0 = Date.now();
  await page.click('a[href="/map"]');
  await page.waitForTimeout(1000);
  const covered = await curtainState(page);
  covered.t = Date.now() - t0;
  await page.screenshot({ path: `${OUT}/curtain-failopen-covered.png` });
  await page.waitForTimeout(4000);
  const released = await curtainState(page);
  released.t = Date.now() - t0;
  await page.screenshot({ path: `${OUT}/curtain-failopen-released.png` });
  // page must be interactive again: click works?
  const clickable = await page.evaluate(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    return el ? el.tagName + "." + (el.className || "").toString().slice(0, 40) : null;
  });
  console.log("\n=== fail-open ===");
  console.log("covered@1s:", JSON.stringify(covered));
  console.log("released@5s:", JSON.stringify(released));
  console.log("elementFromPoint(center):", clickable);
  await ctx.close();
}

await browser.close();
console.log("\nM1 done");
