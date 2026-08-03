#!/usr/bin/env node
/**
 * WCAG contrast sweep (item 23 / element 3 support). Exit-nonzero on failure.
 *
 * For every visible text leaf on every route: computed color vs the nearest
 * ancestor's opaque background-color, composited, as a WCAG luminance ratio.
 * AA bar: 4.5:1, or 3:1 for large text (≥24px, or ≥18.66px at weight ≥700).
 * Text sitting on imagery/gradients can't be judged from computed styles —
 * those are counted and listed as UNMEASURED (scrims get judged by eye).
 *
 * Usage: node scripts/contrast.mjs <outfile.md> [--base URL]
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const out = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v5/elements/contrast.md";
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

const SWEEP = () => {
  document.querySelectorAll(".reveal,.reveal-quote,.lines,.wipe,.home-seq").forEach((e) => {
    e.classList.add("is-in");
    e.style.opacity = "1";
    e.style.transform = "none";
  });

  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[,/ ]+([\d.]+))?\)/);
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
  };
  const lum = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const over = (fg, bg) => {
    const a = fg[3];
    return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
  };

  const rows = [];
  let unmeasured = 0;
  const unmeasuredList = [];
  const leaves = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd,figcaption,a,button,span,time,label")].filter(
    (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (!r.width || !r.height || cs.display === "none" || cs.visibility === "hidden") return false;
      if (+cs.opacity === 0) return false;
      return (
        [...el.children].every(
          (c) => !(c.innerText || "").trim() || getComputedStyle(c).display === "none",
        ) && (el.innerText || "").trim().length > 0
      );
    },
  );
  for (const el of leaves) {
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg) continue;
    // find effective background walking up
    let bg = null,
      dirty = false;
    for (let n = el; n; n = n.parentElement) {
      const ncs = getComputedStyle(n);
      if (ncs.backgroundImage !== "none") {
        dirty = true;
        break;
      }
      const b = parse(ncs.backgroundColor);
      if (b && b[3] > 0) {
        bg = b[3] < 1 ? null : b; // semi-transparent bg: keep walking? treat as unmeasured
        if (b[3] < 1) dirty = true;
        break;
      }
      if (n === document.documentElement) break;
    }
    // media behind text? (position overlap with video/img/canvas is the common scrim case)
    const id =
      el.tagName.toLowerCase() +
      ([...el.classList].length ? "." + [...el.classList].slice(0, 2).join(".") : "");
    const text = (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if (dirty || !bg) {
      unmeasured++;
      if (unmeasuredList.length < 30) unmeasuredList.push(`${id} "${text}"`);
      continue;
    }
    const eff = fg[3] < 1 ? over(fg, bg) : fg.slice(0, 3);
    const px = parseFloat(cs.fontSize);
    const large = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
    const r = ratio(eff, bg.slice(0, 3));
    const bar = large ? 3 : 4.5;
    if (r < bar)
      rows.push({
        id,
        text,
        px,
        weight: cs.fontWeight,
        color: cs.color,
        bg: `rgb(${bg.slice(0, 3).map(Math.round).join(",")})`,
        ratio: Math.round(r * 100) / 100,
        bar,
      });
  }
  return { fails: rows, checked: leaves.length, unmeasured, unmeasuredList };
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
      await page.waitForTimeout(route.includes("map") ? 6000 : 1200);
      const d = await page.evaluate(SWEEP);
      all.push({ route, vp: vp.name, ...d });
      console.log(
        `${d.fails.length ? "✗" : "✓"} ${route} @ ${vp.name} — ${d.fails.length} fails / ${d.checked} checked / ${d.unmeasured} unmeasured`,
      );
    } catch (e) {
      console.error(`✗ ${route} @ ${vp.name}: ${e.message.split("\n")[0]}`);
    }
  }
  await ctx.close();
}
await browser.close();

const totalFails = all.reduce((s, e) => s + e.fails.length, 0);
const L = [
  `# Contrast sweep — ${BASE}`,
  "",
  `AA bar: 4.5:1 (3:1 large). **${totalFails} failure(s).** Text over imagery/gradients is listed unmeasured (scrims judged by eye).`,
  "",
  `| route | vp | element | text | px/wt | fg | bg | ratio | bar |`,
  `|---|---|---|---|---|---|---|---|---|`,
];
for (const e of all)
  for (const f of e.fails)
    L.push(
      `| ${e.route} | ${e.vp} | \`${f.id}\` | "${f.text}" | ${f.px}/${f.weight} | ${f.color} | ${f.bg} | **${f.ratio}** | ${f.bar} |`,
    );
L.push("", `## Unmeasured (over imagery — spot-check the scrims)`, "");
for (const e of all.filter((x) => x.vp === "1440"))
  L.push(`- **${e.route}**: ${e.unmeasured} — ${e.unmeasuredList.slice(0, 8).join(" · ")}${e.unmeasured > 8 ? " …" : ""}`);
writeFileSync(out, L.join("\n"));
console.log(`\ncontrast → ${out}  (${totalFails} failures)`);
process.exit(totalFails ? 1 : 0);
