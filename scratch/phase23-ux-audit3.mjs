// Phase 2+3 UX review — audit part 3: keyboard-play retest, stop-5 badge interception
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:4321";
const OUT = fileURLToPath(new URL("../docs/qa/phase23-ux/", import.meta.url));
const log = (...a) => console.log("[AUDIT3]", ...a);

const browser = await chromium.launch({ headless: true });

// A) keyboard Enter on play button, with hydration settle time
const kctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const kpage = await kctx.newPage();
await kpage.goto(BASE + "/bakery", { waitUntil: "networkidle" });
await kpage.evaluate(() =>
  document.querySelector('button[aria-label^="Play narration"]').scrollIntoView({ block: "center" })
);
await kpage.waitForTimeout(3000); // allow client:visible island to hydrate
await kpage.evaluate(() => document.querySelector('button[aria-label^="Play narration"]').focus());
await kpage.keyboard.press("Enter");
await kpage.waitForTimeout(1500);
log(
  "keyboard Enter (after hydration wait):",
  JSON.stringify(
    await kpage.evaluate(() => {
      const a = document.querySelector("audio");
      return { paused: a.paused, t: a.currentTime };
    })
  )
);

// tap-before-hydration probe: mobile, race to tap play ASAP after scroll
const mctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const mpage = await mctx.newPage();
await mpage.goto(BASE + "/bakery", { waitUntil: "domcontentloaded" });
await mpage.evaluate(() =>
  document.querySelector('button[aria-label^="Play narration"]')?.scrollIntoView({ block: "center" })
);
await mpage.waitForTimeout(200);
try {
  await mpage.tap('button[aria-label^="Play narration"]', { timeout: 3000 });
  await mpage.waitForTimeout(800);
  log(
    "instant tap after load:",
    JSON.stringify(
      await mpage.evaluate(() => {
        const a = document.querySelector("audio");
        return a ? { paused: a.paused, t: a.currentTime } : "no audio el";
      })
    )
  );
} catch (e) {
  log("instant tap failed:", e.message.slice(0, 100));
}

// B) stop-5 marker: blocked by top badge / hint?
const page = await mctx.newPage();
await page.goto(BASE + "/map", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
const s5 = await page.evaluate(() => {
  const m = document.querySelector('button[aria-label^="Stop 5"]');
  const r = m.getBoundingClientRect();
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;
  const at = document.elementFromPoint(cx, cy);
  return {
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    center: [Math.round(cx), Math.round(cy)],
    elementAtCenter: at ? (at.tagName + " " + (at.getAttribute("aria-label") || at.className || "").slice(0, 60)) : "null(offscreen)",
    hitsMarker: at ? !!at.closest('button[aria-label^="Stop 5"]') : false,
  };
});
log("stop-5 before hint dismiss:", JSON.stringify(s5, null, 1));
await page.tap('button[aria-label="Dismiss hint"]').catch(() => {});
await page.waitForTimeout(600);
const s5b = await page.evaluate(() => {
  const m = document.querySelector('button[aria-label^="Stop 5"]');
  const r = m.getBoundingClientRect();
  const cx = r.x + r.width / 2;
  const cy = Math.max(r.y + r.height / 2, 1);
  const at = document.elementFromPoint(cx, cy);
  return {
    center: [Math.round(cx), Math.round(cy)],
    elementAtCenter: at ? (at.tagName + " " + (at.getAttribute("aria-label") || at.className || "").slice(0, 60)) : "null",
    hitsMarker: at ? !!at.closest('button[aria-label^="Stop 5"]') : false,
  };
});
log("stop-5 after hint dismiss:", JSON.stringify(s5b, null, 1));

// try actually tapping stop 5
try {
  await page.tap('button[aria-label^="Stop 5"]', { timeout: 4000 });
  await page.waitForTimeout(1500);
  log("stop-5 tap OK ->", page.url());
} catch (e) {
  log("stop-5 tap FAILED:", e.message.split("\n").find((l) => l.includes("intercept")) || e.message.slice(0, 140));
}

// C) does the hint reappear on every visit? (localStorage memory)
await page.goto(BASE + "/map", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
log(
  "hint present on revisit (same session, was dismissed):",
  (await page.locator('button[aria-label="Dismiss hint"]').count()) > 0
);

// D) active card cue: screenshot the focused card zoomed
await page.tap('button[aria-label="Dismiss hint"]').catch(() => {});
await page.waitForTimeout(400);
await page.tap('button[aria-label^="Stop 2"]');
await page.waitForTimeout(2200);
const cardShot = await page.evaluate(() => {
  const active = [...document.querySelectorAll('.keen-slider__slide [role="button"]')].find((c) =>
    c.getAttribute("aria-label")?.startsWith("Enter Chapter")
  );
  const r = active.getBoundingClientRect();
  return { x: Math.max(0, r.x - 8), y: r.y - 8, width: Math.min(390, r.width + 16), height: r.height + 16, label: active.getAttribute("aria-label"), text: active.innerText };
});
log("active card:", JSON.stringify({ label: cardShot.label, text: cardShot.text }));
await page.screenshot({ path: OUT + "c09-active-card-closeup.png", clip: { x: cardShot.x, y: cardShot.y, width: cardShot.width, height: cardShot.height } });

await browser.close();
log("DONE");
