// Phase 6 FINAL — F2: /map hydration CLS on live (buffered layout-shift observer)
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase6-motion";
fs.mkdirSync(OUT, { recursive: true });
const LIVE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";

const browser = await chromium.launch();

const run = async (label, viewport, cpuThrottle) => {
  const ctx = await browser.newContext({ viewport });
  await ctx.addInitScript(() => {
    window.__cls = 0;
    window.__clsEntries = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) {
          window.__cls += e.value;
          if (e.value > 0.0005)
            window.__clsEntries.push({
              value: +e.value.toFixed(4),
              t: Math.round(e.startTime),
              src: e.sources
                ?.map((s) => s.node?.className?.toString?.().slice(0, 50) || s.node?.tagName)
                .slice(0, 2),
            });
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  const p = await ctx.newPage();
  if (cpuThrottle) {
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuThrottle });
  }
  await p.goto(LIVE + "/map", { waitUntil: "networkidle" });
  await p.waitForTimeout(6000); // hydration + prologue complete
  const load = await p.evaluate(() => ({ cls: +window.__cls.toFixed(4), entries: window.__clsEntries }));
  // then scroll the whole page (index below the map) for a full-page number
  await p.evaluate(async () => {
    const step = innerHeight / 2;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 300));
    }
  });
  await p.waitForTimeout(800);
  const full = await p.evaluate(() => +window.__cls.toFixed(4));
  console.log(label, JSON.stringify({ loadCLS: load.cls, fullPageCLS: full, entries: load.entries.slice(0, 6) }));
  await ctx.close();
};

console.log("=== F2 /map layout shift (live) ===");
await run("desktop 1280x800          ", { width: 1280, height: 800 }, 0);
await run("mobile 390x844            ", { width: 390, height: 844 }, 0);
await run("mobile 390x844 4x CPU thr.", { width: 390, height: 844 }, 4);
await browser.close();
console.log("F2 done");
