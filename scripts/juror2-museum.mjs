// The museum on /paintings as a visitor.
import { launch, ctx, VPS, shot, go, sleep, watchConsole, OUT } from "./juror2-lib.mjs";
import fs from "node:fs";
import path from "node:path";
const errs = []; const notes = []; const N = (s) => { notes.push(s); console.log(s); };
const browser = await launch();
const vps = (process.argv[2] || "p390,d1440").split(",");

async function drag(page, vp, from, to, steps = 14, ms = 300, hold = 0) {
  if (vp.mobile) { const cdp = await page.context().newCDPSession(page); const pt = (x, y) => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 }); await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pt(from.x, from.y)] }); if (hold) await sleep(hold); for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [pt(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps)] }); await sleep(ms / steps); } await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cdp.detach(); }
  else { await page.mouse.move(from.x, from.y); await page.mouse.down(); for (let i = 1; i <= steps; i++) { await page.mouse.move(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps); await sleep(ms / steps); } await page.mouse.up(); }
}
async function tap(page, vp, x, y) { if (vp.mobile) { const cdp = await page.context().newCDPSession(page); const pt = { x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 }; await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pt] }); await sleep(60); await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cdp.detach(); } else { await page.mouse.click(x, y); } }
const vis = (page) => page.evaluate(() => [...document.querySelectorAll("button,a,[role=dialog],[aria-label]")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && !/^Approach|^View “|Skip to content/.test(e.getAttribute("aria-label") || e.textContent); }).map((e) => `"${(e.getAttribute("aria-label") || e.textContent).trim().replace(/\s+/g, " ").slice(0, 40)}"@${Math.round(e.getBoundingClientRect().x)},${Math.round(e.getBoundingClientRect().y)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
const mstate = (page) => page.evaluate(() => { const m = window.__museum; if (!m) return "no hook"; try { const s = typeof m.state === "function" ? m.state() : m.state; return JSON.stringify(s).slice(0, 400); } catch (e) { return "err " + e; } });
const prect = (page, i) => page.evaluate((i) => { const m = window.__museum; try { const r = m && m.paintingRect ? m.paintingRect(i) : null; if (!r) return null; if (r.left !== undefined) return { x: r.left, y: r.top, width: r.right - r.left, height: r.bottom - r.top, behind: r.behind, cx: ((r.left + r.right) / 2 / innerWidth).toFixed(3), cy: ((r.top + r.bottom) / 2 / innerHeight).toFixed(3) }; return r; } catch (e) { return String(e); } }, i);

for (const vpk of vps) {
  const vp = VPS[vpk];
  const c = await ctx(browser, vp); const page = await c.newPage(); watchConsole(page, `museum-${vpk}`, errs);
  await go(page, "/paintings", 3000);
  await shot(page, `mus-${vpk}-01-top`);
  N(`mus@${vpk} top: ${(await vis(page)).join(" | ")}`);
  const slot = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
  N(`mus@${vpk} slot ${JSON.stringify(slot)}; hook: ${await mstate(page)}`);
  // enter the hall
  await page.evaluate((y) => scrollTo(0, y), slot.top); await sleep(2500);
  await shot(page, `mus-${vpk}-02-rail-rest`);
  N(`mus@${vpk} rail rest: ${(await vis(page)).join(" | ")}`);
  // walk down the rail by scrolling
  const steps = 6;
  for (let i = 1; i <= steps; i++) { await page.evaluate((y) => scrollTo(0, y), slot.top + (slot.h - vp.height) * i / steps); await sleep(1400); if (i === 2 || i === 4 || i === steps) await shot(page, `mus-${vpk}-03-rail-${i}`); }
  N(`mus@${vpk} rail end: ${await mstate(page)}`);
  // beyond the hall: threshold / handoff to grid
  await page.evaluate((y) => scrollTo(0, y), slot.top + slot.h - vp.height + 300); await sleep(1200); await shot(page, `mus-${vpk}-04-handoff`);
  await page.evaluate((y) => scrollTo(0, y), slot.top + slot.h + 200); await sleep(1200); await shot(page, `mus-${vpk}-05-grid`);
  // last grid tile (portrait)
  const lastTile = page.locator('button[aria-label^="View “Peter Baltimore’s Barbershop · Narrative II"]');
  await lastTile.scrollIntoViewIfNeeded(); await sleep(900); await shot(page, `mus-${vpk}-06-grid-last`);
  N(`mus@${vpk} last tile box: ${JSON.stringify(await lastTile.boundingBox())}`);
  // back to mid rail: drag to look
  await page.evaluate((y) => scrollTo(0, y), slot.top + (slot.h - vp.height) * 0.3); await sleep(1500);
  const cx = vp.width / 2, cy = vp.height / 2;
  await drag(page, vp, { x: cx, y: cy }, { x: cx - Math.min(260, vp.width * 0.5), y: cy }, 16, 350);
  await sleep(900); await shot(page, `mus-${vpk}-07-looked-away`);
  N(`mus@${vpk} looked away: ${(await vis(page)).join(" | ")}; ${await mstate(page)}`);
  const ff = page.locator('button:visible', { hasText: /Face forward|Recenter/ }).first();
  if (await ff.count()) { await ff.click(); await sleep(1200); await shot(page, `mus-${vpk}-08-face-forward`); N(`mus@${vpk} after Face forward: ${await mstate(page)}`); } else N(`mus@${vpk} NO Face forward button after drag`);
  // approach a painting by tapping the canvas where a painting is (use hook rect if available)
  let r0 = await prect(page, 0);
  N(`mus@${vpk} paintingRect(0) in rail: ${JSON.stringify(r0)}`);
  // scroll so that painting 1 or 2 is comfortably in view, then tap it
  let tapPt = null, tapIdx = -1;
  for (const frac of [0.08, 0.12, 0.16, 0.2]) {
    await page.evaluate((y) => scrollTo(0, y), slot.top + (slot.h - vp.height) * frac); await sleep(1300);
    for (const i of [1, 2, 0, 3]) { const r = await prect(page, i); if (r && !r.behind && r.x > 10 && r.x + r.width < vp.width - 10 && r.y > 60 && r.y + r.height < vp.height - 60 && r.width > 40) { tapPt = { x: r.x + r.width / 2, y: r.y + r.height / 2 }; tapIdx = i; break; } }
    if (tapPt) break;
  }
  N(`mus@${vpk} tapping painting ${tapIdx} at ${JSON.stringify(tapPt)}`);
  if (!tapPt) { const canvas = await page.locator("#museum-slot canvas").first().boundingBox(); tapPt = { x: canvas.x + canvas.width * 0.25, y: canvas.y + canvas.height * 0.45 }; }
  await tap(page, vp, tapPt.x, tapPt.y); await sleep(2200);
  await shot(page, `mus-${vpk}-09-approach`);
  N(`mus@${vpk} approach: ${(await vis(page)).join(" | ")}; ${await mstate(page)}; rect=${JSON.stringify(await prect(page, tapIdx))}`);
  // Tap the painting → alive
  const rA = await prect(page, tapIdx);
  const aliveBtn = page.locator('button[aria-label*="to life"], button[aria-label*="Let it rest"]').first();
  if (rA && rA.width) await tap(page, vp, rA.x + rA.width / 2, rA.y + rA.height / 2); else if (await aliveBtn.count()) await aliveBtn.click();
  await sleep(2500); await shot(page, `mus-${vpk}-10-alive`);
  await sleep(2500); N(`mus@${vpk} alive?: ${await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => `${v.currentSrc.split("/").pop()} paused=${v.paused} t=${v.currentTime.toFixed(1)} ready=${v.readyState} err=${v.error && v.error.code} muted=${v.muted}`).join(";"))} state=${await mstate(page)} ; ${(await vis(page)).filter((s) => /life|rest/.test(s)).join(" | ")}`);
  // Phone: peek sheet drag
  if (vp.mobile && vp.width < 700) {
    const sheetBtn = page.locator('[aria-label*="plaque" i], [aria-label*="sheet" i]').first();
    const sb = await sheetBtn.count() ? await sheetBtn.boundingBox() : null;
    N(`mus@${vpk} sheet header: ${JSON.stringify(sb)} label=${await sheetBtn.count() ? await sheetBtn.getAttribute("aria-label") : "none"}`);
    if (sb) {
      await drag(page, vp, { x: sb.x + sb.width / 2, y: sb.y + sb.height / 2 }, { x: sb.x + sb.width / 2, y: sb.y + sb.height / 2 - 320 }, 16, 350);
      await sleep(1200); await shot(page, `mus-${vpk}-11-sheet-up`);
      N(`mus@${vpk} sheet up: ${(await vis(page)).join(" | ")}; rect=${JSON.stringify(await prect(page, tapIdx))}`);
      const sb2 = await sheetBtn.boundingBox();
      await drag(page, vp, { x: sb2.x + sb2.width / 2, y: sb2.y + sb2.height / 2 }, { x: sb2.x + sb2.width / 2, y: sb2.y + sb2.height / 2 + 320 }, 16, 350);
      await sleep(1200); await shot(page, `mus-${vpk}-12-sheet-down`);
      // tap header toggles?
      await tap(page, vp, sb.x + sb.width / 2, sb.y + sb.height / 2); await sleep(1000); await shot(page, `mus-${vpk}-13-sheet-tap`);
      N(`mus@${vpk} after header tap: ${(await vis(page)).join(" | ")}`);
    }
  }
  // Back to the hall
  const back = page.locator('button:visible', { hasText: /Back to the hall/i }).first();
  if (await back.count()) { await back.click(); await sleep(1800); await shot(page, `mus-${vpk}-14-back-hall`); N(`mus@${vpk} after Back: ${(await vis(page)).join(" | ")}; ${await mstate(page)}`); } else N(`mus@${vpk} NO Back to the hall button`);
  // Approach the LAST painting via its dot
  const lastDot = page.locator('button[aria-label^="Approach “Peter Baltimore’s Barbershop · Narrative II"]');
  await lastDot.click(); await sleep(3500);
  await shot(page, `mus-${vpk}-15-last-approach`);
  const r9 = await prect(page, 9);
  N(`mus@${vpk} last painting rect: ${JSON.stringify(r9)} ratio=${r9 && r9.width ? (r9.width / r9.height).toFixed(3) : "?"}; ${(await vis(page)).join(" | ")}`);
  // Esc
  await page.keyboard.press("Escape"); await sleep(1500); await shot(page, `mus-${vpk}-16-esc`); N(`mus@${vpk} after Esc: ${await mstate(page)}`);
  // Keyboard: focus a dot, Enter, arrows, Esc
  const dot3 = page.locator('button[aria-label^="Approach “Uri Gilbert Home"]');
  await dot3.focus(); await sleep(300); await shot(page, `mus-${vpk}-17-kbd-focus-dot`);
  await page.keyboard.press("Enter"); await sleep(2500); await shot(page, `mus-${vpk}-18-kbd-approach`); N(`mus@${vpk} kbd Enter: ${await mstate(page)}; focus=${await page.evaluate(() => document.activeElement && (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent.trim().slice(0, 30)))}`);
  await page.keyboard.press("ArrowRight"); await sleep(2000); N(`mus@${vpk} kbd →: ${await mstate(page)}`); await shot(page, `mus-${vpk}-19-kbd-right`);
  await page.keyboard.press("Tab"); await sleep(200); N(`mus@${vpk} kbd Tab focus: ${await page.evaluate(() => document.activeElement && (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent.trim().slice(0, 30)))}`);
  await page.keyboard.press("Escape"); await sleep(1500); N(`mus@${vpk} kbd Esc: ${await mstate(page)}`);
  // rail keyboard: arrows look
  await page.evaluate((y) => scrollTo(0, y), slot.top + (slot.h - vp.height) * 0.3); await sleep(800);
  await page.locator("#museum-slot canvas").first().focus().catch(() => {});
  await page.keyboard.press("ArrowLeft"); await sleep(900); N(`mus@${vpk} kbd ← in rail: ${await mstate(page)}`); await shot(page, `mus-${vpk}-20-kbd-look`);
  // Menu open on /paintings inside the museum
  await page.evaluate(() => scrollBy(0, -80)); await sleep(900);
  N(`mus@${vpk} burger after 80px up in the hall: ${await page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const r = b.getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return `at ${Math.round(r.x)},${Math.round(r.y)} hit=${el && el.tagName}.${el && el.className.toString().slice(0, 20)}`; })}`);
  await page.locator('button[aria-label="Open menu"]').click({ timeout: 8000 }).catch((e) => N(`mus@${vpk} menu click failed: ${String(e).slice(0, 80)}`)); await sleep(900); await shot(page, `mus-${vpk}-21-menu`);
  await page.locator('button[aria-label="Close menu"]').click({ timeout: 5000 }).catch(() => {}); await sleep(500);
  // Skip the hall
  await page.evaluate((y) => scrollTo(0, y), slot.top + 100); await sleep(800);
  const skip = page.locator('button:visible', { hasText: /Skip/ }).first();
  if (await skip.count()) { const sbx = await skip.boundingBox(); N(`mus@${vpk} skip pill @${JSON.stringify(sbx)}`); await skip.click(); await sleep(1800); await shot(page, `mus-${vpk}-22-skipped`); N(`mus@${vpk} after skip scrollY=${await page.evaluate(() => scrollY)} slotEnd=${slot.top + slot.h}`); }
  await c.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, `museum-notes-${vps.join("_")}.txt`), notes.concat(["", "CONSOLE:", ...errs]).join("\n"));
console.log("console:", errs.join("\n"));
