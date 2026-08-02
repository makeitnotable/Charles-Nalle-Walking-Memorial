// Phase 2+3 UX review — audit part 2: map card semantics, keyboard, no-JS
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:4321";
const OUT = fileURLToPath(new URL("../docs/qa/phase23-ux/", import.meta.url));
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log("[AUDIT2]", ...a);

const browser = await chromium.launch({ headless: true });

const slideState = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".keen-slider__slide")].map((s, i) => {
      const inner = s.querySelector('[role="button"]');
      const r = s.getBoundingClientRect();
      return {
        i,
        label: inner?.getAttribute("aria-label"),
        scale: s.querySelector("div")?.className.match(/scale-\d+/)?.[0],
        x: Math.round(r.x),
        w: Math.round(r.width),
      };
    })
  );

// ---------- A) map card two-tap semantics ----------
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
await page.goto(BASE + "/map", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
await page.tap('button[aria-label="Dismiss hint"]').catch(() => {});
await page.waitForTimeout(600);

// Probe 1: tap "Take the walk"
await page.tap('button:has-text("Take the walk")');
await page.waitForTimeout(2500);
log("after Take the walk URL:", page.url());
log("slides after Take the walk:", JSON.stringify(await slideState(page), null, 1));
await page.screenshot({ path: OUT + "c03-take-the-walk.png" });

// which slide is under the viewport center-bottom (the visible card)?
const visCard = await page.evaluate(() => {
  const el = document.elementFromPoint(195, 780);
  const slide = el?.closest(".keen-slider__slide");
  return slide?.querySelector('[role="button"]')?.getAttribute("aria-label") || (el?.tagName + "." + el?.className).slice(0, 80);
});
log("element at (195,780):", visCard);

// tap the VISIBLE (active) card once
const urlBefore = page.url();
await page.touchscreen.tap(195, 780);
await page.waitForTimeout(2500);
log("tap on visible card ->", page.url(), "(was", urlBefore + ")");
await page.screenshot({ path: OUT + "c04-activecard-tap.png" });

// Probe 2: fresh map — tap marker 3, then tap a SIDE card (non-active)
await page.goto(BASE + "/map", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.tap('button[aria-label="Dismiss hint"]').catch(() => {});
await page.waitForTimeout(500);
await page.tap('button[aria-label^="Stop 3"]');
await page.waitForTimeout(2000);
log("after marker-3 tap URL:", page.url());
log("slides:", JSON.stringify(await slideState(page), null, 1));
// side card: find a slide whose center is off to the right
const side = await page.evaluate(() => {
  const slides = [...document.querySelectorAll(".keen-slider__slide")];
  const s = slides.find((sl) => {
    const r = sl.getBoundingClientRect();
    return r.x > 300 && r.x < 500;
  });
  if (!s) return null;
  const r = s.getBoundingClientRect();
  return {
    label: s.querySelector('[role="button"]')?.getAttribute("aria-label"),
    x: Math.round(r.x),
    y: Math.round(r.y),
    h: Math.round(r.height),
  };
});
log("side card:", JSON.stringify(side));
if (side) {
  await page.touchscreen.tap(Math.min(side.x + 30, 385), side.y + side.h / 2);
  await page.waitForTimeout(2000);
  log("after SIDE card tap URL:", page.url());
  log("slides now:", JSON.stringify(await slideState(page), null, 1));
  await page.screenshot({ path: OUT + "c05-sidecard-tap.png" });
  // now tap the newly-centered card (second tap of the two-tap pattern)
  const active = await page.evaluate(() => {
    const el = document.elementFromPoint(195, 780);
    return el?.closest(".keen-slider__slide")?.querySelector('[role="button"]')?.getAttribute("aria-label");
  });
  log("card now at center:", active);
  await page.touchscreen.tap(195, 780);
  await page.waitForTimeout(2500);
  log("after second tap URL:", page.url());
}

// Overview / back control presence when focused
await page.goto(BASE + "/map?stop=mansion", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const overviewBtn = await page.evaluate(() => {
  const els = [...document.querySelectorAll("button, a")];
  const o = els.find((e) => /overview/i.test(e.innerText || ""));
  if (!o) return null;
  const r = o.getBoundingClientRect();
  return { text: o.innerText.trim(), w: Math.round(r.width), h: Math.round(r.height) };
});
log("Overview control on deep-linked focus:", JSON.stringify(overviewBtn));
log("deep-link ?stop=mansion focuses stop:", await page.evaluate(() => {
  const el = document.elementFromPoint(195, 780);
  return el?.closest(".keen-slider__slide")?.querySelector('[role="button"]')?.getAttribute("aria-label") || "none";
}));

// ---------- B) keyboard pass (fresh contexts) ----------
const kctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const kpage = await kctx.newPage();
await kpage.goto(BASE + "/", { waitUntil: "networkidle" });
await kpage.waitForTimeout(2200);
const tabTrail = [];
for (let i = 0; i < 6; i++) {
  await kpage.keyboard.press("Tab");
  await kpage.waitForTimeout(150);
  tabTrail.push(
    await kpage.evaluate(() => {
      const a = document.activeElement;
      const cs = getComputedStyle(a);
      return {
        tag: a.tagName,
        label: (a.getAttribute("aria-label") || a.innerText || "").trim().slice(0, 40),
        outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 ? cs.outlineWidth + " " + cs.outlineColor : "NONE",
      };
    })
  );
}
log("HOME tab trail (desktop):", JSON.stringify(tabTrail, null, 1));
await kpage.keyboard.press("Shift+Tab"); // back to burger vicinity not needed; directly:
await kpage.evaluate(() => document.querySelector(".cnwm-menu-burger").focus());
await kpage.keyboard.press("Enter");
await kpage.waitForTimeout(900);
log(
  "menu open after Enter:",
  await kpage.evaluate(() => !document.querySelector(".cnwm-menu-panel").classList.contains("hidden"))
);
await kpage.keyboard.press("Tab");
await kpage.keyboard.press("Tab");
log(
  "focus in panel after tabs:",
  JSON.stringify(
    await kpage.evaluate(() => ({
      label: (document.activeElement.innerText || document.activeElement.getAttribute("aria-label") || "").slice(0, 30),
      inPanel: !!document.activeElement.closest(".cnwm-menu-panel"),
      outlineVisible: (() => { const cs = getComputedStyle(document.activeElement); return cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0; })(),
    }))
  )
);
await kpage.screenshot({ path: OUT + "c07-menu-keyboard.png" });
await kpage.keyboard.press("Escape");
await kpage.waitForTimeout(700);
log(
  "menu closed after Escape:",
  await kpage.evaluate(() => document.querySelector(".cnwm-menu-panel").classList.contains("hidden"))
);

// chapter page keyboard: fresh page, tab to press-reveal, Space-hold
const kpage2 = await kctx.newPage();
await kpage2.goto(BASE + "/commissioners-office", { waitUntil: "networkidle" });
await kpage2.waitForTimeout(2200);
const chTrail = [];
for (let i = 0; i < 6; i++) {
  await kpage2.keyboard.press("Tab");
  await kpage2.waitForTimeout(120);
  chTrail.push(
    await kpage2.evaluate(() => {
      const a = document.activeElement;
      const cs = getComputedStyle(a);
      return {
        tag: a.tagName,
        label: (a.getAttribute("aria-label") || a.innerText || "").trim().slice(0, 45),
        outlineVisible: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
      };
    })
  );
}
log("CHAPTER tab trail:", JSON.stringify(chTrail, null, 1));

// clean keyboard press-and-hold: focus press-reveal, hold Space
await kpage2.evaluate(() => document.querySelector(".press-reveal").focus());
const preKey = await kpage2.evaluate(() => document.querySelector(".press-reveal").getAttribute("aria-pressed"));
await kpage2.keyboard.down(" ");
await kpage2.waitForTimeout(2800);
await kpage2.keyboard.up(" ");
const postKey = await kpage2.evaluate(() => ({
  ariaPressed: document.querySelector(".press-reveal").getAttribute("aria-pressed"),
  video: !!document.querySelector(".press-reveal video"),
}));
log("press-reveal keyboard: before=", preKey, "after Space-hold:", JSON.stringify(postKey));

// also: quick single Space press (no hold) — any feedback?
const kpage3 = await kctx.newPage();
await kpage3.goto(BASE + "/bakery", { waitUntil: "networkidle" });
await kpage3.waitForTimeout(2000);
await kpage3.evaluate(() => document.querySelector(".press-reveal").focus());
await kpage3.keyboard.press(" ");
await kpage3.waitForTimeout(1000);
log(
  "press-reveal after quick Space tap:",
  JSON.stringify(
    await kpage3.evaluate(() => ({
      ariaPressed: document.querySelector(".press-reveal").getAttribute("aria-pressed"),
      video: !!document.querySelector(".press-reveal video"),
    }))
  )
);

// audio player keyboard: tab to play button and press Enter
const playFocus = await kpage3.evaluate(() => {
  const b = document.querySelector('button[aria-label^="Play narration"]');
  b.scrollIntoView({ block: "center" });
  b.focus();
  const cs = getComputedStyle(b);
  return { outlineVisible: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 };
});
await kpage3.keyboard.press("Enter");
await kpage3.waitForTimeout(1200);
log(
  "audio via keyboard Enter:",
  JSON.stringify({
    ...playFocus,
    playing: await kpage3.evaluate(() => {
      const a = document.querySelector("audio");
      return a && !a.paused;
    }),
  })
);

// scrub slider keyboard: arrow keys work on range input?
await kpage3.evaluate(() => document.querySelector("input.cnwm-scrub").focus());
const t0 = await kpage3.evaluate(() => document.querySelector("audio").currentTime);
await kpage3.keyboard.press("ArrowRight");
await kpage3.keyboard.press("ArrowRight");
await kpage3.waitForTimeout(600);
const t1 = await kpage3.evaluate(() => document.querySelector("audio").currentTime);
log("scrub keyboard: t0=", t0.toFixed(1), "t1=", t1.toFixed(1));

// ---------- C) no-JS map ----------
const njctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
const njpage = await njctx.newPage();
await njpage.goto(BASE + "/map", { waitUntil: "load" });
await njpage.waitForTimeout(800);
const njList = await njpage.evaluate(() => {
  const sec = document.querySelector('section[aria-label="The five stops"]');
  if (!sec) return { present: false };
  const secTop = Math.round(sec.getBoundingClientRect().top);
  const links = [...sec.querySelectorAll("a")].map((a) => {
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    return { href: a.getAttribute("href"), visible: r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.5, h: Math.round(r.height) };
  });
  return { present: true, secTop, links };
});
log("NO-JS map stop list:", JSON.stringify(njList, null, 1));
await njpage.screenshot({ path: OUT + "c08-map-nojs.png", fullPage: true });

// no-JS chapter page: is story text readable? audio unusable (react island) — fallback?
await njpage.goto(BASE + "/commissioners-office", { waitUntil: "load" });
await njpage.waitForTimeout(800);
const njCh = await njpage.evaluate(() => {
  const paras = [...document.querySelectorAll("p[data-timing]")];
  const vis = paras.filter((p) => { const cs = getComputedStyle(p); return parseFloat(cs.opacity) > 0.5 && cs.display !== "none"; });
  const playBtn = document.querySelector('button[aria-label^="Play narration"]');
  const nextCta = [...document.querySelectorAll("a")].find((a) => /continue the walk/i.test(a.innerText));
  return { storyParas: paras.length, visibleParas: vis.length, playBtnPresent: !!playBtn, nextCtaPresent: !!nextCta };
});
log("NO-JS chapter page:", JSON.stringify(njCh));

await browser.close();
log("DONE");
