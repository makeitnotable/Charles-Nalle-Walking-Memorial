// Phase 2+3 UX review — Walkthrough B: QR sidewalk arrival (390x844 mobile)
// deep-link /commissioners-office -> orient -> play audio -> find next stop
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:4321";
const OUT = fileURLToPath(new URL("../docs/qa/phase23-ux/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log("[B]", ...a);
const shot = (page, name) => page.screenshot({ path: OUT + name });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
page.on("pageerror", (e) => log("PAGE ERROR:", e.message));

// ---------- STEP 1: arrive from QR plaque ----------
await page.goto(BASE + "/commissioners-office", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await shot(page, "b01-qr-arrival-viewport.png");

// Orientation: what tells me who/where/N-of-M in the initial viewport?
const orient = await page.evaluate(() => {
  const vpText = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.trim();
    if (!t) continue;
    const el = n.parentElement;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (
      r.width > 0 &&
      r.height > 0 &&
      r.top < innerHeight &&
      r.bottom > 0 &&
      cs.visibility !== "hidden" &&
      cs.opacity !== "0"
    )
      vpText.push({ text: t.slice(0, 80), top: Math.round(r.top), fontSize: cs.fontSize });
  }
  return vpText;
});
log("QR arrival viewport text:", JSON.stringify(orient, null, 1));
const fullText = await page.evaluate(() => document.body.innerText);
log('contains "of 5"?', /of 5|of five/i.test(fullText));
log('mentions "Charles Nalle" on page?', /Charles Nalle/.test(fullText));
log(
  'story-context strings found:',
  JSON.stringify(
    ["Chapter", "Stop", "1860", "Walking Memorial"].filter((s) =>
      fullText.includes(s)
    )
  )
);

// ---------- STEP 2: play audio (someone standing on a sidewalk) ----------
// How far must they scroll before the first player is visible?
const play = page.locator('button[aria-label^="Play narration"]').first();
await play.waitFor({ state: "attached", timeout: 15000 });
const pos = await play.evaluate((el) => ({
  docTop: Math.round(el.getBoundingClientRect().top + scrollY),
  vh: innerHeight,
}));
log("first play button document offset:", JSON.stringify(pos), "=> screens below fold:", (pos.docTop / pos.vh).toFixed(2));
await play.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await shot(page, "b02-first-player.png");
await play.tap();
await page.waitForTimeout(1500);
const audioState = await page.evaluate(() =>
  [...document.querySelectorAll("audio")].map((a) => ({
    src: a.getAttribute("src"),
    paused: a.paused,
    t: a.currentTime,
  }))
);
log("audio after tap:", JSON.stringify(audioState));
log("AUDIO PLAY INVOKED:", audioState.some((a) => !a.paused || a.t > 0));
await shot(page, "b03-playing.png");

// keep playing, scroll to read along — mini-player check on this page too
await page.evaluate(() => scrollBy(0, 1400));
await page.waitForTimeout(1000);
const mini = await page.evaluate(() => {
  const els = [...document.querySelectorAll("body *")].filter((e) => {
    const cs = getComputedStyle(e);
    if (cs.position !== "fixed") return false;
    const r = e.getBoundingClientRect();
    return r.width > 200 && r.height > 40 && r.bottom <= innerHeight + 4 && /narration|CHAPTER/i.test(e.innerText || "");
  });
  return els.map((e) => ({
    text: (e.innerText || "").slice(0, 100),
    rect: (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(e.getBoundingClientRect()),
    buttons: [...e.querySelectorAll("button")].map((b) => ({
      label: b.getAttribute("aria-label"),
      w: Math.round(b.getBoundingClientRect().width),
      h: Math.round(b.getBoundingClientRect().height),
    })),
  }));
});
log("mini-player while scrolled:", JSON.stringify(mini, null, 1));
await shot(page, "b04-miniplayer-scrolled.png");

// paragraph tap-to-seek: tap the 3rd paragraph, audio should jump
const para = page.locator("p[data-timing]").nth(2);
await para.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
const before = await page.evaluate(() => document.querySelector("audio").currentTime);
await para.tap();
await page.waitForTimeout(1200);
const after = await page.evaluate(() => document.querySelector("audio").currentTime);
log(`paragraph seek: before=${before.toFixed(1)}s after=${after.toFixed(1)}s (expected ~40.2s)`);
await shot(page, "b05-paragraph-seek.png");

// ---------- STEP 3: find the NEXT stop ----------
// Simulate a user scrolling to the end looking for "what now?"
await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(2500);
await shot(page, "b06-page-end.png");
// find the next-stop block
const nextBlock = page.locator('section[aria-label="Continue the walk"]');
const nextInfo = await nextBlock.evaluate((el) => {
  const links = [...el.querySelectorAll("a")].map((a) => ({
    text: a.innerText.trim(),
    href: a.getAttribute("href"),
    target: a.getAttribute("target"),
    rect: (({ width, height }) => ({ w: Math.round(width), h: Math.round(height) }))(a.getBoundingClientRect()),
  }));
  return { heading: el.querySelector("h2")?.innerText, label: el.querySelector(".type-label")?.innerText, links };
});
log("next-stop block:", JSON.stringify(nextInfo, null, 1));

// scroll the embed map + CTA into view for the screenshot
await nextBlock.scrollIntoViewIfNeeded();
await page.waitForTimeout(2000);
await shot(page, "b07-where-to-next.png");

// distance from top: how much scrolling to find walking directions?
const nextPos = await nextBlock.evaluate((el) => ({
  top: Math.round(el.getBoundingClientRect().top + scrollY),
  docH: document.body.scrollHeight,
  vh: innerHeight,
}));
log("next-stop block position:", JSON.stringify(nextPos), "screens down:", (nextPos.top / nextPos.vh).toFixed(1));

// Verify Get Directions is a Google Maps walking link to stop 3
const dir = nextInfo.links.find((l) => /directions/i.test(l.text));
log("Get Directions ->", dir?.href, "walking mode:", /travelmode=walking/.test(dir?.href || ""));

// ---------- STEP 4: continue to next chapter ----------
await page.tap('a[href="/mansion"]:visible');
await page.waitForURL("**/mansion", { timeout: 10000 });
await page.waitForTimeout(2000);
log("continued to:", page.url());
await shot(page, "b08-next-chapter-mansion.png");

// sanity: mansion page orients as chapter 3 and points to chapter 4
const mansionText = await page.evaluate(() => document.body.innerText);
log("mansion mentions Chapter 4 next:", /Chapter 4/.test(mansionText));

// ---------- Also: last stop (barbershop) — does the loop close? ----------
await page.goto(BASE + "/barbershop", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const barberText = await page.evaluate(() => document.body.innerText);
const tail = barberText.slice(-700);
log("barbershop tail text:", JSON.stringify(tail));
await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(2000);
await shot(page, "b09-barbershop-end.png");

// ---------- ferry (stop 4, no plaque): next-stop path ----------
await page.goto(BASE + "/ferry", { waitUntil: "networkidle" });
const ferryNext = await page.evaluate(() => {
  const el = document.querySelector('section[aria-label="Continue the walk"]');
  return el ? { label: el.querySelector(".type-label")?.innerText, links: [...el.querySelectorAll("a")].map((a) => ({ text: a.innerText.trim(), href: a.getAttribute("href") })) } : null;
});
log("ferry next block:", JSON.stringify(ferryNext));

await browser.close();
log("DONE");
