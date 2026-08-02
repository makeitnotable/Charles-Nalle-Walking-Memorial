// Phase 2+3 motion audit — M4: two-state audio player + mini player + sync
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase23-motion";
fs.mkdirSync(OUT, { recursive: true });
const B = "http://localhost:4321";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(B + "/bakery", { waitUntil: "networkidle" });

// AudioStory hydrates client:visible — scroll it into view
await page.evaluate(() => {
  document.querySelector('button[aria-label^="Play narration"]') ||
    document.querySelector("audio")?.scrollIntoView();
  document.querySelector("audio")?.closest("div")?.scrollIntoView({ block: "center" });
});
await page.waitForSelector('button[aria-label^="Play narration"]', { timeout: 10000 });
await page.evaluate(() =>
  document
    .querySelector('button[aria-label^="Play narration"]')
    .closest(".rounded-3xl")
    .scrollIntoView({ block: "center" }),
);
await page.waitForTimeout(800);

const state = () =>
  page.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="narration"]');
    const card = btn.closest(".rounded-3xl");
    const cover = card.querySelector('[role="img"]');
    const pill = card.querySelector(".bg-primary-10");
    const audio = document.querySelector("audio");
    const spans = [...pill.querySelectorAll("span")].map((s) => ({
      text: s.textContent,
      hidden: s.className.includes("opacity-0"),
    }));
    const active = document.querySelector(".narration-active");
    return {
      btnLabel: btn.getAttribute("aria-label").split(":")[0],
      cardBg: card.className.match(/bg-primary-\d/)?.[0],
      cardBgComputed: getComputedStyle(card).backgroundColor,
      coverScale: cover.className.match(/scale-\d+/)?.[0],
      coverTransform: getComputedStyle(cover).transform,
      pillWidth: Math.round(pill.getBoundingClientRect().width),
      pillSpans: spans,
      audioPaused: audio.paused,
      audioTime: +audio.currentTime.toFixed(2),
      activePara: active ? active.textContent.trim().slice(0, 50) : null,
    };
  });

console.log("=== M4 player two-state ===");
const before = await state();
console.log("before:", JSON.stringify(before, null, 1));
await page.screenshot({ path: `${OUT}/player-idle.png` });

await page.click('button[aria-label^="Play narration"]');
await page.waitForTimeout(150);
console.log("play+150ms:", JSON.stringify(await state()));
await page.waitForTimeout(400); // 300ms transition settled
const playing = await state();
console.log("play+550ms:", JSON.stringify(playing, null, 1));
await page.screenshot({ path: `${OUT}/player-playing.png` });

// let narration run — active paragraph wash should appear
await page.waitForTimeout(2500);
console.log("play+3s (sync):", JSON.stringify(await state()));
await page.screenshot({ path: `${OUT}/player-sync.png` });

// paragraph tap → seek
const seek = await page.evaluate(() => {
  const p = document.querySelector('p[data-timing="3"]');
  p?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  return p ? p.textContent.trim().slice(0, 40) : null;
});
await page.waitForTimeout(600);
const afterSeek = await state();
console.log("after paragraph-3 tap:", seek, "->", JSON.stringify({ t: afterSeek.audioTime, active: afterSeek.activePara }));

// ——— mini player: scroll main button off the top ———
const mini = () =>
  page.evaluate(() => {
    const m = document.querySelector('.fixed.bottom-0.z-\\[999\\], div[class*="z-[999]"]');
    if (!m) return { present: false };
    const s = m.getAttribute("style") || "";
    const card = m.querySelector(".w-72");
    const mainBtn = document.querySelector('button[aria-label*="narration"]');
    const mainCard = mainBtn?.closest(".rounded-3xl");
    return {
      present: true,
      opacity: getComputedStyle(m).opacity,
      pointerEvents: getComputedStyle(m).pointerEvents,
      cardBg: card?.className.match(/bg-primary-\d/)?.[0],
      mainCardOpacity: mainCard ? getComputedStyle(mainCard).opacity : null,
      mainBtnTop: mainBtn ? Math.round(mainBtn.getBoundingClientRect().top) : null,
    };
  });

console.log("\n=== M4 mini player ===");
console.log("at player:", JSON.stringify(await mini()));
await page.evaluate(() => window.scrollBy(0, 2200));
await page.waitForTimeout(600);
console.log("scrolled past:", JSON.stringify(await mini()));
await page.screenshot({ path: `${OUT}/player-mini-visible.png` });
await page.evaluate(() => {
  document.querySelector('button[aria-label*="narration"]').closest(".rounded-3xl").scrollIntoView({ block: "center" });
});
await page.waitForTimeout(600);
console.log("scrolled back:", JSON.stringify(await mini()));
await page.screenshot({ path: `${OUT}/player-mini-hidden.png` });

// pause restores idle state
await page.click('button[aria-label^="Pause narration"]');
await page.waitForTimeout(450);
console.log("\npaused:", JSON.stringify(await state()));
await page.screenshot({ path: `${OUT}/player-paused.png` });

await browser.close();
console.log("\nM4 done");
