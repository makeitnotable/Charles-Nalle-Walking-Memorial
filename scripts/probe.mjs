#!/usr/bin/env node
/**
 * The v5 audit instrument. Where shots.mjs gives us eyes, this gives us a ruler.
 *
 * Everything it reports is measured off the RENDERED page — computed styles and
 * bounding boxes after paint, never markup. Six probes per route × viewport:
 *
 *   type       every heading/display element: rendered px, line count, ratio to
 *              the next step on the ladder
 *   floating   every fixed/sticky element's rect + pairwise overlap test
 *   images     every rendered image's resolved src → repeats within one page
 *   align      left/right edges of block-level content → offsets off the scale
 *   copy       visible text blocks → near-duplicate detection across the site
 *   health     console errors, CLS, tap targets under 24px, horizontal overflow
 *
 * Usage: node scripts/probe.mjs <outdir> [--base URL] [--routes /a,/b]
 * Output: <outdir>/probe.json + a human-readable <outdir>/probe.md
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v5/qa/probe";
function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ROUTES = flag(
  "routes",
  "/,/bakery,/commissioners-office,/mansion,/ferry,/barbershop,/map,/people,/paintings,/about,/404",
).split(",");
const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "phone-landscape", width: 844, height: 390 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
];

mkdirSync(outdir, { recursive: true });

// Runs in the page. Returns everything measurable in one pass so we only pay
// for one round trip per route × viewport.
const MEASURE = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return (
      r.width > 0 &&
      r.height > 0 &&
      cs.visibility !== "hidden" &&
      cs.display !== "none" &&
      Number(cs.opacity) > 0.05
    );
  };
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x + scrollX),
      y: Math.round(r.y + scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  };
  const label = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = (el.getAttribute("class") || "")
      .split(/\s+/)
      .filter((c) => c && !/^(sm|md|lg|xl):/.test(c))
      .slice(0, 4)
      .join(".");
    return `${el.tagName.toLowerCase()}${id}${cls ? "." + cls : ""}`;
  };

  // ---- type: every heading + anything using the display role
  const typeNodes = [
    ...document.querySelectorAll(
      "h1,h2,h3,h4,h5,h6,.t-display,[class*='t-display'],[style*='--fit-chars']",
    ),
  ]
    .filter(vis)
    .map((el) => {
      const cs = getComputedStyle(el);
      const r = rect(el);
      const fs = parseFloat(cs.fontSize);
      const lh = cs.lineHeight === "normal" ? fs * 1.2 : parseFloat(cs.lineHeight);
      return {
        sel: label(el),
        tag: el.tagName.toLowerCase(),
        text: (el.innerText || "").trim().slice(0, 70),
        px: Math.round(fs * 10) / 10,
        lineHeightPx: Math.round(lh * 10) / 10,
        lines: Math.max(1, Math.round(r.h / lh)),
        weight: cs.fontWeight,
        family: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
        tracking: cs.letterSpacing,
        transform: cs.textTransform,
        rect: r,
        // fraction of the viewport a single line of this type occupies
        vwRatio: Math.round((fs / innerWidth) * 1000) / 1000,
      };
    });

  // ---- floating: fixed + sticky elements, and every pair that overlaps
  const floats = [...document.querySelectorAll("body *")]
    .filter((el) => {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") return false;
      if (!vis(el)) return false;
      // Inert chrome cannot collide with anything — nothing can hit it and it
      // hits nothing. The curtain panel and the 3px walk rail are both inert.
      if (cs.pointerEvents === "none") return false;
      // Skip wrappers whose only job is to hold a fixed child
      return !el.querySelector(
        ":scope > [style*='position:fixed'], :scope > [class*='fixed']",
      ) || el.matches("button,a,[role='button'],[role='dialog']");
    })
    .map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        sel: label(el),
        position: cs.position,
        z: cs.zIndex,
        pointer: cs.pointerEvents,
        text: (el.innerText || "").trim().slice(0, 40),
        // viewport coords — that is what collides
        rect: {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
        },
      };
    });
  const collisions = [];
  for (let i = 0; i < floats.length; i++) {
    for (let j = i + 1; j < floats.length; j++) {
      const a = floats[i].rect;
      const b = floats[j].rect;
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 0 && oy > 0) {
        // an element containing the other is nesting, not collision
        const contains =
          (a.x <= b.x && a.y <= b.y && a.x + a.w >= b.x + b.w && a.y + a.h >= b.y + b.h) ||
          (b.x <= a.x && b.y <= a.y && b.x + b.w >= a.x + a.w && b.y + b.h >= a.y + a.h);
        collisions.push({
          a: floats[i].sel,
          b: floats[j].sel,
          overlapPx: { x: ox, y: oy },
          area: ox * oy,
          nested: contains,
          aRect: a,
          bRect: b,
          aZ: floats[i].z,
          bZ: floats[j].z,
        });
      }
    }
  }

  // ---- images: what actually painted, resolved through <picture>
  const images = [...document.querySelectorAll("img,video")]
    .filter(vis)
    .map((el) => {
      const raw =
        el.tagName === "VIDEO"
          ? el.getAttribute("poster") || el.currentSrc || el.src
          : el.currentSrc || el.src;
      const r = rect(el);
      return {
        sel: label(el),
        // strip the responsive width + format so `x-800.avif` and `x-1440.webp`
        // are recognised as the same artwork
        asset: (raw || "")
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/-\d+w?\.(avif|webp|jpg|jpeg|png)$/i, "")
          .replace(/\.(avif|webp|jpg|jpeg|png|mp4)$/i, "")
          .replace(/-poster$/, ""),
        src: raw,
        alt: el.getAttribute("alt") ?? null,
        rect: r,
        natural: el.naturalWidth
          ? { w: el.naturalWidth, h: el.naturalHeight }
          : null,
        // is the box a different shape than the file? then it is cropping
        boxAR: r.h ? Math.round((r.w / r.h) * 100) / 100 : null,
        fileAR: el.naturalHeight
          ? Math.round((el.naturalWidth / el.naturalHeight) * 100) / 100
          : null,
        fit: getComputedStyle(el).objectFit,
      };
    });
  // A poster <img> and its film <video> occupy the same box and are one
  // artwork, not two — count distinct positions, not distinct elements.
  const assetCounts = {};
  const seenAt = new Set();
  for (const im of images) {
    if (!im.asset) continue;
    const at = `${im.asset}@${im.rect.x},${im.rect.y}`;
    if (seenAt.has(at)) continue;
    seenAt.add(at);
    assetCounts[im.asset] = (assetCounts[im.asset] || 0) + 1;
  }
  const repeats = Object.entries(assetCounts)
    .filter(([, n]) => n > 1)
    .map(([asset, n]) => ({ asset, count: n }));

  // ---- align: left/right edges of substantial blocks
  const edges = {};
  [...document.querySelectorAll("section,section>*,main>*,article,header,footer")]
    .filter(vis)
    .forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 80 || r.height < 24) return;
      const L = Math.round(r.x);
      const R = Math.round(innerWidth - (r.x + r.width));
      edges[L] = (edges[L] || 0) + 1;
      edges["R" + R] = (edges["R" + R] || 0) + 1;
    });

  // ---- copy: visible prose blocks, for cross-page duplicate detection
  const copy = [...document.querySelectorAll("p,li,blockquote,figcaption,dd")]
    .filter(vis)
    .map((el) => (el.innerText || "").trim())
    .filter((t) => t.length > 40);

  // ---- health
  const tooSmall = [...document.querySelectorAll("a,button,[role='button'],input,select")]
    .filter(vis)
    .map((el) => ({ sel: label(el), ...rect(el), text: (el.innerText || "").trim().slice(0, 30) }))
    .filter((t) => t.w < 24 || t.h < 24);

  return {
    url: location.pathname,
    docHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth,
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    type: typeNodes,
    floats,
    collisions,
    images,
    repeats,
    edges,
    copy,
    tooSmall,
    fontsUsed: [...new Set(typeNodes.map((t) => t.family))],
  };
};

const browser = await chromium.launch();
const report = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const route of ROUTES) {
    const errors = [];
    page.removeAllListeners("pageerror");
    page.removeAllListeners("console");
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 160)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push("console: " + m.text().slice(0, 160));
      if (m.type() === "warning" && /deprecat|violat/i.test(m.text()))
        errors.push("warn: " + m.text().slice(0, 160));
    });
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(route.includes("map") ? 8000 : 2500);
      const top = await page.evaluate(MEASURE);

      // Floating UI is the whole point of measuring twice: several elements
      // only appear once the page has been scrolled.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
      await page.waitForTimeout(1400);
      const mid = await page.evaluate(MEASURE);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1400);
      const bottom = await page.evaluate(MEASURE);
      await page.evaluate(() => window.scrollTo(0, 0));

      const cls = await page.evaluate(
        () =>
          new Promise((res) => {
            let v = 0;
            try {
              new PerformanceObserver((l) => {
                for (const e of l.getEntries()) if (!e.hadRecentInput) v += e.value;
              }).observe({ type: "layout-shift", buffered: true });
            } catch {}
            setTimeout(() => res(Math.round(v * 1000) / 1000), 600);
          }),
      );

      report.push({
        route,
        viewport: vp.name,
        vw: vp.width,
        vh: vp.height,
        cls,
        errors,
        top,
        midFloats: { floats: mid.floats, collisions: mid.collisions },
        bottomFloats: { floats: bottom.floats, collisions: bottom.collisions },
      });
      const nCol = new Set(
        [...top.collisions, ...mid.collisions, ...bottom.collisions]
          .filter((c) => !c.nested)
          .map((c) => c.a + "|" + c.b),
      ).size;
      console.log(
        `✓ ${route} @ ${vp.name}  type:${top.type.length} max:${Math.max(0, ...top.type.map((t) => t.px))}px  float:${top.floats.length} collide:${nCol}  repeat:${top.repeats.length}  err:${errors.length}`,
      );
    } catch (e) {
      console.error(`✗ ${route} @ ${vp.name}: ${e.message.split("\n")[0]}`);
      report.push({ route, viewport: vp.name, error: e.message.split("\n")[0] });
    }
  }
  await context.close();
}
await browser.close();

writeFileSync(join(outdir, "probe.json"), JSON.stringify(report, null, 1));

// ---------- human-readable digest ----------
const L = [];
const p = (s = "") => L.push(s);
p(`# Probe — ${BASE}`);
p();

p(`## Type ladder — largest rendered size per route × viewport`);
p();
p(`| route | vp | max px | vw% | element | text |`);
p(`|---|---|---|---|---|---|`);
for (const r of report) {
  if (!r.top) continue;
  const biggest = [...r.top.type].sort((a, b) => b.px - a.px)[0];
  if (!biggest) continue;
  p(
    `| ${r.route} | ${r.viewport} | **${biggest.px}** | ${Math.round(biggest.vwRatio * 100)}% | ${biggest.sel} | ${biggest.text.replace(/\n/g, " ").slice(0, 32)} |`,
  );
}
p();

p(`## Floating-UI collisions (non-nested, any scroll depth)`);
p();
const colRows = [];
for (const r of report) {
  if (!r.top) continue;
  const all = [
    ...r.top.collisions.map((c) => ({ ...c, at: "top" })),
    ...r.midFloats.collisions.map((c) => ({ ...c, at: "mid" })),
    ...r.bottomFloats.collisions.map((c) => ({ ...c, at: "bottom" })),
  ].filter((c) => !c.nested);
  const seen = new Set();
  for (const c of all) {
    const k = `${r.route}|${r.viewport}|${c.a}|${c.b}`;
    if (seen.has(k)) continue;
    seen.add(k);
    colRows.push(
      `| ${r.route} | ${r.viewport} | ${c.at} | ${c.a} (z${c.aZ}) | ${c.b} (z${c.bZ}) | ${c.overlapPx.x}×${c.overlapPx.y} |`,
    );
  }
}
if (colRows.length) {
  p(`| route | vp | scroll | A | B | overlap |`);
  p(`|---|---|---|---|---|---|`);
  colRows.forEach((r) => p(r));
} else p(`None detected in the default (no-interaction) state.`);
p();

p(`## Repeated imagery within a single page`);
p();
const repRows = [];
for (const r of report) {
  if (!r.top) continue;
  for (const rep of r.top.repeats)
    repRows.push(`| ${r.route} | ${r.viewport} | \`${rep.asset}\` | **${rep.count}×** |`);
}
if (repRows.length) {
  p(`| route | vp | asset | times |`);
  p(`|---|---|---|---|`);
  repRows.forEach((r) => p(r));
} else p(`None.`);
p();

p(`## Health`);
p();
p(`| route | vp | CLS | overflow-x | tap<24px | console |`);
p(`|---|---|---|---|---|---|`);
for (const r of report) {
  if (!r.top) {
    p(`| ${r.route} | ${r.viewport} | — | — | — | ERROR ${r.error} |`);
    continue;
  }
  p(
    `| ${r.route} | ${r.viewport} | ${r.cls} | ${r.top.overflowX ? "**YES " + r.top.scrollWidth + "px**" : "ok"} | ${r.top.tooSmall.length} | ${r.errors.length ? "**" + r.errors.length + "**" : "0"} |`,
  );
}
p();

// Console detail — the noise itself, not just a count
const errSet = new Map();
for (const r of report)
  for (const e of r.errors || []) errSet.set(e, (errSet.get(e) || 0) + 1);
if (errSet.size) {
  p(`### Console detail`);
  p();
  [...errSet.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([e, n]) => p(`- (${n}×) ${e}`));
  p();
}

// Cross-page copy duplication
p(`## Repeated copy across routes`);
p();
const byText = new Map();
for (const r of report) {
  if (!r.top || r.viewport !== "1440") continue;
  for (const t of r.top.copy) {
    const norm = t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
    if (norm.length < 60) continue;
    if (!byText.has(norm)) byText.set(norm, { text: t, routes: new Set() });
    byText.get(norm).routes.add(r.route);
  }
}
const dupes = [...byText.values()].filter((v) => v.routes.size > 1);
if (dupes.length) {
  for (const d of dupes)
    p(`- **${[...d.routes].join(", ")}** — "${d.text.replace(/\n/g, " ").slice(0, 120)}…"`);
} else p(`No identical prose blocks across routes.`);
p();

writeFileSync(join(outdir, "probe.md"), L.join("\n"));
console.log(`\nprobe → ${join(outdir, "probe.md")}`);
