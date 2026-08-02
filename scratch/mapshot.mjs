import { chromium } from "playwright";
const b = await chromium.launch();
for (const vp of [{ n: "1440", w: 1440, h: 900 }, { n: "390", w: 390, h: 844 }]) {
  const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } });
  await p.goto("http://localhost:4321/map", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(9000); // intro flight + route self-draw + hint timeout
  await p.screenshot({ path: `docs/v4/qa/p3-map/map--${vp.n}.png` });
  await p.close();
  console.log("shot", vp.n);
}
await b.close();
