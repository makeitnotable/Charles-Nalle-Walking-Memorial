import { chromium } from "playwright";
const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();
for (const path of ["/ferry", "/commissioners-office"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3500);
  const d = await page.evaluate(() => {
    const b = document.querySelector("button.cnwm-menu-burger");
    const r = b?.getBoundingClientRect();
    const cs = b ? getComputedStyle(b) : null;
    let anc = [], el = b?.parentElement;
    while (el && el !== document.body) {
      const s = getComputedStyle(el);
      if (s.transform !== "none" || s.position !== "static" || s.filter !== "none" || s.willChange !== "auto")
        anc.push({ tag: el.tagName, cls: (el.className + "").slice(0, 50), pos: s.position, tr: s.transform.slice(0, 40), wc: s.willChange });
      el = el.parentElement;
    }
    return {
      innerW: innerWidth, innerH: innerHeight,
      vv: { w: Math.round(visualViewport.width), h: Math.round(visualViewport.height), scale: visualViewport.scale },
      scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
      horizOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      burger: r ? { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width) } : null,
      burgerPos: cs?.position, burgerBottom: cs?.bottom, burgerRight: cs?.right,
      positionedAncestors: anc,
    };
  });
  console.log(path, JSON.stringify(d, null, 1));
  // scroll down a bit: does the burger come into view / stay fixed?
  await page.evaluate(() => scrollBy(0, 600));
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => {
    const b = document.querySelector("button.cnwm-menu-burger");
    const r = b?.getBoundingClientRect();
    return r ? { left: Math.round(r.left), top: Math.round(r.top), scrollY: Math.round(scrollY) } : null;
  });
  console.log(path, "after 600px scroll:", JSON.stringify(after));
  await ctx.close();
}
await browser.close();
