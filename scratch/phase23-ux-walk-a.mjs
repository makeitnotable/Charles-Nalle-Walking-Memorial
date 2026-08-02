// Phase 2+3 UX review — Walkthrough A: first-time home visitor (390x844 mobile)
// land on / -> understand -> reach a chapter -> play audio -> reach the map -> focus stop 2
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:4321";
const OUT = fileURLToPath(new URL("../docs/qa/phase23-ux/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log("[A]", ...a);
const shot = (page, name) =>
  page.screenshot({ path: OUT + name, fullPage: false });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();
page.on("console", (m) => {
  if (m.type() === "error") log("CONSOLE ERROR:", m.text());
});
page.on("pageerror", (e) => log("PAGE ERROR:", e.message));

// ---------- STEP 1: land on home ----------
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2200); // let entrance animation settle
await shot(page, "a01-home-landing.png");

// what does a first-timer see above the fold?
const homeText = await page.evaluate(() => document.body.innerText);
log("HOME innerText:", JSON.stringify(homeText.slice(0, 500)));
const ctas = await page.$$eval("a", (as) =>
  as
    .filter((a) => {
      const r = a.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < innerHeight;
    })
    .map((a) => ({
      text: a.innerText.trim().slice(0, 60),
      href: a.getAttribute("href"),
      rect: (({ x, y, width, height }) => ({
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(width),
        h: Math.round(height),
      }))(a.getBoundingClientRect()),
    }))
);
log("HOME visible links:", JSON.stringify(ctas, null, 1));

// ---------- STEP 2: tap Continue (tap #1) ----------
await page.tap('a[href="/map"]:has-text("Continue")');
await page.waitForURL("**/map", { timeout: 10000 });
await page.waitForTimeout(3500); // map tiles + curtain
await shot(page, "a02-map-after-continue.png");
log("Continue -> URL:", page.url());

// what's visible on the map page viewport for a newcomer?
const mapVp = await page.evaluate(() => {
  const els = [...document.querySelectorAll("a,button,.mapboxgl-marker")];
  return els
    .filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0;
    })
    .map((e) => ({
      tag: e.tagName,
      cls: (e.className + "").slice(0, 60),
      label: (e.getAttribute("aria-label") || e.innerText || "")
        .trim()
        .slice(0, 70),
      rect: (({ x, y, width, height }) => ({
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(width),
        h: Math.round(height),
      }))(e.getBoundingClientRect()),
    }));
});
log("MAP viewport interactables:", JSON.stringify(mapVp, null, 1));

// dump full map page structure (markers, cards, buttons)
const markerInfo = await page.evaluate(() => {
  const markers = [...document.querySelectorAll(".mapboxgl-marker")];
  return markers.map((m) => ({
    html: m.outerHTML.slice(0, 400),
    rect: (({ x, y, width, height }) => ({
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(width),
      h: Math.round(height),
    }))(m.getBoundingClientRect()),
  }));
});
log("MARKERS:", JSON.stringify(markerInfo, null, 1));

// ---------- STEP 3: reach a chapter from the map ----------
// A newcomer's most obvious route: is there a visible card/CTA in the initial
// viewport, or must they discover markers / scroll to the list?
// First try: tap marker for stop 1 (bakery). Record what one tap does.
const marker1 = page.locator(".mapboxgl-marker", { hasText: "1" }).first();
let usedMarkerPath = false;
if ((await marker1.count()) > 0) {
  usedMarkerPath = true;
  await marker1.tap();
  await page.waitForTimeout(1600);
  await shot(page, "a03-map-tap-marker1-first.png");
  log("after 1st marker tap URL:", page.url());
  const cardState = await page.evaluate(() => {
    // look for any focused stop card / popup
    const cand = [
      ...document.querySelectorAll(
        ".mapboxgl-popup, [class*=card], [class*=slide], [class*=keen]"
      ),
    ];
    return cand
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 40 && r.height > 40 && r.top < innerHeight;
      })
      .map((e) => ({
        cls: (e.className + "").slice(0, 80),
        text: (e.innerText || "").trim().slice(0, 140),
      }))
      .slice(0, 8);
  });
  log("card state after first marker tap:", JSON.stringify(cardState, null, 1));
}
log("marker path used:", usedMarkerPath);

// Scroll down to the static list (the discoverable fallback) and use it.
await page.evaluate(() =>
  document
    .querySelector('section[aria-label="The five stops"]')
    ?.scrollIntoView({ block: "start" })
);
await page.waitForTimeout(1200);
await shot(page, "a04-map-stop-list.png");

// tap Bakery card (tap #2 or #3 depending on path)
await page.tap('section[aria-label="The five stops"] a[href="/bakery"]');
await page.waitForURL("**/bakery", { timeout: 10000 });
await page.waitForTimeout(2500);
await shot(page, "a05-bakery-hero.png");
log("chapter reached:", page.url());

// ---------- STEP 4: play audio ----------
// where is the first play button relative to the landing viewport?
const playBtn = page.locator('button[aria-label^="Play narration"]').first();
await playBtn.waitFor({ state: "attached", timeout: 10000 });
const btnBox = await playBtn.evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.top + scrollY), vh: innerHeight };
});
log("first play button offset from top of page:", JSON.stringify(btnBox));
await playBtn.scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await shot(page, "a06-bakery-player.png");
await playBtn.tap();
await page.waitForTimeout(1500);
const audioState = await page.evaluate(() => {
  const audios = [...document.querySelectorAll("audio")];
  return audios.map((a) => ({
    src: a.getAttribute("src"),
    paused: a.paused,
    currentTime: a.currentTime,
    readyState: a.readyState,
  }));
});
log("audio elements after play tap:", JSON.stringify(audioState, null, 1));
const anyPlaying = audioState.some((a) => !a.paused || a.currentTime > 0);
log("AUDIO PLAY INVOKED:", anyPlaying);
await shot(page, "a07-bakery-playing.png");

