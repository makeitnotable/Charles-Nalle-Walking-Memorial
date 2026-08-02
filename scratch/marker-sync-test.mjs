// Reproduce QA defect 2 locally: tap marker 3 (Gilbert Mansion) and marker 5 —
// the fronted card must match the tapped stop.
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:4321";
const browser = await chromium.launch();
for (const [w, h, name] of [[1440, 900, "1440"], [390, 844, "390"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE + "/map", { waitUntil: "networkidle" });
  await page.waitForTimeout(6000);
  for (const label of ["Gilbert Mansion", "Barbershop"]) {
    await page.evaluate((lbl) => {
      const btns = [...document.querySelectorAll("button.mapboxgl-marker")];
      const b = btns.find((x) => x.getAttribute("aria-label")?.includes(lbl));
      b?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, label);
    await page.waitForTimeout(1500);
    const fronted = await page.evaluate(() => {
      const slides = [...document.querySelectorAll(".keen-slider__slide")];
      const active = slides.find((s) => s.querySelector('[class*="scale-100"]'));
      return active?.textContent?.slice(0, 60) ?? "none";
    });
    console.log(`${name} tap "${label}" → fronted: ${fronted.trim().slice(0, 50)}`);
    // back to overview for next tap
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Overview"))?.click();
    });
    await page.waitForTimeout(2500);
  }
  await page.close();
}
await browser.close();
