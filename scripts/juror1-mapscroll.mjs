// Can a phone visitor scroll past the map by touch? Try drags at several start points.
import { launch, ctx, watch, shot, sleep, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const k = process.argv[2] || "p390";
const vp = VPS[k];
const c = await ctx(browser, vp);
const page = await c.newPage();
watch(page);
await page.goto(BASE + "/map", { waitUntil: "networkidle" });
await sleep(4000);
async function touchDrag(x0, y0, x1, y1, steps = 12, ms = 300) {
  const cdp = await page.context().newCDPSession(page);
  const t = (x, y) => [{ x, y, id: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: t(x0, y0) });
  for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: t(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps) }); await sleep(ms / steps); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
const tries = [
  ["map centre", vp.width / 2, vp.height * 0.5],
  ["bottom band centre (chevron)", vp.width / 2, vp.height - 8],
  ["bottom band left of CTA", 30, vp.height - 40],
  ["between CTA and burger", vp.width - 90, vp.height - 30],
  ["just above CTA", vp.width / 2, vp.height - 100],
];
for (const [name, x, y] of tries) {
  await page.evaluate(() => scrollTo(0, 0)); await sleep(500);
  const el = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && `${e.tagName}.${(e.className || "").toString().slice(0, 40)} touch-action=${getComputedStyle(e).touchAction}`; }, [x, y]);
  await touchDrag(x, y, x, y - 400, 14, 350);
  await sleep(1000);
  const sy = await page.evaluate(() => scrollY);
  console.log(name, `@${x},${y}`, el, "→ scrollY", sy);
  if (sy > 50) await shot(page, `mapscroll-${k}-${name.replace(/\W+/g, "_")}`);
}
// wheel (desktop-like) for reference
await page.evaluate(() => scrollTo(0, 0));
await page.mouse.move(vp.width / 2, vp.height / 2); await page.mouse.wheel(0, 500); await sleep(800);
console.log("wheel over map → scrollY", await page.evaluate(() => scrollY));
await browser.close();
