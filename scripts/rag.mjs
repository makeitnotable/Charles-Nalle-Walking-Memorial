#!/usr/bin/env node
/**
 * Rag & clip sweep (docs/PLAN.md Part B item 1). Exit-nonzero on any finding.
 *
 * For every visible text block on every route × the v7 viewport matrix:
 *   - line count, last-line word count, last-line width ratio (from Range
 *     client rects, grouped by top coordinate);
 *   - RUNT: a ≥2-line block whose last line is SHORT — one word or ≤3 characters at < 60% of the widest line,
 *     plus 2-word last lines on display/title/quote roles;
 *   - CLIP: text rects (per word) that overhang the nearest overflow:hidden|clip
 *     or clip-path ancestor by >1px on any side. `.lines .line-box` is checked
 *     line-by-line against its own box (the mask machinery's known J-descender
 *     hazard at --lh-display: 0.95).
 * A block is measured once, at the innermost element that owns its text run.
 *
 * Usage:
 *   node scripts/rag.mjs <outdir> [--base URL] [--vp 390,1440] [--routes /,/map]
 * Output: <outdir>/rag.json (every block + flags) and <outdir>/rag.md (summary).
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/qa/rag";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ROUTES = flag(
  "routes",
  "/,/bakery,/commissioners-office,/mansion,/ferry,/barbershop,/map,/people,/paintings,/about,/404",
).split(",");
const ALL_VPS = [
  { name: "360", width: 360, height: 800 },
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "land", width: 844, height: 390 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];
const want = flag("vp", ALL_VPS.map((v) => v.name).join(",")).split(",");
const VPS = ALL_VPS.filter((v) => want.includes(v.name));

// Same reveal-forcing as contrast.mjs's SWEEP, plus the per-line mask inner
// (which otherwise slides in over --dur-slow and would read as mid-clip).
const REVEAL = () => {
  document.querySelectorAll(".reveal,.reveal-quote,.lines,.wipe,.home-seq").forEach((e) => {
    e.classList.add("is-in");
    e.style.opacity = "1";
    e.style.transform = "none";
  });
  document.querySelectorAll(".lines .line-inner").forEach((e) => {
    e.style.transition = "none";
    e.style.transform = "none";
  });
};

// Runs in the page. Returns { blocks: [...] } — every measured text block.
const MEASURE = () => {
  const ROLE_SEL =
    "h1,h2,h3,h4,h5,h6,p,figcaption,dt,dd,li,blockquote,.btn,.btn-sm,[class^='t-'],[class*=' t-']," +
    "[class*='chip'],[class*='pill'],[class*='badge'],footer a,footer span";
  const DISPLAY_SEL = ".t-display,.t-title,.t-title-sm,.t-quote,h1,h2";
  const label = (el) => {
    const cls = (el.getAttribute("class") || "")
      .split(/\s+/)
      .filter((c) => c && !/^(sm|md|lg|xl):/.test(c) && !/^(text|font|leading|mt|mb|w|is)-/.test(c) && !/^(absolute|relative)$/.test(c))
      .slice(0, 3)
      .join(".");
    return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls ? "." + cls : ""}`;
  };
  const txt = (el) => (el.innerText || "").trim().replace(/\s+/g, " ");
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false; // display:none, sr-only, empty
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
      if (n.getAttribute("aria-hidden") === "true" || n.hasAttribute("inert")) return false;
    }
    return true;
  };

  // Candidates, deduped: drop any element whose whole text lives in ONE
  // candidate descendant (measure the innermost owner of the run).
  const cands = [...document.querySelectorAll(ROLE_SEL)].filter((el) => visible(el) && txt(el).length > 0);
  const set = new Set(cands);
  const blocks = cands.filter((el) => {
    const t = txt(el);
    return ![...el.querySelectorAll("*")].some((d) => set.has(d) && txt(d) === t);
  });

  // Per-word rects via Range on each visible text node.
  const wordRects = (root) => {
    const out = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node; (node = w.nextNode()); ) {
      const p = node.parentElement;
      if (!p || !visible(p)) continue;
      const cs = getComputedStyle(p);
      if (cs.fontSize === "0px") continue;
      for (const m of node.data.matchAll(/\S+/g)) {
        const rg = document.createRange();
        rg.setStart(node, m.index);
        rg.setEnd(node, m.index + m[0].length);
        for (const r of rg.getClientRects()) {
          if (r.width > 0.5 && r.height > 0.5)
            out.push({ word: m[0], top: r.top, bottom: r.bottom, left: r.left, right: r.right });
        }
      }
    }
    return out;
  };
  // Group rects into lines by top coordinate (2px tolerance), in reading order.
  const toLines = (rects) => {
    const lines = [];
    for (const r of [...rects].sort((a, b) => a.top - b.top || a.left - b.left)) {
      const L = lines[lines.length - 1];
      if (L && Math.abs(r.top - L.top) <= 2) {
        L.words.push(r.word);
        L.left = Math.min(L.left, r.left);
        L.right = Math.max(L.right, r.right);
      } else lines.push({ top: r.top, left: r.left, right: r.right, words: [r.word] });
    }
    return lines;
  };
  // Nearest ancestor that clips: overflow hidden|clip on either axis, or a
  // clip-path. Returns which axes it clips (overflow-x:clip alone is x-only).
  const clipper = (el) => {
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const ox = /hidden|clip/.test(cs.overflowX), oy = /hidden|clip/.test(cs.overflowY);
      const cp = cs.clipPath && cs.clipPath !== "none";
      const hid = cs.overflowX === "hidden" || cs.overflowY === "hidden"; // hidden on one axis clips both
      if (ox || oy || cp) return { el: n, x: cp || hid || ox, y: cp || hid || oy };
    }
    return null;
  };
  // INK extents, not the font's content box. Range rects are the inline box
  // (ascent+descent of the font, ~1.25em for Caslon) — at --lh-display .95
  // that box overhangs every line box by 6–13px while the actual glyph ink
  // (cap height above, a J tail below) may or may not. So we measure ink with
  // canvas TextMetrics for the line's own text in the element's font, and
  // place it on the baseline of each rect (top + fontBoundingBoxAscent).
  const inkCanvas = document.createElement("canvas").getContext("2d");
  const inkOf = (el, r) => {
    const cs = getComputedStyle(el);
    inkCanvas.font = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${cs.fontFamily}`;
    let t = r.word || "";
    if (cs.textTransform === "uppercase") t = t.toUpperCase();
    const m = inkCanvas.measureText(t);
    const fa = m.fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * 0.9;
    const fd = m.fontBoundingBoxDescent ?? parseFloat(cs.fontSize) * 0.25;
    // baseline inside the rect: the rect is the content area (fa+fd tall),
    // possibly scaled if line-height < content area (rect height still fa+fd).
    const scale = r.height && fa + fd ? r.height / (fa + fd) : 1;
    const baseline = r.top + fa * scale;
    return {
      top: baseline - (m.actualBoundingBoxAscent ?? fa) * scale,
      bottom: baseline + (m.actualBoundingBoxDescent ?? 0) * scale,
      left: r.left - Math.max(0, m.actualBoundingBoxLeft ?? 0),
      right: r.right + Math.max(0, (m.actualBoundingBoxRight ?? 0) - m.width),
    };
  };
  const overhang = (el, rects, b, axes = { x: true, y: true }, scrollsX = false) => {
    const inks = rects.map((r) => inkOf(el, r));
    const over = {
      top: axes.y ? Math.max(0, b.top - Math.min(...inks.map((i) => i.top))) : 0,
      bottom: axes.y ? Math.max(0, Math.max(...inks.map((i) => i.bottom)) - b.bottom) : 0,
      left: axes.x ? Math.max(0, b.left - Math.min(...inks.map((i) => i.left))) : 0,
      right: axes.x && !scrollsX ? Math.max(0, Math.max(...inks.map((i) => i.right)) - b.right) : 0,
    };
    return Object.entries(over).filter(([, v]) => v > 1).map(([k, v]) => `${k} ${v.toFixed(1)}px`);
  };
  // Overhang of text INK beyond the clip box (>1px). Horizontal overhang is
  // ignored inside a wider-than-itself container (carousels/marquees scroll by
  // design); left overhang from negative indent still registers there.
  const clipOf = (rects, el) => {
    const c = clipper(el);
    if (!c || !rects.length) return null;
    const b = c.el.getBoundingClientRect();
    const scrollsX = c.el.scrollWidth > c.el.clientWidth + 2;
    const sides = overhang(el, rects, b, c, scrollsX);
    return sides.length ? { by: label(c.el), sides } : null;
  };

  const rows = [];
  for (const el of blocks) {
    const rects = wordRects(el);
    if (!rects.length) continue;
    const lines = toLines(rects);
    const last = lines[lines.length - 1];
    const widest = Math.max(...lines.map((l) => l.right - l.left));
    const lastText = last.words.join(" ");
    const isDisplay = el.matches(DISPLAY_SEL);
    // A runt is a SHORT last line (the typographic definition): one word or
    // ≤3 chars at < 60% of the widest line, or two words on display/title
    // roles at < 50%. A balanced two-line name ("MARTIN I. / TOWNSEND",
    // ratio ≈ 1) is not a runt — `text-wrap: balance` did its job.
    const ratio0 = widest ? (last.right - last.left) / widest : 1;
    const runt =
      lines.length >= 2 &&
      (((last.words.length === 1 || lastText.length <= 3) && ratio0 < 0.6) ||
        (isDisplay && last.words.length === 2 && ratio0 < 0.5));
    // .lines headings: each authored line sits in its own overflow-hidden box —
    // check every line-box's text against that box, else the block's clipper.
    let clip = null;
    if (el.matches(".lines") && el.querySelector(".line-box")) {
      const hits = [];
      for (const lb of el.querySelectorAll(".line-box")) {
        const rs = wordRects(lb);
        if (!rs.length) continue;
        // The clip edge is the padding box (padding-bottom gives descender room).
        const lcs = getComputedStyle(lb);
        if (!/hidden|clip/.test(lcs.overflow) && (!lcs.clipPath || lcs.clipPath === "none")) continue;
        const b = lb.getBoundingClientRect();
        const sides = overhang(el, rs, b);
        if (sides.length) hits.push(`"${rs.map((r) => r.word).join(" ").slice(0, 24)}": ${sides.join(", ")}`);
      }
      if (hits.length) clip = { by: ".line-box", sides: hits };
    } else clip = clipOf(rects, el);
    // Line breaks the author chose (Lines component, <br>, pre-line "\n",
    // stacked block/flex children) — still reported, but noted as authored.
    const cs = getComputedStyle(el);
    const authored =
      el.matches(".lines") ||
      !!el.querySelector("br") ||
      (/pre/.test(cs.whiteSpace) && /\n/.test(el.textContent)) ||
      [...el.children].some((c) => !/^inline/.test(getComputedStyle(c).display));
    rows.push({
      sel: label(el),
      text: txt(el).slice(0, 40),
      fontSize: Math.round(parseFloat(cs.fontSize) * 10) / 10,
      lines: lines.length,
      lastWords: last.words.length,
      lastText: lastText.slice(0, 40),
      ratio: widest ? +((last.right - last.left) / widest).toFixed(2) : 1,
      display: isDisplay,
      authored,
      runt,
      twoWord: runt && isDisplay && last.words.length === 2,
      // The gate counts only UNAUTHORED runts (authored lockups are listed for eyeballing).
      gate: runt && !authored,
      clip,
    });
  }
  return rows;
};

mkdirSync(outdir, { recursive: true });
const browser = await chromium.launch();
const results = []; // { route, vp, blocks | error }
for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(route.includes("map") ? 6000 : 1200);
      // One scroll-through so lazy content (map copy, museum grid) mounts.
      await page.evaluate(async () => {
        const step = innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        scrollTo(0, 0);
      });
      await page.evaluate(REVEAL);
      await page.waitForTimeout(1800); // let reveal/opacity transitions settle
      const blocks = await page.evaluate(MEASURE);
      const runts = blocks.filter((b) => b.gate).length, clips = blocks.filter((b) => b.clip).length;
      results.push({ route, vp: vp.name, blocks });
      console.log(`${runts || clips ? "✗" : "✓"} ${route} @ ${vp.name} — ${blocks.length} blocks · ${runts} runts · ${clips} clips`);
    } catch (e) {
      const error = e.message.split("\n")[0];
      results.push({ route, vp: vp.name, blocks: [], error });
      console.error(`✗ ${route} @ ${vp.name}: ${error}`);
    }
  }
  await ctx.close();
}
await browser.close();

// Reports
const flat = results.flatMap((r) => r.blocks.map((b) => ({ route: r.route, vp: r.vp, ...b })));
const allRunts = flat.filter((b) => b.runt), runts = allRunts.filter((b) => b.gate), authoredRunts = allRunts.filter((b) => !b.gate), twoWord = runts.filter((b) => b.twoWord), clips = flat.filter((b) => b.clip);
const errors = results.filter((r) => r.error);
writeFileSync(join(outdir, "rag.json"), JSON.stringify({ base: BASE, generated: new Date().toISOString(), results }, null, 2));
const L = [
  `# Rag & clip sweep — ${BASE}`,
  "",
  `**${runts.length} runts (unauthored, the gate) · ${twoWord.length} two-word display runts · ${clips.length} ink clips** · ${authoredRunts.length} authored-lockup rows listed separately` +
    (errors.length ? ` · ${errors.length} route error(s)` : "") +
    ` — ${flat.length} blocks over ${results.length} route × viewport passes.`,
  "",
  "## Runts",
  "",
  "| route | vp | selector | text | px | lines | last line | ratio | note |",
  "|---|---|---|---|---|---|---|---|---|",
  ...runts.map(
    (b) =>
      `| ${b.route} | ${b.vp} | \`${b.sel}\` | "${b.text}" | ${b.fontSize} | ${b.lines} | "${b.lastText}" (${b.lastWords}w) | ${b.ratio} | ${[b.twoWord && "two-word display", b.authored && "authored break"].filter(Boolean).join(", ")} |`,
  ),
  "",
  "## Authored lockups (not gated — eyeball)",
  "",
  "| route | vp | selector | text | lines | last line |",
  "|---|---|---|---|---|---|",
  ...authoredRunts.map((b) => `| ${b.route} | ${b.vp} | \`${b.sel}\` | "${b.text}" | ${b.lines} | "${b.lastText}" |`),
  "",
  "## Clips (ink vs clip box)",
  "",
  "| route | vp | selector | text | px | clipped by | overhang |",
  "|---|---|---|---|---|---|---|",
  ...clips.map((b) => `| ${b.route} | ${b.vp} | \`${b.sel}\` | "${b.text}" | ${b.fontSize} | \`${b.clip.by}\` | ${b.clip.sides.join("; ")} |`),
];
if (errors.length) L.push("", "## Errors", "", ...errors.map((r) => `- ${r.route} @ ${r.vp}: ${r.error}`));
writeFileSync(join(outdir, "rag.md"), L.join("\n") + "\n");
console.log(`\nrag → ${outdir}/rag.{json,md}  (${runts.length} runts · ${twoWord.length} two-word display runts · ${clips.length} clips)`);
process.exit(runts.length || clips.length || errors.length ? 1 : 0);
