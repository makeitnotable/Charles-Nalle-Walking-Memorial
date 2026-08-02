import { chromium } from "playwright";
const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();
for (const path of ["/ferry", "/commissioners-office"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3500);
  const d = await page.evaluate(() => {
    const info = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const chain = [];
      let p = el.parentElement;
      while (p && p !== document.documentElement) {
        const s = getComputedStyle(p);
        chain.push({ tag: p.tagName, cls: (p.className + "").slice(0, 55), ov: s.overflowX, w: Math.round(p.getBoundingClientRect().width) });
        p = p.parentElement;
      }
      return { rect: { left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) }, transform: getComputedStyle(el).transform.slice(0, 60), chain: chain.slice(0, 6) };
    };
    const img = document.querySelector(".interlude-img");
    const span = [...document.querySelectorAll("span")].find((s) => /absolute/.test(s.className) && /opacity-0/.test(s.className) && /\d\d:\d\d/.test(s.textContent));
    return {
      scrollW: document.documentElement.scrollWidth,
      img: info(img),
      timeSpan: span ? { text: span.textContent, ...info(span) } : null,
    };
  });
  console.log("=====", path, JSON.stringify(d, null, 1));
  await ctx.close();
}
await browser.close();
