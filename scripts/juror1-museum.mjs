// The Museum on /paintings as a visitor: rail, look, Face forward, approach, tap-to-life, sheet, Back, Esc, keyboard, grid.
import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const ks = (process.argv[2] || "p390,t768,d1440").split(",");
const R = {};
const M = (page) => page.evaluate(() => { const m = window.__museum; if (!m) return null; let s; try { s = typeof m.state === "function" ? m.state() : m.state; } catch (e) { s = String(e); } return { keys: Object.keys(m), state: s }; });
const UI = (page) => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.opacity !== "0" && r.bottom > 0 && r.top < innerHeight; };
  return [...document.querySelectorAll("button, a.btn, [role=button]")].filter(vis).map((b) => { const r = b.getBoundingClientRect(); return `${(b.getAttribute("aria-label") || b.textContent.trim().replace(/\s+/g, " ")).slice(0, 40)} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; }).filter((s) => !/^Approach/.test(s));
});
const chip = (page) => page.evaluate(() => [...document.querySelectorAll("#museum-slot *")].filter((e) => e.children.length === 0 && e.textContent.trim() && getComputedStyle(e).position !== "static" || false).map((e) => e.textContent.trim()).slice(0, 8));
async function touchDrag(page, x0, y0, x1, y1, steps = 14, ms = 320) {
  const cdp = await page.context().newCDPSession(page);
  const t = (x, y) => [{ x, y, id: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: t(x0, y0) });
  for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: t(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps) }); await sleep(ms / steps); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
async function tap(page, x, y) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
  await sleep(60);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
async function mouseDrag(page, x0, y0, x1, y1, steps = 14, ms = 320) {
  await page.mouse.move(x0, y0); await page.mouse.down();
  for (let i = 1; i <= steps; i++) { await page.mouse.move(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps); await sleep(ms / steps); }
  await page.mouse.up();
}
for (const k of ks) {
  const vp = VPS[k]; const drag = vp.mobile ? touchDrag : mouseDrag; const click = vp.mobile ? tap : (p, x, y) => p.mouse.click(x, y);
  const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(2500);
  const rec = { t: [] };
  await shot(page, `mus-${k}-00-top`);
  // stage geometry
  const geo = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height), docH: document.documentElement.scrollHeight, canvas: !!s.querySelector("canvas") }; });
  rec.geo = geo;
  await page.evaluate((y) => scrollTo(0, y), geo.top); await sleep(2500);
  rec.t.push({ s: "rail rest", ui: await UI(page), m: await M(page), chip: await chip(page) });
  await shot(page, `mus-${k}-01-rail-rest`);
  // scroll the rail
  const railLen = geo.h - vp.height;
  for (const f of [0.15, 0.4, 0.7]) { await page.evaluate((y) => scrollTo(0, y), geo.top + railLen * f); await sleep(1600); await shot(page, `mus-${k}-02-rail-${Math.round(f * 100)}`); }
  rec.t.push({ s: "rail 70%", ui: await UI(page), m: await M(page) });
  // drag to look
  const cx = vp.width / 2, cy = vp.height / 2;
  await drag(page, cx + 100, cy, cx - 250, cy + 40, 16, 400); await sleep(1400);
  rec.t.push({ s: "looked away", ui: await UI(page), m: await M(page), chip: await chip(page) });
  await shot(page, `mus-${k}-03-looked-away`);
  const ff = page.getByRole("button", { name: /face forward|recent/i });
  rec.faceForward = await ff.count();
  if (rec.faceForward) { await ff.first().click(); await sleep(1400); await shot(page, `mus-${k}-04-face-forward`); rec.t.push({ s: "after Face forward", m: await M(page) }); }
  // approach: click a painting. Use paintingRect if present, else dot rail.
  let rect = await page.evaluate(() => { const m = window.__museum; if (!m?.paintingRect) return null; for (let i = 0; i < 10; i++) { try { const r = m.paintingRect(i); if (r && r.width > 40 && r.x > 0 && r.x + r.width < innerWidth && r.y > 0 && r.y + r.height < innerHeight) return { i, ...r }; } catch (e) {} } return null; });
  rec.clickRect = rect;
  if (rect) { await click(page, rect.x + rect.width / 2, rect.y + rect.height / 2); }
  else { await page.locator('button[aria-label^="Approach"]').nth(3).click(); }
  await sleep(2600);
  rec.t.push({ s: "approach", ui: await UI(page), m: await M(page) });
  rec.approachRect = await page.evaluate(() => { const m = window.__museum; const s = typeof m?.state === "function" ? m.state() : m?.state; const i = s?.approach ?? s?.approachIdx ?? s?.active ?? s?.current; try { return { i, r: m.paintingRect(i) }; } catch (e) { return { i, err: String(e) }; } });
  await shot(page, `mus-${k}-05-approach`);
  // tap the painting → alive
  const pr = rec.approachRect?.r;
  if (pr && pr.width) { await click(page, pr.x + pr.width / 2, pr.y + pr.height / 2); await sleep(2200); rec.t.push({ s: "after tap painting", m: await M(page), video: await page.evaluate(() => [...document.querySelectorAll("video")].filter((v) => !v.paused).length) }); await shot(page, `mus-${k}-06-alive`); }
  // phone: sheet drag
  if (vp.mobile && vp.width < 800) {
    const sheet = await page.evaluate(() => { const b = document.querySelector('button[aria-label*="plaque" i], [aria-label*="Expand"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, h: r.height, label: b.getAttribute("aria-label") }; });
    rec.sheet = sheet;
    if (sheet) { await touchDrag(page, sheet.x, sheet.y, sheet.x, sheet.y - 380, 16, 400); await sleep(1200); rec.t.push({ s: "sheet dragged up", ui: await UI(page), m: await M(page) }); await shot(page, `mus-${k}-07-sheet-up`); await touchDrag(page, sheet.x, 200, sheet.x, 700, 16, 400); await sleep(1200); await shot(page, `mus-${k}-08-sheet-down`); }
  }
  // Back to the hall
  const back = page.getByRole("button", { name: /back to the hall/i });
  rec.hasBack = await back.count();
  if (rec.hasBack) { await back.first().click(); await sleep(2000); rec.t.push({ s: "after Back", ui: await UI(page), m: await M(page), focus: await page.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName) }); await shot(page, `mus-${k}-09-back`); }
  // keyboard path (desktop): focus a dot, Enter, arrows, Esc
  if (!vp.mobile) {
    const dot = page.locator('button[aria-label^="Approach"]').nth(2);
    await dot.focus(); await page.keyboard.press("Enter"); await sleep(2200);
    rec.kbd = { afterEnter: await M(page), ui: await UI(page) };
    await shot(page, `mus-${k}-10-kbd-enter`);
    await page.keyboard.press("ArrowRight"); await sleep(1800); rec.kbd.afterRight = await M(page); await shot(page, `mus-${k}-11-kbd-right`);
    // Tab to the invisible painting toggle?
    const tabs = []; for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); tabs.push(await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return `${a.tagName} "${a.getAttribute("aria-label") || a.textContent.trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)} outline=${getComputedStyle(a).outlineStyle}/${getComputedStyle(a).boxShadow.slice(0, 30)}`; })); }
    rec.kbd.tabs = tabs;
    await page.keyboard.press("Escape"); await sleep(1800); rec.kbd.afterEsc = await M(page); await shot(page, `mus-${k}-12-kbd-esc`);
    // arrows in rail = look
    await page.keyboard.press("ArrowLeft"); await sleep(900); rec.kbd.afterLeftRail = await M(page);
  }
  // end of hall + grid
  await page.evaluate((y) => scrollTo(0, y), geo.top + railLen * 0.97); await sleep(1800); await shot(page, `mus-${k}-13-hall-end`);
  await page.evaluate((y) => scrollTo(0, y), geo.top + geo.h - 20); await sleep(1500); await shot(page, `mus-${k}-14-threshold`);
  await page.evaluate((y) => scrollTo(0, y), geo.top + geo.h + vp.height * 0.6); await sleep(1500); await shot(page, `mus-${k}-15-grid`);
  const tile = page.locator("button.painting-open").nth(9);
  await tile.scrollIntoViewIfNeeded(); await sleep(800); await shot(page, `mus-${k}-16-grid-portrait`);
  await tile.click(); await sleep(1800); rec.dialog = await page.evaluate(() => { const d = document.getElementById("painting-dialog"); const v = d.querySelector("video"); const im = d.querySelector("img"); return { open: d.open, video: v && { paused: v.paused, w: v.videoWidth, h: v.videoHeight, vis: v.getBoundingClientRect().width }, img: im && im.getBoundingClientRect().width, title: d.querySelector("#painting-dialog-title")?.textContent }; }); await shot(page, `mus-${k}-17-dialog`);
  await page.keyboard.press("Escape"); await sleep(600); rec.dialogClosed = await page.evaluate(() => !document.getElementById("painting-dialog").open);
  // footer
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(1000); await shot(page, `mus-${k}-18-footer`);
  rec.log = log.filter((l) => !/ERR_ABORTED/.test(l));
  R[k] = rec; save(`museum-${k}.json`, rec);
  await c.close();
}
console.log(JSON.stringify(R, null, 1));
await browser.close();
