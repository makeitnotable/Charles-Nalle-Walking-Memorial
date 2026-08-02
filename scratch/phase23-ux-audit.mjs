// Phase 2+3 UX review — systematic audit (text sizes, tap targets, keyboard,
// press-and-hold fallbacks, map two-tap, no-JS map)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:4321";
const OUT = fileURLToPath(new URL("../docs/qa/phase23-ux/", import.meta.url));
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log("[AUDIT]", ...a);

const browser = await chromium.launch({ headless: true });

// ============ 1) TEXT SIZE + TAP TARGET SWEEP (mobile) ============
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

for (const path of ["/", "/commissioners-office", "/map"]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  // force reveal-all so we can measure everything
  await page.evaluate(() => {
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in"));
    scrollTo(0, 0);
  });
  const small = await page.evaluate(() => {
    const out = [];
    const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent.trim();
      if (t.length < 4) continue;
      const el = n.parentElement;
      if (seen.has(el)) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const r = el.getBoundingClientRect();
      if (r.width === 0 || cs.display === "none" || cs.visibility === "hidden") continue;
      if (el.closest('[aria-hidden="true"], .curtain-text, .skip-link')) continue;
      if (fs < 16)
        out.push({
          fs: fs,
          tag: el.tagName,
          cls: (el.className + "").split(" ").slice(0, 3).join(" "),
          text: t.slice(0, 60),
        });
    }
    // dedupe by cls+fs
    const uniq = [];
    const k = new Set();
    for (const o of out) {
      const key = o.cls + "|" + o.fs;
      if (k.has(key)) continue;
      k.add(key);
      uniq.push(o);
    }
    return uniq;
  });
  log(`SMALL TEXT (<16px) on ${path}:`, JSON.stringify(small, null, 1));

  const targets = await page.evaluate(() => {
    const els = [...document.querySelectorAll('a,button,input,[role="button"]')];
    return els
      .map((e) => {
        const r = e.getBoundingClientRect();
        return {
          tag: e.tagName,
          label: (e.getAttribute("aria-label") || e.innerText || e.type || "")
            .trim()
            .slice(0, 50),
          w: Math.round(r.width),
          h: Math.round(r.height),
        };
      })
      .filter((t) => t.w > 0 && t.h > 0 && (t.w < 24 || t.h < 24));
  });
  log(`TAP TARGETS <24px on ${path}:`, JSON.stringify(targets, null, 1));
}

// menu links tap size (open the menu first)
await page.goto(BASE + "/commissioners-office", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.tap("button.cnwm-menu-burger");
await page.waitForTimeout(800);
const menuLinks = await page.evaluate(() =>
  [...document.querySelectorAll(".cnwm-menu-panel a")].map((a) => {
    const r = a.getBoundingClientRect();
    return { text: a.innerText.trim(), w: Math.round(r.width), h: Math.round(r.height) };
  })
);
log("MENU link sizes:", JSON.stringify(menuLinks, null, 1));
const closeBtn = await page.evaluate(() => {
  const b = document.querySelector(".cnwm-menu-close");
  const r = b.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height) };
});
log("MENU close button:", JSON.stringify(closeBtn));

// scrub bar (paragraph-seek slider) size
const scrub = await page.evaluate(() => {
  const s = document.querySelector("input.cnwm-scrub");
  if (!s) return null;
  const r = s.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height) };
});
log("SCRUB input size:", JSON.stringify(scrub));

