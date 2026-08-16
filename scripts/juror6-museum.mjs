// Museum visitor pass at one viewport.
import { launch, ctx, VPS, goto, shot, watch, sleep, save, FLOATING_JS, touchDrag, touchTap } from "./juror6-lib.mjs";
const vpName = process.argv[2] || "p390";
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/paintings"); await sleep(5000);
await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

const UI = () => {
  const out = [];
  for (const el of document.querySelectorAll("button, a, [role=button], [class*=chip], [class*=pill], p, span")) {
    const r = el.getBoundingClientRect(); if (r.width < 6 || r.height < 6) continue;
    const cs = getComputedStyle(el); let op = 1, e = el; while (e && e !== document.body) { const s = getComputedStyle(e); op *= parseFloat(s.opacity); if (s.visibility === "hidden" || s.display === "none") op = 0; e = e.parentElement; }
    if (op < 0.05) continue;
    if (r.bottom < 0 || r.top > innerHeight) continue;
    const t = (el.getAttribute("aria-label") || el.innerText || "").trim().replace(/\s+/g, " ");
    if (!t) continue;
    if (el.children.length && [...el.children].some(ch => ch.tagName !== "SVG" && ch.tagName !== "svg" && ch.innerText && ch.innerText.trim() === t)) continue;
    const rg = document.createRange(); rg.selectNodeContents(el);
    const lines = new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size;
    out.push({ tag: el.tagName, t: t.slice(0, 60), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), lines, pos: cs.position });
  }
  // dedupe by text+pos
  const seen = new Set(); return out.filter(o => { const k = o.t + o.x + o.y; if (seen.has(k)) return false; seen.add(k); return true; });
};
const M = () => { const m = window.__museum; if (!m) return null; try { const s = m.state; return typeof s === "function" ? s() : s; } catch (e) { return { err: String(e) }; } };
console.log("has __museum:", await page.evaluate(() => !!window.__museum), JSON.stringify(await page.evaluate(() => window.__museum ? Object.keys(window.__museum) : null)));
console.log("state:", JSON.stringify(await page.evaluate(M)).slice(0, 600));
await shot(page, `mus-${vpName}-1-rail-rest`);
console.log("UI at rest:", JSON.stringify(await page.evaluate(UI)));
const canvas = await page.evaluate(() => { const c = document.querySelector("canvas"); const r = c && c.getBoundingClientRect(); return c ? { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } : null; });
console.log("canvas:", JSON.stringify(canvas));
const stageH = await page.evaluate(() => document.documentElement.scrollHeight);
console.log("docH", stageH);

