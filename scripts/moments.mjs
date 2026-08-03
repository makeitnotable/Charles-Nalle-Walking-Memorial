#!/usr/bin/env node
/**
 * E2 instrument — the moment census.
 *
 * Element 2 (signature + restraint) is measurable only if we know every
 * animated/interactive treatment the site ships. This walks every element on
 * every route and records its computed transition/animation tuples
 * (property · duration · easing), grouped and counted, then checks each tuple
 * against the motion tokens in global.css. Off-token tuples are either bugs
 * or documented exceptions (curtain circ, corner-menu pop, map cameras).
 *
 * GSAP- and Mapbox-driven motion never reaches computed transition styles —
 * those moments are census'd by hand in the meaning ledger (E5). This file is
 * the CSS half of the truth.
 *
 * Usage: node scripts/moments.mjs <outfile.md> [--base URL]
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const out = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v5/elements/moments.md";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ROUTES =
  "/,/bakery,/commissioners-office,/mansion,/ferry,/barbershop,/map,/people,/paintings,/about,/404".split(",");
const VPS = [
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];

// The motion contract (src/styles/global.css :root). A tuple off this list is
// a finding unless it appears in the documented-exceptions table of MOTION.md.
const TOKEN_DURS = new Set(["0s", "0.3s", "0.6s", "1.6s"]);
const TOKEN_EASES = new Set([
  "cubic-bezier(0.19, 1, 0.22, 1)", // --ease
  "cubic-bezier(0.34, 1, 0.36, 1.06)", // --ease-pop (corner-menu bloom only)
  "cubic-bezier(0.85, 0, 0.15, 1)", // --ease-circ-in-out (curtain only)
  "linear", // progress/scrub surfaces
  "ease", // UA default — only acceptable at 0s
]);

const CENSUS = () => {
  const id = (el) => {
    const cls = [...el.classList].slice(0, 3).join(".");
    return el.tagName.toLowerCase() + (cls ? "." + cls : "");
  };
  const rows = [];
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none") continue;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;

    // transitions: parallel comma lists
    const props = cs.transitionProperty.split(", ");
    const durs = cs.transitionDuration.split(", ");
    const eases = cs.transitionTimingFunction.split(/, (?![^(]*\))/);
    props.forEach((p, i) => {
      const d = durs[i % durs.length];
      if (d === "0s") return; // not a moment
      rows.push({
        kind: "transition",
        tuple: `${p} · ${d} · ${eases[i % eases.length]}`,
        dur: d,
        ease: eases[i % eases.length],
        el: id(el),
      });
    });

    // animations
    if (cs.animationName !== "none") {
      const names = cs.animationName.split(", ");
      const adurs = cs.animationDuration.split(", ");
      const aeases = cs.animationTimingFunction.split(/, (?![^(]*\))/);
      names.forEach((n, i) => {
        rows.push({
          kind: "animation",
          tuple: `@${n} · ${adurs[i % adurs.length]} · ${aeases[i % aeases.length]}`,
          dur: adurs[i % adurs.length],
          ease: aeases[i % aeases.length],
          el: id(el),
        });
      });
    }
  }
  const interactive = document.querySelectorAll(
    'a[href],button,[role="button"],input,select,textarea,[tabindex]:not([tabindex="-1"])',
  ).length;
  return { rows, interactive };
};

mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch();
const all = [];
for (const vp of VPS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 40000 });
      await page.waitForTimeout(route.includes("map") ? 6000 : 1500);
      const d = await page.evaluate(CENSUS);
      all.push({ route, vp: vp.name, ...d });
      console.log(`✓ ${route} @ ${vp.name} — ${d.rows.length} moment rows`);
    } catch (e) {
      console.error(`✗ ${route} @ ${vp.name}: ${e.message.split("\n")[0]}`);
    }
  }
  await ctx.close();
}
await browser.close();

const onToken = (r) =>
  TOKEN_DURS.has(r.dur) && TOKEN_EASES.has(r.ease) && !(r.ease === "ease" && r.dur !== "0s");

// site-wide rollup keyed by tuple
const rollup = new Map();
for (const e of all) {
  for (const r of e.rows) {
    if (!rollup.has(r.tuple)) rollup.set(r.tuple, { n: 0, routes: new Set(), sample: r.el, ok: onToken(r) });
    const x = rollup.get(r.tuple);
    x.n++;
    x.routes.add(e.route);
  }
}
const tuples = [...rollup.entries()].sort((a, b) => b[1].n - a[1].n);
const off = tuples.filter(([, v]) => !v.ok);

const L = [
  `# Moment census — ${BASE}`,
  "",
  `Motion contract: durations {300ms, 600ms curtain, 1600ms} · easings {--ease, --ease-pop, --ease-circ-in-out, linear}.`,
  `${tuples.length} distinct tuples site-wide · **${off.length} off-token** (each is a bug or needs a MOTION.md exception).`,
  `GSAP/Mapbox motion is NOT here — see the E5 meaning ledger.`,
  "",
  `## Off-token tuples`,
  "",
  `| tuple | count | routes | sample |`,
  `|---|---|---|---|`,
];
for (const [t, v] of off)
  L.push(`| \`${t}\` | ${v.n} | ${[...v.routes].join(" ")} | \`${v.sample}\` |`);
L.push("", `## All tuples (by frequency)`, "", `| tuple | count | on-token | routes |`, `|---|---|---|---|`);
for (const [t, v] of tuples)
  L.push(`| \`${t}\` | ${v.n} | ${v.ok ? "✓" : "**✗**"} | ${[...v.routes].join(" ")} |`);
L.push("", `## Interactive-element counts`, "", `| route | 390 | 1440 |`, `|---|---|---|`);
for (const route of ROUTES) {
  const a = all.find((x) => x.route === route && x.vp === "390");
  const b = all.find((x) => x.route === route && x.vp === "1440");
  L.push(`| ${route} | ${a?.interactive ?? "—"} | ${b?.interactive ?? "—"} |`);
}
writeFileSync(out, L.join("\n"));
console.log(`\nmoments → ${out}  (${off.length} off-token tuples)`);
