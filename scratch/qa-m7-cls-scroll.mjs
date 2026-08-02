// Phase 2+3 motion audit — M7: CLS from animation + native-scroll scan
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase23-motion";
fs.mkdirSync(OUT, { recursive: true });
const B = "http://localhost:4321";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(() => {
  window.__cls = 0;
  window.__clsEntries = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (!e.hadRecentInput) {
        window.__cls += e.value;
        if (e.value > 0.001)
          window.__clsEntries.push({
            value: +e.value.toFixed(4),
            t: Math.round(e.startTime),
            src: e.sources?.map((s) => s.node?.className?.toString?.().slice(0, 60) || s.node?.tagName).slice(0, 2),
          });
      }
    }
  }).observe({ type: "layout-shift", buffered: true });
});

console.log("=== M7 CLS + native scroll ===");
for (const path of ["/", "/bakery", "/commissioners-office", "/map", "/about", "/people", "/paintings"]) {
  const p = await ctx.newPage();
  await p.goto(B + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  // step-scroll through the page so every reveal fires
  await p.evaluate(async () => {
    const step = innerHeight / 2;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 350));
    }
  });
  await p.waitForTimeout(900);
  const res = await p.evaluate(() => ({
    cls: +window.__cls.toFixed(4),
    biggest: window.__clsEntries.sort((a, b) => b.value - a.value).slice(0, 4),
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    bodyOverflow: getComputedStyle(document.body).overflow,
    scrollHeight: document.body.scrollHeight,
  }));
  // native scroll sanity: programmatic scroll must land where asked
  const native = await p.evaluate(async () => {
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
    window.scrollTo(0, 240);
    await new Promise((r) => setTimeout(r, 400));
    return window.scrollY;
  });
  // stuck reveals under normal motion after the sweep?
  const stuck = await p.evaluate(
    () => [...document.querySelectorAll(".reveal")].filter((e) => !e.classList.contains("is-in")).length,
  );
  console.log(
    path.padEnd(24),
    JSON.stringify({ ...res, scrollTo240: native, revealsNotIn: stuck }),
  );
  await p.close();
}
await browser.close();
console.log("\nM7 done");
