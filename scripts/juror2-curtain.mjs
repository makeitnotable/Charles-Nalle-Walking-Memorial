// Curtain transitions under 4x CPU throttle: CDP screencast contact sheets for Continue→next and map card→chapter, menu link.
import { launch, ctx, VPS, go, sleep, OUT, BASE } from "./juror2-lib.mjs";
import fs from "node:fs";
import path from "node:path";
const browser = await launch();
async function capture(page, cdp, name, action, ms = 2600) {
  const frames = [];
  const onFrame = async (p) => { frames.push({ t: Date.now(), data: p.data }); await cdp.send("Page.screencastFrameAck", { sessionId: p.sessionId }).catch(() => {}); };
  cdp.on("Page.screencastFrame", onFrame);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 480, maxHeight: 900, everyNthFrame: 1 });
  await sleep(300);
  const t0 = Date.now();
  await action();
  await sleep(ms);
  await cdp.send("Page.stopScreencast").catch(() => {});
  cdp.off("Page.screencastFrame", onFrame);
  const dir = path.join(OUT, "curtain", name); fs.mkdirSync(dir, { recursive: true });
  const kept = frames.filter((f) => f.t >= t0 - 150);
  kept.forEach((f, i) => fs.writeFileSync(path.join(dir, `f${String(i).padStart(3, "0")}-${f.t - t0}.jpg`), Buffer.from(f.data, "base64")));
  console.log(name, "frames:", kept.length, "span", kept.length ? `${kept[0].t - t0}..${kept[kept.length - 1].t - t0}ms` : "");
  return kept.map((f) => f.t - t0);
}
for (const vpk of (process.argv[2] || "p390,d1440").split(",")) {
  const vp = VPS[vpk];
  // A. Continue → next chapter
  {
    const c = await ctx(browser, vp); const page = await c.newPage(); const cdp = await c.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await go(page, "/mansion", 2500);
    const cta = page.locator("#onward a", { hasText: "Continue" }).first(); await cta.scrollIntoViewIfNeeded(); await sleep(800);
    await capture(page, cdp, `continue-${vpk}`, () => cta.click({ noWaitAfter: true }), 3200);
    console.log(`continue-${vpk} landed on`, page.url());
    await c.close();
  }
  // B. Map card → chapter
  {
    const c = await ctx(browser, vp); const page = await c.newPage(); const cdp = await c.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await go(page, "/map", 6000);
    await page.locator('button:visible:has-text("Take the walk")').click(); await sleep(2500);
    const card = page.locator("[aria-label^='Enter Spot']").first();
    await capture(page, cdp, `mapcard-${vpk}`, async () => { const b = await card.boundingBox(); if (vp.mobile) { const cd = await c.newCDPSession(page); const pt = { x: b.x + b.width / 2, y: b.y + b.height / 2, radiusX: 2, radiusY: 2, force: 1, id: 1 }; await cd.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pt] }); await sleep(50); await cd.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cd.detach(); } else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }, 3400);
    console.log(`mapcard-${vpk} landed on`, page.url());
    await c.close();
  }
  // C. Menu link (chapter → /about)
  {
    const c = await ctx(browser, vp); const page = await c.newPage(); const cdp = await c.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await go(page, "/ferry", 2500);
    await page.locator('button[aria-label="Open menu"]').click(); await sleep(900);
    const link = page.locator('a:visible', { hasText: /^About$/ }).first();
    await capture(page, cdp, `menu-${vpk}`, () => link.click({ noWaitAfter: true }), 3200);
    console.log(`menu-${vpk} landed on`, page.url());
    await c.close();
  }
}
await browser.close();
