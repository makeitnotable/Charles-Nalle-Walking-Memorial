#!/usr/bin/env node
/**
 * Phase 1 Visual Design audit — pixel-samples the /styleguide instrument
 * against docs/BASELINE.md + docs/LEGACY-PORT-NOTES.md.
 *  1. Every [data-token] swatch computed background-color vs contract hex.
 *  2. Root-level --color-* custom properties vs contract (the swatches use
 *     inline hexes, so this catches @theme drift the swatches would hide).
 *  3. Type roles measured at 390 / 768 / 1024 / 1440.
 *  4. Signature primitive spot-checks (buttons, pills, hamburger, CTA,
 *     first-word cap, narration wash).
 */
import { chromium } from "playwright";

const URL = "http://localhost:4321/styleguide";

// ——— contract ———————————————————————————————————————————————
const RAMPS = {
  primary: ["#0e0807","#1d1411","#341a11","#4a1b0a","#592411","#69311d","#80412b","#a55438","#f26835","#e45b27","#ff9770","#fed9cc"],
  secondary: ["#0f0707","#1f1110","#3d0e0e","#55050b","#660b11","#791b1d","#932c2b","#be3a3a","#bf3b3b","#af2b2e","#ff8f8b","#ffd0cb"],
  tertiary: ["#010036","#010550","#040f74","#0921b3","#133092","#1e3fa2","#2c50b4","#3c63c9","#537de5","#477dd7","#8ab2ff","#cce1ff"],
  gray: ["#080907","#191715","#24211d","#2c2924","#34302a","#3d3a34","#4b4741","#648059","#706d66","#7e7a73","#b7b3ab","#f0edeb"],
  neutral: ["#070912","#100a06","#302414","#503d22","#705731","#8f7040","#ad8950","#bb9e70","#c9b490","#d7c9b0","#e6decf","#f6f3ee"],
};

// ladder: [font-size, line-height(px|null=skip), letter-spacing(px|null)]
const LADDER = {
  ".type-display": {
    390:  { fs: 42,   lh: 34,    ls: -1.5 },
    768:  { fs: 52.5, lh: 42.5,  ls: -1.875 },
    1024: { fs: 63,   lh: 51,    ls: -2.25 },
    1440: { fs: 63,   lh: 51,    ls: -2.25 },
  },
  ".type-wordmark": {
    390:  { fs: 54,   ls: -2.5 },
    768:  { fs: 67.5, ls: -2.5 },
    1024: { fs: 81,   ls: -2.5 },
    1440: { fs: 81,   ls: -2.5 },
  },
  ".type-body": {
    390:  { fs: 18, lh: 28.8, w: 300 },
    768:  { fs: 18, lh: 28.8, w: 300 },
    1024: { fs: 18, lh: 28.8, w: 300 },
    1440: { fs: 18, lh: 28.8, w: 300 },
  },
  ".type-label": {
    390:  { fs: 12 },
    768:  { fs: 15 },
    1024: { fs: 18 },
    1440: { fs: 18 },
  },
};

const toHex = (rgb) => {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return rgb;
  return (
    "#" + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("")
  );
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "networkidle" });

let failures = 0;
const report = [];
const check = (label, got, want) => {
  const pass = String(got).toLowerCase() === String(want).toLowerCase();
  if (!pass) failures++;
  report.push(`${pass ? "PASS" : "FAIL"}  ${label}: got ${got} want ${want}`);
};
const checkNum = (label, got, want, tol = 0.35) => {
  const pass = Math.abs(parseFloat(got) - want) <= tol;
  if (!pass) failures++;
  report.push(`${pass ? "PASS" : "FAIL"}  ${label}: got ${got} want ${want}`);
};

