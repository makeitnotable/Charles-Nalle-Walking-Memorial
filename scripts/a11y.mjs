#!/usr/bin/env node
/**
 * The QA ear: Playwright + axe-core accessibility instrument (docs/PLAN.md
 * Part B item 2). shots.mjs photographs; states.mjs measures collisions; this
 * scores every route × viewport with axe (WCAG 2.x A/AA + best-practice), then
 * scores the KEY STATES (menu open, map walk/lens, painting dialog, mini-
 * player), walks the Tab order recording focus-ring visibility, sweeps every
 * route under prefers-reduced-motion for content that never appears, and
 * sweeps at an effective 200% zoom for horizontal overflow. Console errors and
 * pageerrors are captured on every visit.
 *
 * Usage:
 *   node scripts/a11y.mjs <outdir> [--base URL] [--vp 390,768,1440] [--routes /,/map]
 *
 * Output: <outdir>/a11y.json, <outdir>/a11y.md, screenshots (gitignored).
 * Exit 1 if any serious/critical axe violation, else 0.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/qa/a11y";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ALL_VP = {
  390: { width: 390, height: 844 },
  768: { width: 768, height: 1024 },
  1440: { width: 1440, height: 900 },
};
const VPS = flag("vp", "390,768,1440")
  .split(",")
  .map((n) => ({ name: n, ...(ALL_VP[n] ?? { width: Number(n), height: 900 }) }));
const ROUTES = flag(
  "routes",
  "/,/bakery,/commissioners-office,/mansion,/ferry,/barbershop,/map,/people,/paintings,/about,/404",
).split(",");
const has = (r) => ROUTES.includes(r);
const vpNamed = (n) => VPS.find((v) => v.name === String(n));
const AXE = fileURLToPath(new URL("../node_modules/axe-core/axe.min.js", import.meta.url));
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"];
const slugOf = (r) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/\//g, "-"));
const settle = (r) => (r.includes("map") ? 6000 : 1500);

mkdirSync(outdir, { recursive: true });

/* ─── results ─── */
const R = {
  base: BASE,
  startedAt: new Date().toISOString(),
  runs: [], // axe runs: baseline + states
  keyboard: [], // Tab walks + menu/dialog keyboard checks
  reducedMotion: [],
  zoom: [],
  consoleErrors: [], // { where, text }
};
const seenErr = new Set();
let WHERE = "";
const consoleErr = (text) => {
  const key = WHERE + "|" + text;
  if (seenErr.has(key)) return;
  seenErr.add(key);
  R.consoleErrors.push({ where: WHERE, text: text.slice(0, 300) });
};

/* ─── page helpers ─── */
const browser = await chromium.launch();
async function newPage(opts) {
  const ctx = await browser.newContext({ deviceScaleFactor: 1, ...opts });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => consoleErr("pageerror: " + String(e).split("\n")[0]));
  page.on("console", (m) => m.type() === "error" && consoleErr(m.text()));
  return { ctx, page };
}
async function visit(page, route, label, wait = settle(route)) {
  WHERE = label;
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(wait);
  // The Astro dev toolbar is dev-only chrome (absent from the build); it traps
  // Tab focus in its shadow root and would be scored by axe, so drop it.
  await page.evaluate(() => document.querySelector("astro-dev-toolbar")?.remove());
}
/* Reveal-on-scroll text sits at opacity 0 until IntersectionObserver fires;
   forcing it in lets axe score contrast on the words a reader will see. */
const forceReveals = (page) =>
  page.evaluate(() => {
    for (const el of document.querySelectorAll(".reveal,.reveal-quote,.lines,.wipe,.home-seq")) {
      el.classList.add("is-in");
      el.style.opacity = "1";
      el.style.transform = "none";
    }
  });
