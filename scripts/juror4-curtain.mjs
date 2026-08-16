import { launch, ctx, watch, sleep, goto, VPS, OUT } from "./juror4-lib.mjs";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
// node scripts/juror4-curtain.mjs p390 map-card|continue|menu
const vpk = process.argv[2] || "p390"; const vp = VPS[vpk];
const kase = process.argv[3] || "map-card";
const dir = path.join(OUT, `curtain-${kase}-${vpk}`); fs.mkdirSync(dir, { recursive: true });
const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
const cdp = await c.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
let target;
if (kase === "map-card") { await goto(page, "/map"); await sleep(3500); target = page.locator('main a[href*="/mansion"]:has-text("Spot")').first(); await target.scrollIntoViewIfNeeded(); await sleep(400); await page.evaluate(() => scrollBy(0, -120)); await sleep(500); }
else if (kase === "continue") { await goto(page, "/mansion"); await sleep(1500); target = page.locator('a:has-text("Continue")').first(); await target.scrollIntoViewIfNeeded(); await sleep(400); await page.evaluate(() => scrollBy(0, -160)); await sleep(500); }
else if (kase === "menu") { await goto(page, "/people"); await sleep(1500); await page.locator(".cnwm-menu-burger").click(); await sleep(800); target = page.locator('.cnwm-menu a[href*="/ferry"]').first(); }
const frames = [];
const t0 = Date.now();
cdp.on("Page.screencastFrame", async (f) => { frames.push({ t: Date.now() - t0, data: f.data, meta: f.metadata }); try { await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }); } catch {} });
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 55, maxWidth: 480, maxHeight: 900, everyNthFrame: 1 });
await sleep(300);
const tClick = Date.now() - t0;
await target.click();
await sleep(3500);
await cdp.send("Page.stopScreencast").catch(() => {});
console.log("frames", frames.length, "click at", tClick, "url", page.url());
// analyse: mean luminance per frame + save
const rows = [];
for (let i = 0; i < frames.length; i++) {
  const buf = Buffer.from(frames[i].data, "base64");
  const p = path.join(dir, `f${String(i).padStart(3, "0")}-${frames[i].t - tClick}.jpg`);
  fs.writeFileSync(p, buf);
  const st = await sharp(buf).greyscale().stats();
  rows.push({ i, t: frames[i].t - tClick, mean: +st.channels[0].mean.toFixed(1), std: +st.channels[0].stdev.toFixed(1) });
}
console.log(rows.map((r) => `${r.i}@${r.t}ms mean=${r.mean} std=${r.std}`).join("\n"));
// contact sheet of frames after click
const post = rows.filter((r) => r.t >= -100);
const cols = 8; const w = 120; const h = Math.round((w * vp.height) / vp.width);
const comps = [];
for (let k = 0; k < post.length; k++) { const r = post[k]; const b = await sharp(fs.readFileSync(path.join(dir, `f${String(r.i).padStart(3, "0")}-${r.t}.jpg`))).resize(w, h).png().toBuffer(); comps.push({ input: b, left: (k % cols) * (w + 4), top: Math.floor(k / cols) * (h + 18) + 14 }); comps.push({ input: Buffer.from(`<svg width="${w}" height="14"><text x="0" y="11" font-size="10" fill="#fff" font-family="sans-serif">${r.t}ms m${r.mean}</text></svg>`), left: (k % cols) * (w + 4), top: Math.floor(k / cols) * (h + 18) }); }
await sharp({ create: { width: cols * (w + 4), height: Math.ceil(post.length / cols) * (h + 18), channels: 3, background: "#333" } }).composite(comps).png().toFile(path.join(OUT, `curtain-${kase}-${vpk}.png`));
console.log("LOG", log.filter((l) => !/mp3|pbf/.test(l)));
await browser.close();
