#!/usr/bin/env node
/**
 * Round 28 — the /paintings drawer under a page that scrolls anyway
 * (docs/rounds/2026-09-22-round-28-plan.md).
 *
 * On his iPhone, with a painting open, a swipe pans the document instead of
 * dragging the drawer (v14 E7's lock no longer holds since round 24's pin),
 * so the document's scroll now drives the drawer, the page is clamped to the
 * hall's band, and Back restores the tap's position. This instrument drives
 * the document the way iOS does and asserts the drawer follows. Chromium,
 * 390×645, the bars stood in (B 110, pin 100svh), the hall stuck at 40%:
 *   · POINTER: a touch swipe up on the hall and one on the handle still
 *     expand the drawer (the path that works where the lock holds).
 *   · SCROLL: with painting 1 open and the drawer at peek, the document is
 *     scrolled down in steps of 40px, as a pan would: the drawer's position
 *     rises with the scroll (≈ dy / travel), the stage stays pinned (top 0),
 *     the mode stays approach; once the scroll settles the drawer has snapped
 *     to full; scrolling back up collapses it to peek. The hall's camera does
 *     not move meanwhile (the approached composition holds).
 *   · HIDDEN: the drawer hidden (its X), a scroll down of 40px reveals it.
 *   · CLAMP: a scroll far past the hall's end with the painting open is taken
 *     back the same frame — the stage's bottom never leaves the wrap's, the
 *     mode stays approach; the same at the top.
 *   · BACK: approach(null) returns the document to the tap's position (±1)
 *     with the drawer closed and the rail resumed where it was.
 *   · no page errors.
 *
 *   node scripts/museum-drawer.mjs [--base http://localhost:4331]
 *        [--out node_modules/.cache/museum-drawer]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const OUT = flag("out", "node_modules/.cache/museum-drawer");
mkdirSync(OUT, { recursive: true });
const results = [];
let failures = 0;
const check = (session, pos, name, ok, detail = "") => {
  results.push({ session, pos, name, ok: !!ok, detail: String(detail) });
  if (!ok) failures++;
};
const near = (a, b, tol) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tol;
const r1 = (v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v);

const STATE = () => {
  const h = window.__museum;
  const st = h.state;
  const stage = document.querySelector(".museum-stage");
  const sr = stage.getBoundingClientRect();
  const wr = stage.closest(".museum-wrap").getBoundingClientRect();
  const sheet = document.querySelector(".museum-sheet");
  const head = document.querySelector(".museum-sheet-head");
  return {
    mode: st.mode,
    sheet: st.sheet,
    sheetPos: st.sheetPos,
    sheetHidden: st.sheetHidden,
    approachScrollY: st.approachScrollY,
    live: st.scrollDrivesSheet,
    scrollY: window.scrollY,
    innerHeight: innerHeight,
    stage: { top: sr.top, bottom: sr.bottom },
    wrap: { top: wr.top, bottom: wr.bottom },
    sheetTop: sheet ? sheet.getBoundingClientRect().top : null,
    travel: sheet && head ? sheet.offsetHeight - sheet.clientTop - head.offsetHeight : null,
    cam: { x: st.cur.x, y: st.cur.y, z: st.cur.z },
    railT: st.railT,
  };
};
const SCROLL_TO_RAIL = (t) => {
  const stage = document.querySelector(".museum-stage");
  const wrap = stage.closest(".museum-wrap");
  const r = wrap.getBoundingClientRect();
  const top = r.top + window.scrollY;
  const total = r.height - stage.clientHeight;
  window.scrollTo({ top: Math.round(top + t * total), behavior: "instant" });
};

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 645 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  const add = () => {
    const st = document.createElement("style");
    st.textContent = `.museum-wrap{--museum-b:110px !important;--museum-pin:100svh !important}`;
    (document.head || document.documentElement).appendChild(st);
  };
  if (document.documentElement) add();
  else new MutationObserver((_, o) => { if (!document.documentElement) return; o.disconnect(); add(); }).observe(document, { childList: true });
});
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e).slice(0, 200)));
await page.goto(`${BASE}/paintings`, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForFunction(() => window.__museum, null, { timeout: 45000 });
await page.waitForTimeout(1500);
await page.evaluate(SCROLL_TO_RAIL, 0.4);
await page.waitForTimeout(1200);
const cdp = await ctx.newCDPSession(page);
const swipe = async (x, y0, y1, steps = 12, ms = 160) => {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 + ((y1 - y0) * i) / steps }] });
    await page.waitForTimeout(ms / steps);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
};
const open = async (i) => {
  await page.evaluate((i) => window.__museum.approach(i), i);
  await page.waitForFunction(() => !!document.querySelector(".museum-sheet"), null, { timeout: 8000 });
  await page.waitForTimeout(1300); // past settleUntil
};
const scrollBy = async (dy, steps = 5, ms = 80) => {
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy({ top: d, behavior: "instant" }), dy / steps);
    await page.waitForTimeout(ms / steps);
  }
};

/* ── POINTER ── */
{
  await open(1);
  const s0 = await page.evaluate(STATE);
  check("pointer", "open", "approach with the drawer at peek, stage pinned", s0.mode === "approach" && s0.sheet === "peek" && near(s0.stage.top, 0, 0.5), JSON.stringify({ mode: s0.mode, sheet: s0.sheet, top: r1(s0.stage.top) }));
  await swipe(195, 420, 200);
  await page.waitForTimeout(700);
  const s1 = await page.evaluate(STATE);
  check("pointer", "swipe on the hall", "drawer full, page unmoved", s1.sheet === "full" && near(s1.scrollY, s0.scrollY, 0.5), `sheet ${s1.sheet} · scrollY ${r1(s1.scrollY)} vs ${r1(s0.scrollY)}`);
  await page.evaluate(() => window.__museum.setSheet("peek"));
  await page.waitForTimeout(500);
  const head = await page.evaluate(() => { const r = document.querySelector(".museum-sheet-head").getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; });
  await swipe(head.x, head.y, head.y - 260);
  await page.waitForTimeout(700);
  const s2 = await page.evaluate(STATE);
  check("pointer", "swipe on the handle", "drawer full, page unmoved", s2.sheet === "full" && near(s2.scrollY, s0.scrollY, 0.5), `sheet ${s2.sheet} · scrollY ${r1(s2.scrollY)}`);
  await page.evaluate(() => window.__museum.setSheet("peek"));
  await page.waitForTimeout(500);
}
/* ── SCROLL: the document moves under the drawer, as iOS does ── */
{
  const s0 = await page.evaluate(STATE);
  const travel = s0.travel;
  check("scroll", "before", "drawer at peek, travel measured", s0.sheet === "peek" && travel > 100, `travel ${travel}`);
  await scrollBy(Math.round(travel * 0.4), 4, 60);
  const mid = await page.evaluate(STATE);
  check("scroll", "+40% of travel", "drawer position follows the scroll", near(mid.sheetPos, 0.4, 0.08) && mid.live === true, `pos ${r1(mid.sheetPos)} · live ${mid.live} · dy ${r1(mid.scrollY - s0.scrollY)}`);
  check("scroll", "+40% of travel", "stage still pinned, mode approach", near(mid.stage.top, 0, 0.5) && mid.mode === "approach", `top ${r1(mid.stage.top)} · ${mid.mode}`);
  check("scroll", "+40% of travel", "camera holds the painting", near(mid.cam.z, s0.cam.z, 0.05) && near(mid.cam.x, s0.cam.x, 0.05), `z ${r1(mid.cam.z)} vs ${r1(s0.cam.z)}`);
  await scrollBy(Math.round(travel * 0.4), 4, 60);
  await page.waitForTimeout(700);
  const full = await page.evaluate(STATE);
  check("scroll", "+80%, settled", "drawer snapped to full", full.sheet === "full" && near(full.sheetPos, 1, 0.01) && full.live === false, `sheet ${full.sheet} · pos ${r1(full.sheetPos)} · live ${full.live}`);
  await scrollBy(-Math.round(travel * 0.9), 5, 80);
  await page.waitForTimeout(700);
  const back = await page.evaluate(STATE);
  check("scroll", "−90%, settled", "drawer collapsed to peek", back.sheet === "peek" && near(back.sheetPos, 0, 0.01), `sheet ${back.sheet} · pos ${r1(back.sheetPos)}`);
  check("scroll", "−90%, settled", "still approach, stage pinned", back.mode === "approach" && near(back.stage.top, 0, 0.5), `${back.mode} · top ${r1(back.stage.top)}`);
}
/* ── HIDDEN: a scroll down reveals a hidden drawer ── */
{
  await page.evaluate(() => window.__museum.setSheet("full"));
  await page.waitForTimeout(500);
  await page.click(".museum-sheet-close");
  await page.waitForTimeout(600);
  const hid = await page.evaluate(STATE);
  check("hidden", "after X", "drawer hidden", hid.sheetHidden === true, `hidden ${hid.sheetHidden}`);
  await scrollBy(40, 2, 60);
  await page.waitForTimeout(600);
  const rev = await page.evaluate(STATE);
  check("hidden", "+40px", "drawer revealed at peek", rev.sheetHidden === false && rev.sheet === "peek", `hidden ${rev.sheetHidden} · sheet ${rev.sheet}`);
}
/* ── CLAMP ── */
{
  const s0 = await page.evaluate(STATE);
  await page.evaluate(() => window.scrollBy({ top: 5000, behavior: "instant" }));
  await page.waitForTimeout(300);
  const far = await page.evaluate(STATE);
  check("clamp", "+5000", "taken back to the band's end, stage pinned, still approach", far.mode === "approach" && near(far.stage.bottom, far.wrap.bottom, 1) && near(far.stage.top, 0, 0.5), `${far.mode} · stage ${r1(far.stage.top)}→${r1(far.stage.bottom)} · wrap bottom ${r1(far.wrap.bottom)}`);
  await page.evaluate(() => window.scrollBy({ top: -8000, behavior: "instant" }));
  await page.waitForTimeout(300);
  const top = await page.evaluate(STATE);
  check("clamp", "−8000", "taken back to the band's start, still approach", top.mode === "approach" && near(top.wrap.top, 0, 1) && near(top.stage.top, 0, 0.5), `${top.mode} · wrap top ${r1(top.wrap.top)} · stage top ${r1(top.stage.top)}`);
  void s0;
}
/* ── BACK ── */
{
  const s0 = await page.evaluate(STATE);
  await page.evaluate(() => window.__museum.approach(null));
  await page.waitForTimeout(400);
  const s1 = await page.evaluate(STATE);
  check("back", "after Back", "document at the tap's position", near(s1.scrollY, s0.approachScrollY, 1), `scrollY ${r1(s1.scrollY)} vs tap ${r1(s0.approachScrollY)}`);
  check("back", "after Back", "rail mode, no drawer", s1.mode === "rail" && s1.sheetTop === null, `${s1.mode} · drawer ${s1.sheetTop === null ? "gone" : "present"}`);
}
check("-", "-", "no page errors", errs.length === 0, errs.join(" | "));
await browser.close();

const lines = ["# /paintings drawer under a scrolling page — measured", "", `base ${BASE} · ${new Date().toISOString()}`, "", "| session | when | check | ok | detail |", "|---|---|---|---|---|"];
for (const r of results) lines.push(`| ${r.session} | ${r.pos} | ${r.name} | ${r.ok ? "✓" : "✗"} | ${r.detail.replace(/\|/g, "\\|")} |`);
writeFileSync(join(OUT, "drawer.json"), JSON.stringify({ base: BASE, results }, null, 2));
writeFileSync(join(OUT, "drawer.md"), lines.join("\n") + "\n");
for (const r of results) if (!r.ok) console.error(`  ✗ ${r.session} · ${r.pos} · ${r.name} — ${r.detail}`);
console.log(`museum-drawer: ${results.length} check(s), ${failures} failed · ${join(OUT, "drawer.md")}`);
process.exit(failures ? 1 : 0);