async function runAxe(page, route, vp, state) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) await page.addScriptTag({ path: AXE });
  const raw = await page.evaluate(
    (tags) => window.axe.run(document, { runOnly: { type: "tag", values: tags } }),
    TAGS,
  );
  const violations = raw.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    helpUrl: v.helpUrl,
    count: v.nodes.length,
    nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
  }));
  R.runs.push({ route, vp, state, violations, passes: raw.passes.length, incomplete: raw.incomplete.length });
  const bad = violations.filter((v) => /serious|critical/.test(v.impact)).length;
  console.log(`  axe ${route} @${vp} [${state}] — ${violations.length} violation(s), ${bad} serious+`);
  return violations;
}
const shot = (page, name) => page.screenshot({ path: join(outdir, `${name}.png`) });

/* ═══ 1. Baseline: every route × viewport ═══ */
for (const vp of VPS) {
  const { ctx, page } = await newPage({ viewport: { width: vp.width, height: vp.height } });
  console.log(`\n── baseline @${vp.name}`);
  for (const route of ROUTES) {
    try {
      await visit(page, route, `${route} @${vp.name} rest`);
      await forceReveals(page);
      await page.waitForTimeout(400);
      await runAxe(page, route, vp.name, "rest");
    } catch (e) {
      R.runs.push({ route, vp: vp.name, state: "rest", violations: [], note: e.message.split("\n")[0] });
      console.error(`  ✗ ${route} @${vp.name}: ${e.message.split("\n")[0]}`);
    }
  }
  await ctx.close();
}

/* ═══ 2. Key states: each = drive + axe + screenshot; a miss is a NOTE not a crash ═══ */
const STATES = [
  { route: "/mansion", state: "menu-open", drive: async (p) => { await p.click(".cnwm-menu-burger"); await p.waitForTimeout(900); } },
  { route: "/map", state: "menu-open", drive: async (p) => { await p.click(".cnwm-menu-burger"); await p.waitForTimeout(900); } },
  { route: "/map", state: "walk", drive: async (p) => { await p.getByRole("button", { name: /Take the walk/i }).first().click({ timeout: 5000 }); await p.waitForTimeout(4000); } },
  { route: "/map", state: "lens-1858", drive: async (p) => { await p.getByRole("button", { name: /See Troy in 1858/i }).first().click({ timeout: 5000 }); await p.waitForTimeout(2500); } },
  {
    route: "/paintings", state: "dialog",
    drive: async (p) => {
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await p.waitForTimeout(800);
      // The 2-D grid tiles are `.painting-open`; fall back to any button that ends up opening a dialog.
      const tile = p.locator(".painting-open, section:has(img) button").first();
      await tile.scrollIntoViewIfNeeded();
      await tile.click({ timeout: 5000 });
      await p.waitForTimeout(1100);
      if (!(await p.locator("dialog[open]").count())) throw new Error("no dialog[open] after tile click");
    },
  },
  {
    route: "/mansion", state: "mini-player",
    drive: async (p) => {
      const play = p.locator("button[aria-label*='Play']").first();
      await play.scrollIntoViewIfNeeded();
      await play.click({ timeout: 5000 });
      await p.waitForTimeout(1200);
      await p.evaluate(() => window.scrollBy(0, window.innerHeight * 2.2));
      await p.waitForTimeout(1600);
    },
  },
].filter((s) => has(s.route));

for (const vp of VPS) {
  const { ctx, page } = await newPage({ viewport: { width: vp.width, height: vp.height } });
  console.log(`\n── states @${vp.name}`);
  for (const s of STATES) {
    const name = `state-${slugOf(s.route)}-${vp.name}-${s.state}`;
    try {
      await visit(page, s.route, `${s.route} @${vp.name} ${s.state}`);
      await s.drive(page);
      await shot(page, name);
      await runAxe(page, s.route, vp.name, s.state);
    } catch (e) {
      const note = `state not reached: ${e.message.split("\n")[0]}`;
      R.runs.push({ route: s.route, vp: vp.name, state: s.state, violations: [], note });
      await shot(page, name).catch(() => {});
      console.error(`  ✗ ${name}: ${note}`);
    }
  }
  await ctx.close();
}

