// juror9: page-transition capture — CDP screencast at 4x CPU; look for an uncovered frame of page B before the curtain hold
import { launch, goto, sleep, byText, VIEWPORTS, log, OUT, saveJson } from "./juror9-lib.mjs";
import fs from "node:fs";
import path from "node:path";

const key = process.argv[2] || "d1440";
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp, { dpr: 1 });
const cdp = await page.context().newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

async function capture(name, prep, trigger) {
  await prep();
  const dir = path.join(OUT, `frames-${key}-${name}`);
  fs.mkdirSync(dir, { recursive: true });
  const frames = [];
  const t0 = Date.now();
  const onFrame = async (ev) => {
    frames.push({ t: Date.now() - t0, data: ev.data });
    try { await cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }); } catch {}
  };
  cdp.on("Page.screencastFrame", onFrame);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 55, maxWidth: 720, maxHeight: 720, everyNthFrame: 1 });
  await sleep(300);
  const tClick = Date.now() - t0;
  await trigger();
  await sleep(4500);
  await cdp.send("Page.stopScreencast");
  cdp.off("Page.screencastFrame", onFrame);
  // save frames + a per-frame mean luminance profile (cheap: use sharp if present, else skip)
  let sharp = null; try { sharp = (await import("sharp")).default; } catch {}
  const profile = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const p = path.join(dir, `f${String(i).padStart(3, "0")}-${f.t - tClick}.jpg`);
    const buf = Buffer.from(f.data, "base64");
    fs.writeFileSync(p, buf);
    if (sharp) { const s = await sharp(buf).resize(36, 36, { fit: "fill" }).greyscale().raw().toBuffer(); let sum = 0; for (const b of s) sum += b; profile.push({ i, t: f.t - tClick, lum: Math.round(sum / s.length) }); }
  }
  log(name, "frames", frames.length, "url", page.url());
  log(JSON.stringify(profile.map((p) => `${p.t}:${p.lum}`).join(" ")));
  return { name, url: page.url(), n: frames.length, profile };
}

const results = [];
const only = (process.argv[3] || "").split(",").filter(Boolean);
const want = (n) => !only.length || only.includes(n);
try {
  // 1) home door → map
  if (want("home-door")) results.push(await capture("home-door", async () => { await goto(page, "/", 3000); }, async () => { const b = await byText(page, /Walk the story/i); const r = await b.boundingBox(); await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); }));
  // 2) chapter Continue → next chapter
  if (want("continue")) results.push(await capture("continue", async () => { await goto(page, "/mansion", 2500); const c = await byText(page, /^Continue/); await c.scrollIntoViewIfNeeded(); await sleep(1200); }, async () => { const c = await byText(page, /^Continue/); const r = await c.boundingBox(); await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); }));
  // 3) map index card → chapter
  if (want("map-card")) results.push(await capture("map-card", async () => { await goto(page, "/map", 5000); await page.evaluate(() => scrollTo({ top: innerHeight * 1.6, behavior: "instant" })); await sleep(1200); }, async () => { const a = page.locator("a", { hasText: /Commissioner/i }).filter({ has: page.locator(":scope") }).first(); let r = await a.boundingBox(); if (!r) { const cands = await page.evaluate(() => [...document.querySelectorAll("a")].filter((x) => /Commissioner/i.test(x.textContent || "") && x.getBoundingClientRect().height > 0 && x.getBoundingClientRect().top < innerHeight && x.getBoundingClientRect().top > 0).map((x) => { const b = x.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height, href: x.getAttribute("href") }; })); log("cands", JSON.stringify(cands)); r = cands[0]; } await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); }));
  // 4) menu link → people
  if (want("menu-link")) results.push(await capture("menu-link", async () => { await goto(page, "/ferry", 2500); const b = page.locator("button[aria-label='Open menu']").first(); const r = await b.boundingBox(); await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await sleep(900); }, async () => { const a = page.locator("a", { hasText: /The people/i }).first(); const r = await a.boundingBox(); await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); }));
} catch (e) { log("ERR", e); }
saveJson(`${key}-transitions`, { results, errors });
log("errors", JSON.stringify(errors));
await browser.close();
