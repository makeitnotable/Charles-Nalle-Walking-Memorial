import { chromium } from "playwright";
const browser = await chromium.launch();
for (const [name, w, h] of [["390", 390, 844], ["1440", 1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto("http://localhost:4321/map", { waitUntil: "networkidle" });
  await page.waitForTimeout(7000); // let the prologue settle
  await page.screenshot({ path: `docs/qa/phase3/map-settled--${name}.png` });
  // also test a marker tap → focus view w/ carousel
  if (name === "390") {
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button.mapboxgl-marker");
      (btns[0] /* Bakery */)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `docs/qa/phase3/map-focus--390.png` });
  }
  await page.close();
}
await browser.close();
console.log("done");
