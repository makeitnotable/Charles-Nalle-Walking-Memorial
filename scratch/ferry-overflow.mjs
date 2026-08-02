import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:4321/ferry", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const wide = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > 391 && r.width > 10) {
      out.push(`${el.tagName}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)} w=${Math.round(r.width)}`);
    }
  });
  return { scrollWidth: document.documentElement.scrollWidth, items: out.slice(0, 12) };
});
console.log(JSON.stringify(wide, null, 1));
await browser.close();