/* ═══ 3. Keyboard walk ═══ */
const FOCUS_INFO = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return { body: true };
  const cs = getComputedStyle(el);
  const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
  const shadow = cs.boxShadow !== "none";
  const r = el.getBoundingClientRect();
  return {
    body: false,
    domIndex: [...document.querySelectorAll("*")].indexOf(el),
    tag: el.tagName.toLowerCase(),
    id: el.id || "",
    class: (el.getAttribute("class") || "").split(/\s+/).slice(0, 3).join("."),
    ariaLabel: el.getAttribute("aria-label") || "",
    text: (el.innerText || el.value || "").trim().replace(/\s+/g, " ").slice(0, 30),
    noRing: !outline && !shadow,
    outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
    boxShadow: cs.boxShadow === "none" ? "none" : "set",
    opacity: Number(cs.opacity),
    inViewport: r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0,
  };
};
const KBD_ROUTES = ["/", "/map", "/bakery", "/paintings"].filter(has);
for (const vpName of ["1440", "390"]) {
  const vp = vpNamed(vpName);
  if (!vp) continue;
  const { ctx, page } = await newPage({ viewport: { width: vp.width, height: vp.height } });
  console.log(`\n── keyboard @${vp.name}`);
  for (const route of KBD_ROUTES) {
    const rec = { route, vp: vp.name, stops: [], stopReason: "" };
    try {
      await visit(page, route, `${route} @${vp.name} keyboard`);
      const seen = new Set();
      for (let n = 1; n <= 60; n++) {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(250);
        const f = await page.evaluate(FOCUS_INFO);
        if (f.body) { rec.stopReason = "focus returned to body"; break; }
        if (seen.has(f.domIndex)) { rec.stopReason = "focus repeated an element"; break; }
        seen.add(f.domIndex);
        rec.stops.push({ n, ...f });
        if (n <= 12) await shot(page, `kbd-${slugOf(route)}-${vp.name}-${n}`);
      }
      if (!rec.stopReason) rec.stopReason = "60-stop cap";
    } catch (e) {
      rec.stopReason = "error: " + e.message.split("\n")[0];
    }
    const noRing = rec.stops.filter((s) => s.noRing).length;
    console.log(`  ${route}: ${rec.stops.length} stops, ${noRing} without a visible ring (${rec.stopReason})`);
    R.keyboard.push(rec);
  }
  // Menu via keyboard on /mansion: Enter opens, Escape closes, focus returns to the burger.
  if (has("/mansion")) {
    const rec = { route: "/mansion", vp: vp.name, check: "menu-keyboard" };
    try {
      await visit(page, "/mansion", `/mansion @${vp.name} menu-keyboard`);
      await page.focus(".cnwm-menu-burger");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(900);
      rec.openedOnEnter = await page.evaluate(
        () => Boolean(document.querySelector(".cnwm-menu-panel:not(.hidden)")) || document.querySelector(".cnwm-menu-burger")?.getAttribute("aria-expanded") === "true",
      );
      rec.focusMovedIntoPanel = await page.evaluate(() => Boolean(document.activeElement?.closest(".cnwm-menu-panel")));
      await page.keyboard.press("Escape");
      await page.waitForTimeout(800);
      rec.closedOnEscape = await page.evaluate(() => !document.querySelector(".cnwm-menu-panel:not(.hidden)"));
      rec.focusReturnedToBurger = await page.evaluate(() => document.activeElement?.classList.contains("cnwm-menu-burger") ?? false);
    } catch (e) { rec.note = e.message.split("\n")[0]; }
    console.log(`  /mansion menu: open=${rec.openedOnEnter} close=${rec.closedOnEscape} focusBack=${rec.focusReturnedToBurger}`);
    R.keyboard.push(rec);
  }
  // Painting dialog via keyboard: Enter on a tile opens, Escape closes.
  if (has("/paintings")) {
    const rec = { route: "/paintings", vp: vp.name, check: "dialog-keyboard" };
    try {
      await visit(page, "/paintings", `/paintings @${vp.name} dialog-keyboard`);
      const tile = page.locator(".painting-open").first();
      await tile.scrollIntoViewIfNeeded();
      await tile.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1100);
      rec.openedOnEnter = (await page.locator("dialog[open]").count()) > 0;
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
      rec.closedOnEscape = (await page.locator("dialog[open]").count()) === 0;
      rec.focusReturnedToTile = await page.evaluate(() => document.activeElement?.classList.contains("painting-open") ?? false);
    } catch (e) { rec.note = e.message.split("\n")[0]; }
    console.log(`  /paintings dialog: open=${rec.openedOnEnter} close=${rec.closedOnEscape} focusBack=${rec.focusReturnedToTile}`);
    R.keyboard.push(rec);
  }
  await ctx.close();
}

