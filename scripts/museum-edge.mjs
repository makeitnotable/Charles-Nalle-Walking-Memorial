#!/usr/bin/env node
/**
 * Round 24 — the /paintings edge strips and top bleed, measured where this
 * container can measure them (docs/rounds/2026-09-21-round-24-plan.md,
 * device pass 4).
 *
 * The bars' height is stood in through an init-script <style>
 * (`--museum-b: 110px !important` on .museum-stage; the @supports gate never
 * matches in Chromium, so the stage would otherwise carry 0), exactly as
 * map-framing.mjs stands T and E in. The iOS-only overflow/clip-path rules
 * are not stood in: this instrument asserts geometry, not paint.
 *
 * Per phone viewport (390×645, 430×720):
 *   · ON (stand-in): the two strips exist, 8px tall, full width, riding the
 *     viewport's edges (−2→6 and H−6→H+2) at rest and stuck at 40% of the
 *     slot; hidden once the hall has left the screen; back at rest again.
 *     The canvas is stage + B tall starting B above the stage; the stage's
 *     box, `--cnwm-chip-y` and the canonical projection of a work are
 *     identical to the no-bleed session (the framing invariant).
 *   · BLEED OFF (`?bleed=off`, stand-in): canvas = stage; strips still on.
 *   · EDGE OFF (`?edge=off`, stand-in): no strip in the DOM; bleed on.
 *   · no page errors anywhere.
 * At 1440×900 with no stand-in: no strip, canvas = stage.
 *
 *   node scripts/museum-edge.mjs [--base http://localhost:4331] [--b 110]
 *        [--vp 390x645,430x720] [--out node_modules/.cache/museum-edge]
 *
 * Output: <out>/edge.json + edge.md. Exit 1 on any failed assertion.
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
  console.log("usage: node scripts/museum-edge.mjs [--base URL] [--b px] [--vp WxH,...] [--out dir]");
  process.exit(0);
}
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const B = Number(flag("b", "110"));
const OUT = flag("out", "node_modules/.cache/museum-edge");
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
const near = (a, b, tol) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tol;
const r1 = (v) => (typeof v === "number" ? Math.round(v * 10) / 10 : v);

const SNAPSHOT = () => {
  const h = window.__museum;
  if (!h) return { missing: true };
  const stage = document.querySelector(".museum-stage");
  const canvas = stage && stage.querySelector("canvas");
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, width: r.width, height: r.height };
  };
  const cam = h.camera;
  const savedPos = cam.position.clone();
  const savedRot = cam.rotation.clone();
  cam.position.set(0, cam.position.y, 0.4);
  cam.rotation.set(-0.17, 0, 0, "YXZ");
  cam.updateMatrixWorld(true);
  const cr = h.paintingRect(0);
  cam.position.copy(savedPos);
  cam.rotation.copy(savedRot);
  cam.updateMatrixWorld(true);
  const strips = [...document.querySelectorAll(".museum-edge")].map((el) => ({ name: el.dataset.edge, display: getComputedStyle(el).display, rect: rect(el) }));
  return {
    scrollY: window.scrollY,
    innerHeight: innerHeight,
    edge: h.state.edge,
    stage: rect(stage),
    canvas: rect(canvas),
    chipY: stage ? getComputedStyle(stage).getPropertyValue("--cnwm-chip-y").trim() : null,
    canonical: cr ? { left: cr.left, right: cr.right, top: cr.top, bottom: cr.bottom } : null,
    strips,
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
    await ctx.addInitScript((b) => {
      const add = () => {
        const st = document.createElement("style");
        st.textContent = `.museum-stage{--museum-b:${b}px !important}`;
        (document.head || document.documentElement).appendChild(st);
      };
      if (document.documentElement) add();
      else
        new MutationObserver((_, o) => {
          if (!document.documentElement) return;
          o.disconnect();
          add();
        }).observe(document, { childList: true });
    }, B);
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

const stripAsserts = (vp, session, pos, snap, wantOn) => {
  const top = snap.strips.find((s) => s.name === "top");
  const bottom = snap.strips.find((s) => s.name === "bottom");
  const shown = (s) => !!s && s.display !== "none";
  if (!wantOn) {
    check(vp, session, pos, "strips hidden", !shown(top) && !shown(bottom), `${top ? top.display : "absent"} / ${bottom ? bottom.display : "absent"}`);
    return;
  }
  const H = snap.innerHeight;
  check(vp, session, pos, "top strip on the top edge (−2→6)", shown(top) && near(top.rect.top, -2, 1) && near(top.rect.bottom, 6, 1) && near(top.rect.width, snap.stage.width, 1), top ? `${r1(top.rect?.top)}→${r1(top.rect?.bottom)} w ${r1(top.rect?.width)}` : "absent");
  check(vp, session, pos, "bottom strip on the bottom edge (H−6→H+2)", shown(bottom) && near(bottom.rect.top, H - 6, 1) && near(bottom.rect.bottom, H + 2, 1), bottom ? `${r1(bottom.rect?.top)}→${r1(bottom.rect?.bottom)} (H ${H})` : "absent");
};
const framingAsserts = (vp, session, pos, ref, on) => {
  check(vp, session, pos, "stage box unchanged", near(on.stage.height, ref.stage.height, 0.5) && near(on.stage.top, ref.stage.top, 0.5), `${r1(on.stage.top)}/${r1(on.stage.height)} vs ${r1(ref.stage.top)}/${r1(ref.stage.height)}`);
  check(vp, session, pos, "chip band unchanged", on.chipY === ref.chipY, `${on.chipY} vs ${ref.chipY}`);
  const canon = on.canonical && ref.canonical && ["left", "right", "top", "bottom"].every((k) => near(on.canonical[k], ref.canonical[k], 0.5));
  check(vp, session, pos, "canonical projection unchanged", canon, on.canonical && ref.canonical ? `${[on.canonical.left, on.canonical.top].map(r1).join(",")} vs ${[ref.canonical.left, ref.canonical.top].map(r1).join(",")}` : "no rect");
};

for (const vp of VPS) {
  const V = `${vp.w}x${vp.h}`;
  /* the reference: bleed off, so the stage's framing is today's */
  const ref = await open(vp, "?bleed=off", true);
  const refRest = await ref.page.evaluate(SNAPSHOT);
  check(V, "bleed off", "rest", "hall mounted", !refRest.missing, refRest.missing ? "no __museum" : "");
  let refStuck = null;
  if (!refRest.missing) {
    check(V, "bleed off", "rest", "canvas = stage", near(refRest.canvas.height, refRest.stage.height, 0.5) && near(refRest.canvas.top, refRest.stage.top, 0.5), `${r1(refRest.canvas.height)} vs ${r1(refRest.stage.height)}`);
    stripAsserts(V, "bleed off", "rest", refRest, true);
    await ref.page.evaluate(SCROLL_TO_RAIL, 0.4);
    await ref.page.waitForTimeout(1500);
    refStuck = await ref.page.evaluate(SNAPSHOT);
    check(V, "bleed off", "-", "no page errors", ref.errs.length === 0, ref.errs.join(" | "));
  }
  await ref.ctx.close();

  const on = await open(vp, "", true);
  const rest = await on.page.evaluate(SNAPSHOT);
  check(V, "on", "rest", "hall mounted", !rest.missing, rest.missing ? "no __museum" : "");
  if (!rest.missing && !refRest.missing) {
    check(V, "on", "rest", `edge on, bars ${B}, B ${B}`, rest.edge && rest.edge.on === true && rest.edge.bars === B && rest.edge.b === B, JSON.stringify(rest.edge && { on: rest.edge.on, bars: rest.edge.bars, b: rest.edge.b, mode: rest.edge.mode }));
    check(V, "on", "rest", "canvas = stage + B, B above", near(rest.canvas.height, rest.stage.height + B, 0.5) && near(rest.canvas.top, rest.stage.top - B, 0.5), `canvas ${r1(rest.canvas.top)}/${r1(rest.canvas.height)} · stage ${r1(rest.stage.top)}/${r1(rest.stage.height)}`);
    framingAsserts(V, "on", "rest", refRest, rest);
    stripAsserts(V, "on", "rest", rest, true);
    await on.page.evaluate(SCROLL_TO_RAIL, 0.4);
    await on.page.waitForTimeout(1500);
    const stuck = await on.page.evaluate(SNAPSHOT);
    check(V, "on", "stuck", "stage stuck at 0", near(stuck.stage.top, 0, 0.5), `${r1(stuck.stage.top)}`);
    if (refStuck) framingAsserts(V, "on", "stuck", refStuck, stuck);
    stripAsserts(V, "on", "stuck", stuck, true);
    await on.page.evaluate(SCROLL_PAST);
    await on.page.waitForTimeout(1200);
    const past = await on.page.evaluate(SNAPSHOT);
    stripAsserts(V, "on", "past", past, false);
    await on.page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await on.page.waitForTimeout(1500);
    const back = await on.page.evaluate(SNAPSHOT);
    stripAsserts(V, "on", "back at rest", back, true);
    check(V, "on", "-", "no page errors", on.errs.length === 0, on.errs.join(" | "));
  }
  await on.ctx.close();

  const eo = await open(vp, "?edge=off", true);
  const eoRest = await eo.page.evaluate(SNAPSHOT);
  check(V, "edge off", "rest", "hall mounted", !eoRest.missing, eoRest.missing ? "no __museum" : "");
  if (!eoRest.missing) {
    check(V, "edge off", "rest", "no strip in the DOM", eoRest.strips.length === 0 && eoRest.edge && eoRest.edge.on === false, `${eoRest.strips.length} strip(s) · on ${eoRest.edge && eoRest.edge.on}`);
    check(V, "edge off", "rest", "bleed still on", near(eoRest.canvas.height, eoRest.stage.height + B, 0.5), `${r1(eoRest.canvas.height)} vs ${r1(eoRest.stage.height)}`);
    check(V, "edge off", "-", "no page errors", eo.errs.length === 0, eo.errs.join(" | "));
  }
  await eo.ctx.close();
}
{
  const d = await open({ w: 1440, h: 900 }, "", false);
  const snap = await d.page.evaluate(SNAPSHOT);
  check("1440x900", "no bars", "rest", "hall mounted", !snap.missing, snap.missing ? "no __museum" : "");
  if (!snap.missing) {
    check("1440x900", "no bars", "rest", "no strip, edge off, B 0", snap.strips.length === 0 && snap.edge && snap.edge.on === false && snap.edge.b === 0, JSON.stringify({ strips: snap.strips.length, edge: snap.edge }));
    check("1440x900", "no bars", "rest", "canvas = stage", near(snap.canvas.height, snap.stage.height, 0.5) && near(snap.canvas.top, snap.stage.top, 0.5), `${r1(snap.canvas.height)} vs ${r1(snap.stage.height)}`);
    check("1440x900", "no bars", "-", "no page errors", d.errs.length === 0, d.errs.join(" | "));
  }
  await d.ctx.close();
}
await browser.close();

const lines = ["# /paintings edge strips and top bleed — measured", "", `base ${BASE} · B ${B} · ${new Date().toISOString()}`, "", "| viewport | session | position | check | ok | detail |", "|---|---|---|---|---|---|"];
for (const r of results) lines.push(`| ${r.vp} | ${r.session} | ${r.pos} | ${r.name} | ${r.ok ? "✓" : "✗"} | ${r.detail.replace(/\|/g, "\\|")} |`);
writeFileSync(join(OUT, "edge.json"), JSON.stringify({ base: BASE, b: B, results }, null, 2));
writeFileSync(join(OUT, "edge.md"), lines.join("\n") + "\n");
for (const r of results) if (!r.ok) console.error(`  ✗ ${r.vp} · ${r.session} · ${r.pos} · ${r.name} — ${r.detail}`);
console.log(`museum-edge: ${results.length} check(s), ${failures} failed · ${join(OUT, "edge.md")}`);
process.exit(failures ? 1 : 0);
