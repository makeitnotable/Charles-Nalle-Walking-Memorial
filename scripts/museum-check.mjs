#!/usr/bin/env node
/**
 * The Museum step tests (docs/PLAN.md A10 implementation order + Part B item
 * 5), driven through `window.__museum` ({ state, approach(i), turnOn(i),
 * turnOff(), paintingRect(i), placements, info, camera }) that Museum.tsx
 * exposes once the scene is up.
 *
 * Per viewport (390×844 · 844×390 · 768×1024 · 1024×768 · 1440×900):
 *   · rail at rest: camera (fov/far/pitch), draw calls, fps proxy (240 rAF
 *     samples: frames > 26 ms), painting 0 projected rect;
 *   · rail mid + end: scroll to 50% and 100% of the slot; railIdx agrees;
 *   · U6/U7 approach(3): projected painting rect vs the stage (centred within
 *     ±3%?), disjoint from the plaque/card/sheet? which buttons exist?
 *     the top chip text; menu lane (top-right on /paintings) empty?
 *   · alive: turnOn(3) → state.alive === 3; turnOff → −1;
 *   · Escape returns to the rail; console clean throughout;
 *   · floating controls census (rects) for the states.mjs cross-check.
 * Chromium flags: --use-gl=angle --autoplay-policy=no-user-gesture-required.
 *
 * Usage: node scripts/museum-check.mjs <outdir> [--base URL] [--vp 390,land,768,1024,1440]
 * Output: <outdir>/museum.json + museum.md. Exit 1 on any failed assertion.
 * Phase 0 runs it as a BASELINE (failures expected and recorded).
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v7/qa/museum";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ALL_VP = {
  390: { width: 390, height: 844 },
  land: { width: 844, height: 390 },
  768: { width: 768, height: 1024 },
  1024: { width: 1024, height: 768 },
  1440: { width: 1440, height: 900 },
};
const VPS = flag("vp", "390,land,768,1024,1440").split(",").map((n) => ({ name: n, ...ALL_VP[n] }));
mkdirSync(outdir, { recursive: true });

const UI = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 4 && r.height > 4 && cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0.05;
  };
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const stage = document.querySelector("canvas")?.parentElement;
  const controls = [...document.querySelectorAll("button, a, [role='button']")]
    .filter(vis)
    .filter((el) => {
      let n = el;
      while (n && n !== document.body) {
        const cs = getComputedStyle(n);
        if (cs.position === "fixed" || cs.position === "absolute" || cs.position === "sticky") return true;
        n = n.parentElement;
      }
      return false;
    })
    .map((el) => ({ text: (el.getAttribute("aria-label") || el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40), rect: rectOf(el) }))
    .filter((c) => c.rect.x >= 0 && c.rect.y >= -2); // drop the off-screen a11y skip link
  // the plaque: the phone sheet, else the desktop card holding "Back to the hall"
  let card = null;
  const sheet = document.querySelector(".museum-sheet");
  if (sheet && vis(sheet)) card = rectOf(sheet);
  else {
    const back = [...document.querySelectorAll("button")].find((b) => /back to the hall/i.test(b.innerText));
    if (back) {
      let n = back.parentElement;
      while (n && n !== document.body && !(n.getBoundingClientRect().width > 120 && n.getBoundingClientRect().height < innerHeight * 0.9 && getComputedStyle(n).backgroundColor !== "rgba(0, 0, 0, 0)")) n = n.parentElement;
      if (n && n !== document.body) card = rectOf(n);
    }
  }
  const chip = [...document.querySelectorAll("p")].filter(vis).map((e) => (e.innerText || "").trim().replace(/\s+/g, " ")).find((t) => t && t.length < 90 && /scroll to walk|returns to the hall|Face forward|drag to look/i.test(t)) || null;
  const menu = document.querySelector(".cnwm-menu-burger");
  return {
    stage: stage ? rectOf(stage) : null,
    controls,
    card,
    chip,
    menu: menu ? rectOf(menu) : null,
    inset: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-inset")) || 20,
  };
};

const FPS = async (n = 240) =>
  await new Promise((res) => {
    const d = [];
    let last = performance.now();
    const step = () => {
      const now = performance.now();
      d.push(now - last);
      last = now;
      if (d.length < n) requestAnimationFrame(step);
      else res({ long: d.filter((x) => x > 26).length, avg: +(d.reduce((a, b) => a + b, 0) / d.length).toFixed(1), max: +Math.max(...d).toFixed(1) });
    };
    requestAnimationFrame(step);
  });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader"] });
const report = [];
for (const vp of VPS) {
  const phone = vp.width < 640 || vp.height < 640;
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, hasTouch: phone, isMobile: vp.width < 640 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).split("\n")[0]));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  const rec = { vp: vp.name, width: vp.width, height: vp.height, findings: [], errors };
  const rel = (r, s) => (r && s ? { cx: +(((r.left + r.right) / 2 - s.x) / s.w).toFixed(3), cy: +(((r.top + r.bottom) / 2 - s.y) / s.h).toFixed(3), w: +((r.right - r.left) / s.w).toFixed(3), h: +((r.bottom - r.top) / s.h).toFixed(3) } : null);
  const overlaps = (r, c) => Boolean(r && c && Math.min(r.right, c.x + c.w) - Math.max(r.left, c.x) > 2 && Math.min(r.bottom, c.y + c.h) - Math.max(r.top, c.y) > 2);
  try {
    await page.goto(BASE + "/paintings", { waitUntil: "networkidle", timeout: 60000 });
    const ok = await page.waitForFunction(() => Boolean(window.__museum), null, { timeout: 25000 }).then(() => true).catch(() => false);
    if (!ok) throw new Error("__museum hook never appeared (capability gate / three failed to load)");
    await page.waitForTimeout(1500);
    // Bring the sticky stage to the top of the viewport (the page has a header
    // above the hall) so every measurement is taken with the stage in view.
    const wrapTop = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      const wrap = c.closest(".relative") || c.parentElement.parentElement;
      const r = wrap.getBoundingClientRect();
      const top = Math.round(window.scrollY + r.top);
      // `scroll-behavior: smooth` is on — force an instant jump, and never
      // read scrollY back as the target.
      window.scrollTo({ top, behavior: "instant" });
      return { top, total: r.height - window.innerHeight };
    });
    await page.waitForTimeout(1800);
    rec.rest = { state: await page.evaluate(() => window.__museum.state), calls: await page.evaluate(() => window.__museum.info.render.calls), fps: await page.evaluate(FPS), ui: await page.evaluate(UI), rect0: await page.evaluate(() => window.__museum.paintingRect(0)) };
    await page.screenshot({ path: join(outdir, `rail-rest-${vp.name}.png`) });
    if (rec.rest.fps.long > 3) rec.findings.push(`fps: ${rec.rest.fps.long}/240 frames > 26ms at rest`);
    if (rec.rest.calls > 80) rec.findings.push(`draw calls ${rec.rest.calls} > 80`);
    if (rec.rest.state.cur.pitch === 0 && rec.rest.state.target.pitch === 0) rec.findings.push("U1 rail pitch is 0 (want ≈ −6° to −8°)");
    if (rec.rest.state.far < 80) rec.findings.push(`U2 camera.far ${rec.rest.state.far} (end wall beyond far/fog)`);
    // menu lane on /paintings: top-right must be empty of museum controls
    const menu = rec.rest.ui.menu;
    if (menu) for (const c of rec.rest.ui.controls) if (overlaps({ left: c.rect.x, right: c.rect.x + c.rect.w, top: c.rect.y, bottom: c.rect.y + c.rect.h }, menu) && !/menu/i.test(c.text)) rec.findings.push(`U10 "${c.text}" sits in the corner-menu lane`);
    // Skip pill on --ui-inset?
    const skip = rec.rest.ui.controls.find((c) => /skip/i.test(c.text));
    if (skip && Math.abs(skip.rect.y - rec.rest.ui.inset) > 3) rec.findings.push(`U10 Skip pill top=${skip.rect.y} (inset ${rec.rest.ui.inset})`);
    if (skip && skip.rect.x + skip.rect.w > vp.width * 0.6) rec.findings.push("U10 Skip pill on the right (menu lane) — want top-left");
    // hint chip
    if (rec.rest.ui.chip && /↓/.test(rec.rest.ui.chip)) rec.findings.push("U10 literal ↓ glyph in the chip");

    // ——— Rail mid / end ———
    for (const [label, f] of [["mid", 0.5], ["end", 1]]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(wrapTop.top + wrapTop.total * f));
      await page.waitForTimeout(1800);
      rec[`rail_${label}`] = { state: await page.evaluate(() => window.__museum.state), fps: await page.evaluate(FPS) };
      await page.screenshot({ path: join(outdir, `rail-${label}-${vp.name}.png`) });
      if (rec[`rail_${label}`].fps.long > 3) rec.findings.push(`fps: ${rec[`rail_${label}`].fps.long}/240 frames > 26ms at rail ${label}`);
    }
    if (rec.rail_end.state.railIdx !== rec.rail_end.state.works - 1) rec.findings.push(`rail end railIdx ${rec.rail_end.state.railIdx} ≠ ${rec.rail_end.state.works - 1}`);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), wrapTop.top);
    await page.waitForTimeout(800);

    // ——— Approach ———
    await page.evaluate(() => window.__museum.approach(3));
    await page.waitForTimeout(2200);
    /* The composition assertions below describe the SETTLED frame, so wait for
       the dolly to actually arrive instead of trusting a fixed timeout. The
       damping steps per FRAME (dt clamped at 50ms), so on a software
       rasterizer — this QA container, an old laptop — 2.2s of wall clock is
       only ~0.4s of simulated travel and the camera is still moving: that read
       as an off-centre painting (cx 0.531) when the composition was correct
       and converged to 0.500. Bounded, so a genuinely stuck camera still
       fails the assertion rather than hanging the run. */
    await page
      .waitForFunction(
        () => {
          const s = window.__museum.state;
          return (
            Math.abs(s.cur.x - s.target.x) < 0.01 &&
            Math.abs(s.cur.y - s.target.y) < 0.01 &&
            Math.abs(s.cur.z - s.target.z) < 0.01
          );
        },
        null,
        { timeout: 15000, polling: 200 },
      )
      .catch(() => {});
    const ap = { state: await page.evaluate(() => window.__museum.state), rect: await page.evaluate(() => window.__museum.paintingRect(3)), ui: await page.evaluate(UI), fps: await page.evaluate(FPS) };
    ap.relRect = rel(ap.rect, ap.ui.stage);
    ap.overlapsCard = overlaps(ap.rect, ap.ui.card);
    rec.approach = ap;
    await page.screenshot({ path: join(outdir, `approach-${vp.name}.png`) });
    if (ap.state.mode !== "approach") rec.findings.push("approach(3) did not enter approach mode");
    if (ap.relRect && Math.abs(ap.relRect.cx - 0.5) > 0.03 && vp.width >= 640) rec.findings.push(`U6 painting centre x=${ap.relRect.cx} (want 0.5 ± 0.03)`);
    if (ap.overlapsCard) rec.findings.push("U6/U7 painting rect overlaps the card/sheet");
    if (ap.rect?.behind) rec.findings.push("painting projects behind the camera");
    const btns = ap.ui.controls.map((c) => c.text);
    if (btns.some((t) => /bring it to life|let it rest/i.test(t))) rec.findings.push("U6 visible 'Bring it to life' button (should be an Easter egg + sr-only toggle)");
    if (ap.ui.chip && /returns to the hall/i.test(ap.ui.chip)) rec.findings.push("U6 'Esc/Back returns…' chip still shown");
    if (ap.ui.card && ap.ui.card.h > vp.height * 0.55 && phone) rec.findings.push(`U7 sheet/card ${ap.ui.card.h}px tall > 55% of the stage`);
    if (ap.fps.long > 3) rec.findings.push(`fps: ${ap.fps.long}/240 frames > 26ms in approach`);

    // ——— Alive ———
    await page.evaluate(() => window.__museum.turnOn(3));
    await page.waitForTimeout(1500);
    rec.alive = await page.evaluate(() => window.__museum.state.alive);
    await page.screenshot({ path: join(outdir, `alive-${vp.name}.png`) });
    if (rec.alive !== 3) rec.findings.push(`turnOn(3) → alive ${rec.alive}`);
    await page.evaluate(() => window.__museum.turnOff());
    await page.waitForTimeout(500);
    if ((await page.evaluate(() => window.__museum.state.alive)) !== -1) rec.findings.push("turnOff() left a video alive");

    // ——— Escape ———
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1200);
    rec.afterEsc = await page.evaluate(() => window.__museum.state.mode);
    if (rec.afterEsc !== "rail") rec.findings.push("Escape did not return to the rail");
    // Portrait work (index 9) aspect
    rec.aspects = await page.evaluate(() => window.__museum.placements.map((p) => +(p.w / p.h).toFixed(3)));
    if (rec.aspects.every((a) => Math.abs(a - 1.5) < 0.01)) rec.findings.push("U8 every canvas is 1.5 (aspects not real; portrait work distorted)");
  } catch (e) {
    rec.findings.push(`ERROR: ${e.message.split("\n")[0]}`);
  }
  if (errors.length) rec.findings.push(`console errors: ${errors.length} — ${errors[0]}`);
  report.push(rec);
  console.log(`${rec.findings.length ? "✗" : "✓"} ${vp.name} — calls ${rec.rest?.calls} fps-long ${rec.rest?.fps?.long} · ${rec.findings.length} finding(s)${rec.findings.length ? ": " + rec.findings.slice(0, 4).join(" | ") : ""}`);
  await ctx.close();
}
await browser.close();