// ============ 2) PRESS-AND-HOLD: hint visibility + tap & keyboard fallback ============
await page.goto(BASE + "/commissioners-office", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const pr = page.locator(".press-reveal");
const hint = await page.evaluate(() => {
  const spans = [...document.querySelectorAll(".press-reveal span")];
  const s = spans.find((x) => /press and hold/i.test(x.innerText));
  if (!s) return null;
  const r = s.getBoundingClientRect();
  const cs = getComputedStyle(s);
  // is anything overlapping the hint? (menu burger)
  const mid = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  const burger = document.querySelector(".cnwm-menu-burger");
  const br = burger.getBoundingClientRect();
  const overlap = !(br.right < r.left || br.left > r.right || br.bottom < r.top || br.top > r.bottom);
  return {
    text: s.innerText,
    fontSize: cs.fontSize,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    inViewport: r.bottom <= innerHeight && r.top >= 0,
    burgerOverlapsHint: overlap,
    burgerRect: { x: Math.round(br.x), y: Math.round(br.y), w: Math.round(br.width), h: Math.round(br.height) },
  };
});
log("PRESS-HOLD hint:", JSON.stringify(hint, null, 1));
await page.screenshot({ path: OUT + "c01-presshold-hint.png" });

// short tap fallback: does a quick tap advance the reveal at all?
const opacityBefore = await pr.evaluate((el) => el.querySelectorAll("img")[0].style.opacity);
await pr.tap({ position: { x: 195, y: 300 } });
await page.waitForTimeout(900);
const afterTap = await pr.evaluate((el) => ({
  paintingOpacity: el.querySelectorAll("img")[0].style.opacity,
  ariaPressed: el.getAttribute("aria-pressed"),
}));
log("press-reveal after SHORT TAP (was", opacityBefore + "):", JSON.stringify(afterTap));

// long press via touchscreen: hold ~2.5s
const box = await pr.boundingBox();
const cdp = await page.context().newCDPSession(page);
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: box.x + 195, y: box.y + 300 }],
});
await page.waitForTimeout(500);
const during = await pr.evaluate((el) => ({
  progressBar: el.querySelector('div[style*="scaleX"]')?.getAttribute("style")?.match(/scaleX\([\d.]+\)/)?.[0],
  ariaPressed: el.getAttribute("aria-pressed"),
}));
await page.waitForTimeout(2500);
const afterHold = await pr.evaluate((el) => ({
  paintingOpacity: el.querySelectorAll("img")[0].style.opacity,
  ariaPressed: el.getAttribute("aria-pressed"),
  video: !!el.querySelector("video"),
}));
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
log("press-reveal DURING hold:", JSON.stringify(during));
log("press-reveal AFTER 3s hold:", JSON.stringify(afterHold));
await page.screenshot({ path: OUT + "c02-presshold-after-hold.png" });
// does release keep it revealed or snap back?
await page.waitForTimeout(1200);
const afterRelease = await pr.evaluate((el) => ({
  paintingOpacity: el.querySelectorAll("img")[0].style.opacity,
  ariaPressed: el.getAttribute("aria-pressed"),
}));
log("press-reveal AFTER RELEASE:", JSON.stringify(afterRelease));

// keyboard fallback: focus it and hold Space
await page.evaluate(() => {
  document.querySelector(".press-reveal").focus();
});
await page.keyboard.down(" ");
await page.waitForTimeout(2800);
const afterKey = await pr.evaluate((el) => ({
  paintingOpacity: el.querySelectorAll("img")[0].style.opacity,
  ariaPressed: el.getAttribute("aria-pressed"),
}));
await page.keyboard.up(" ");
log("press-reveal AFTER SPACE-HOLD:", JSON.stringify(afterKey));

