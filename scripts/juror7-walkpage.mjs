// Scroll a page viewport by viewport (reveals fire), capture each, then a stitched strip
import { launch, ctx, goto, attachConsole, sleep, VIEWPORTS, OUT } from "./juror7-lib.mjs";
import sharp from "sharp"; import path from "node:path"; import fs from "node:fs";
const vp = process.argv[2]; const route = process.argv[3]; const V = VIEWPORTS[vp];
const tag = (route === "/" ? "home" : route.slice(1)) + "-" + vp;
const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const errs = []; attachConsole(page, tag, errs);
await goto(page, route); await sleep(1500);
const H = await page.evaluate(() => document.documentElement.scrollHeight);
const bufs = []; let y = 0; const step = Math.round(V.height * 0.9);
while (y < H - 10 && bufs.length < 40) { await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y); await sleep(900); bufs.push(await page.screenshot({ scale: "css" })); y += step; if (y >= H - V.height) { await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })); await sleep(900); bufs.push(await page.screenshot({ scale: "css" })); break; } }
const W = 360; const h = Math.round(V.height * W / V.width);
const cols = Math.min(bufs.length, 6); const rows = Math.ceil(bufs.length / cols);
const comps = [];
for (let i = 0; i < bufs.length; i++) comps.push({ input: await sharp(bufs[i]).resize(W, h).png().toBuffer(), left: (i % cols) * (W + 6), top: Math.floor(i / cols) * (h + 6) });
await sharp({ create: { width: cols * (W + 6), height: rows * (h + 6), channels: 3, background: "#ddd" } }).composite(comps).png().toFile(path.join(OUT, `walk-${tag}.png`));
console.log("frames", bufs.length, "H", H, "errs", JSON.stringify(errs.filter((e) => !/ERR_ABORTED/.test(e.text))));
await browser.close();