writeFileSync(join(outdir, "museum.json"), JSON.stringify(report, null, 1));
const total = report.reduce((s, r) => s + r.findings.length, 0);
const L = [`# Museum check — ${BASE}`, "", `**${total} finding(s) across ${report.length} viewport(s).**`, ""];
L.push(`| vp | calls | fps long (rest/mid/end/approach) | rail pitch | far | approach cx/cy | overlaps card | findings |`, `|---|---|---|---|---|---|---|---|`);
for (const r of report)
  L.push(`| ${r.vp} | ${r.rest?.calls ?? "—"} | ${r.rest?.fps?.long ?? "—"}/${r.rail_mid?.fps?.long ?? "—"}/${r.rail_end?.fps?.long ?? "—"}/${r.approach?.fps?.long ?? "—"} | ${r.rest?.state?.cur?.pitch ?? "—"} | ${r.rest?.state?.far ?? "—"} | ${r.approach?.relRect ? `${r.approach.relRect.cx}/${r.approach.relRect.cy}` : "—"} | ${r.approach?.overlapsCard ?? "—"} | ${r.findings.join("<br>") || "—"} |`);
L.push("", "## Controls in approach", "");
for (const r of report.filter((x) => x.approach)) L.push(`- **${r.vp}**: ` + r.approach.ui.controls.map((c) => `"${c.text}" ${c.rect.w}×${c.rect.h}@${c.rect.x},${c.rect.y}`).join(" · ") + (r.approach.ui.chip ? ` · chip: "${r.approach.ui.chip}"` : ""));
writeFileSync(join(outdir, "museum.md"), L.join("\n"));
console.log(`\nmuseum → ${join(outdir, "museum.md")} (${total} findings)`);
process.exit(total ? 1 : 0);