// scroll the rail: to 25%, 50%, 90% of the museum stage (approx: the stage's scroll span)
const span = await page.evaluate(() => { const s = document.querySelector("canvas").closest("section, div[class*=sticky], div"); let el = document.querySelector("canvas"); let p = el; let best = null; while (p && p !== document.body) { const cs = getComputedStyle(p); if (cs.position === "sticky") { best = p; } p = p.parentElement; } const wrap = best ? best.parentElement : null; if (!wrap) return null; const r = wrap.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
console.log("stage span:", JSON.stringify(span));
const railY = (f) => span ? span.top + Math.round((span.h - vp.height) * f) : Math.round(stageH * f * 0.5);
for (const [tag, f] of [["25", 0.25], ["55", 0.55], ["96", 0.96]]) {
  await page.evaluate((y) => scrollTo(0, y), railY(f)); await sleep(1500);
  await shot(page, `mus-${vpName}-2-rail-${tag}`);
  console.log(`rail ${tag}%:`, JSON.stringify(await page.evaluate(M)).slice(0, 300));
}
// back to mid, drag to look
await page.evaluate((y) => scrollTo(0, y), railY(0.4)); await sleep(1200);
const cx = vp.width / 2, cy = vp.height / 2;
if (vp.mobile) await touchDrag(page, { x: cx + 100, y: cy }, { x: cx - 120, y: cy }, 14, 16, 30);
else { await page.mouse.move(cx + 100, cy); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(cx + 100 - 220 * i / 14, cy); await sleep(16); } await page.mouse.up(); }
await sleep(1200);
await shot(page, `mus-${vpName}-3-looked`);
console.log("after look UI:", JSON.stringify(await page.evaluate(UI).then(u => u.filter(x => /face|forward|scroll|museum|skip|menu/i.test(x.t)))));
const ff = page.locator("button:has-text('Face forward'):visible").first();
if (await ff.count()) { await ff.click(); await sleep(1200); console.log("after Face forward:", JSON.stringify(await page.evaluate(UI).then(u => u.filter(x => /face|forward|scroll|museum/i.test(x.t))))); }
await shot(page, `mus-${vpName}-4-faced`);

// approach a painting: use the dot rail (Approach “...”) buttons — pick the first
const dots = await page.evaluate(() => [...document.querySelectorAll("button[aria-label^='Approach']")].map(b => { const r = b.getBoundingClientRect(); return { t: b.getAttribute("aria-label"), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }));
console.log("dots:", dots.length, JSON.stringify(dots.slice(0, 2)), JSON.stringify(dots.slice(-1)));
// try clicking on the painting itself: find a canvas-space rect via the debug hook if it exists
const pr = await page.evaluate(() => { const m = window.__museum; if (!m || !m.paintingRect) return null; try { return m.paintingRect(0); } catch (e) { return { err: String(e) }; } });
console.log("paintingRect(0):", JSON.stringify(pr));
// approach via the first dot (visitor can also tap the painting; test both)
if (dots.length) {
  const d = dots[0];
  if (vp.mobile) await touchTap(page, d.x + d.w / 2, d.y + d.h / 2); else await page.mouse.click(d.x + d.w / 2, d.y + d.h / 2);
  await sleep(2500);
  await shot(page, `mus-${vpName}-5-approach`);
  const st = await page.evaluate(M);
  console.log("approach state:", JSON.stringify(st).slice(0, 500));
  const ui = await page.evaluate(UI);
  console.log("approach UI:", JSON.stringify(ui));
  const rect0 = await page.evaluate(() => { const m = window.__museum; try { return m && m.paintingRect ? m.paintingRect(m.state && (typeof m.state === "function" ? m.state().active ?? m.state().index ?? 0 : m.state.active ?? 0)) : null; } catch (e) { return { err: String(e) }; } });
  console.log("painting rect:", JSON.stringify(rect0), "viewport centre", cx, cy);
  const geo = await page.evaluate(() => { const m = window.__museum; const pl = m.placements ? (typeof m.placements === "function" ? m.placements() : m.placements) : null; const card = [...document.querySelectorAll("div, aside, section")].find(e => /MARK PRIEST/.test(e.innerText || "") && e.getBoundingClientRect().width < innerWidth * 0.6 && e.getBoundingClientRect().width > 100 && ![...e.children].some(ch => /MARK PRIEST/.test(ch.innerText || "") && ch.getBoundingClientRect().width > 100 && ch.tagName !== "P")); const r = card && card.getBoundingClientRect(); return { card: card && { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), border: getComputedStyle(card).borderWidth, bg: getComputedStyle(card).backgroundColor }, placements: pl && JSON.stringify(pl).slice(0, 300) }; });
  console.log("card geometry:", JSON.stringify(geo));
  const alive = page.locator("button[aria-label='Bring the painting to life']");
  console.log("alive button:", await alive.count(), JSON.stringify(await alive.first().boundingBox().catch(() => null)));
  // tap the painting to bring it to life
  const ab = await alive.first().boundingBox().catch(() => null);
  if (ab) { if (vp.mobile) await touchTap(page, ab.x + ab.width / 2, ab.y + ab.height / 2); else await page.mouse.click(ab.x + ab.width / 2, ab.y + ab.height / 2); await sleep(2500); await shot(page, `mus-${vpName}-6-alive`); console.log("after tap:", JSON.stringify(await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(b => /life|rest/i.test(b.getAttribute("aria-label") || "")); const v = document.querySelector("video"); return { label: b && b.getAttribute("aria-label"), video: v && { paused: v.paused, t: v.currentTime, src: v.currentSrc.slice(-30) } }; }))); }
  // phone sheet: expand
  const sheetBtn = page.locator("[aria-label*='plaque']").first();
  if (await sheetBtn.count()) {
    const sb = await sheetBtn.boundingBox();
    console.log("sheet header:", JSON.stringify(sb));
    if (vp.mobile) await touchTap(page, sb.x + sb.width / 2, sb.y + 20); else await sheetBtn.click();
    await sleep(1500);
    await shot(page, `mus-${vpName}-7-sheet-full`);
    console.log("sheet full UI:", JSON.stringify(await page.evaluate(UI)));
    console.log("painting rect (sheet full):", JSON.stringify(await page.evaluate(() => { const m = window.__museum; try { return m && m.paintingRect ? m.paintingRect(0) : null; } catch (e) { return null; } })));
    // drag the header down
    const sb2 = await page.locator("[aria-label*='plaque']").first().boundingBox().catch(() => null);
    console.log("sheet header after expand:", JSON.stringify(sb2));
    if (sb2 && vp.mobile) { await touchDrag(page, { x: sb2.x + sb2.width / 2, y: sb2.y + 20 }, { x: sb2.x + sb2.width / 2, y: sb2.y + 20 + 300 }, 14, 16, 60); await sleep(1200); await shot(page, `mus-${vpName}-8-sheet-dragged-down`); console.log("after drag down:", JSON.stringify(await page.locator("[aria-label*='plaque']").first().boundingBox().catch(() => null))); }
  }
  // Back to the hall
  const back = page.locator("button:has-text('Back to the hall'):visible").first();
  console.log("back to hall:", JSON.stringify(await back.boundingBox().catch(() => null)));
  await back.click(); await sleep(2000);
  await shot(page, `mus-${vpName}-9-back`);
  console.log("after back state:", JSON.stringify(await page.evaluate(M)).slice(0, 300));
}
// last painting (portrait)
if (dots.length) {
  const d = dots[dots.length - 1];
  const dd = await page.evaluate(() => { const bs = [...document.querySelectorAll("button[aria-label^='Approach']")]; const b = bs[bs.length - 1]; const r = b.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  if (vp.mobile) await touchTap(page, dd.x + dd.w / 2, dd.y + dd.h / 2); else await page.mouse.click(dd.x + dd.w / 2, dd.y + dd.h / 2);
  await sleep(3000);
  await shot(page, `mus-${vpName}-10-last-portrait`);
  console.log("last state:", JSON.stringify(await page.evaluate(M)).slice(0, 400));
  const rectL = await page.evaluate(() => { const m = window.__museum; try { const s = typeof m.state === "function" ? m.state() : m.state; const i = s.active ?? s.index ?? s.approach ?? 9; return { i, rect: m.paintingRect(i) }; } catch (e) { return { err: String(e) }; } });
  console.log("last painting rect:", JSON.stringify(rectL));
  console.log("last UI:", JSON.stringify(await page.evaluate(UI)));
  // Esc
  await page.keyboard.press("Escape"); await sleep(1800);
  console.log("after Esc:", JSON.stringify(await page.evaluate(M)).slice(0, 200));
  await shot(page, `mus-${vpName}-11-after-esc`);
}
console.log("errors:", log.errors, "failed:", log.failed.filter(f => !/ERR_ABORTED/.test(f)));
await browser.close();
