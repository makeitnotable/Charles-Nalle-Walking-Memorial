import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:4321/map", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const r = await page.evaluate(() => {
  const mapDiv = document.querySelector(".mapboxgl-map");
  if (!mapDiv) return { mapDiv: null };
  const cs = getComputedStyle(mapDiv);
  const links = [...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.href);
  return {
    rect: mapDiv.getBoundingClientRect(),
    position: cs.position, inset: cs.inset, height: cs.height,
    className: mapDiv.className,
    stylesheets: links,
  };
});
console.log(JSON.stringify(r, null, 2));
await browser.close();
