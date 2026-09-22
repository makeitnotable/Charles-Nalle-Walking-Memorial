import { launch, ctx, watch, sleep, save, goto, VPS, OUT } from "./juror5-lib.mjs";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
// usage: node juror5-curtain.mjs p390 map-card | continue | menu
const key = process.argv[2] || "p390";
const kase = process.argv[3] || "map-card";
const vp = VPS[key];
const browser = await launch();
const c = await ctx(browser, vp, { deviceScaleFactor: 1 });
const page = await c.newPage();
const log = watch(page);
const cdp = await c.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
const frames = [];
let t0 = 0;
cdp.on("Page.screencastFrame", async (f) => {
  frames.push({ t: Math.round(performance.now() - t0), data: f.data });
  await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
let clickTarget;
if (kase === "map-card") {
  await goto(page, "/map"); await sleep(6000);
  await page.getByRole("button", { name: /take the walk/i }).click(); await sleep(3000);
  // click the active card (Enter Spot)
  clickTarget = page.locator("[aria-label^='Enter Spot']").first();
} else if (kase === "continue") {
  await goto(page, "/bakery"); await sleep(1500);
  const cont = page.locator("a").filter({ hasText: /^continue/i }).first();
  await cont.scrollIntoViewIfNeeded(); await sleep(1200);
  clickTarget = cont;
} else if (kase === "menu") {
  await goto(page, "/people"); await sleep(1500);
  await page.locator('button[aria-label*="menu" i]').first().click(); await sleep(900);
  clickTarget = page.locator("a").filter({ hasText: /^the paintings$/i }).first();
} else if (kase === "home") {
  await goto(page, "/"); await sleep(2000);
  clickTarget = page.locator("a").filter({ hasText: /walk the story/i }).first();
}
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 480, maxHeight: 1000, everyNthFrame: 1 });
await sleep(300);
t0 = performance.now();
await clickTarget.click({ force: true });
await sleep(3200);
await cdp.send("Page.stopScreencast");
const dir = path.join(OUT, `curtain-${kase}-${key}`);
fs.mkdirSync(dir, { recursive: true });
// save frames + build a contact sheet of up to 40 frames spread evenly
const pick = frames.length > 40 ? frames.filter((_, i) => i % Math.ceil(frames.length / 40) === 0) : frames;
const tiles = [];
for (const f of pick) {
  const buf = Buffer.from(f.data, "base64");
  const meta = await sharp(buf).metadata();
  const w = 160, h = Math.round((meta.height / meta.width) * 160);
  const img = await sharp(buf).resize(w, h).png().toBuffer();
  tiles.push({ img, w, h, t: f.t });
}
const cols = 8, rows = Math.ceil(tiles.length / cols);
const th = Math.max(...tiles.map((t) => t.h)) + 18;
const sheet = sharp({ create: { width: cols * 164, height: rows * th, channels: 3, background: "#222" } });
const comps = [];
tiles.forEach((t, i) => {
  comps.push({ input: t.img, left: (i % cols) * 164, top: Math.floor(i / cols) * th });
  const label = Buffer.from(`<svg width="160" height="16"><text x="2" y="12" font-size="12" fill="#fff" font-family="sans-serif">${t.t}ms</text></svg>`);
  comps.push({ input: label, left: (i % cols) * 164, top: Math.floor(i / cols) * th + t.h });
});
await sheet.composite(comps).png().toFile(path.join(OUT, `curtain-${kase}-${key}-sheet.png`));
// luminance timeline: mean brightness of each frame (dark curtain ~ low)
const lum = [];
for (const f of frames) { const s = await sharp(Buffer.from(f.data, "base64")).resize(32, 32).greyscale().raw().toBuffer(); let sum = 0; for (const b of s) sum += b; lum.push({ t: f.t, l: Math.round(sum / s.length) }); }
save(`curtain-${kase}-${key}.json`, { frames: frames.length, lum, url: page.url(), log });
console.log(JSON.stringify({ frames: frames.length, lum, url: page.url(), errors: log.errors }, null, 0));
await c.close(); await browser.close();
