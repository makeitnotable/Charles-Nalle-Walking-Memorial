import { chromium } from "playwright";
console.log("launching");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
console.log("routing");
await page.route("**/map", (route) => { console.log("STALLED:", route.request().url()); });
console.log("goto");
await page.goto("http://localhost:4321/", { waitUntil: "load", timeout: 15000 });
console.log("loaded");
await page.waitForTimeout(1000);
console.log("evaluating click");
await page.evaluate(() => {
  document.querySelector('a[href="/map"]').dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
});
console.log("clicked; waiting 1s");
await page.waitForTimeout(1000);
const s = await page.evaluate(() => {
  const p = document.getElementById("curtain-panel");
  const r = p.getBoundingClientRect();
  return { top: Math.round(r.top), pe: p.style.pointerEvents, flag: sessionStorage.getItem("cnwm-curtain") };
});
console.log("covered:", JSON.stringify(s));
await page.waitForTimeout(4200);
const s2 = await page.evaluate(() => {
  const p = document.getElementById("curtain-panel");
  const r = p.getBoundingClientRect();
  return { top: Math.round(r.top), pe: p.style.pointerEvents, flag: sessionStorage.getItem("cnwm-curtain") };
});
console.log("after-failopen:", JSON.stringify(s2));
await page.screenshot({ path: "docs/qa/phase23-motion/failopen-released.png" });
await browser.close();
console.log("done");
