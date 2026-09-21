#!/usr/bin/env node
/**
 * Round 24 — the /paintings bar tint, measured where this container can
 * measure it (docs/rounds/2026-09-21-round-24-plan.md, device pass 3).
 *
 * Safari 26 draws nothing the page renders beyond the layout viewport's
 * edges; its bars show its own glass tinted from <body>'s background-color.
 * Museum.tsx therefore writes the hall's own edge colour to <body> while the
 * hall is on screen, wherever the bars collapse. This proves the write where
 * Chromium can: the bars' height is stood in through an init-script <style>
 * (`--museum-bars: 110px !important` on .museum-stage; the @supports gate
 * never matches here), exactly as map-framing.mjs stands T and E in.
 *
 * Per phone viewport (390×645, 430×720):
 *   · ON (stand-in): after the hall mounts, tint.on, the edge is "bottom"
 *     (Chromium's innerHeight equals svh, the bars-expanded state), a
 *     #rrggbb was written and <body>'s inline colour carries it; stuck at
 *     40% of the slot, still written; past the hall, cleared and <body>'s
 *     inline colour empty; back at rest, written again; no page errors.
 *   · OFF (`?tint=off`, stand-in): never written, <body> untouched.
 *   · The canvas equals the stage — no bleed remains.
 * At 1440×900 with no stand-in: tint.on false, <body> untouched.
 *
 *   node scripts/museum-tint.mjs [--base http://localhost:4331] [--bars 110]
 *        [--vp 390x645,430x720] [--out node_modules/.cache/museum-tint]
 *
 * Output: <out>/tint.json + tint.md. Exit 1 on any failed assertion.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
if (args.includes("--help") || args.includes("-h")) {
  console.log("usage: node scripts/museum-tint.mjs [--base URL] [--bars px] [--vp WxH,...] [--out dir]");
  process.exit(0);
}
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const BARS = Number(flag("bars", "110"));
const OUT = flag("out", "node_modules/.cache/museum-tint");
const VPS = flag("vp", "390x645,430x720")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => {
    const [w, h] = s.split("x").map(Number);
    return { w, h };
  });
mkdirSync(OUT, { recursive: true });

const results = [];
let failures = 0;
const check = (vp, session, pos, name, ok, detail = "") => {
  results.push({ vp, session, pos, name, ok: !!ok, detail: String(detail) });
  if (!ok) failures++;
};
const HEX = /^#[0-9a-f]{6}$/;
const near = (a, b, tol) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tol;

const SNAPSHOT = () => {
  const h = window.__museum;
  if (!h) return { missing: true };
  const stage = document.querySelector(".museum-stage");
  const canvas = stage && stage.querySelector("canvas");
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, height: r.height };
  };
  return {
    scrollY: window.scrollY,
    innerHeight: innerHeight,
    tint: h.state.tint,
    body: document.body.style.backgroundColor,
    stage: rect(stage),
    canvas: rect(canvas),
  };
};
const SCROLL_TO_RAIL = (t) => {
  const stage = document.querySelector(".museum-stage");
  const wrap = stage.parentElement;
  const r = wrap.getBoundingClientRect();
  const top = r.top + window.scrollY;
  const total = r.height - stage.clientHeight;
  window.scrollTo({ top: Math.round(top + t * total), behavior: "instant" });
};
const SCROLL_PAST = () => {
  const stage = document.querySelector(".museum-stage");
  const wrap = stage.parentElement;
  const r = wrap.getBoundingClientRect();
  window.scrollTo({ top: Math.round(r.bottom + window.scrollY + 200), behavior: "instant" });
};

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
async function open(vp, query, standIn) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  if (standIn) {
    await ctx.addInitScript((bars) => {
      const add = () => {
        const st = document.createElement("style");
        st.textContent = `.museum-stage{--museum-bars:${bars}px !important}`;
        (document.head || document.documentElement).appendChild(st);
      };
      if (document.documentElement) add();
      else
        new MutationObserver((_, o) => {
          if (!document.documentElement) return;
          o.disconnect();
          add();
        }).observe(document, { childList: true });
    }, BARS);
  }
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  page.on("console", (m) => {
    if (m.type() === "error") errs.push("console: " + m.text().slice(0, 160));
  });
  await page.goto(`${BASE}/paintings${query}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForFunction(() => window.__museum, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1800);
  return { ctx, page, errs };
}

for (const vp of VPS) {
  const V = `${vp.w}x${vp.h}`;
  const on = await open(vp, "", true);
  const rest = await on.page.evaluate(SNAPSHOT);
  check(V, "on", "rest", "hall mounted", !rest.missing, rest.missing ? "no __museum" : "");
  if (!rest.missing) {
    check(V, "on", "rest", `tint on, bars ${BARS}`, rest.tint && rest.tint.on === true && rest.tint.bars === BARS, JSON.stringify(rest.tint));
    check(V, "on", "rest", "edge = bottom (bars expanded)", rest.tint && rest.tint.edge === "bottom", rest.tint && rest.tint.edge);
    check(V, "on", "rest", "a colour written to <body>", rest.tint && HEX.test(rest.tint.written) && rest.body !== "", `${rest.tint && rest.tint.written} · body "${rest.body}" · writes ${rest.tint && rest.tint.writes}`);
    check(V, "on", "rest", "canvas = stage (no bleed)", rest.canvas && rest.stage && near(rest.canvas.height, rest.stage.height, 0.5) && near(rest.canvas.top, rest.stage.top, 0.5), `${rest.canvas && rest.canvas.height} vs ${rest.stage && rest.stage.height}`);
    await on.page.evaluate(SCROLL_TO_RAIL, 0.4);
    await on.page.waitForTimeout(1500);
    const stuck = await on.page.evaluate(SNAPSHOT);
    check(V, "on", "stuck", "still written, edge bottom", stuck.tint && HEX.test(stuck.tint.written) && stuck.tint.edge === "bottom" && stuck.body !== "", `${stuck.tint && stuck.tint.written} · ${stuck.tint && stuck.tint.edge}`);
    await on.page.evaluate(SCROLL_PAST);
    await on.page.waitForTimeout(1200);
    const past = await on.page.evaluate(SNAPSHOT);
    check(V, "on", "past", "cleared once the hall has left the screen", past.tint && past.tint.written === "" && past.body === "", `written "${past.tint && past.tint.written}" · body "${past.body}" · edge ${past.tint && past.tint.edge}`);
    await on.page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await on.page.waitForTimeout(1500);
    const back = await on.page.evaluate(SNAPSHOT);
    check(V, "on", "back at rest", "written again", back.tint && HEX.test(back.tint.written) && back.body !== "", `${back.tint && back.tint.written}`);
    check(V, "on", "-", "no page errors", on.errs.length === 0, on.errs.join(" | "));
  }
  await on.ctx.close();

  const off = await open(vp, "?tint=off", true);
  const offRest = await off.page.evaluate(SNAPSHOT);
  check(V, "off", "rest", "hall mounted", !offRest.missing, offRest.missing ? "no __museum" : "");
  if (!offRest.missing) {
    check(V, "off", "rest", "never written, <body> untouched", offRest.tint && offRest.tint.on === false && offRest.tint.writes === 0 && offRest.body === "", JSON.stringify({ on: offRest.tint && offRest.tint.on, writes: offRest.tint && offRest.tint.writes, body: offRest.body }));
    check(V, "off", "-", "no page errors", off.errs.length === 0, off.errs.join(" | "));
  }
  await off.ctx.close();
}
{
  const d = await open({ w: 1440, h: 900 }, "", false);
  const snap = await d.page.evaluate(SNAPSHOT);
  check("1440x900", "no bars", "rest", "hall mounted", !snap.missing, snap.missing ? "no __museum" : "");
  if (!snap.missing) {
    check("1440x900", "no bars", "rest", "tint off, <body> untouched", snap.tint && snap.tint.on === false && snap.tint.bars === 0 && snap.body === "", JSON.stringify({ on: snap.tint && snap.tint.on, bars: snap.tint && snap.tint.bars, body: snap.body }));
    check("1440x900", "no bars", "rest", "canvas = stage", snap.canvas && snap.stage && near(snap.canvas.height, snap.stage.height, 0.5), `${snap.canvas && snap.canvas.height} vs ${snap.stage && snap.stage.height}`);
    check("1440x900", "no bars", "-", "no page errors", d.errs.length === 0, d.errs.join(" | "));
  }
  await d.ctx.close();
}
await browser.close();

const lines = ["# /paintings bar tint — measured", "", `base ${BASE} · bars ${BARS} · ${new Date().toISOString()}`, "", "| viewport | session | position | check | ok | detail |", "|---|---|---|---|---|---|"];
for (const r of results) lines.push(`| ${r.vp} | ${r.session} | ${r.pos} | ${r.name} | ${r.ok ? "✓" : "✗"} | ${r.detail.replace(/\|/g, "\\|")} |`);
writeFileSync(join(OUT, "tint.json"), JSON.stringify({ base: BASE, bars: BARS, results }, null, 2));
writeFileSync(join(OUT, "tint.md"), lines.join("\n") + "\n");
for (const r of results) if (!r.ok) console.error(`  ✗ ${r.vp} · ${r.session} · ${r.pos} · ${r.name} — ${r.detail}`);
console.log(`museum-tint: ${results.length} check(s), ${failures} failed · ${join(OUT, "tint.md")}`);
process.exit(failures ? 1 : 0);
