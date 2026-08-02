// Phase 2+3 motion audit — M6: prefers-reduced-motion sweep
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase23-motion";
fs.mkdirSync(OUT, { recursive: true });
const B = "http://localhost:4321";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  reducedMotion: "reduce",
});

console.log("=== M6 reduced motion ===");

// Home: static frame, everything visible immediately, video hidden
{
  const p = await ctx.newPage();
  await p.goto(B + "/", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(250);
  const home = await p.evaluate(() => {
    const seqs = [...document.querySelectorAll(".home-seq")].map((e) => getComputedStyle(e).opacity);
    const video = document.querySelector(".home-frame video");
    const img = document.querySelector(".home-frame img");
    return {
      seqOpacities: seqs,
      videoDisplay: video ? getComputedStyle(video).display : null,
      imgDisplay: img ? getComputedStyle(img).display : null,
    };
  });
  console.log("home @250ms:", JSON.stringify(home));
  await p.screenshot({ path: `${OUT}/rm-home.png` });

  // curtain must be skipped: instant nav
  const t0 = Date.now();
  await p.click('a[href="/map"]');
  await p.waitForURL("**/map", { timeout: 3000 });
  console.log("home->map nav (no curtain) in", Date.now() - t0, "ms");
  await p.close();
}

// Bakery: reveals visible, no hero scrub transforms, player states still work
{
  const p = await ctx.newPage();
  await p.goto(B + "/bakery", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const reveals = await p.evaluate(() => {
    const els = [...document.querySelectorAll(".reveal")];
    return {
      total: els.length,
      hidden: els.filter((e) => +getComputedStyle(e).opacity < 0.99).length,
    };
  });
  console.log("bakery reveals:", JSON.stringify(reveals));
  await p.screenshot({ path: `${OUT}/rm-bakery-top.png` });

  // hero scrub disabled?
  await p.evaluate(() => window.scrollTo(0, 900));
  await p.waitForTimeout(700);
  const hero = await p.evaluate(() => ({
    media: getComputedStyle(document.getElementById("hero-media")).transform,
    header: getComputedStyle(document.getElementById("hero-header")).transform,
  }));
  console.log("bakery hero transforms after scroll (want none/none):", JSON.stringify(hero));

  // press-reveal shows tap affordance
  const pr = await p.evaluate(
    () => document.querySelector(".press-reveal")?.textContent.trim() ?? null,
  );
  console.log("press-reveal hint:", pr);

  // player still functions
  await p.evaluate(() =>
    document.querySelector('button[aria-label^="Play narration"]')?.scrollIntoView({ block: "center" }),
  );
  await p.waitForSelector('button[aria-label^="Play narration"]', { timeout: 8000 });
  await p.click('button[aria-label^="Play narration"]');
  await p.waitForTimeout(400);
  const player = await p.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="narration"]');
    const card = btn.closest(".rounded-3xl");
    return {
      label: btn.getAttribute("aria-label").split(":")[0],
      cardBg: card.className.match(/bg-primary-\d/)?.[0],
      paused: document.querySelector("audio").paused,
    };
  });
  console.log("player under RM:", JSON.stringify(player));
  await p.screenshot({ path: `${OUT}/rm-bakery-player.png` });

  // full-page sweep for stuck-hidden content
  const stuck = await p.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 600));
    return [...document.querySelectorAll(".reveal")].filter(
      (e) => +getComputedStyle(e).opacity < 0.99,
    ).length;
  });
  console.log("bakery stuck-hidden reveals after full scroll:", stuck);
  await p.close();
}

// Map: no prologue — settled tilted overview immediately; route full at once; jump on select
{
  const p = await ctx.newPage();
  await p.goto(B + "/map", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/rm-map-1.5s.png` });
  await p.evaluate(() => {
    document.querySelectorAll("button.mapboxgl-marker")[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await p.waitForTimeout(700); // jumpTo = instant; carousel should be up already
  const st = await p.evaluate(() => ({
    slides: document.querySelectorAll(".keen-slider__slide").length,
    overview: [...document.querySelectorAll("button")].some((b) => b.textContent.includes("Overview")),
  }));
  console.log("map after marker click @700ms (jump):", JSON.stringify(st));
  await p.screenshot({ path: `${OUT}/rm-map-jumped.png` });
  await p.close();
}

// Menu: instant open/close
{
  const p = await ctx.newPage();
  await p.goto(B + "/bakery", { waitUntil: "networkidle" });
  await p.click(".cnwm-menu-burger");
  await p.waitForTimeout(120);
  const open = await p.evaluate(() => ({
    panelHidden: document.querySelector(".cnwm-menu-panel").classList.contains("hidden"),
    transform: getComputedStyle(document.querySelector(".cnwm-menu-panel")).transform,
  }));
  console.log("menu open @120ms:", JSON.stringify(open));
  await p.screenshot({ path: `${OUT}/rm-menu-open.png` });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(120);
  const closed = await p.evaluate(() => ({
    panelHidden: document.querySelector(".cnwm-menu-panel").classList.contains("hidden"),
    burgerHidden: document.querySelector(".cnwm-menu-burger").classList.contains("hidden"),
  }));
  console.log("menu closed @120ms:", JSON.stringify(closed));
  await p.close();
}

await browser.close();
console.log("\nM6 done");
