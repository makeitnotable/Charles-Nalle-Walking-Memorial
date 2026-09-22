// Page-transition screencast at 4x CPU throttle: Continue (bakery→CO) and menu link (bakery→people)
import { launch, ctx, VIEWPORTS, BASE, sleep, OUT } from "./juror10-lib.mjs";
import fs from "node:fs";
import path from "node:path";
const vpKey = process.argv[2] || "d1440";
const vp = VIEWPORTS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp, { dpr: 1 });
const page = await c.newPage();
const cdp = await page.context().newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
async function record(name, act) {
  const frames = [];
  const handler = async (f) => { frames.push({ t: f.metadata.timestamp, data: f.data }); await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }); };
  cdp.on("Page.screencastFrame", handler);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 55, maxWidth: 720, maxHeight: 720, everyNthFrame: 1 });
  await sleep(400);
  const t0 = Date.now() / 1000;
  await act();
  await sleep(3500);
  await cdp.send("Page.stopScreencast");
  cdp.off("Page.screencastFrame", handler);
  const dir = path.join(OUT, `frames-${name}-${vpKey}`);
  fs.mkdirSync(dir, { recursive: true });
  const sharp = (await import("sharp")).default;
  const rows = [];
  let prev = null;
  for (let i = 0; i < frames.length; i++) {
    const buf = Buffer.from(frames[i].data, "base64");
    const tMs = Math.round((frames[i].t - t0) * 1000);
    fs.writeFileSync(path.join(dir, `f${String(i).padStart(3, "0")}-${tMs}.jpg`), buf);
    const raw = await sharp(buf).greyscale().resize(32, 32, { fit: "fill" }).raw().toBuffer();
    const sig = [...raw];
    const mean = sig.reduce((a, b) => a + b, 0) / sig.length;
    let diff = 0; if (prev) { for (let j = 0; j < sig.length; j++) diff += Math.abs(sig[j] - prev[j]); diff /= sig.length; }
    prev = sig;
    rows.push(`${i}@${tMs}:m${mean.toFixed(0)}/d${diff.toFixed(0)}`);
  }
  console.log(name, "frames", frames.length, "url now", page.url());
  console.log(rows.join(" "));
}
await page.goto(BASE + "/bakery", { waitUntil: "networkidle" }); await sleep(1500);
const cont = page.locator("#onward a.btn-solid");
await cont.scrollIntoViewIfNeeded(); await sleep(300);
await page.evaluate(() => scrollBy(0, -200)); await sleep(800);
const cb = await cont.boundingBox();
await record("continue", async () => { await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); });
// menu link → people
await page.evaluate(() => scrollTo(0, 0)); await sleep(500);
await page.click(".cnwm-menu-burger"); await sleep(800);
const link = page.locator(".cnwm-menu a", { hasText: "The people" }).first();
const lb = await link.boundingBox();
await record("menu-people", async () => { await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2); });
// map card → chapter
await page.goto(BASE + "/map", { waitUntil: "networkidle" }); await sleep(3500);
const card = page.locator('[aria-label^="Enter Spot 01"]').first();
const cbb = await card.boundingBox();
if (cbb) await record("map-card", async () => { await page.mouse.click(cbb.x + cbb.width / 2, cbb.y + cbb.height / 2); });
else console.log("no card visible for map-card case");
await browser.close();
