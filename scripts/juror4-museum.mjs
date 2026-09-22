import { launch, ctx, watch, shot, sleep, save, goto, VPS, floating, touchDrag, touchTap } from "./juror4-lib.mjs";
const vpk = process.argv[2] || "d1440";
const vp = VPS[vpk];
const R = { vpk, steps: [] };
const step = (name, data) => { R.steps.push({ name, ...data }); console.log(name, JSON.stringify(data).slice(0, 700)); };
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/paintings"); await sleep(1500);
await shot(page, `mus-${vpk}-00-top`);
const M = () => page.evaluate(() => { const m = window.__museum; const s = m.state; return { mode: s.mode, railT: +s.railT.toFixed(3), railIdx: s.railIdx, approached: s.approached, zoom: s.zoom, alive: s.alive, look: { yaw: +s.look.yaw.toFixed(2), pitch: +s.look.pitch.toFixed(2) }, sheet: s.sheet, fov: s.fov, calls: m.info?.render?.calls }; });
const UI = () => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.opacity !== "0" && cs.display !== "none" && r.bottom > 0 && r.top < innerHeight; };
  const rect = (e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; };
  const els = [...document.querySelectorAll("#museum-slot button, #museum-slot p, #museum-slot h2, #museum-slot h3, #museum-slot blockquote, .cnwm-menu-burger")].filter(vis).filter((e) => !/Approach/.test(e.getAttribute("aria-label") || ""));
  return els.map((e) => `${e.tagName} ${(e.getAttribute("aria-label") || e.innerText || "").replace(/\s+/g, " ").slice(0, 60)} @${rect(e)}`);
});
const slotTop = await page.evaluate(() => document.querySelector("#museum-slot").offsetTop);
const slotH = await page.evaluate(() => document.querySelector("#museum-slot").offsetHeight);
step("slot", { slotTop, slotH });
// walk the rail
for (const f of [0, 0.15, 0.4, 0.7, 1.0]) {
  await page.evaluate((y) => scrollTo(0, y), slotTop + (slotH - vp.height) * f); await sleep(1300);
  await shot(page, `mus-${vpk}-01-rail-${Math.round(f * 100)}`);
  step("rail", { f, m: await M(), ui: await UI() });
}
// scroll to hall end and see the threshold + grid
await page.evaluate((y) => scrollTo(0, y), slotTop + slotH - vp.height + 10); await sleep(1000);
await shot(page, `mus-${vpk}-02-hall-end`);
await page.evaluate((y) => scrollTo(0, y), slotTop + slotH + 200); await sleep(1000);
await shot(page, `mus-${vpk}-03-grid`);
// back to the middle of the rail; drag to look
await page.evaluate((y) => scrollTo(0, y), slotTop + (slotH - vp.height) * 0.4); await sleep(1200);
const cx = vp.width / 2, cy = vp.height / 2;
if (vp.mobile) await touchDrag(page, cx + 100, cy, cx - 140, cy + 20, 14, 300);
else { await page.mouse.move(cx + 100, cy); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(cx + 100 - (240 * i) / 14, cy + i, { steps: 1 }); await sleep(20); } await page.mouse.up(); }
await sleep(900);
await shot(page, `mus-${vpk}-04-looked`);
step("looked", { m: await M(), ui: await UI() });
const face = page.locator('#museum-slot button:has-text("Face forward"), #museum-slot button:has-text("Recenter")').first();
step("face-btn", { count: await face.count(), box: await face.boundingBox().catch(() => null) });
if (await face.count()) { await face.click(); await sleep(1000); step("faced", { m: await M() }); }
// look further: full turn?
if (!vp.mobile) { await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 30; i++) { await page.mouse.move(cx - 30 * i, cy, { steps: 1 }); await sleep(12); } await page.mouse.up(); await sleep(800); await shot(page, `mus-${vpk}-05-turned`); step("turned", { m: await M() }); if (await face.count()) { await face.click(); await sleep(900); } }
// approach by clicking on a painting: which painting is nearest / on screen?
const rects = await page.evaluate(() => Array.from({ length: 10 }, (_, i) => { const r = window.__museum.paintingRect(i); return { i, l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), behind: r.behind }; }));
const onScreen = rects.filter((r) => !r.behind && r.l >= 0 && r.r <= vp.width && r.t >= 0 && r.b <= vp.height);
step("rects", { onScreen });
const target = onScreen[0] || rects.find((r) => !r.behind && r.r > 0 && r.l < vp.width);
const tx = Math.min(vp.width - 10, Math.max(10, (target.l + target.r) / 2)), ty = Math.min(vp.height - 10, Math.max(10, (target.t + target.b) / 2));
if (vp.mobile) await touchTap(page, tx, ty); else await page.mouse.click(tx, ty);
await sleep(2200);
await shot(page, `mus-${vpk}-06-approach`);
const ap = await M();
const apRect = await page.evaluate((i) => window.__museum.paintingRect(i), ap.approached ?? target.i);
step("approach", { clicked: target.i, m: ap, rect: apRect, centre: { cx: +((apRect.left + apRect.right) / 2 / vp.width).toFixed(3), cy: +((apRect.top + apRect.bottom) / 2 / vp.height).toFixed(3) }, aspect: +((apRect.right - apRect.left) / (apRect.bottom - apRect.top)).toFixed(3), ui: await UI() });
// tap the painting: bring it to life
if (vp.mobile) await touchTap(page, (apRect.left + apRect.right) / 2, (apRect.top + apRect.bottom) / 2); else await page.mouse.click((apRect.left + apRect.right) / 2, (apRect.top + apRect.bottom) / 2);
await sleep(1800);
await shot(page, `mus-${vpk}-07-alive`);
step("alive", { m: await M(), video: await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => ({ src: v.currentSrc.split("/").pop(), paused: v.paused, t: +v.currentTime.toFixed(1), rs: v.readyState }))) });
// tap again: rest
if (vp.mobile) await touchTap(page, (apRect.left + apRect.right) / 2, (apRect.top + apRect.bottom) / 2); else await page.mouse.click((apRect.left + apRect.right) / 2, (apRect.top + apRect.bottom) / 2);
await sleep(900);
step("rest-again", { m: await M() });
// phone: peek sheet drag
if (vp.mobile && vp.width < 700) {
  const hdr = page.locator('#museum-slot button[aria-label*="plaque" i], #museum-slot [aria-label*="Expand" i]').first();
  const hb = await hdr.boundingBox().catch(() => null);
  step("sheet-header", { hb, ui: await UI() });
  if (hb) {
    // tap header
    await touchTap(page, hb.x + hb.width / 2, hb.y + hb.height / 2); await sleep(900);
    await shot(page, `mus-${vpk}-08-sheet-tap`);
    step("sheet-after-tap", { m: await M(), ui: await UI() });
    // drag it back down
    const hb2 = await hdr.boundingBox().catch(() => hb);
    await touchDrag(page, hb2.x + hb2.width / 2, hb2.y + 10, hb2.x + hb2.width / 2, vp.height - 30, 14, 300); await sleep(900);
    await shot(page, `mus-${vpk}-09-sheet-dragdown`);
    step("sheet-after-drag-down", { m: await M(), ui: await UI() });
    // drag it up
    const hb3 = await hdr.boundingBox().catch(() => hb);
    await touchDrag(page, hb3.x + hb3.width / 2, hb3.y + 10, hb3.x + hb3.width / 2, hb3.y - 300, 14, 300); await sleep(900);
    await shot(page, `mus-${vpk}-10-sheet-dragup`);
    step("sheet-after-drag-up", { m: await M(), ui: await UI(), rect: await page.evaluate((i) => window.__museum.paintingRect(i), ap.approached ?? target.i) });
  }
}
// Back to the hall
const back = page.locator('#museum-slot button:has-text("Back to the hall")').first();
step("back-btn", { box: await back.boundingBox().catch(() => null) });
await back.click(); await sleep(1500);
step("after-back", { m: await M(), ui: await UI() });
await shot(page, `mus-${vpk}-11-back`);
// approach the LAST painting via dot (portrait)
const lastDot = page.locator('#museum-slot button[aria-label^="Approach"]').last();
await lastDot.click({ force: true }); await sleep(2600);
await shot(page, `mus-${vpk}-12-last`);
const lm = await M();
const lr = await page.evaluate((i) => window.__museum.paintingRect(i), 9);
step("last", { m: lm, rect: lr, aspect: +((lr.right - lr.left) / (lr.bottom - lr.top)).toFixed(3), centre: { cx: +((lr.left + lr.right) / 2 / vp.width).toFixed(3), cy: +((lr.top + lr.bottom) / 2 / vp.height).toFixed(3) }, ui: await UI() });
// Esc
await page.keyboard.press("Escape"); await sleep(1200);
step("esc", { m: await M() });
// keyboard: Tab to a dot, Enter, arrows, Esc
if (!vp.mobile) {
  await page.locator('#museum-slot button[aria-label^="Approach"]').first().focus(); await sleep(200);
  await page.keyboard.press("Enter"); await sleep(2000);
  step("kb-enter", { m: await M(), focused: await page.evaluate(() => { const a = document.activeElement; return a && `${a.tagName} ${a.getAttribute("aria-label") || a.innerText}`.slice(0, 60); }) });
  await shot(page, `mus-${vpk}-13-kb-approach`);
  await page.keyboard.press("ArrowRight"); await sleep(1800);
  step("kb-right", { m: await M() });
  await page.keyboard.press("Escape"); await sleep(1200);
  step("kb-esc", { m: await M(), focused: await page.evaluate(() => { const a = document.activeElement; return a && `${a.tagName} ${a.getAttribute("aria-label") || a.innerText}`.slice(0, 60); }) });
  await page.keyboard.press("ArrowLeft"); await sleep(600);
  step("kb-left-rail", { m: await M() });
  // Tab order through the museum controls
  const tabs = [];
  await page.locator('#museum-slot button:has-text("Skip the hall")').focus();
  for (let i = 0; i < 16; i++) { await page.keyboard.press("Tab"); await sleep(80); tabs.push(await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return `${a.tagName} ${(a.getAttribute("aria-label") || a.innerText || "").replace(/\s+/g, " ").slice(0, 40)} ${Math.round(r.width)}x${Math.round(r.height)} ol:${cs.outlineStyle}/${cs.outlineWidth} bs:${cs.boxShadow.slice(0, 30)}`; })); }
  step("tabs", { tabs });
}
// Skip the hall
await page.evaluate((y) => scrollTo(0, y), slotTop + 50); await sleep(900);
const skip = page.locator('#museum-slot button:has-text("Skip the hall")').first();
step("skip", { box: await skip.boundingBox().catch(() => null) });
await skip.click(); await sleep(1500);
step("after-skip", { y: await page.evaluate(() => scrollY), m: await M() });
await shot(page, `mus-${vpk}-14-after-skip`);
// open a grid tile dialog
const tile = page.locator("button.painting-open").last();
await tile.scrollIntoViewIfNeeded(); await sleep(500); await tile.click(); await sleep(1500);
await shot(page, `mus-${vpk}-15-dialog`);
step("dialog", { open: await page.evaluate(() => document.querySelector("#painting-dialog")?.open), video: await page.evaluate(() => { const v = document.querySelector("#painting-dialog-video"); return v && { paused: v.paused, t: v.currentTime, src: v.currentSrc.split("/").pop(), w: v.getBoundingClientRect().width, h: v.getBoundingClientRect().height }; }) });
await page.keyboard.press("Escape"); await sleep(600);
step("dialog-esc", { open: await page.evaluate(() => document.querySelector("#painting-dialog")?.open) });
// footer + menu on paintings
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(800);
await shot(page, `mus-${vpk}-16-footer`);
await page.evaluate(() => scrollBy(0, -200)); await sleep(700);
await page.locator(".cnwm-menu-burger").click({ force: true }); await sleep(800);
await shot(page, `mus-${vpk}-17-menu`);
await page.locator(".cnwm-menu-close").click(); await sleep(500);
R.log = log;
save(`mus-${vpk}.json`, R);
console.log("LOG", log);
await browser.close();
