#!/usr/bin/env node
/**
 * UX walk (tablet + desktop) — script 05: the page-transition curtain, recorded via
 * CDP Page.startScreencast at 4× CPU throttle. Two transitions:
 *   A) /map → focus card → click card → chapter (curtain with date)
 *   B) /bakery "Continue" → /commissioners-office
 * Frames go to docs/v7/qa/uxwalk-desk/curtain-<A|B>-<nnn>.jpg; a contact sheet
 * curtain-<A|B>-sheet.png is assembled with sharp; 05-curtain.json holds per-frame
 * brightness so a "flash" (bright frame between two dark ones) is measurable.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const BASE = "http://localhost:4321";
const OUT = "docs/v7/qa/uxwalk-desk";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
const report = {};

async function record(tag, setup, trigger, ms = 4500) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await setup(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async (ev) => {
    frames.push({ t: ev.metadata.timestamp, data: ev.data });
    await cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 720, maxHeight: 450, everyNthFrame: 1 });
  const t0 = Date.now();
  await trigger(page);
  await page.waitForTimeout(ms);
  await cdp.send("Page.stopScreencast").catch(() => {});
  // Analyse frames
  const rows = [];
  const thumbs = [];
  for (let i = 0; i < frames.length; i++) {
    const buf = Buffer.from(frames[i].data, "base64");
    const img = sharp(buf);
    const stats = await img.stats();
    const mean = stats.channels.slice(0, 3).reduce((a, c) => a + c.mean, 0) / 3;
    // centre patch stats (where content would be)
    const meta = await img.metadata();
    const patch = await sharp(buf).extract({ left: Math.round(meta.width * 0.2), top: Math.round(meta.height * 0.2), width: Math.round(meta.width * 0.6), height: Math.round(meta.height * 0.6) }).stats();
    const pmean = patch.channels.slice(0, 3).reduce((a, c) => a + c.mean, 0) / 3;
    const pstd = patch.channels.slice(0, 3).reduce((a, c) => a + c.stdev, 0) / 3;
    rows.push({ i, t: +(frames[i].t - frames[0].t).toFixed(3), mean: +mean.toFixed(1), pmean: +pmean.toFixed(1), pstd: +pstd.toFixed(1) });
    if (i % 2 === 0 && thumbs.length < 48) thumbs.push(await sharp(buf).resize(240, 150, { fit: "fill" }).png().toBuffer());
    if (i < 200) writeFileSync(join(OUT, `curtain-${tag}-${String(i).padStart(3, "0")}.jpg`), buf);
  }
  // contact sheet 6 columns
  const cols = 6, w = 240, h = 150;
  const rowsN = Math.ceil(thumbs.length / cols);
  const composite = thumbs.map((b, i) => ({ input: b, left: (i % cols) * (w + 4), top: Math.floor(i / cols) * (h + 4) }));
  await sharp({ create: { width: cols * (w + 4), height: Math.max(1, rowsN) * (h + 4), channels: 3, background: "#ffffff" } }).composite(composite).png().toFile(join(OUT, `curtain-${tag}-sheet.png`));
  report[tag] = { frames: rows, count: frames.length, url: page.url() };
  await ctx.close();
}

// A) map card → chapter
await record("A", async (page) => {
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" }).catch(() => {});
  await page.waitForFunction(() => window.__troyMap?.map?.loaded(), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  // Take the walk, stop after first stop → focused on card 1
  await page.getByRole("button", { name: /take the walk/i }).first().click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /stop the walk/i }).first().click().catch(() => {});
  await page.waitForTimeout(1200);
}, async (page) => {
  const card = page.locator("[role='button'][aria-label^='Enter Chapter']").first();
  await card.click({ force: true });
}, 5000);

// B) chapter Continue → next chapter
await record("B", async (page) => {
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" }).catch(() => {});
  await page.waitForTimeout(1500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 900) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(80); }
  await page.evaluate(() => { const el = document.getElementById("onward"); scrollTo(0, el.getBoundingClientRect().top + scrollY + 200); });
  await page.waitForTimeout(1500);
}, async (page) => {
  await page.getByRole("link", { name: /continue/i }).first().click();
}, 5000);

// C) menu link → /people (wordmark curtain), for the "curtain-then-flash" check on a light page
await record("C", async (page) => {
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.locator(".cnwm-menu-burger").click();
  await page.waitForTimeout(800);
}, async (page) => {
  await page.getByRole("link", { name: /^the people$/i }).first().click();
}, 5000);

writeFileSync(join(OUT, "05-curtain.json"), JSON.stringify(report, null, 1));
await browser.close();
console.log("done 05", Object.entries(report).map(([k, v]) => k + ":" + v.count + " frames → " + v.url).join(" · "));
