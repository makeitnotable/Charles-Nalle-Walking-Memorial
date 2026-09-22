import { launch, ctx, VPS, OUT, goto, watchConsole, log, sleep, cdp } from "./juror11-lib.mjs";
import fs from "node:fs";
import path from "node:path";
const vpKey = process.argv[2] || "d1440";
const vp = VPS[vpKey];
const browser = await launch();

async function capture(name, route, prep, clickFn) {
  const c = await ctx(browser, vp, { dpr: 1 });
  const page = await c.newPage();
  const errs = watchConsole(page, name);
  const session = await cdp(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await goto(page, route, 3000);
  await prep(page);
  const dir = path.join(OUT, `frames-${name}-${vpKey}`);
  fs.mkdirSync(dir, { recursive: true });
  const frames = [];
  let t0 = null;
  session.on("Page.screencastFrame", async (ev) => {
    const t = Date.now();
    if (t0 !== null) frames.push({ t: t - t0, data: ev.data, url: (await page.evaluate(() => location.pathname).catch(() => "?")) });
    session.send("Page.screencastFrameAck", { sessionId: ev.sessionId }).catch(() => {});
  });
  await session.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 480, maxHeight: 480, everyNthFrame: 1 });
  await sleep(300);
  t0 = Date.now();
  await clickFn(page);
  await sleep(3200);
  await session.send("Page.stopScreencast").catch(() => {});
  // save frames
  const kept = [];
  for (const f of frames) { const p = path.join(dir, `f${String(f.t).padStart(5, "0")}.jpg`); fs.writeFileSync(p, Buffer.from(f.data, "base64")); kept.push({ t: f.t, url: f.url }); }
  log(name, vpKey, "frames:", kept.length, "url now:", page.url().replace(/.*Memorial/, ""), "errs:", errs.length ? errs : "none");
  log("  times:", kept.map((k) => k.t).join(","));
  await c.close();
  return dir;
}

// 1. map card → chapter
await capture("mapcard", "/map", async (page) => { await sleep(3000); }, async (page) => {
  const card = page.locator("button:visible, a:visible", { hasText: /Holeur|Bakery/i }).first();
  // On the overview, the card strip may be hidden; use the index list instead
  const idx = page.locator("a[href*='bakery']:visible").first();
  const bb = await idx.boundingBox();
  await page.evaluate((y) => scrollTo({ top: y - 200, behavior: "instant" }), bb.y + (await page.evaluate(() => scrollY)));
  await sleep(600);
  const bb2 = await idx.boundingBox();
  await page.mouse.click(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2);
});
// 2. chapter Continue → next chapter
await capture("continue", "/bakery", async (page) => { await page.evaluate(() => document.querySelector("#onward")?.scrollIntoView({ behavior: "instant" })); await sleep(1500); }, async (page) => {
  const cont = page.locator("#onward a", { hasText: /continue/i }).first();
  const bb = await cont.boundingBox();
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
});
// 3. home door → map
await capture("homedoor", "/", async (page) => { await sleep(1500); }, async (page) => {
  const cta = page.locator("a", { hasText: /Walk the story/i }).first();
  const bb = await cta.boundingBox();
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
});
// 4. menu link → people
await capture("menulink", "/about", async (page) => { await sleep(800); }, async (page) => {
  const burger = page.locator(".cnwm-menu button").first();
  const bb = await burger.boundingBox();
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await sleep(900);
  const link = page.locator(".cnwm-menu a", { hasText: /The people/i }).first();
  const lb = await link.boundingBox();
  await page.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2);
});
await browser.close();
