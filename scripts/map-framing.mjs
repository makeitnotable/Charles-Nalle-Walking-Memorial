#!/usr/bin/env node
/**
 * Round 19 — the /map overview framing, measured where this container can
 * measure it.
 *
 * Why this exists: api.mapbox.com is blocked by the egress policy, so the GL
 * style never loads here, `qa:walk` cannot take a camera or pin assertion, and
 * the visual gate's baselines carry no pins at all. Round 17 shipped the top
 * runway (T) with the camera "not verifiable here", and the fit under T was
 * broken from that day: the label search works in CONTAINER pixels while its
 * safe box was written in WINDOW pixels, T apart, so on a phone it never
 * converged and fell through to the blind OVERVIEW constant (Wil's screenshot
 * 3 against his screenshot of the intended framing).
 *
 * The camera search needs no tiles: `jumpTo` / `project` / `unproject` are
 * transform arithmetic, and `map.on("load")` fires as soon as a style — any
 * style — has parsed. So every api.mapbox.com style request is answered with a
 * stub (version 8, no sources, one background layer in the style's own ground
 * #353535); everything else Mapbox asks for gets a 204. The pins are DOM
 * markers, so their rects are real.
 *
 * Runways are stood in the way RUN-STATE records for safe-area insets: with
 * `--t 110 --e 129` an init script pins `--map-t` / `--map-e` on .map-shell
 * (Wil's phone; the @supports gate never matches in Chromium, so the shell
 * would otherwise carry 0). Under a runway the page must land at scroll T and
 * the UI layer must sit at the viewport's top — the instrument asserts both,
 * then (phones) that the landing survives a scroll to 0, a pin tap and the
 * walk door.
 *
 *   node scripts/map-framing.mjs [--base http://localhost:4331] [--t 0] [--e 0]
 *        [--vp 390x844,375x667,430x932,768x1024,1440x900] [--out <dir>]
 *
 * Output: <out>/framing-t<T>-e<E>.json + .md. Exit 1 when, at a viewport at
 * least 560px tall, a pill sits outside the visible UI box, or a landing
 * assertion fails. Compare two runs (base vs new, T=0 vs T>0) on the camera
 * columns: zoom / pitch / bearing must agree, and each pill's position
 * RELATIVE TO THE UI LAYER'S TOP must agree to the pixel.
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
  console.log("usage: node scripts/map-framing.mjs [--base URL] [--t px] [--e px] [--vp WxH,...] [--out dir]");
  process.exit(0);
}
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const T = Number(flag("t", "0"));
const E = Number(flag("e", "0"));
const OUT = flag("out", "node_modules/.cache/map-framing");
const VPS = flag("vp", "390x844,375x667,430x932,768x1024,1440x900")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => {
    const [w, h] = s.split("x").map(Number);
    return { w, h };
  });
mkdirSync(OUT, { recursive: true });

const STUB_STYLE = {
  version: 8,
  name: "offline-stub",
  sources: {},
  layers: [{ id: "bg", type: "background", paint: { "background-color": "#353535" } }],
};

/* Everything read inside the page, in one evaluate. Rects are viewport
   pixels; `rel` is the same rect against the UI layer's top edge, which is the
   number that must not change between T=0 and T>0. */
