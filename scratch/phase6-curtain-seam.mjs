// Phase 6 FINAL — seam check: chapter page B must START covered (commit-time sample)
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase6-motion";
fs.mkdirSync(OUT, { recursive: true });
const LIVE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto(LIVE + "/map", { waitUntil: "networkidle" });
const card = p.locator("ol a[data-curtain-date]").first();
await card.scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
await card.click();
await p.waitForURL(/\/(bakery|commissioners-office|mansion|ferry|barbershop)\/?/, {
  timeout: 10000,
  waitUntil: "commit",
});
// sample the panel as early and as often as possible on page B
const samples = [];
for (let i = 0; i < 14; i++) {
  try {
    const s = await p.evaluate(() => {
      const panel = document.getElementById("curtain-panel");
      return panel
        ? {
            t: Math.round(performance.now()),
            panelTop: Math.round(panel.getBoundingClientRect().top),
            pe: panel.style.pointerEvents || "-",
            text: document.getElementById("curtain-text-content")?.innerText.replace(/\n+/g, " | "),
          }
        : { t: -1 };
    });
    samples.push(s);
    if (i === 3) await p.screenshot({ path: `${OUT}/curtain-overtitle-pageB-early.png` });
  } catch {
    samples.push({ err: 1 });
  }
  await p.waitForTimeout(120);
}
console.log(samples.map((s) => JSON.stringify(s)).join("\n"));
await browser.close();
