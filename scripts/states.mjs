#!/usr/bin/env node
/**
 * Interaction-state capture. shots.mjs photographs pages at rest; this
 * photographs them *while something is happening* — which is where the
 * floating-UI collisions actually live.
 *
 * Each state also re-runs the collision measurement, so "menu open + audio
 * playing + map focused" produces both a picture and a number.
 *
 * Usage: node scripts/states.mjs <outdir> [--base URL] [--vp 390,768,1024,1440,land]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v5/qa/states";
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
const VPS = flag("vp", "390,land,768,1024,1440")
  .split(",")
  .map((n) => ({ name: n, ...ALL_VP[n] }));

mkdirSync(outdir, { recursive: true });

/** Collision measurement — same rules as probe.mjs, plus absolutely-positioned
 *  overlays inside a viewport-sized stage (the map's controls behave exactly
 *  like fixed UI even though they are `absolute` inside `.map-shell`). */
const COLLIDE = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return (
      r.width > 8 &&
      r.height > 8 &&
      cs.visibility !== "hidden" &&
      cs.display !== "none" &&
      Number(cs.opacity) > 0.05 &&
      cs.pointerEvents !== "none" &&
      r.bottom > 0 &&
      r.top < innerHeight &&
      r.right > 0 &&
      r.left < innerWidth
    );
  };
  const label = (el) => {
    const cls = (el.getAttribute("class") || "")
      .split(/\s+/)
      .filter((c) => c && !/^(sm|md|lg|xl):/.test(c) && !/^(text|font|leading)-/.test(c))
      .slice(0, 3)
      .join(".");
    return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls ? "." + cls : ""}`;
  };

  // A stage is any element that fills the viewport and positions children.
  const stages = [...document.querySelectorAll("body *")].filter((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return (
      cs.position !== "static" &&
      r.width >= innerWidth * 0.9 &&
      r.height >= innerHeight * 0.7
    );
  });

  const cands = new Set();
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.position === "fixed" || cs.position === "sticky") cands.add(el);
    else if (cs.position === "absolute" && stages.some((s) => s !== el && s.contains(el)))
      cands.add(el);
  }

  // Only the interactive/legible leaves matter — a positioned wrapper that
  // merely holds a button is not itself a colliding object.
  const items = [...cands]
    .filter(vis)
    .filter((el) => {
      if (el.matches("button,a,input,[role='button'],[role='dialog']")) return true;
      // a positioned box with its own visible skin or text, holding no other candidate
      const holdsCand = [...cands].some((o) => o !== el && el.contains(o));
      if (holdsCand) return false;
      const cs = getComputedStyle(el);
      const painted =
        cs.backgroundColor !== "rgba(0, 0, 0, 0)" ||
        cs.borderTopWidth !== "0px" ||
        (el.innerText || "").trim().length > 0;
      return painted;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const inLens = Boolean(el.closest(".lens-shell"));
      /* An element (or its floating wrapper's child) that carries its own
         ground — backdrop blur + border + non-transparent background — is a
         self-scrimmed LAYER (the mini-player pill). */
      const skin = el.querySelector(":scope > div") ?? el;
      const scs = skin === el ? cs : getComputedStyle(skin);
      const layer =
        (scs.backdropFilter && scs.backdropFilter !== "none") &&
        scs.borderTopWidth !== "0px" &&
        scs.backgroundColor !== "rgba(0, 0, 0, 0)";
      /* A fixed CONTROL (menu burger, map buttons) must never be covered,
         even by a layer. */
      const fixedControl =
        el.matches("button,a,[role='button']") &&
        (cs.position === "fixed" ||
          Boolean(el.closest(".mapboxgl-ctrl, .cnwm-menu-burger")) ||
          /* the map's own corner controls are `absolute` inside the 100dvh shell */
          (cs.position === "absolute" && Boolean(el.closest(".map-shell"))));
      return {
        sel: label(el),
        inLens,
        marker: Boolean(el.closest(".mapboxgl-marker")),
        layer,
        fixedControl,
        text: (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 34),
        z: cs.zIndex === "auto" ? 0 : Number(cs.zIndex),
        rect: {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
        },
      };
    });

  /* A modal over page content is not a collision — it is the point of a modal.
     When the menu scrim is up, the panel is a layer above a dimmed page, so
     pairs involving the panel are excluded. Everything else still counts, and
     the invariant that the scrim MUST be present whenever the panel is open is
     asserted separately below. */
  const scrimUp = Boolean(
    document.querySelector(".cnwm-menu-scrim:not([hidden])"),
  );
  const isPanelPart = (sel) => /cnwm-menu/.test(sel);
  /* v7: the open 1858 lens is a modal layer over the map (70% black ground,
     pointer-events on) — the same doctrine as the scrimmed menu: pairs of a
     lens element with anything outside it are layering, not collision. */
  const lensUp = (() => {
    const l = document.querySelector(".lens-shell");
    return Boolean(l && getComputedStyle(l).opacity === "1");
  })();

  const hits = [];
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) {
      if (scrimUp && (isPanelPart(items[i].sel) || isPanelPart(items[j].sel)))
        continue;
      if (lensUp && items[i].inLens !== items[j].inLens) continue;
      /* Two map markers are geographic objects: their positions are DATA, not
         layout. The Commissioner's Office and the Barbershop are one block
         apart, so their pins are close at any camera that shows the whole
         walk, and pushing them apart would make the map lie. Marker-vs-marker
         is excluded; marker-vs-UI is still very much a collision. */
      if (items[i].marker && items[j].marker) continue;
      /* v7 (P5): while a stop is focused the camera flies over the city and a
         neighbouring marker's pill will pass UNDER the fixed corner controls
         (Back / Stop the walk), which carry their own opaque ground. The map
         moving under fixed chrome is layering, not layout — the pill is back
         a beat later, the control is always legible. Overview state (camera
         at rest) still counts marker-vs-control. */
      const focusedWalk = Boolean(window.__troyMap?.state?.focused);
      if (
        focusedWalk &&
        ((items[i].marker && items[j].fixedControl && !items[j].marker) ||
          (items[j].marker && items[i].fixedControl && !items[i].marker))
      )
        continue;
      /* A floating pill that carries its own ground (backdrop blur + border
         + painted background — the mini-player) is a LAYER above in-flow
         content, the same doctrine as the scrimmed menu (v5 F4).
         Layer-vs-CONTENT is layering; layer-vs-a-fixed-control still
         counts as a collision. */
      if (
        (items[i].layer && !items[j].fixedControl) ||
        (items[j].layer && !items[i].fixedControl)
      )
        continue;
      const a = items[i].rect;
      const b = items[j].rect;
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 2 && oy > 2) {
        const nested =
          (a.x <= b.x && a.y <= b.y && a.x + a.w >= b.x + b.w && a.y + a.h >= b.y + b.h) ||
          (b.x <= a.x && b.y <= a.y && b.x + b.w >= a.x + a.w && b.y + b.h >= a.y + a.h);
        if (!nested)
          hits.push({
            a: items[i].sel,
            aText: items[i].text,
            aZ: items[i].z,
            b: items[j].sel,
            bText: items[j].text,
            bZ: items[j].z,
            overlap: `${ox}×${oy}`,
            area: ox * oy,
          });
      }
    }
  /* The invariant that replaces the excluded pairs: an open panel is ALWAYS
     scrimmed. If this ever fails, the panel really is colliding again. */
  const panelOpen = Boolean(
    document.querySelector(".cnwm-menu-panel:not(.hidden)"),
  );
  const unscrimmedPanel = panelOpen && !scrimUp;

  return {
    items,
    hits: hits.sort((x, y) => y.area - x.area),
    unscrimmedPanel,
  };
};

// v7: GL flags so the museum mounts under headless Chromium
const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
const log = [];
const shot = async (page, name) => {
  await page.screenshot({ path: join(outdir, `${name}.png`) });
};
const record = async (page, name, note) => {
  await shot(page, name);
  const { items, hits, unscrimmedPanel } = await page.evaluate(COLLIDE);
  log.push({ state: name, note, floatCount: items.length, hits, unscrimmedPanel });
  console.log(
    `  ${name} — ${items.length} floating, ${hits.length} collision${hits.length === 1 ? "" : "s"}${unscrimmedPanel ? " ⚠ UNSCRIMMED PANEL" : ""}${hits.length ? ": " + hits.slice(0, 3).map((h) => `${h.a}✕${h.b} ${h.overlap}`).join(" | ") : ""}`,
  );
};

for (const vp of VPS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const go = async (r, wait = 2500) => {
    await page.goto(BASE + r, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(wait);
  };
  console.log(`\n── ${vp.name} (${vp.width}×${vp.height})`);

  try {
    // ─── CHAPTER: the flagship, every combination ───
    await go("/mansion");
    await record(page, `mansion-${vp.name}-01-rest`, "chapter at rest");

    await page.click(".cnwm-menu-burger");
    await page.waitForTimeout(900);
    await record(page, `mansion-${vp.name}-02-menu-open`, "menu open at top");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);

    // Start narration, then scroll past it so the mini-player latches
    const play = page.locator("button[aria-label*='Play'], button[aria-label*='play']").first();
    if (await play.count()) {
      await play.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await record(page, `mansion-${vp.name}-03-player-inview`, "narration object in view");
      await play.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1200);
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2.2));
      await page.waitForTimeout(1600);
      await record(page, `mansion-${vp.name}-04-mini-player`, "audio playing, mini-player latched");

      await page.click(".cnwm-menu-burger").catch(() => {});
      await page.waitForTimeout(900);
      await record(
        page,
        `mansion-${vp.name}-05-mini-plus-menu`,
        "THE COMBINED STATE: audio playing + menu open",
      );
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // v7: the mini-player collapses once the transcript has scrolled away
    if (await play.count()) {
      await page.evaluate(() => window.scrollTo({ top: document.getElementById("onward")?.offsetTop ?? 0, behavior: "instant" }));
      await page.waitForTimeout(1200);
      await record(page, `mansion-${vp.name}-11-mini-collapsed`, "mini-player COLLAPSED at Onward (one orange: Continue)");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(600);
    }

    // Press-and-hold, mid-hold
    const pr = page.locator("[data-press-reveal], .press-reveal, [aria-label*='Press']").first();
    const target = (await pr.count())
      ? pr
      : page.locator("#sketch button, #sketch [role='button']").first();
    if (await target.count()) {
      await target.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(800);
      await record(page, `mansion-${vp.name}-06-sketch-rest`, "press-reveal at rest");
      const box = await target.boundingBox().catch(() => null);
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(700);
        await record(page, `mansion-${vp.name}-07-sketch-holding`, "press-reveal MID-HOLD");
        await page.mouse.up();
      }
    }

    // Keyboard focus ring on the primary CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    await record(page, `mansion-${vp.name}-08-foot`, "chapter foot / onward");
    const cta = page.locator("a.btn-solid").first();
    if (await cta.count()) {
      await cta.focus().catch(() => {});
      await page.waitForTimeout(400);
      await record(page, `mansion-${vp.name}-09-cta-focus`, "primary CTA focus ring");
      await cta.hover().catch(() => {});
      await page.waitForTimeout(500);
      await record(page, `mansion-${vp.name}-10-cta-hover`, "primary CTA hover");
    }

    // ─── MAP: the collision hot spot ───
    await go("/map", 9000);
    await record(page, `map-${vp.name}-01-rest`, "map at rest");
    await page.click(".cnwm-menu-burger").catch(() => {});
    await page.waitForTimeout(900);
    await record(page, `map-${vp.name}-02-menu-open`, "map + menu open");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);

    // Focus a carousel card, then open the menu on top of it
    const card = page
      .locator(".keen-slider__slide button, .keen-slider__slide a, [class*='slide'] button")
      .first();
    if (await card.count()) {
      await card.focus().catch(() => {});
      await page.waitForTimeout(1500);
      await record(page, `map-${vp.name}-03-card-focus`, "map card focused");
      await page.click(".cnwm-menu-burger").catch(() => {});
      await page.waitForTimeout(900);
      await record(
        page,
        `map-${vp.name}-04-card-plus-menu`,
        "THE COMBINED STATE: map card focused + menu open",
      );
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
    }
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
    await page.waitForTimeout(1200);
    await record(page, `map-${vp.name}-05-index`, "map index below the fold");

    // ─── v7 states: the walk, paused, lens, walk + menu ───
    await go("/map", 8000);
    const walkBtn = page.getByRole("button", { name: /take the walk/i }).first();
    if (await walkBtn.count()) {
      await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /take the walk/i.test(b.innerText))?.click());
      await page.waitForTimeout(3800);
      await record(page, `map-${vp.name}-06-walk`, "WALK MODE: Back top-left, Stop the walk top-right, cards");
      // a drag pauses the walk
      const strip = page.locator(".keen-slider").first();
      const box = await strip.boundingBox().catch(() => null);
      if (box) {
        await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
        await page.mouse.down();
        for (let i = 1; i <= 8; i++) {
          await page.mouse.move(box.x + box.width * 0.7 - i * 12, box.y + box.height / 2);
          await page.waitForTimeout(16);
        }
        await page.mouse.up();
        await page.waitForTimeout(1600);
        await record(page, `map-${vp.name}-07-walk-paused`, "walk PAUSED by a drag: button reads Continue");
      }
      await page.click(".cnwm-menu-burger", { timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(900);
      await record(page, `map-${vp.name}-08-walk-plus-menu`, "walk + menu (phones: ☰ retreats while focused)");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
      await page.keyboard.press("Escape"); // back to overview
      await page.waitForTimeout(2200);
    }
    const lensBtn = page.getByRole("button", { name: /see troy in 1858/i }).first();
    if (await lensBtn.count()) {
      await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /see troy in 1858/i.test(b.innerText) && b.getClientRects().length)?.click());
      await page.waitForTimeout(2500);
      await record(page, `map-${vp.name}-09-lens-open`, "1858 LENS open: only Back to today");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(800);
    }

    // ─── PAINTINGS: the dialog ───
    await go("/paintings");
    await record(page, `paintings-${vp.name}-01-rest`, "gallery at rest");

    // ─── v7 MUSEUM states (corner menu forced visible: it is the top-right lane owner) ───
    const hasMuseum = await page.waitForFunction(() => Boolean(window.__museum), null, { timeout: 15000 }).then(() => true).catch(() => false);
    if (hasMuseum) {
      const forceMenu = () => page.evaluate(() => { const m = document.querySelector(".cnwm-menu"); if (m) { m.dataset.hidden = "false"; m.dataset.walk = "false"; } });
      const toStage = () => page.evaluate(() => { const c = document.querySelector("canvas"); const wrap = c.closest(".relative"); const r = wrap.getBoundingClientRect(); window.scrollTo({ top: Math.round(scrollY + r.top), behavior: "instant" }); });
      await toStage(); await page.waitForTimeout(2200); await forceMenu();
      await record(page, `museum-${vp.name}-01-rail-rest`, "MUSEUM rail at rest (chip, Skip top-left, dots, menu)");
      await page.evaluate(() => window.__museum.setLook(0.9, 0)); await page.waitForTimeout(900); await forceMenu();
      await record(page, `museum-${vp.name}-02-looked-away`, "MUSEUM looked away: Face forward");
      await page.evaluate(() => window.__museum.recenter());
      await page.evaluate(() => window.__museum.approach(3)); await page.waitForTimeout(2200); await forceMenu();
      await record(page, `museum-${vp.name}-03-approach`, "MUSEUM approach: card/sheet + painting + Back");
      if (await page.locator(".museum-sheet").count()) {
        await page.evaluate(() => window.__museum.setSheet("full")); await page.waitForTimeout(900); await forceMenu();
        await record(page, `museum-${vp.name}-04-sheet-full`, "MUSEUM approach: sheet expanded");
        await page.evaluate(() => window.__museum.setSheet("peek"));
      }
      await page.evaluate(() => window.__museum.turnOn(3)); await page.waitForTimeout(1200); await forceMenu();
      await record(page, `museum-${vp.name}-05-alive`, "MUSEUM approach: the painting alive");
      await page.evaluate(() => window.__museum.approach(null)); await page.waitForTimeout(800);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(600);
    }
    const tile = page.locator("button, [role='button']").filter({ hasNotText: /menu/i }).nth(1);
    if (await tile.count()) {
      await tile.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(1100);
      await record(page, `paintings-${vp.name}-02-dialog`, "painting dialog open");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
    }

    // ─── HOME: curtain mid-transition ───
    await go("/");
    await record(page, `home-${vp.name}-01-rest`, "home at rest");
    const doorLink = page.locator("a[data-curtain-label]").first();
    if (await doorLink.count()) {
      await doorLink.hover().catch(() => {});
      await page.waitForTimeout(500);
      await record(page, `home-${vp.name}-02-door-hover`, "door hover");
      await doorLink.click({ noWaitAfter: true, timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(320);
      await record(page, `home-${vp.name}-03-curtain-mid`, "CURTAIN MID-TRANSITION");
      await page.waitForTimeout(2600);
    }

    // ─── PEOPLE / ABOUT at rest, plus menu ───
    for (const r of ["/people", "/about"]) {
      await go(r);
      await record(page, `${r.slice(1)}-${vp.name}-01-rest`, `${r} at rest`);
      await page.click(".cnwm-menu-burger").catch(() => {});
      await page.waitForTimeout(900);
      await record(page, `${r.slice(1)}-${vp.name}-02-menu`, `${r} + menu open`);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }
  } catch (e) {
    console.error(`  ✗ ${vp.name}: ${e.message.split("\n")[0]}`);
    log.push({ state: `FAILURE@${vp.name}`, note: e.message.split("\n")[0], hits: [] });
  }
  await ctx.close().catch(() => {});
}
await browser.close().catch(() => {});

writeFileSync(join(outdir, "states.json"), JSON.stringify(log, null, 1));

const L = [`# Interaction states — ${BASE}`, ""];
const bad = log.filter((s) => (s.hits && s.hits.length) || s.unscrimmedPanel);
L.push(`**${log.length} states captured · ${bad.length} with floating-UI collisions.**`, "");
if (bad.length) {
  L.push(`| state | A | B | overlap | z |`, `|---|---|---|---|---|`);
  for (const s of bad)
    for (const h of s.hits.slice(0, 6))
      L.push(
        `| \`${s.state}\` | ${h.a} ${h.aText ? `"${h.aText}"` : ""} | ${h.b} ${h.bText ? `"${h.bText}"` : ""} | **${h.overlap}** | ${h.aZ}/${h.bZ} |`,
      );
} else L.push("No collisions detected in any captured state.");
L.push("", "## All states", "");
for (const s of log) L.push(`- \`${s.state}.png\` — ${s.note} (${s.floatCount ?? "?"} floating, ${s.hits?.length ?? 0} collisions)`);
writeFileSync(join(outdir, "states.md"), L.join("\n"));
console.log(`\nstates → ${join(outdir, "states.md")} — ${bad.length}/${log.length} states have collisions`);
