// Curtain transitions under 4x CPU throttle: CDP screencast frames
import { launch, ctx, goto, attachConsole, sleep, writeJson, VIEWPORTS, OUT } from "./juror7-lib.mjs";
import fs from "node:fs"; import path from "node:path"; import sharp from "sharp";
const vp = process.argv[2] || "390"; const V = VIEWPORTS[vp];
const errs = []; const log = {};
const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); attachConsole(page, "trans-" + vp, errs);
const session = await c.newCDPSession(page);
await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
const dir = path.join(OUT, `frames-${vp}`); fs.mkdirSync(dir, { recursive: true });
async function record(name, prep, act, waitRe) {
  await prep();
  const frames = [];
  const onFrame = async (ev) => { frames.push({ t: Date.now(), data: ev.data, meta: ev.metadata }); try { await session.send("Page.screencastFrameAck", { sessionId: ev.sessionId }); } catch {} };
  session.on("Page.screencastFrame", onFrame);
  await session.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 480, maxHeight: 900, everyNthFrame: 1 });
  await sleep(300);
  const t0 = Date.now();
  await act();
  await page.waitForURL(waitRe, { timeout: 20000 }).catch(() => {});
  const tNav = Date.now();
  await sleep(2200);
  await session.send("Page.stopScreencast"); session.off("Page.screencastFrame", onFrame);
  const rows = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i]; const rel = f.t - t0; if (rel < -250) continue;
    const buf = Buffer.from(f.data, "base64");
    const st = await sharp(buf).greyscale().stats();
    const mean = st.channels[0].mean;
    const fn = `${name}-${String(i).padStart(3, "0")}-${rel >= 0 ? "" : "m"}${Math.abs(rel)}.jpg`;
    fs.writeFileSync(path.join(dir, fn), buf);
    rows.push({ i, rel, mean: Math.round(mean * 10) / 10, fn });
  }
  log[name] = { navMs: tNav - t0, frames: rows, url: page.url() };
  return rows;
}
const only = process.argv[3];
// 1. map card -> chapter
if (!only || only === "mapcard") await record("mapcard", async () => { await goto(page, "/map"); await sleep(5000); const t = page.locator("button", { hasText: "Take the walk" }).locator("visible=true").first(); const tb = await t.boundingBox(); await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2); await sleep(4500); }, async () => { const card = page.locator('[aria-label^="Enter Spot"]').first(); const b = await card.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }, /bakery|commissioners|mansion|ferry|barbershop/);
// 2. Continue -> next chapter
if (!only || only === "continue") await record("continue", async () => { await goto(page, "/bakery"); await sleep(1500); await page.evaluate(() => { const a = [...document.querySelectorAll("a")].find((x) => /Continue/.test(x.textContent) && /commissioners/.test(x.href)); scrollTo({ top: a.getBoundingClientRect().top + scrollY - innerHeight * 0.6, behavior: "instant" }); }); await sleep(1500); }, async () => { const a = page.locator('a[href$="/commissioners-office"]').filter({ hasText: /Continue/ }).first(); const b = await a.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }, /commissioners-office/);
// 3. menu link -> people
if (!only || only === "menu") await record("menu", async () => { await goto(page, "/mansion"); await sleep(1500); const mb = await page.locator('button[aria-label="Open menu"]').boundingBox(); await page.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2); await sleep(900); }, async () => { const a = page.locator('.cnwm-menu a[href$="/people"]').first(); const b = await a.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }, /people/);
// 4. home door -> map
if (!only || only === "home") await record("home", async () => { await goto(page, "/"); await sleep(2500); }, async () => { const a = page.locator('a[href$="/map"]').first(); const b = await a.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }, /map/);
writeJson(`transitions-${vp}${only ? "-" + only : ""}`, { log, errs });
for (const k of Object.keys(log)) console.log(k, "navMs", log[k].navMs, log[k].frames.map((f) => `${f.rel}:${f.mean}`).join(" "));
console.log("ERRS", JSON.stringify(errs.filter((e) => !/ERR_ABORTED/.test(e.text))));
await browser.close();
