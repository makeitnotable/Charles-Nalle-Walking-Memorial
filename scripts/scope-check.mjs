#!/usr/bin/env node
/**
 * Client round 3 — the scope gate (docs/rounds/2026-09-16-round-3-plan.md,
 * "The regression guarantee").
 *
 * Why this exists: rounds 1–2 shipped changes Wil had not asked for (the
 * `lvh` stage sizing, the `--cnwm-bar` token) because nothing mechanical stood
 * between "the plan lists these files" and "the commit touches these files".
 * Every client round now opens with a manifest in docs/rounds/ naming every
 * path it may change, and this gate fails when the tree differs from the
 * round's base commit anywhere else. Run it before every commit and push.
 * It only reads; git is never written.
 *
 * Files considered = `git diff --name-only --no-renames <base>` (every
 * committed AND working-tree change against the base, deletions included)
 * ∪ `git ls-files --others --exclude-standard` (new, untracked files).
 * Each must match an `allowed` entry: an exact path, or a glob in which `*`
 * matches within one path segment, `**` across segments and `?` one
 * character. Nothing else is glob syntax — `src/pages/[chapter].astro` is a
 * literal path. An optional `constraints` block holds a JSON file to named
 * top-level keys (`"package.json": { "jsonKeys": ["scripts"] }` = the scripts
 * block may change, dependencies and everything else may not).
 *
 * Base ref, in order: `--base <ref>`; the manifest's tag when it exists
 * locally (`git rev-parse -q --verify refs/tags/<tag>`); its pinned commit
 * SHA; its branch (`origin/<branch>`, then `<branch>`). A fresh clone has no
 * tags — this repo's tokens refuse tag pushes, so each round's base is also
 * pinned as a `claude/client-round-N-base` branch and as a SHA in the
 * manifest. Never assume the tag; carry the SHA.
 *
 *   node scripts/scope-check.mjs [--manifest docs/rounds/<date>-round-N.json] [--base <ref>] [--list]
 *   npm run qa:scope
 *
 * Default manifest: the lexically latest docs/rounds/*-round-*.json.
 * `--list` prints every changed file with the rule that admits it.
 * Exit 0: "scope-check: N changed file(s), all within the round manifest ✓".
 * Exit 1: the offending paths. Exit 2: no manifest, or the base cannot resolve.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
if (args.includes("--help") || args.includes("-h")) {
  console.log(
    "usage: node scripts/scope-check.mjs [--manifest docs/rounds/<date>-round-N.json] [--base <ref>] [--list]",
  );
  process.exit(0);
}
const die = (msg) => {
  console.error(msg);
  process.exit(2);
};

/* Every git call runs at the repository root so `ls-files --others` sees the
   whole tree and every path comes back root-relative, wherever this is run. */
const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: HERE, encoding: "utf8" }).trim();
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const tryGit = (...a) => {
  try {
    return git(...a).trim();
  } catch {
    return null;
  }
};

/* ── manifest ─────────────────────────────────────────────────────────────── */
function latestManifest() {
  const dir = join(ROOT, "docs", "rounds");
  if (!existsSync(dir)) return null;
  /* Sort by date, then by the round number NUMERICALLY. A plain lexical sort
     puts `-round-10` BEFORE `-round-9` ("1" < "9"), so from the tenth manifest
     on, the latest round would never be the one discovered and a bare
     `npm run qa:scope` would silently gate against the wrong round. Round 8
     phase B already noticed the numbering trap this sits next to (its manifest
     is called round-9 only because scope-check discovers by
     `-round-<digits>.json`); this is the other half of it. */
  const key = (f) => {
    const m = /^(.*)-round-(\d+)\.json$/.exec(f);
    return [m[1], Number(m[2])];
  };
  const files = readdirSync(dir)
    .filter((f) => /-round-\d+\.json$/.test(f))
    .sort((a, b) => {
      const [da, na] = key(a);
      const [db, nb] = key(b);
      return da === db ? na - nb : da < db ? -1 : 1;
    });
  return files.length ? join("docs", "rounds", files[files.length - 1]) : null;
}
const manifestArg = flag("manifest", latestManifest());
if (!manifestArg) die("scope-check: no round manifest found (docs/rounds/<date>-round-N.json) — pass --manifest");
const manifestPath = resolve(ROOT, manifestArg);
const manifestRel = relative(ROOT, manifestPath);
if (!existsSync(manifestPath)) die(`scope-check: no manifest at ${manifestRel}`);
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (e) {
  die(`scope-check: ${manifestRel} is not valid JSON (${e.message})`);
}
if (!Array.isArray(manifest.allowed) || !manifest.allowed.every((g) => typeof g === "string" && g.length)) {
  die(`scope-check: ${manifestRel} needs an "allowed" array of paths/globs`);
}

