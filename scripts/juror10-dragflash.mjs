// Screencast the phone card-drag settle to see whether the one-frame position blip paints
import { launch, ctx, VIEWPORTS, BASE, sleep, touchDrag, OUT } from "./juror10-lib.mjs";
import fs from "node:fs";
import path from "node:path";
const vpKey = process.argv[2] || "p390";
const vp = VIEWPORTS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp, { dpr: 1 });
const page = await c.newPage();
await page.goto(BASE + "/map", { waitUntil: "networkidle" });
await sleep(3500);
const twk = page.locator("button:visible", { hasText: "Take the walk" }).first();
const tb = await twk.boundingBox();
await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
await sleep(6500);
const strip = await page.evaluate(() => { const cards = [...document.querySelectorAll('[aria-label^="Focus Spot"], [aria-label^="Enter Spot"]')]; const rs = cards.map((c) => c.getBoundingClientRect()); return { top: Math.min(...rs.map((r) => r.top)), bottom: Math.max(...rs.map((r) => r.bottom)) }; });
const cy = (strip.top + strip.bottom) / 2, cx = vp.width / 2;
const cdp = await page.context().newCDPSession(page);
const frames = [];
cdp.on("Page.screencastFrame", async (f) => { frames.push({ t: f.metadata.timestamp, data: f.data }); await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }); });
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, everyNthFrame: 1 });
await sleep(300);
const t0 = Date.now();
await touchDrag(page, cx + 60, cy, cx - 100, cy, 16, 220);
const dragEnd = Date.now();
await sleep(1600);
await cdp.send("Page.stopScreencast");
const dir = path.join(OUT, `dragflash-${vpKey}`);
fs.mkdirSync(dir, { recursive: true });
// write frames and compute per-frame strip-region signature (mean luminance in card strip band)
const sharp = (await import("sharp")).default;
let prev = null;
const rows = [];
for (let i = 0; i < frames.length; i++) {
  const buf = Buffer.from(frames[i].data, "base64");
  const meta = await sharp(buf).metadata();
  const scaleY = meta.height / vp.height, scaleX = meta.width / vp.width;
  const region = { left: 0, top: Math.round(strip.top * scaleY), width: meta.width, height: Math.round((strip.bottom - strip.top) * scaleY) };
  const raw = await sharp(buf).extract(region).greyscale().resize(64, 8, { fit: "fill" }).raw().toBuffer();
  const sig = [...raw];
  let diff = 0;
  if (prev) { for (let j = 0; j < sig.length; j++) diff += Math.abs(sig[j] - prev[j]); diff /= sig.length; }
  prev = sig;
  const tMs = Math.round((frames[i].t * 1000) - t0);
  rows.push({ i, tMs, diff: +diff.toFixed(1) });
  fs.writeFileSync(path.join(dir, `f${String(i).padStart(3, "0")}-${tMs}.jpg`), buf);
}
console.log("frames:", frames.length, "dragEnd at +", dragEnd - t0, "ms");
console.log(rows.map((r) => `${r.i}@${r.tMs}:${r.diff}`).join("  "));
await browser.close();
