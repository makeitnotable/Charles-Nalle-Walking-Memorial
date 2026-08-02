import { chromium } from "playwright";
import fs from "fs";

const OUT = "docs/qa/inspiration/rewild";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

async function run(width, height, tag, steps, wheelPerStep, shotEvery) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("https://rewildyourself.com/", { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(6000); // let loader finish

  // How does the site consume scroll? inspect wrapper transforms before/after wheel
  const before = await page.evaluate(() => {
    const cands = [...document.querySelectorAll("main, .page, .smooth, [class*='scroll'], [class*='wrap'], section")]
      .slice(0, 10).map(el => ({ cls: String(el.className).slice(0, 50), tag: el.tagName, transform: getComputedStyle(el).transform }));
    return { cands, scrollY: window.scrollY, bodyTop: getComputedStyle(document.body).top };
  });
  console.log(tag, "BEFORE:", JSON.stringify(before));

  await page.mouse.move(width / 2, height / 2);
  let shot = 0;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.wheel(0, wheelPerStep);
    await page.waitForTimeout(350);
    if (i % shotEvery === 0) {
      await page.waitForTimeout(1100); // settle smooth scroll
      shot++;
      const state = await page.evaluate(() => ({
        y: window.scrollY,
        bodyTop: getComputedStyle(document.body).top,
        firstSection: (() => { const s = document.querySelector("main") || document.querySelector(".page"); return s ? getComputedStyle(s).transform : null; })(),
      }));
      const name = `${OUT}/wheel-${tag}-${String(shot).padStart(2, "0")}.png`;
      await page.screenshot({ path: name });
      console.log("shot", name, JSON.stringify(state));
    }
  }
  await page.close();
}

// 1440: total runway ~38000px. 30 steps x 1600px wheel, shot every 2 steps -> 15 shots
await run(1440, 900, "1440", 30, 1600, 2);
// 390: shorter capture set
await run(390, 844, "390", 16, 1800, 4);
await browser.close();