/* ── base ref ─────────────────────────────────────────────────────────────── */
const rev = (ref) => tryGit("rev-parse", "-q", "--verify", `${ref}^{commit}`);
const pin = manifest.base ?? {};
let base = null;
let via = null;
const wanted = flag("base", null);
if (wanted) {
  base = rev(wanted);
  via = `--base ${wanted}`;
  if (!base) die(`scope-check: --base ${wanted} does not resolve to a commit`);
} else if (pin.tag && (base = rev(`refs/tags/${pin.tag}`))) {
  via = `tag ${pin.tag}`;
  if (pin.commit && !base.startsWith(pin.commit)) {
    console.warn(
      `scope-check: WARNING tag ${pin.tag} is at ${base.slice(0, 7)} but the manifest pins ${pin.commit.slice(0, 7)} — checking against the tag; fix whichever is wrong`,
    );
  }
} else if (pin.commit && (base = rev(pin.commit))) {
  via = "pinned commit";
} else if (pin.branch && (base = rev(`refs/remotes/origin/${pin.branch}`) ?? rev(pin.branch))) {
  via = `branch ${pin.branch}`;
}
if (!base) {
  die(
    `scope-check: cannot resolve the round's base — none of tag ${pin.tag ?? "-"}, commit ${pin.commit ?? "-"}, branch ${pin.branch ?? "-"} exist here (fetch origin, or pass --base)`,
  );
}

/* ── what changed ─────────────────────────────────────────────────────────── */
const nul = (s) => s.split("\0").filter(Boolean);
const changed = new Set([
  ...nul(git("diff", "--name-only", "--no-renames", "-z", base)),
  ...nul(git("ls-files", "--others", "--exclude-standard", "-z")),
]);

/* ── the tiny glob ────────────────────────────────────────────────────────── */
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        i++;
        if (glob[i + 1] === "/") {
          i++;
          re += "(?:.*/)?"; // `**/x` — zero or more whole segments
        } else re += ".*"; // `a/**` — anything, across segments
      } else re += "[^/]*"; // `*.png` — within one segment
    } else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}
const rules = manifest.allowed.map((glob) => ({ glob, re: globToRegExp(glob) }));
const inside = [];
const outside = [];
for (const p of [...changed].sort()) {
  const rule = rules.find((r) => r.re.test(p));
  if (rule) inside.push({ path: p, glob: rule.glob });
  else outside.push(p);
}

/* ── constraints: a JSON file held to named top-level keys ───────────────── */
const problems = [];
for (const [p, rule] of Object.entries(manifest.constraints ?? {})) {
  if (!changed.has(p) || !Array.isArray(rule.jsonKeys)) continue;
  const before = tryGit("show", `${base}:${p}`);
  if (before == null) continue; // new this round — nothing to hold constant
  const free = rule.jsonKeys;
  const only = `only ${free.map((k) => `"${k}"`).join(", ")} may change`;
  if (!existsSync(join(ROOT, p))) {
    problems.push(`${p}: deleted — ${only}`);
    continue;
  }
  let was;
  let now;
  try {
    was = JSON.parse(before);
    now = JSON.parse(readFileSync(join(ROOT, p), "utf8"));
  } catch (e) {
    problems.push(`${p}: not parseable as JSON (${e.message})`);
    continue;
  }
  for (const key of new Set([...Object.keys(was), ...Object.keys(now)])) {
    if (free.includes(key)) continue;
    if (JSON.stringify(was[key]) !== JSON.stringify(now[key])) problems.push(`${p}: "${key}" changed — ${only}`);
  }
}

/* ── report ───────────────────────────────────────────────────────────────── */
console.log(`scope-check: ${manifestRel} (round ${manifest.round ?? "?"}) · base ${base.slice(0, 7)} via ${via}`);
if (args.includes("--list")) {
  for (const { path, glob } of inside) console.log(`  · ${path}${glob === path ? "" : `  ←  ${glob}`}`);
}
if (outside.length || problems.length) {
  if (outside.length) {
    console.error(`scope-check: ${outside.length} path(s) outside the round manifest:`);
    for (const p of outside) console.error(`  ✗ ${p}`);
  }
  for (const m of problems) console.error(`  ✗ ${m}`);
  console.error(
    `scope-check: FAIL — ${changed.size} changed file(s), ${outside.length} outside ${manifestRel}` +
      (problems.length ? `, ${problems.length} constraint violation(s)` : "") +
      ". Revert them, or — only if the round's plan lists them — add the path to the manifest.",
  );
  process.exit(1);
}
console.log(`scope-check: ${changed.size} changed file(s), all within the round manifest ✓`);
