import { chromium } from "playwright";
const B = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();
// ferry viewport
const p1 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p1.goto(B + "/ferry", { waitUntil: "networkidle" });
await p1.waitForTimeout(2500);
const sw = await p1.evaluate(() => document.documentElement.scrollWidth);
const menuVisible = await p1.evaluate(() => {
  const m = document.querySelector(".cnwm-menu");
  if (!m) return false;
  const r = m.getBoundingClientRect();
  return r.left >= 0 && r.right <= 391 && r.top >= 0 && r.bottom <= 845;
});
console.log("ferry scrollWidth:", sw, "| menu on-screen:", menuVisible);
// people h1
const p2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p2.goto(B + "/people", { waitUntil: "networkidle" });
const h1 = await p2.locator("h1").innerText();
console.log("people h1:", JSON.stringify(h1));
// hint auto-dismiss on drag
const p3 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p3.goto(B + "/map", { waitUntil: "networkidle" });
await p3.waitForTimeout(6000);
const hintBefore = await p3.evaluate(() => document.body.textContent?.includes("Drag to explore"));
await p3.mouse.move(195, 400); await p3.mouse.down(); await p3.mouse.move(230, 430, { steps: 4 }); await p3.mouse.up();
await p3.waitForTimeout(600);
const hintAfter = await p3.evaluate(() => document.body.textContent?.includes("Drag to explore"));
console.log("hint before drag:", hintBefore, "| after drag:", hintAfter);
await browser.close();