/* ═══ 4. Reduced-motion parity: text that stays invisible is a failure ═══
   Text inside aria-hidden / hidden / inert / closed-dialog subtrees (the
   curtain overlay, the closed menu) is not content and is skipped. */
const HIDDEN_TEXT = () => {
  const out = [];
  const eff = (el) => { let o = 1; for (let e = el; e && e !== document; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o; };
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("[aria-hidden='true'],[hidden],[inert],dialog:not([open]),script,style")) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ");
    if (own.length < 3) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue;
    if (eff(el) < 0.05) {
      const cls = (el.getAttribute("class") || "").split(/\s+/).slice(0, 3).join(".");
      out.push(`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls ? "." + cls : ""} "${own.slice(0, 40)}"`);
    }
    if (out.length >= 20) break;
  }
  return out;
};
for (const vpName of ["390", "1440"]) {
  const vp = vpNamed(vpName);
  if (!vp) continue;
  const { ctx, page } = await newPage({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce" });
  console.log(`\n── reduced-motion @${vp.name}`);
  for (const route of ROUTES) {
    const rec = { route, vp: vp.name, hiddenText: [] };
    const before = R.consoleErrors.length;
    try {
      await visit(page, route, `${route} @${vp.name} reduced-motion`);
      await shot(page, `rm-${slugOf(route)}-${vp.name}-top`);
      const top = await page.evaluate(HIDDEN_TEXT);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);
      await shot(page, `rm-${slugOf(route)}-${vp.name}-bottom`);
      const bottom = await page.evaluate(HIDDEN_TEXT);
      rec.hiddenText = [...new Set([...top, ...bottom])];
    } catch (e) { rec.note = e.message.split("\n")[0]; }
    rec.consoleErrors = R.consoleErrors.slice(before).map((e) => e.text);
    console.log(`  ${route}: ${rec.hiddenText.length} hidden-text element(s), ${rec.consoleErrors.length} console error(s)`);
    R.reducedMotion.push(rec);
  }
  await ctx.close();
}

/* ═══ 5. 200% zoom: 1440 at 200% is effectively a 720×450 viewport ═══ */
{
  const { ctx, page } = await newPage({ viewport: { width: 720, height: 450 } });
  console.log(`\n── zoom 200% (720×450)`);
  for (const route of ROUTES) {
    const rec = { route };
    try {
      await visit(page, route, `${route} zoom-200`);
      Object.assign(rec, await page.evaluate(() => {
        const sw = document.documentElement.scrollWidth;
        const wide = [...document.querySelectorAll("body *")]
          .filter((el) => el.getBoundingClientRect().right > innerWidth + 2 && getComputedStyle(el).position !== "fixed")
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${(el.getAttribute("class") || "").split(/\s+/)[0]}`);
        return { scrollWidth: sw, innerWidth, overflow: sw > innerWidth + 2, wide };
      }));
      await shot(page, `zoom-${slugOf(route)}`);
    } catch (e) { rec.note = e.message.split("\n")[0]; }
    console.log(`  ${route}: ${rec.overflow ? `OVERFLOW ${rec.scrollWidth}>${rec.innerWidth}` : "ok"}`);
    R.zoom.push(rec);
  }
  await ctx.close();
}
await browser.close();

/* ═══ Report ═══ */
R.finishedAt = new Date().toISOString();
writeFileSync(join(outdir, "a11y.json"), JSON.stringify(R, null, 1));

const allV = R.runs.flatMap((r) => r.violations.map((v) => ({ ...r, ...v })));
const nSevere = allV.filter((v) => /serious|critical/.test(v.impact)).length;
const nMod = allV.filter((v) => v.impact === "moderate").length;
const nMinor = allV.filter((v) => v.impact === "minor").length;
const L = [
  `# Accessibility — ${BASE}`,
  "",
  `**${nSevere} serious/critical · ${nMod} moderate · ${nMinor} minor across ${R.runs.length} runs** (${R.runs.filter((r) => r.note).length} run(s) not reached · ${R.startedAt})`,
  "",
  "## Violations",
  "",
];
if (allV.length) {
  L.push("| route | vp | state | rule | impact | count | first target |", "|---|---|---|---|---|---|---|");
  for (const v of allV) L.push(`| ${v.route} | ${v.vp} | ${v.state} | [${v.id}](${v.helpUrl}) — ${v.help} | **${v.impact}** | ${v.count} | \`${(v.nodes[0] || "").replace(/\|/g, "\\|").slice(0, 80)}\` |`);
} else L.push("No axe violations.");
const missed = R.runs.filter((r) => r.note);
if (missed.length) { L.push("", "Runs not reached:", ""); for (const r of missed) L.push(`- ${r.route} @${r.vp} [${r.state}] — ${r.note}`); }

L.push("", "## Keyboard walk", "");
for (const k of R.keyboard) {
  if (k.check === "menu-keyboard") { L.push(`- **/mansion menu @${k.vp}** — Enter opens: ${k.openedOnEnter} · focus into panel: ${k.focusMovedIntoPanel} · Escape closes: ${k.closedOnEscape} · focus returned to burger: ${k.focusReturnedToBurger}${k.note ? " · " + k.note : ""}`); continue; }
  if (k.check === "dialog-keyboard") { L.push(`- **/paintings dialog @${k.vp}** — Enter opens: ${k.openedOnEnter} · Escape closes: ${k.closedOnEscape} · focus returned to tile: ${k.focusReturnedToTile}${k.note ? " · " + k.note : ""}`); continue; }
  const bad = k.stops.filter((s) => s.noRing);
  L.push(`- **${k.route} @${k.vp}** — ${k.stops.length} stops (${k.stopReason}); ${bad.length} WITHOUT a visible ring${bad.length ? ":" : ""}`);
  for (const s of bad) L.push(`  - #${s.n} \`${s.tag}${s.id ? "#" + s.id : ""}${s.class ? "." + s.class : ""}\` ${s.ariaLabel ? `[${s.ariaLabel}] ` : ""}"${s.text}" (outline ${s.outline}, opacity ${s.opacity}${s.inViewport ? "" : ", off-screen"})`);
}

L.push("", "## Reduced motion", "");
for (const m of R.reducedMotion) {
  L.push(`- **${m.route} @${m.vp}** — ${m.hiddenText.length ? `${m.hiddenText.length} text element(s) still hidden` : "all text visible"}; ${m.consoleErrors.length} console error(s)${m.note ? " · " + m.note : ""}`);
  for (const h of m.hiddenText.slice(0, 8)) L.push(`  - ${h}`);
}

L.push("", "## 200% zoom (720×450)", "");
for (const z of R.zoom) L.push(`- **${z.route}** — ${z.overflow ? `HORIZONTAL OVERFLOW ${z.scrollWidth}px > ${z.innerWidth}px${z.wide?.length ? " · " + z.wide.join(", ") : ""}` : "no horizontal overflow"}${z.note ? " · " + z.note : ""}`);

L.push("", "## Console errors", "");
if (R.consoleErrors.length) for (const e of R.consoleErrors) L.push(`- \`${e.where}\` — ${e.text.replace(/\n/g, " ")}`);
else L.push("None.");

writeFileSync(join(outdir, "a11y.md"), L.join("\n") + "\n");
console.log(`\na11y → ${join(outdir, "a11y.md")} — ${nSevere} serious/critical · ${nMod} moderate · ${nMinor} minor across ${R.runs.length} runs`);
process.exit(nSevere ? 1 : 0);
