// Curtain transitions via CDP screencast at 4x CPU: menu link (chapter → paintings), footer link (people → about), map card → chapter
import { launch, ctx, VPS, watch, sleep, go, save, OUT } from "./juror8-lib.mjs";
import fs from "node:fs";
import path from "node:path";
const key = process.argv[2] || "d1440";
const vp = VPS[key];
const out = {};
const browser = await launch();
async function capture(name, setup, trigger) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const cdp = await c.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await setup(page);
  const frames = [];
  const dir = path.join(OUT, `curtain-${name}-${key}`);
  fs.mkdirSync(dir, { recursive: true });
  cdp.on("Page.screencastFrame", async (ev) => { frames.push({ t: Date.now(), data: ev.data }); try { await cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }); } catch {} });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 480, maxHeight: 480, everyNthFrame: 1 });
  await sleep(300);
  const t0 = Date.now();
  await trigger(page);
  await sleep(3200);
  try { await cdp.send("Page.stopScreencast"); } catch {}
  // analyse: mean luminance per frame + save
  const rows = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const buf = Buffer.from(f.data, "base64");
    const p = path.join(dir, `f${String(i).padStart(3, "0")}-${f.t - t0}.jpg`);
    fs.writeFileSync(p, buf);
    rows.push({ i, t: f.t - t0, bytes: buf.length });
  }
  out[name] = { frames: rows, url: page.url() };
  await c.close();
}
await capture("menu-link", async (page) => { await go(page, "/mansion", 2500); await page.locator(".cnwm-menu-burger").click(); await sleep(800); }, async (page) => { const a = page.locator(".cnwm-menu a:has-text('The paintings')").first(); const b = await a.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); });
await capture("footer-link", async (page) => { await go(page, "/people", 2500); await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(1000); }, async (page) => { const a = page.locator("footer a:has-text('About the memorial')").first(); const b = await a.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); });
await capture("map-card", async (page) => { await go(page, "/map", 6000); const b = await page.locator("button:visible:has-text('Take the walk')").first().boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(2500); }, async (page) => { const s = page.locator(".keen-slider__slide").filter({ hasText: /Spot\s*1/ }).first(); const b = await s.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); });
await browser.close();
save(`curtain-${key}.json`, out);
console.log(JSON.stringify(out, null, 1));