// ============ 3) MAP TWO-TAP CARD BEHAVIOR ============
await page.goto(BASE + "/map", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
// dismiss hint to unblock
const hintBtn = page.locator('button[aria-label="Dismiss hint"]');
if ((await hintBtn.count()) > 0) await hintBtn.tap().catch(() => {});
await page.waitForTimeout(500);

// Tap "Take the walk" — what happens?
const takeWalk = page.locator('button:has-text("Take the walk")');
if ((await takeWalk.count()) > 0) {
  await takeWalk.tap();
  await page.waitForTimeout(2500);
  log("after 'Take the walk' tap, URL:", page.url());
  await page.screenshot({ path: OUT + "c03-take-the-walk.png" });
}

// is the card slider now visible? tap the visible card once -> ? twice -> ?
const card = page.locator(".keen-slider__slide").first();
if ((await card.count()) > 0) {
  const cardHtml = await card.evaluate((el) => el.outerHTML.slice(0, 600));
  log("CARD[0] html head:", cardHtml);
  const urlBefore = page.url();
  await card.tap();
  await page.waitForTimeout(1800);
  log("after card tap 1:", page.url(), "(was", urlBefore + ")");
  await page.screenshot({ path: OUT + "c04-card-tap1.png" });
  await card.tap();
  await page.waitForTimeout(3000);
  log("after card tap 2:", page.url());
  await page.screenshot({ path: OUT + "c05-card-tap2.png" });
  // any visible cue that a second tap navigates?
  if (page.url().includes("/map")) {
    const cue = await page.evaluate(() => {
      const c = document.querySelector(".keen-slider__slide");
      return c ? c.innerText : null;
    });
    log("card text (looking for 'open/enter/tap' cue):", JSON.stringify(cue));
  }
}

// back/overview from focused state
if (page.url().includes("/map")) {
  const overview = page.locator('button:has-text("Overview"), a:has-text("Overview")');
  log("Overview control present:", (await overview.count()) > 0);
}

// ============ 4) KEYBOARD PASS (desktop-ish, still 390 viewport) ============
const kctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const kpage = await kctx.newPage();
await kpage.goto(BASE + "/", { waitUntil: "networkidle" });
await kpage.waitForTimeout(2200);
const tabTrail = [];
for (let i = 0; i < 8; i++) {
  await kpage.keyboard.press("Tab");
  await kpage.waitForTimeout(150);
  const info = await kpage.evaluate(() => {
    const a = document.activeElement;
    const cs = getComputedStyle(a);
    return {
      tag: a.tagName,
      label: (a.getAttribute("aria-label") || a.innerText || "").trim().slice(0, 40),
      outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor,
      boxShadow: cs.boxShadow.slice(0, 60),
    };
  });
  tabTrail.push(info);
}
log("HOME tab trail:", JSON.stringify(tabTrail, null, 1));
await kpage.screenshot({ path: OUT + "c06-home-focus-visible.png" });

// operate menu by keyboard: focus burger, Enter, tab in panel, Escape
await kpage.evaluate(() => document.querySelector(".cnwm-menu-burger").focus());
await kpage.keyboard.press("Enter");
await kpage.waitForTimeout(800);
let menuState = await kpage.evaluate(() => ({
  open: !document.querySelector(".cnwm-menu-panel").classList.contains("hidden"),
  focused: document.activeElement.tagName + ":" + (document.activeElement.innerText || document.activeElement.getAttribute("aria-label") || "").slice(0, 30),
}));
log("menu after Enter:", JSON.stringify(menuState));
await kpage.keyboard.press("Tab");
await kpage.keyboard.press("Tab");
const inPanel = await kpage.evaluate(() => ({
  focused: (document.activeElement.innerText || document.activeElement.getAttribute("aria-label") || "").slice(0, 30),
  insidePanel: !!document.activeElement.closest(".cnwm-menu-panel"),
}));
log("focus after 2 tabs:", JSON.stringify(inPanel));
await kpage.screenshot({ path: OUT + "c07-menu-keyboard.png" });
await kpage.keyboard.press("Escape");
await kpage.waitForTimeout(600);
menuState = await kpage.evaluate(() => ({
  open: !document.querySelector(".cnwm-menu-panel").classList.contains("hidden"),
  focusAfterEsc: document.activeElement.getAttribute("aria-label") || document.activeElement.tagName,
}));
log("menu after Escape:", JSON.stringify(menuState));

// chapter page: tab to press-reveal and players
await kpage.goto(BASE + "/commissioners-office", { waitUntil: "networkidle" });
await kpage.waitForTimeout(2000);
const chTrail = [];
for (let i = 0; i < 10; i++) {
  await kpage.keyboard.press("Tab");
  await kpage.waitForTimeout(120);
  const info = await kpage.evaluate(() => {
    const a = document.activeElement;
    const cs = getComputedStyle(a);
    return {
      tag: a.tagName,
      label: (a.getAttribute("aria-label") || a.innerText || "").trim().slice(0, 45),
      outlineVisible: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
    };
  });
  chTrail.push(info);
}
log("CHAPTER tab trail:", JSON.stringify(chTrail, null, 1));

// paragraph-seek by keyboard? are p[data-timing] focusable?
const paraKb = await kpage.evaluate(() => {
  const p = document.querySelector("p[data-timing]");
  return { tabindex: p?.getAttribute("tabindex"), role: p?.getAttribute("role") };
});
log("paragraph-seek keyboard access:", JSON.stringify(paraKb));

// ============ 5) NO-JS MAP PAGE ============
const njctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  javaScriptEnabled: false,
});
const njpage = await njctx.newPage();
await njpage.goto(BASE + "/map", { waitUntil: "load" });
await njpage.waitForTimeout(1000);
const njList = await njpage.evaluate(() => {
  const sec = document.querySelector('section[aria-label="The five stops"]');
  if (!sec) return { present: false };
  const links = [...sec.querySelectorAll("a")].map((a) => {
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    return {
      href: a.getAttribute("href"),
      visible: r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.5,
      h: Math.round(r.height),
    };
  });
  return { present: true, links };
});
log("NO-JS map stop list:", JSON.stringify(njList, null, 1));
await njpage.screenshot({ path: OUT + "c08-map-nojs.png", fullPage: true });

// what does the top of the no-JS map page look like (dead map area?)
const njTop = await njpage.evaluate(() => {
  const isl = document.querySelector("astro-island");
  const r = isl?.getBoundingClientRect();
  return { islandBox: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null, bodyStart: document.body.innerText.trim().slice(0, 120) };
});
log("NO-JS map top state:", JSON.stringify(njTop));

await browser.close();
log("DONE");