const SNAPSHOT = () => {
  const h = window.__troyMap;
  if (!h || !h.map) return { missing: true };
  const map = h.map;
  const root = document.querySelector(".troymap-root");
  const shell = document.querySelector(".map-shell");
  if (!root || !shell) return { missing: true };
  const rr = root.getBoundingClientRect();
  const scs = getComputedStyle(shell);
  const t = parseFloat(scs.getPropertyValue("--map-t")) || 0;
  const e = parseFloat(scs.getPropertyValue("--map-e")) || 0;
  const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-inset")) || 20;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 4 && r.height > 4 && cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0.05;
  };
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
  };
  const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => {
    const skin =
      [...m.querySelectorAll("*")]
        .filter(vis)
        .sort((a, b) => {
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          return rb.width * rb.height - ra.width * ra.height;
        })[0] || m;
    const r = rectOf(skin);
    return {
      text: (m.innerText || "").trim().replace(/\s+/g, " ").slice(0, 24),
      rect: r,
      rel: { x: r.x, y: +(r.y - rr.top).toFixed(1) },
    };
  });
  const box = { x0: 0, y0: +rr.top.toFixed(1), x1: innerWidth, y1: +(rr.top + rr.height).toFixed(1) };
  /* The code's own label safe box, in viewport pixels: below the top row, above the door row. */
  const safe = { x0: inset, y0: rr.top + inset + 56, x1: innerWidth - inset, y1: rr.top + rr.height - (inset + 76) };
  const out = (r, b) => r.x < b.x0 - 0.5 || r.y < b.y0 - 0.5 || r.x + r.w > b.x1 + 0.5 || r.y + r.h > b.y1 + 0.5;
  const door = [...document.querySelectorAll("button")].find((b) => /take the walk/i.test(b.textContent || ""));
  const logo = document.querySelector(".mapboxgl-ctrl-logo");
  const pad = map.getPadding ? map.getPadding() : null;
  return {
    state: h.state,
    scrollY: +window.scrollY.toFixed(1),
    inner: { w: innerWidth, h: innerHeight },
    t,
    e,
    shellH: shell.offsetHeight,
    root: { top: +rr.top.toFixed(1), h: +rr.height.toFixed(1) },
    padding: pad ? { top: pad.top, bottom: pad.bottom } : null,
    camera: {
      zoom: +map.getZoom().toFixed(2),
      pitch: +map.getPitch().toFixed(1),
      bearing: +map.getBearing().toFixed(1),
      center: map.getCenter().toArray().map((v) => +v.toFixed(5)),
    },
    markers,
    outsideBox: markers.filter((m) => out(m.rect, box)).map((m) => m.text),
    outsideSafe: markers.filter((m) => out(m.rect, safe)).map((m) => m.text),
    door: door && vis(door) ? { ...rectOf(door), gapToBoxBottom: +(box.y1 - door.getBoundingClientRect().bottom).toFixed(1) } : null,
    logoBottomGap: logo ? +(box.y1 - logo.getBoundingClientRect().bottom).toFixed(1) : null,
  };
};

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const rows = [];
let failures = 0;
for (const vp of VPS) {
  const phone = vp.w < 640;
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    hasTouch: phone,
    isMobile: phone,
    reducedMotion: "reduce",
  });
  await ctx.route(/(api|events)\.mapbox\.com/, (route) => {
    const u = route.request().url();
    if (/\/styles\/v1\//.test(u) && !/\/sprite|\/fonts\//.test(u)) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(STUB_STYLE) });
    }
    return route.fulfill({ status: 204, body: "" });
  });
  if (T || E) {
    await ctx.addInitScript(
      ({ t, e }) => {
        /* An init script runs before <html> exists; wait for it, then put the
           rule ahead of every stylesheet so the shell carries the runway from
           its first style resolution (land() reads it at DOMContentLoaded). */
        const add = () => {
          const s = document.createElement("style");
          s.textContent = `.map-shell{--map-t:${t}px !important;--map-e:${e}px !important}`;
          document.documentElement.appendChild(s);
        };
        if (document.documentElement) add();
        else
          new MutationObserver((_, o) => {
            if (document.documentElement) {
              add();
              o.disconnect();
            }
          }).observe(document, { childList: true });
      },
      { t: T, e: E },
    );
  }
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err.message || err)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const row = { vp: `${vp.w}x${vp.h}`, errors, checks: [] };
  const check = (name, ok, detail = "") => {
    row.checks.push({ name, ok, detail });
    if (!ok) failures++;
  };
  try {
    await page.goto(`${BASE}/map`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => window.__troyMap && window.__troyMap.map && window.__troyMap.map.loaded(), null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    const s = await page.evaluate(SNAPSHOT);
    row.overview = s;
    if (s.missing) throw new Error("map hook missing");
    check("style loaded, five markers", s.markers.length === 5, `${s.markers.length} markers`);
    if (vp.h >= 560) check("every pill inside the visible UI box", s.outsideBox.length === 0, s.outsideBox.join(", "));
    else row.note = `landscape: outside box = ${s.outsideBox.join(", ") || "none"} (accepted pan)`;
    if (T || E) {
      check("runway stood in", s.t === T && s.e === E, `t ${s.t} e ${s.e}`);
      check("page landed at T", Math.abs(s.scrollY - T) <= 1, `scrollY ${s.scrollY}`);
      check("UI layer at the viewport top", Math.abs(s.root.top) <= 1, `root.top ${s.root.top}`);
      check("camera padding = T / E", s.padding && s.padding.top === T && s.padding.bottom === E, JSON.stringify(s.padding));
    } else {
      check("no runway", s.t === 0 && s.e === 0 && s.scrollY === 0, `t ${s.t} e ${s.e} scrollY ${s.scrollY}`);
    }
    /* The landing's durability — phones under a runway only. Reduced motion
       is on in this context, so every re-land is an instant jump. */
    if (T && phone) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(900);
      let y = await page.evaluate(() => window.scrollY);
      check("re-lands after a scroll to 0", Math.abs(y - T) <= 1, `scrollY ${y}`);
      await page.evaluate(() => window.scrollTo(0, 0));
      /* The marker element IS the <button> (Marker({ element })), so click it. */
      await page.evaluate(() => document.querySelector(".mapboxgl-marker")?.click());
      await page.waitForTimeout(900);
      y = await page.evaluate(() => window.scrollY);
      const st = await page.evaluate(() => window.__troyMap.state);
      check("pin tap lands at T, focuses", Math.abs(y - T) <= 1 && st.focused, `scrollY ${y} focused ${st.focused}`);
      check("pin tap leaves the URL clean", !(await page.evaluate(() => location.search.includes("stop="))), await page.evaluate(() => location.search));
      await page.evaluate(() => document.querySelector('button[aria-label="Back to map"]')?.click());
      await page.waitForTimeout(600);
      await page.evaluate(() => window.scrollTo(0, 700));
      await page.waitForTimeout(300);
      await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /take the walk/i.test(b.textContent || ""))?.click());
      await page.waitForTimeout(900);
      y = await page.evaluate(() => window.scrollY);
      const st2 = await page.evaluate(() => window.__troyMap.state);
      check("walk door lands at T, walking", Math.abs(y - T) <= 1 && st2.walk === "walking", `scrollY ${y} walk ${st2.walk}`);
      await page.keyboard.press("Escape");
      await page.evaluate(() => document.querySelector('button[aria-label="Back to map"]')?.click());
      await page.waitForTimeout(600);
    }
    /* The walk view (round 20), every viewport: the cards share the door's
       lane, the (i) rides 8px above them, and the page cannot scroll while a
       stop is focused — a real wheel over the strip must not move it — until
       Back releases it. */
    const walkView = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const door = [...document.querySelectorAll("button")].find((b) => /take the walk/i.test(b.textContent || ""));
      if (!door) return { missing: true };
      door.click();
      await sleep(900);
      const root = document.querySelector(".troymap-root").getBoundingClientRect();
      const card = document.querySelector(".keen-slider__slide .origin-bottom > div");
      /* The logo's wrapper, not the attribution: under the stub style the
         attribution control renders empty (0×0) and its box means nothing. Both
         corners take the same padding rule, so the logo row stands for both. */
      const logoRow = document.querySelector(".mapboxgl-ctrl-bottom-left .mapboxgl-ctrl:last-child");
      const cr = card ? card.getBoundingClientRect() : null;
      return {
        state: window.__troyMap.state,
        cardsGap: cr ? +(root.bottom - cr.bottom).toFixed(1) : null,
        attribAboveCards: logoRow && cr ? +(cr.top - logoRow.getBoundingClientRect().bottom).toFixed(1) : null,
        lane: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--map-lane")),
        scrollY: window.scrollY,
        stripTouchAction: getComputedStyle(document.querySelector(".map-cards .keen-slider")).touchAction,
      };
    });
    row.walkView = walkView;
    if (walkView.missing) check("walk view", false, "no walk door");
    else {
      check("walk view: walking", walkView.state.walk === "walking" && walkView.state.focused, `walk ${walkView.state.walk}`);
      check("cards share the door's lane", s.door && Math.abs(walkView.cardsGap - s.door.gapToBoxBottom) <= 0.5, `cards ${walkView.cardsGap} door ${s.door?.gapToBoxBottom} lane ${walkView.lane}`);
      check("logo / (i) row rides 8px above the cards", walkView.attribAboveCards !== null && Math.abs(walkView.attribAboveCards - 8) <= 1, `${walkView.attribAboveCards}`);
      check("strip touch-action none while focused", walkView.stripTouchAction === "none", walkView.stripTouchAction);
      await page.mouse.move(Math.round(vp.w / 2), vp.h - 60);
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(500);
      let y2 = await page.evaluate(() => window.scrollY);
      check("locked: a wheel over the strip does not scroll", Math.abs(y2 - T) <= 1, `scrollY ${y2}`);
      await page.keyboard.press("Escape"); // pauses the walk; still focused
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(500);
      y2 = await page.evaluate(() => window.scrollY);
      check("locked while paused too", Math.abs(y2 - T) <= 1, `scrollY ${y2}`);
      await page.evaluate(() => document.querySelector('button[aria-label="Back to map"]')?.click());
      await page.waitForTimeout(600);
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(700);
      y2 = await page.evaluate(() => window.scrollY);
      check("released after Back: the page scrolls again", y2 > T + 20, `scrollY ${y2}`);
    }
  } catch (err) {
    check("run", false, String(err.message || err));
  }
  check("no console/page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  rows.push(row);
  await ctx.close();
}
await browser.close();