// ——— 1. swatch pixel sampling ————————————————————————————————
report.push("=== 1. [data-token] swatch computed backgrounds ===");
for (const [ramp, steps] of Object.entries(RAMPS)) {
  for (let i = 0; i < steps.length; i++) {
    const sel = `[data-token="${ramp}-${i + 1}"]`;
    const el = page.locator(sel);
    if ((await el.count()) === 0) {
      failures++;
      report.push(`FAIL  ${ramp}-${i + 1}: element missing`);
      continue;
    }
    const bg = await el.evaluate((n) => getComputedStyle(n).backgroundColor);
    check(`${ramp}-${i + 1}`, toHex(bg), steps[i]);
  }
}

// ——— 2. @theme custom properties on :root ————————————————————
report.push("=== 2. :root --color-* custom properties (theme truth) ===");
for (const [ramp, steps] of Object.entries(RAMPS)) {
  for (let i = 0; i < steps.length; i++) {
    const val = await page.evaluate(
      (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
      `--color-${ramp}-${i + 1}`,
    );
    check(`--color-${ramp}-${i + 1}`, val || "(unset)", steps[i]);
  }
}

// ——— 3. type ladder at 4 widths ———————————————————————————————
report.push("=== 3. type ladder (measured) ===");
for (const width of [390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(150);
  for (const [sel, ladder] of Object.entries(LADDER)) {
    const want = ladder[width];
    const got = await page.locator(sel).first().evaluate((n) => {
      const s = getComputedStyle(n);
      return {
        fs: s.fontSize, lh: s.lineHeight, ls: s.letterSpacing,
        w: s.fontWeight, fam: s.fontFamily, tt: s.textTransform, color: s.color,
      };
    });
    checkNum(`${width}px ${sel} font-size`, got.fs, want.fs);
    if (want.lh != null) checkNum(`${width}px ${sel} line-height`, got.lh, want.lh);
    if (want.ls != null)
      checkNum(`${width}px ${sel} letter-spacing`, got.ls === "normal" ? 0 : got.ls, want.ls, 0.06);
    if (want.w != null) checkNum(`${width}px ${sel} weight`, got.w, want.w, 0);
    report.push(`info  ${width}px ${sel} → ${got.fs}/${got.lh} ls ${got.ls} w ${got.w} ${got.fam.split(",")[0]} ${got.tt} ${got.color}`);
  }
  // button scale (legacy: 18 → 22.5 → 27, py 16 → 20 → 24)
  const btn = await page.locator("button", { hasText: "Play Chapter" }).evaluate((n) => {
    const s = getComputedStyle(n);
    return { fs: s.fontSize, pt: s.paddingTop, pl: s.paddingLeft, fam: s.fontFamily, bg: s.backgroundColor, color: s.color, bc: s.borderColor };
  });
  report.push(`info  ${width}px filled button → fs ${btn.fs} pad ${btn.pt}/${btn.pl} ${btn.fam.split(",")[0]} bg ${btn.bg} color ${btn.color} border ${btn.bc}`);
  const title = await page.locator(".type-card-title").first().evaluate((n) => getComputedStyle(n).fontSize);
  report.push(`info  ${width}px .type-card-title font-size ${title}`);
}

// ——— 4. primitive spot checks (at 1440) ———————————————————————
report.push("=== 4. primitives (1440) ===");
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(150);

const btn = await page.locator("button", { hasText: "Play Chapter" }).evaluate((n) => {
  const s = getComputedStyle(n);
  return { bg: s.backgroundColor, color: s.color, bc: s.borderTopColor };
});
check("filled button bg (primary-4)", toHex(btn.bg), "#4a1b0a");
check("filled button text (primary-11)", toHex(btn.color), "#ff9770");
check("filled button border (primary-6)", toHex(btn.bc), "#69311d");

const outline = await page.locator("button", { hasText: "Get Directions" }).evaluate((n) => {
  const s = getComputedStyle(n);
  return { bc: s.borderTopColor, color: s.color };
});
check("outline button border (primary-8)", toHex(outline.bc), "#a55438");

const cta = await page.locator("button", { hasText: "Continue" }).evaluate((n) => {
  const s = getComputedStyle(n);
  return { bg: s.backgroundColor, color: s.color, bc: s.borderTopColor };
});
check("home CTA bg", toHex(cta.bg), "#ffc6b3");
check("home CTA text", toHex(cta.color), "#bd3900");
check("home CTA border", toHex(cta.bc), "#f7a98f");

// marker pills — active then inactive
const pills = await page.locator("div.rounded-\\[30px\\]").evaluateAll((ns) =>
  ns.map((n) => {
    const s = getComputedStyle(n);
    return { bg: s.backgroundColor, color: s.color, bc: s.borderTopColor };
  }),
);
if (pills.length >= 2) {
  check("marker active bg (#F26835)", toHex(pills[0].bg), "#f26835");
  check("marker active text (#FED9CC)", toHex(pills[0].color), "#fed9cc");
  check("marker inactive bg (#4A1B0A)", toHex(pills[1].bg), "#4a1b0a");
  check("marker inactive text (#FF9770)", toHex(pills[1].color), "#ff9770");
  check("marker inactive border (#80412B)", toHex(pills[1].bc), "#80412b");
} else {
  failures++;
  report.push("FAIL  marker pills not found");
}

// hamburger (styleguide demo copy — first .h-\[72px\])
const burger = await page.locator('div.h-\\[72px\\], button.h-\\[72px\\]').first().evaluate((n) => {
  const s = getComputedStyle(n);
  return { bg: s.backgroundColor, bc: s.borderTopColor, blr: s.borderBottomLeftRadius, tlr: s.borderTopLeftRadius, w: s.width, h: s.height };
});
check("hamburger bg (primary-3)", toHex(burger.bg), "#341a11");
check("hamburger border (primary-6)", toHex(burger.bc), "#69311d");
report.push(`info  hamburger ${burger.w}×${burger.h}, bl-radius ${burger.blr}, tl-radius ${burger.tlr}`);

const bar = await page.locator(".h-0\\.5").first().evaluate((n) => getComputedStyle(n).backgroundColor);
check("hamburger bar (primary-10)", toHex(bar), "#e45b27");

// first-word cap
const fw = await page.locator(".first-word").first().evaluate((n) => {
  const s = getComputedStyle(n);
  return { fs: s.fontSize, w: s.fontWeight, mt: s.marginTop, mb: s.marginBottom };
});
report.push(`info  .first-word → fs ${fw.fs} weight ${fw.w} mt ${fw.mt} mb ${fw.mb} (spec: 32px / 500 font-medium / -0.5rem)`);
checkNum("first-word size", fw.fs, 32);

// narration wash
const wash = await page.locator(".narration-active").first().evaluate((n) => getComputedStyle(n).backgroundColor);
report.push(`info  narration-active bg → ${wash} (primary-4 = rgb(74,27,10) at 65%)`);

// play icon stroke
const stroke = await page.locator('button[aria-label="Play"] path').getAttribute("stroke");
check("play icon stroke (#F26835 canonical)", stroke, "#F26835");

// player card surfaces
const cards = await page.locator(".frame-2.w-72").evaluateAll((ns) =>
  ns.map((n) => getComputedStyle(n).backgroundColor),
);
if (cards.length >= 2) {
  check("player idle bg (primary-3)", toHex(cards[0]), "#341a11");
  check("player playing bg (primary-4)", toHex(cards[1]), "#4a1b0a");
}

// time pill
const pill = await page.locator(".bg-primary-10.rounded-3xl").first().evaluate((n) => getComputedStyle(n).backgroundColor);
check("time pill bg (primary-10)", toHex(pill), "#e45b27");

// body font family sanity — no Fraunces/Newsreader anywhere
const fonts = await page.evaluate(() => {
  const set = new Set();
  document.querySelectorAll("*").forEach((n) => set.add(getComputedStyle(n).fontFamily));
  return [...set];
});
const bad = fonts.filter((f) => /fraunces|newsreader/i.test(f));
check("no Fraunces/Newsreader in computed families", bad.length === 0 ? "clean" : bad.join("|"), "clean");
report.push("info  families in use: " + fonts.join(" || "));

await browser.close();
console.log(report.join("\n"));
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
process.exit(0);
