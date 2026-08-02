import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => { if (m.text().startsWith("[keen]")) console.log(m.text()); });
await page.goto("http://localhost:4321/map", { waitUntil: "networkidle" });
await page.waitForTimeout(6000);
const tap = (lbl) => page.evaluate((l) => {
  const b = [...document.querySelectorAll("button.mapboxgl-marker")].find((x) => x.getAttribute("aria-label")?.includes(l));
  b?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}, lbl);
const dump = (tag) => page.evaluate((t) => {
  const slides = [...document.querySelectorAll(".keen-slider__slide")];
  const active = slides.findIndex((s) => s.querySelector('[class*="scale-100"]'));
  console.log(`[keen] ${t}: slides=${slides.length} activeVisual=${active}`);
}, tag);
await tap("Gilbert Mansion"); await page.waitForTimeout(1500); await dump("after-mansion");
await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Overview"))?.click(); });
await page.waitForTimeout(2500);
await tap("Barbershop"); await page.waitForTimeout(400); await dump("barbershop+400ms");
await page.waitForTimeout(1500); await dump("barbershop+1900ms");
// what does the URL say?
console.log("[keen] url:", await page.evaluate(() => location.search));
await browser.close();
