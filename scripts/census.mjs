#!/usr/bin/env node
/**
 * The full type + rhythm census.
 *
 * probe.mjs measures what is visible at a scroll position, which means every
 * `.reveal` element below the fold reads as invisible and never gets counted.
 * This forces every reveal into its finished state first, so the ladder it
 * reports is the whole page's, and adds the two things a type census is
 * actually for: how many distinct sizes a page renders, and whether the gaps
 * between sections quantize to the three spacing tokens.
 *
 * Usage: node scripts/census.mjs <outfile.md> [--base URL]
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const out = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v5/qa/census.md";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ROUTES =
  "/,/bakery,/commissioners-office,/mansion,/ferry,/barbershop,/map,/people,/paintings,/about,/404".split(
    ",",
  );
const VPS = [
  { name: "390", width: 390, height: 844 },
  { name: "land", width: 844, height: 390 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
];

const CENSUS = () => {
  // Finish every entrance so nothing is measured mid-animation or at opacity 0
  document
    .querySelectorAll(".reveal,.reveal-quote,.lines,.home-seq")
    .forEach((e) => {
      e.classList.add("is-in");
      e.style.opacity = "1";
      e.style.transform = "none";
    });

  const named = (el) => {
    for (const c of [
      "t-display",
      "t-wordmark",
      "t-title",
      "t-title-sm",
      "t-quote",
      "t-prose",
      "t-meta",
      "t-meta-body",
      "t-spine",
      "btn",
      "btn-sm",
    ])
      if (el.classList.contains(c)) return c;
    return `(${el.tagName.toLowerCase()})`;
  };

  const nodes = [
    ...document.querySelectorAll(
      "h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd,figcaption,a,button,span",
    ),
  ]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (!r.width || !r.height || cs.display === "none" || cs.visibility === "hidden")
        return false;
      // leaf text only — a wrapper inherits its child's size and would double-count
      return [...el.children].every(
        (c) => !(c.innerText || "").trim() || getComputedStyle(c).display === "none",
      ) && (el.innerText || "").trim().length > 0;
    })
    .map((el) => {
      const cs = getComputedStyle(el);
      return {
        role: named(el),
        px: Math.round(parseFloat(cs.fontSize) * 10) / 10,
        weight: cs.fontWeight,
        family: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
        text: (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40),
      };
    });

  // widows / orphans: a heading or prose block whose last line holds one word
  const rag = [...document.querySelectorAll("h1,h2,.t-title,.t-prose,.t-quote,.t-title-sm")]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    })
    .map((el) => {
      const cs = getComputedStyle(el);
      const lh =
        cs.lineHeight === "normal"
          ? parseFloat(cs.fontSize) * 1.2
          : parseFloat(cs.lineHeight);
      const lines = Math.round(el.getBoundingClientRect().height / lh);
      const words = (el.innerText || "").trim().split(/\s+/);
      // measure the true last line by range
      let lastLineWords = 0;
      try {
        const range = document.createRange();
        const tn = [...el.childNodes].filter((n) => n.nodeType === 3);
        if (tn.length && lines > 1) {
          const t = el.innerText.trim();
          const wl = t.split(/\s+/);
          // approximate: how many words fit after the final line break
          const el2 = el.cloneNode(true);
          void el2;
          lastLineWords = wl.length; // fallback
        }
        range.detach?.();
      } catch {}
      return {
        sel: el.className.split(/\s+/).slice(0, 2).join("."),
        lines,
        words: words.length,
        text: (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 46),
      };
    })
    .filter((x) => x.lines > 1);

  // Vertical rhythm: the gap between consecutive top-level sections
  const secs = [...document.querySelectorAll("main > *, main section, main header, main footer")]
    .filter((el) => el.parentElement?.closest("main") === null || el.parentElement.tagName === "MAIN")
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase() + (el.id ? "#" + el.id : ""),
        top: Math.round(r.top + scrollY),
        bottom: Math.round(r.bottom + scrollY),
      };
    })
    .sort((a, b) => a.top - b.top);
  const gaps = [];
  for (let i = 1; i < secs.length; i++)
    gaps.push({ between: `${secs[i - 1].tag} → ${secs[i].tag}`, gap: secs[i].top - secs[i - 1].bottom });

  return { nodes, rag, gaps };
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
      const d = await page.evaluate(CENSUS);
      all.push({ route, vp: vp.name, ...d });
      const sizes = [...new Set(d.nodes.map((n) => n.px))].sort((a, b) => b - a);
      console.log(`✓ ${route} @ ${vp.name} — ${sizes.length} sizes: ${sizes.join(", ")}`);
    } catch (e) {
      console.error(`✗ ${route} @ ${vp.name}: ${e.message.split("\n")[0]}`);
    }
  }
  await ctx.close();
}
await browser.close();

const L = [`# Type + rhythm census — ${BASE}`, ""];
L.push(`## Distinct rendered type sizes per page`);
L.push("");
L.push(`The system declares four roles. More than ~6 rendered sizes on one page`);
L.push(`means the ladder is not being obeyed.`);
L.push("");
L.push(`| route | vp | # sizes | sizes (px) |`);
L.push(`|---|---|---|---|`);
for (const e of all) {
  const sizes = [...new Set(e.nodes.map((n) => n.px))].sort((a, b) => b - a);
  L.push(
    `| ${e.route} | ${e.vp} | ${sizes.length > 6 ? "**" + sizes.length + "**" : sizes.length} | ${sizes.join(", ")} |`,
  );
}
L.push("", "## Size → role map (1440) — a size used by two roles is a collision", "");
for (const e of all.filter((x) => x.vp === "1440")) {
  const m = new Map();
  for (const n of e.nodes) {
    const k = n.px;
    if (!m.has(k)) m.set(k, new Set());
    m.get(k).add(n.role);
  }
  const clashes = [...m.entries()].filter(([, s]) => s.size > 1);
  L.push(
    `- **${e.route}** — ${[...m.entries()].sort((a, b) => b[0] - a[0]).map(([px, s]) => `${px}px ${[...s].join("+")}`).join(" · ")}${clashes.length ? `  ⚠ ${clashes.length} size(s) shared by >1 role` : ""}`,
  );
}
L.push("", "## Section gaps — should quantize to 24 / 72–128 / 128–200 / 260–400", "");
for (const e of all.filter((x) => x.vp === "1440")) {
  if (!e.gaps.length) continue;
  L.push(`**${e.route}**: ${e.gaps.map((g) => g.gap).join(", ")}`);
}
L.push("", "## Multi-line headings (rag/widow candidates, 1440)", "");
for (const e of all.filter((x) => x.vp === "1440")) {
  const h = e.rag.filter((r) => /t-display|t-title|t-quote/.test(r.sel));
  if (h.length) L.push(`- **${e.route}** — ${h.map((r) => `"${r.text}" (${r.lines} lines/${r.words} words)`).join(" · ")}`);
}
writeFileSync(out, L.join("\n"));
console.log(`\ncensus → ${out}`);
