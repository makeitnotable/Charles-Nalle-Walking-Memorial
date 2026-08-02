// Phase 2+3 motion audit — M2: hero scrub on /bakery, M3: menu open/close
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase23-motion";
fs.mkdirSync(OUT, { recursive: true });
const B = "http://localhost:4321";
const browser = await chromium.launch();

// ——— M2: hero scrub ———
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(B + "/bakery", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const metrics = () =>
    page.evaluate(() => {
      const m = document.getElementById("hero-media");
      const h = document.getElementById("hero-header");
      const ms = getComputedStyle(m);
      const hs = getComputedStyle(h);
      const parse = (t) => {
        if (t === "none") return { scale: 1, y: 0 };
        const v = t.match(/matrix\(([^)]+)\)/)?.[1].split(",").map(Number);
        return v ? { scale: +v[0].toFixed(3), y: +v[5].toFixed(1) } : { raw: t };
      };
      return {
        media: {
          ...parse(ms.transform),
          borderRadius: ms.borderTopLeftRadius,
          marginTop: ms.marginTop,
        },
        header: parse(hs.transform),
        scrollY: window.scrollY,
        nextSectionTop: Math.round(
          document.querySelector("section")?.getBoundingClientRect().top ?? -1,
        ),
      };
    });

  const range = await page.evaluate(() => {
    const m = document.getElementById("hero-media");
    return { start: m.getBoundingClientRect().top + window.scrollY, vh: innerHeight };
  });
  console.log("=== M2 hero scrub (scrub range starts at media top-top) ===");
  console.log("range:", JSON.stringify(range));
  for (const pct of [0, 25, 50, 100]) {
    const y = Math.round(range.start + (range.vh * pct) / 100);
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(900); // let scrub 0.5 catch up
    const m = await metrics();
    console.log(`@${pct}% (scrollTo ${y}):`, JSON.stringify(m));
    await page.screenshot({ path: `${OUT}/hero-scrub-${pct}.png` });
  }
  // scroll back to 0 — scrub must reverse cleanly
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  console.log("back@0:", JSON.stringify(await metrics()));
  await page.close();
}

// ——— M3: menu ———
async function menuAudit(url, name) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(B + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const state = () =>
    page.evaluate(() => {
      const burger = document.querySelector(".cnwm-menu-burger");
      const panel = document.querySelector(".cnwm-menu-panel");
      const bs = getComputedStyle(burger);
      const ps = getComputedStyle(panel);
      const parse = (t) => {
        if (t === "none") return "none";
        const v = t.match(/matrix\(([^)]+)\)/)?.[1].split(",").map(Number);
        return v ? `scale=${+Math.hypot(v[0], v[1]).toFixed(3)}` : t;
      };
      return {
        burgerHidden: burger.classList.contains("hidden"),
        burgerT: parse(bs.transform),
        burgerOp: bs.opacity,
        ariaExpanded: burger.getAttribute("aria-expanded"),
        panelHidden: panel.classList.contains("hidden"),
        panelT: parse(ps.transform),
        panelOp: ps.opacity,
        focused: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 20),
      };
    });

  console.log(`\n=== M3 menu (${name}) ===`);
  await page.screenshot({ path: `${OUT}/menu-${name}-0-idle.png` });
  console.log("idle:", JSON.stringify(await state()));
  const t0 = Date.now();
  await page.click(".cnwm-menu-burger");
  for (let i = 1; i <= 4; i++) {
    console.log(`open+${Date.now() - t0}ms:`, JSON.stringify(await state()));
    await page.screenshot({ path: `${OUT}/menu-${name}-open-${i}.png` });
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(400);
  console.log("open-settled:", JSON.stringify(await state()));
  await page.screenshot({ path: `${OUT}/menu-${name}-open-settled.png` });

  // close via Escape
  const t1 = Date.now();
  await page.keyboard.press("Escape");
  for (let i = 1; i <= 4; i++) {
    console.log(`close+${Date.now() - t1}ms:`, JSON.stringify(await state()));
    await page.screenshot({ path: `${OUT}/menu-${name}-close-${i}.png` });
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);
  console.log("close-settled:", JSON.stringify(await state()));
  await page.screenshot({ path: `${OUT}/menu-${name}-close-settled.png` });
  await page.close();
}

await menuAudit("/", "home");
await menuAudit("/bakery", "bakery");

await browser.close();
console.log("\nM2+M3 done");
