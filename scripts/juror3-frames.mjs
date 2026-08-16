import { launch, newPage, goto, sleep, cdp, VIEWPORTS, OUT } from "./juror3-lib.mjs";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Curtain frame capture with a CDP screencast at 4× CPU: card→chapter (map) and Continue→next (chapter)
const cases = [
  { name: "map-card", vp: "p390", route: "/map", act: async (page) => { await sleep(3500); await (await page.$('button:has-text("Take the walk")')).click(); await sleep(2200); const c = await page.$('[aria-label^="Enter Spot 01"]'); await c.click({ force: true }); } },
  { name: "continue", vp: "d1440", route: "/bakery", act: async (page) => { await page.evaluate(() => document.querySelector("#onward").scrollIntoView()); await sleep(1200); await (await page.$('a:has-text("Continue")')).click(); } },
  { name: "continue", vp: "p390", route: "/ferry", act: async (page) => { await page.evaluate(() => document.querySelector("#onward").scrollIntoView()); await sleep(1200); await (await page.$('a:has-text("Continue")')).click(); } },
  { name: "menu-link", vp: "d1440", route: "/about", act: async (page) => { await (await page.$('button[aria-label="Open menu"]')).click(); await sleep(900); await (await page.$('nav a[href$="/people"], a[href$="/people"]')).click(); } },
];
for (const c of cases) {
  const browser = await launch();
  const page = await newPage(browser, c.vp);
  const s = await cdp(page);
  await s.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await goto(page, c.route);
  await sleep(1500);
  const dir = path.join(OUT, `frames-${c.name}-${c.vp}`);
  fs.mkdirSync(dir, { recursive: true });
  const frames = [];
  let t0 = null;
  s.on("Page.screencastFrame", async (ev) => {
    frames.push({ t: ev.metadata.timestamp * 1000, data: ev.data });
    await s.send("Page.screencastFrameAck", { sessionId: ev.sessionId }).catch(() => {});
  });
  await s.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 480, maxHeight: 900, everyNthFrame: 1 });
  await sleep(300);
  t0 = Date.now();
  const clickWall = performance.timeOrigin + performance.now();
  await c.act(page);
  const clickAt = Date.now();
  await sleep(2600);
  await s.send("Page.stopScreencast");
  console.log(`\n== ${c.name} @${c.vp}: ${frames.length} frames, landed on ${page.url()}`);
  // Write frames and compute mean luminance + diff to detect page-B flash before cover
  let prev = null; const rows = [];
  const clickTs = frames.length ? null : null;
  // Estimate click time in screencast clock: screencast timestamps are epoch seconds → compare with clickAt (epoch ms)
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const buf = Buffer.from(f.data, "base64");
    const rel = Math.round(f.t - clickAt);
    const file = path.join(dir, `f${String(i).padStart(3, "0")}-${rel < 0 ? "m" + Math.abs(rel) : rel}.jpg`);
    fs.writeFileSync(file, buf);
    const { data, info } = await sharp(buf).resize(48, 90, { fit: "fill" }).greyscale().raw().toBuffer({ resolveWithObject: true });
    let sum = 0; for (const v of data) sum += v; const mean = sum / data.length;
    let diff = 0; if (prev) { for (let k = 0; k < data.length; k++) diff += Math.abs(data[k] - prev[k]); diff /= data.length; }
    prev = data;
    rows.push({ i, rel, mean: +mean.toFixed(1), diff: +diff.toFixed(1) });
  }
  console.log(rows.filter((r) => r.rel > -300 && r.rel < 2400).map((r) => `${r.i}:${r.rel}ms L=${r.mean} Δ=${r.diff}`).join("  "));
  await browser.close();
}
