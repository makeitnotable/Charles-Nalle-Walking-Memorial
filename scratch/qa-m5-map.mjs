// Phase 2+3 motion audit — M5: map prologue, route draw, dive, overview, tour, arrival
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase23-motion";
fs.mkdirSync(OUT, { recursive: true });
const B = "http://localhost:4321";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const ui = () =>
  page.evaluate(() => {
    const q = (t) => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === t);
    return {
      markers: document.querySelectorAll("button.mapboxgl-marker").length,
      slides: document.querySelectorAll(".keen-slider__slide").length,
      activeCards: document.querySelectorAll(".keen-slider__slide .scale-100").length,
      overviewBtn: !![...document.querySelectorAll("button")].find((b) => b.textContent.includes("Overview")),
      takeWalk: !!q("Take the walk"),
      stopWalk: !!q("Stop the walk"),
      lensBtn: !!(q("See Troy in 1860") || q("Back to today")),
      hint: !!document.querySelector('button[aria-label="Dismiss hint"]'),
      nameplate: [...document.querySelectorAll("p")].find((p) => /^Stop \d of \d$/.test(p.textContent.trim()))?.textContent.trim() ?? null,
      url: location.search,
      scrollY: window.scrollY,
    };
  });

console.log("=== M5 map ===");
await page.goto(B + "/map", { waitUntil: "networkidle" });
await page.waitForTimeout(1300); // route draw begins at 1200ms
await page.screenshot({ path: `${OUT}/map-1s-route-start.png` });
console.log("@1.3s:", JSON.stringify(await ui()));
await page.waitForTimeout(5700); // prologue 3.5s + settle
await page.screenshot({ path: `${OUT}/map-7s-settled.png` });
console.log("@7s settled:", JSON.stringify(await ui()));
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/map-8s-route-drawn.png` });

// ——— native-scroll check over the map (wheel) ———
await page.mouse.move(640, 400);
await page.mouse.wheel(0, 600);
await page.waitForTimeout(800);
const afterWheel = await page.evaluate(() => window.scrollY);
console.log("wheel over map -> scrollY:", afterWheel, "(0 = wheel consumed by map zoom)");
await page.screenshot({ path: `${OUT}/map-after-wheel.png` });

// ——— marker dive ———
await page.evaluate(() => {
  const btns = document.querySelectorAll("button.mapboxgl-marker");
  btns[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/map-dive-1s.png` });
console.log("dive@1s:", JSON.stringify(await ui()));
await page.waitForTimeout(5000);
await page.screenshot({ path: `${OUT}/map-dive-6s.png` });
console.log("dive@6s:", JSON.stringify(await ui()));

// marker active/inactive states
const markerStates = await page.evaluate(() =>
  [...document.querySelectorAll("button.mapboxgl-marker")].map((m) => {
    const pill = m.querySelector("div[style*='border-radius:30px'], div[style*='border-radius: 30px']");
    const wrap = m.firstElementChild;
    return {
      label: m.getAttribute("aria-label")?.slice(0, 30),
      scale: wrap?.style.transform,
      bg: pill?.style.background,
    };
  }),
);
console.log("markers:", JSON.stringify(markerStates, null, 1));

// ——— back to overview (2s ease) ———
await page.click("text=Overview");
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/map-overview-1s.png` });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/map-overview-settled.png` });
console.log("overview settled:", JSON.stringify(await ui()));

// ——— guided tour ———
await page.click("text=Take the walk");
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/map-tour-3s.png` });
console.log("tour@3s:", JSON.stringify(await ui()));
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/map-tour-6.5s.png` });
console.log("tour@6.5s:", JSON.stringify(await ui()));
const stopClicked = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Stop the walk");
  if (b) b.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  return !!b;
});
await page.waitForTimeout(800);
console.log("stop clicked:", stopClicked, "->", JSON.stringify(await ui()));
await page.screenshot({ path: `${OUT}/map-tour-stopped.png` });

// ——— 1860 lens ———
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("Overview"));
  b?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await page.waitForTimeout(2300);
const lensBtn = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "See Troy in 1860");
  b?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  return !!b;
});
await page.waitForTimeout(900);
console.log("lens opened:", lensBtn, JSON.stringify(await ui()));
await page.screenshot({ path: `${OUT}/map-lens.png` });

await page.close();

// ——— deep-link cinematic arrival ———
const p2 = await ctx.newPage();
await p2.goto(B + "/map?stop=bakery", { waitUntil: "networkidle" });
await p2.waitForTimeout(1500);
await p2.screenshot({ path: `${OUT}/map-arrival-1.5s.png` });
const np1 = await p2.evaluate(
  () => [...document.querySelectorAll("p")].find((p) => /^Stop \d of \d$/.test(p.textContent.trim()))?.parentElement.textContent.trim() ?? null,
);
console.log("arrival nameplate @1.5s:", np1);
await p2.waitForTimeout(4500);
await p2.screenshot({ path: `${OUT}/map-arrival-6s.png` });
const np2 = await p2.evaluate(
  () => [...document.querySelectorAll("p")].find((p) => /^Stop \d of \d$/.test(p.textContent.trim()))?.textContent ?? null,
);
console.log("arrival nameplate @6s (should be gone):", np2);
await p2.close();

await browser.close();
console.log("\nM5 done");