// does a pause affordance appear? (button label should flip)
const btnLabelNow = await page.evaluate(() =>
  [...document.querySelectorAll("button")]
    .map((b) => b.getAttribute("aria-label"))
    .filter((l) => l && /narration|pause|play/i.test(l))
);
log("player button labels after tap:", JSON.stringify(btnLabelNow));

// mini-player persistence: scroll away while playing
await page.evaluate(() => scrollBy(0, 1800));
await page.waitForTimeout(1200);
await shot(page, "a08-bakery-scrolled-during-play.png");
const miniPlayer = await page.evaluate(() => {
  const els = [...document.querySelectorAll("body *")];
  return els
    .filter((e) => {
      const cs = getComputedStyle(e);
      if (cs.position !== "fixed" && cs.position !== "sticky") return false;
      const r = e.getBoundingClientRect();
      return (
        r.width > 60 &&
        r.height > 30 &&
        r.top < innerHeight &&
        r.bottom > 0 &&
        /play|pause|audio|narration|player|scrub|min/i.test(
          e.outerHTML.slice(0, 900)
        )
      );
    })
    .map((e) => ({
      cls: (e.className + "").slice(0, 90),
      text: (e.innerText || "").trim().slice(0, 90),
      rect: (({ x, y, width, height }) => ({
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(width),
        h: Math.round(height),
      }))(e.getBoundingClientRect()),
    }));
});
log("mini-player candidates while scrolled:", JSON.stringify(miniPlayer, null, 1));

// ---------- STEP 5: reach the map again ----------
// obvious route for a user mid-chapter: the menu (bottom-right burger)
await page.tap("button.cnwm-menu-burger");
await page.waitForTimeout(900);
await shot(page, "a09-bakery-menu-open.png");
const menuOpen = await page.evaluate(() => {
  const p = document.querySelector(".cnwm-menu-panel");
  return p && !p.classList.contains("hidden");
});
log("menu open:", menuOpen);

// recovery probe: close it again with the close button (wrong-tap recovery)
await page.tap("button.cnwm-menu-close");
await page.waitForTimeout(700);
const menuClosed = await page.evaluate(() =>
  document.querySelector(".cnwm-menu-panel")?.classList.contains("hidden")
);
log("menu closes cleanly (recovery):", menuClosed);

// reopen and go to The Walk
await page.tap("button.cnwm-menu-burger");
await page.waitForTimeout(700);
await page.tap('.cnwm-menu-panel a[href="/map"]');
await page.waitForURL("**/map", { timeout: 10000 });
await page.waitForTimeout(3500);
await shot(page, "a10-map-via-menu.png");

// ---------- STEP 6: focus stop 2 on the map ----------
const marker2 = page.locator(".mapboxgl-marker", { hasText: "2" }).first();
if ((await marker2.count()) === 0) {
  log("NO marker with text 2 found — dumping markers");
  log(
    await page.evaluate(() =>
      [...document.querySelectorAll(".mapboxgl-marker")].map((m) =>
        m.outerHTML.slice(0, 200)
      )
    )
  );
} else {
  const m2box = await marker2.boundingBox();
  log("marker2 bbox:", JSON.stringify(m2box));
  // Document the hint-overlay interception first (finding): try a quick tap
  let intercepted = false;
  try {
    await marker2.tap({ timeout: 3000 });
  } catch (e) {
    intercepted = true;
    log("FINDING: tap on marker 2 intercepted by hint overlay:", e.message.split("\n").find((l) => l.includes("intercepts")) || e.message.slice(0, 120));
  }
  log("marker2 first tap intercepted by hint:", intercepted);
  if (intercepted) {
    await shot(page, "a11a-map-hint-blocks-marker2.png");
    // does the hint dismiss on map interaction (drag)? try a small drag first
    await page.touchscreen.tap(195, 500); // tap empty map area
    await page.waitForTimeout(1200);
    const hintStill = await page
      .locator('button[aria-label="Dismiss hint"]')
      .count();
    log("hint still present after tapping empty map:", hintStill > 0);
    if (hintStill > 0) {
      await page.tap('button[aria-label="Dismiss hint"]');
      await page.waitForTimeout(800);
      log("dismissed hint via its 32px close button");
    }
  }
  await marker2.tap();
  await page.waitForTimeout(1800);
  await shot(page, "a11-map-stop2-focused.png");
  log("URL after first tap on marker 2:", page.url());
  const focusedCard = await page.evaluate(() => {
    const els = [...document.querySelectorAll("body *")];
    return els
      .filter((e) => {
        const t = (e.innerText || "").trim();
        return (
          t.startsWith("Office of the Commissioner") ||
          /Commissioner/.test(t.slice(0, 60))
        );
      })
      .slice(0, 3)
      .map((e) => ({
        cls: (e.className + "").slice(0, 80),
        text: (e.innerText || "").trim().slice(0, 160),
        rect: (({ x, y, width, height }) => ({
          x: Math.round(x),
          y: Math.round(y),
          w: Math.round(width),
          h: Math.round(height),
        }))(e.getBoundingClientRect()),
      }));
  });
  log("focused stop-2 card:", JSON.stringify(focusedCard, null, 1));

  // second tap on same marker — does it navigate? (two-tap behavior)
  await marker2.tap();
  await page.waitForTimeout(2500);
  log("URL after second tap on marker 2:", page.url());
  await shot(page, "a12-map-stop2-second-tap.png");
}

// back/overview recovery: browser back
await page.goBack().catch(() => {});
await page.waitForTimeout(1500);
log("after back URL:", page.url());

await browser.close();
log("DONE");
