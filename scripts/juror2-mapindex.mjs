import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
for (const vpk of (process.argv[2] || "p390,p360,land,t768,t1024,d1440").split(",")) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/map", 4000);
  const rows = page.locator('a[href*="/bakery"], a[href*="/commissioners-office"], a[href*="/mansion"], a[href*="/ferry"], a[href*="/barbershop"]');
  const info = await page.evaluate(() => [...document.querySelectorAll("main a[href]")].filter((a) => /Spot 0\d/.test(a.textContent)).map((a) => { const ar = a.getBoundingClientRect(); const h = a.querySelector("h2,h3,.t-title-sm,[class*=title]") || [...a.querySelectorAll("*")].find((e) => /HOLEUR|COMMISSIONER|GILBERT|FERRY|BARBERSHOP/i.test(e.textContent) && e.children.length === 0); const hr = h.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(h); const rects = [...range.getClientRects()]; const inkRight = Math.max(...rects.map((r) => r.right)); const arrow = [...a.querySelectorAll("svg, [class*=arrow], [class*=icon]")].pop(); const arr = arrow && arrow.getBoundingClientRect(); return { title: h.textContent.trim().replace(/\s+/g, " ").slice(0, 32), aRight: Math.round(ar.right), inkRight: Math.round(inkRight), inkLines: rects.length, arrowLeft: arr && Math.round(arr.left), arrowRight: arr && Math.round(arr.right), vw: innerWidth, ws: getComputedStyle(h).whiteSpace, tw: getComputedStyle(h).textWrap, overflowClipped: inkRight > ar.right + 1 }; }));
  console.log(vpk, JSON.stringify(info));
  await page.evaluate(() => { const a = [...document.querySelectorAll("main a[href]")].find((a) => /Spot 01/.test(a.textContent)); scrollTo(0, a.getBoundingClientRect().top + scrollY - 80); });
  await sleep(1200); await shot(page, `mapindex-${vpk}`);
  await c.close();
}
await browser.close();
