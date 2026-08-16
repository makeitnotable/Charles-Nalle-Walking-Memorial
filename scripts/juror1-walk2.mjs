// Mid-walk drag (pause? Continue label? snap-back?), Continue resumes, Stop the walk, Walk again, marker tap → Enter → chapter.
import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const ks = (process.argv[2] || "p390,d1440").split(",");
const st = (page) => page.evaluate(() => { const m = window.__troyMap; const mm = m?.map; return { walk: m?.state?.walk, idx: m?.state?.activeIdx, moving: mm?.isMoving?.(), zoom: +mm?.getZoom?.().toFixed(2), btn: [...document.querySelectorAll("button")].filter((b) => /stop the walk|continue|walk again/i.test(b.getAttribute("aria-label") || b.textContent)).map((b) => `${b.textContent.trim()} [${b.getAttribute("aria-label") || ""}]`).join("; "), active: document.querySelector('[aria-label^="Enter Spot"]')?.getAttribute("aria-label")?.slice(0, 13), pos: (() => { const f = document.querySelector('[aria-label*="Spot 01"]'); return f && Math.round(f.getBoundingClientRect().x); })() }; });
async function touchDrag(page, x0, y0, x1, y1, steps = 14, ms = 320) {
  const cdp = await page.context().newCDPSession(page);
  const t = (x, y) => [{ x, y, id: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: t(x0, y0) });
  for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: t(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps) }); await sleep(ms / steps); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
async function mouseDrag(page, x0, y0, x1, y1, steps = 14, ms = 320) {
  await page.mouse.move(x0, y0); await page.mouse.down();
  for (let i = 1; i <= steps; i++) { await page.mouse.move(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps); await sleep(ms / steps); }
  await page.mouse.up();
}
const R = {};
for (const k of ks) {
  const vp = VPS[k]; const drag = vp.mobile ? touchDrag : mouseDrag;
  const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await page.goto(BASE + "/map", { waitUntil: "networkidle" }); await sleep(4000);
  const rec = { t: [] };
  await page.getByRole("button", { name: /take the walk/i }).click();
  await sleep(4200); // should be on stop 2 by now
  rec.t.push({ s: "mid-walk before drag", ...(await st(page)) });
  const cardY = vp.mobile ? vp.height - 120 : vp.height - 200;
  // slow, deliberate 20px drag → should stay on same card, map does not move
  const posBefore = await st(page);
  await drag(page, vp.width * 0.5, cardY, vp.width * 0.5 - 20, cardY, 8, 300);
  const samples = []; for (let i = 0; i < 25; i++) { samples.push(await page.evaluate(() => { const f = document.querySelector('[aria-label*="Spot 01"]'); return f && Math.round(f.getBoundingClientRect().x); })); await sleep(16); }
  rec.smallDrag = { before: posBefore.pos, samples, after: await st(page) };
  await shot(page, `walk2-${k}-01-after-small-drag`);
  await sleep(1500);
  rec.t.push({ s: "1.5s after small drag", ...(await st(page)) });
  // Continue → resumes cycling from current card
  const cont = page.getByRole("button", { name: /continue/i });
  if (await cont.count()) { await cont.first().click(); const seq = []; for (let i = 0; i < 8; i++) { await sleep(700); seq.push((await st(page)).active); } rec.afterContinue = seq; rec.t.push({ s: "after Continue", ...(await st(page)) }); }
  // real flick: one card
  const b2 = await st(page);
  await drag(page, vp.width * 0.7, cardY, vp.width * 0.3, cardY, 8, 140);
  const s2 = []; for (let i = 0; i < 25; i++) { s2.push(await page.evaluate(() => { const f = document.querySelector('[aria-label*="Spot 01"]'); return f && Math.round(f.getBoundingClientRect().x); })); await sleep(16); }
  await sleep(1400);
  rec.flick = { before: b2, samples: s2, after: await st(page) };
  await shot(page, `walk2-${k}-02-after-flick`);
  // Stop the walk while walking: Continue first
  const cont2 = page.getByRole("button", { name: /continue/i });
  if (await cont2.count()) { await cont2.first().click(); await sleep(1200); }
  const stop = page.getByRole("button", { name: /stop the walk/i });
  if (await stop.count()) { await stop.first().click(); const mv = []; for (let i = 0; i < 12; i++) { await sleep(130); mv.push(await page.evaluate(() => window.__troyMap?.map?.isMoving?.())); } rec.stop = { moving: mv, after: await st(page) }; await shot(page, `walk2-${k}-03-stopped`); }
  // menu on phone while focused?
  rec.burger = await page.evaluate(() => { const b = document.querySelector(".cnwm-menu"); const cs = getComputedStyle(b); return { op: cs.opacity, pe: cs.pointerEvents, attrs: [...b.attributes].map((a) => a.name + "=" + a.value).join(" ") }; });
  // Enter the active card → chapter via curtain
  const enter = page.locator('[aria-label^="Enter Spot"]').first();
  const label = await enter.getAttribute("aria-label");
  await enter.click({ noWaitAfter: true });
  const frames = [];
  for (let i = 0; i < 12; i++) { await sleep(120); frames.push(await shot(page, `walk2-${k}-04-enter-f${String(i).padStart(2, "0")}`)); }
  await page.waitForLoadState("networkidle").catch(() => {}); await sleep(1000);
  rec.enter = { label, url: page.url(), title: await page.title() };
  await shot(page, `walk2-${k}-05-arrived`);
  // Back (browser) → map: state?
  await page.goBack({ waitUntil: "networkidle" }).catch(() => {}); await sleep(3000);
  rec.afterBrowserBack = { url: page.url(), ...(await st(page)) };
  await shot(page, `walk2-${k}-06-browser-back`);
  rec.log = log.filter((l) => !/ERR_ABORTED/.test(l));
  R[k] = rec; save(`walk2-${k}.json`, rec);
  await c.close();
}
console.log(JSON.stringify(R, null, 1));
await browser.close();
