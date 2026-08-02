import { chromium } from "playwright";
import fs from "fs";

const OUT = "docs/qa/inspiration/rewild";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://rewildyourself.com/", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(6000);

// helper: dispatch wheel bursts directly on the scroll container
async function wheelOnContainer(totalDelta, stepDelta = 400, stepMs = 30) {
  await page.evaluate(async ({ totalDelta, stepDelta, stepMs }) => {
    const el = document.querySelector("[data-scroll-container]") || document.body;
    const steps = Math.ceil(totalDelta / stepDelta);
    for (let i = 0; i < steps; i++) {
      el.dispatchEvent(new WheelEvent("wheel", { deltaY: stepDelta, bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, stepMs));
    }
  }, { totalDelta, stepDelta, stepMs });
}

async function state() {
  return page.evaluate(() => {
    const c = document.querySelector("[data-scroll-container]");
    const t = getComputedStyle(c).transform;
    const m = new DOMMatrixReadOnly(t === "none" ? "" : t);
    return Math.round(-m.m42); // virtual scroll Y
  });
}

// test: does dispatched wheel drive locomotive?
await wheelOnContainer(3000);
await page.waitForTimeout(1500);
console.log("after test wheel, virtualY =", await state());

// If it works, walk the whole 38k runway with shots
let shot = 0;
for (let i = 0; i < 26; i++) {
  await wheelOnContainer(1500, 500, 25);
  await page.waitForTimeout(1400);
  shot++;
  const y = await state();
  const name = `${OUT}/drive-1440-${String(shot).padStart(2, "0")}-y${y}.png`;
  await page.screenshot({ path: name });
  console.log("shot", name);
}
await browser.close();