const name = `framing-t${T}-e${E}`;
writeFileSync(join(OUT, `${name}.json`), JSON.stringify(rows, null, 2));
const L = [`# /map framing — T ${T} · E ${E} · ${BASE}`, ""];
L.push("| vp | zoom | pitch | bearing | scrollY | root.top | outside box | door gap | checks |", "|---|---|---|---|---|---|---|---|---|");
for (const r of rows) {
  const s = r.overview || {};
  const c = s.camera || {};
  const bad = r.checks.filter((k) => !k.ok).map((k) => `${k.name}${k.detail ? ` (${k.detail})` : ""}`);
  L.push(
    `| ${r.vp} | ${c.zoom ?? "-"} | ${c.pitch ?? "-"} | ${c.bearing ?? "-"} | ${s.scrollY ?? "-"} | ${s.root?.top ?? "-"} | ${(s.outsideBox || []).join(", ") || "none"} | ${s.door?.gapToBoxBottom ?? "-"} | ${bad.length ? "FAIL: " + bad.join("; ") : `${r.checks.length} ✓`} |`,
  );
  if (r.note) L.push(`| | | | | | | ${r.note} | | |`);
}
L.push("", "Pill positions relative to the UI layer's top (x, y):", "");
for (const r of rows) {
  const s = r.overview || {};
  L.push(`- ${r.vp}: ${(s.markers || []).map((m) => `${m.text} (${m.rel.x}, ${m.rel.y})`).join(" · ")}`);
}
writeFileSync(join(OUT, `${name}.md`), L.join("\n") + "\n");
console.log(L.join("\n"));
console.log(failures ? `\nmap-framing: ${failures} check(s) failed` : "\nmap-framing: all checks passed ✓");
process.exit(failures ? 1 : 0);
