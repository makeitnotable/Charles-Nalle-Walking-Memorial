// Phase 6 FINAL UX gate — P1 fix verification on LIVE (390x844 mobile touch)
// Fix 1: map hint no longer eats taps (passthrough + auto-dismiss on first map touch + bottom)
// Fix 2: press-and-hold hint clear of burger + un-clipped at 390
// Fix 3: chapter orientation line "Charles Nalle Walking Memorial · Troy, NY · Stop N of 5"
// Fix 4: narration scrub 24px hit area + visible "Tap any paragraph..." line
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const OUT = fileURLToPath(new URL("../docs/qa/phase6-ux/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log("[FIX]", ...a);
const browser = await chromium.launch({ headless: true });

const newCtx = () =>
  browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });

const rect = (r) => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), top: Math.round(r.top) });

async function mapState(page) {
  return page.evaluate(() => {
    const R = (r) => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) });
    const hintP = [...document.querySelectorAll("p")].find((p) => /Drag to explore/.test(p.textContent));
    const pill = hintP ? hintP.closest("div") : null;
    const container = pill ? pill.parentElement : null;
    const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => ({
      label: (m.getAttribute("aria-label") || m.innerText || "").trim().slice(0, 60),
      rect: R(m.getBoundingClientRect()),
    }));
    return {
      hintPresent: !!hintP,
      hintPillRect: pill ? R(pill.getBoundingClientRect()) : null,
      hintContainerPE: container ? getComputedStyle(container).pointerEvents : null,
      hintPillPE: pill ? getComputedStyle(pill).pointerEvents : null,
      markers,
      vh: innerHeight,
      vw: innerWidth,
      url: location.pathname + location.search,
    };
  });
}

// ————— FIX 1a: hint position + tap on the topmost marker (old hint band) —————
{
  const ctx = await newCtx();
  const page = await ctx.newPage();
  page.on("pageerror", (e) => log("PAGE ERROR:", e.message));
  page.on("console", (m) => m.type() === "error" && log("CONSOLE ERROR:", m.text().slice(0, 200)));
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(9000); // let the prologue flight land (idle)
  const st = await mapState(page);
  log("1a hint present after settle:", st.hintPresent);
  log("1a hint pill rect:", JSON.stringify(st.hintPillRect), "container PE:", st.hintContainerPE, "pill PE:", st.hintPillPE);
  log("1a hint in bottom half:", st.hintPillRect ? st.hintPillRect.top > st.vh / 2 : null);
  log("1a markers:", JSON.stringify(st.markers, null, 1));
  // overlap: does any marker intersect the hint pill?
  if (st.hintPillRect) {
    const overl = st.markers.filter((m) => {
      const a = m.rect, b = st.hintPillRect;
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    });
    log("1a markers overlapping hint pill:", JSON.stringify(overl.map((m) => m.label)));
  }
  await page.screenshot({ path: OUT + "f1a-map-initial-hint.png" });

  // tap the TOPMOST marker (the band the old hint used to cover)
  const topMarker = [...st.markers].sort((a, b) => a.rect.top - b.rect.top)[0];
  log("1a tapping topmost marker:", topMarker.label, JSON.stringify(topMarker.rect));
  await page.touchscreen.tap(topMarker.rect.x + topMarker.rect.w / 2, topMarker.rect.y + topMarker.rect.h / 2);
  await page.waitForTimeout(2500);
  const after = await mapState(page);
  log("1a URL after tap:", after.url, "| hint gone:", !after.hintPresent);
  await page.screenshot({ path: OUT + "f1b-map-after-top-marker-tap.png" });
  await ctx.close();
}

// ————— FIX 1b: fresh session — tap EMPTY map after settle: hint must vanish —————
{
  const ctx = await newCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(9000);
  const st = await mapState(page);
  if (!st.hintPresent) log("1b SKIP: hint not present on fresh session?");
  // pick an empty map point: middle of viewport, not on any marker/hint/card
  const candidates = [ [195, 260], [110, 320], [280, 300], [195, 200] ];
  const clear = candidates.find(([x, y]) =>
    !st.markers.some((m) => x >= m.rect.x - 8 && x <= m.rect.x + m.rect.w + 8 && y >= m.rect.y - 8 && y <= m.rect.y + m.rect.h + 8) &&
    !(st.hintPillRect && x >= st.hintPillRect.x && x <= st.hintPillRect.x + st.hintPillRect.w && y >= st.hintPillRect.y && y <= st.hintPillRect.y + st.hintPillRect.h)
  );
  log("1b tapping empty map at:", JSON.stringify(clear));
  const under = await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.tagName + "." + (el.className + "").slice(0, 60) : null;
  }, clear);
  log("1b element at empty point:", under);
  await page.touchscreen.tap(clear[0], clear[1]);
  await page.waitForTimeout(1500);
  const after = await mapState(page);
  log("1b hint gone after first empty-map touch:", !after.hintPresent);
  await page.screenshot({ path: OUT + "f1c-map-after-empty-tap.png" });
  await ctx.close();
}

// ————— FIX 1c: fresh session — what does a tap ON the hint pill body do? —————
{
  const ctx = await newCtx();
  const page = await ctx.newPage();
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(9000);
  const st = await mapState(page);
  if (st.hintPillRect) {
    const cx = st.hintPillRect.x + 40; // on the label text, away from the X
    const cy = st.hintPillRect.y + st.hintPillRect.h / 2;
    const stack = await page.evaluate(([x, y]) =>
      document.elementsFromPoint(x, y).slice(0, 5).map((e) => e.tagName + "." + (e.className + "").slice(0, 50)), [cx, cy]);
    log("1c element stack at hint label point:", JSON.stringify(stack, null, 1));
    await page.touchscreen.tap(cx, cy);
    await page.waitForTimeout(1200);
    const after = await mapState(page);
    log("1c after tapping hint body: hint gone:", !after.hintPresent, "| URL:", after.url);
    await page.screenshot({ path: OUT + "f1d-map-after-hint-body-tap.png" });
  }
  await ctx.close();
}

// ————— FIX 2 + 3 + 4 on chapter pages —————
{
  const ctx = await newCtx();
  const page = await ctx.newPage();
  page.on("pageerror", (e) => log("PAGE ERROR:", e.message));

  // Fix 3 across all five chapters: orientation line correct + in first viewport
  const chapters = [ ["bakery", 1], ["commissioners-office", 2], ["mansion", 3], ["ferry", 4], ["barbershop", 5] ];
  for (const [slug, n] of chapters) {
    await page.goto(`${BASE}/${slug}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2200);
    const o = await page.evaluate(() => {
      const p = [...document.querySelectorAll("p")].find((p) => /Walking Memorial · Troy, NY · Stop \d of 5/.test(p.textContent));
      if (!p) return { found: false };
      const r = p.getBoundingClientRect();
      const cs = getComputedStyle(p);
      return {
        found: true,
        text: p.textContent.trim(),
        rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), w: Math.round(r.width) },
        fontSize: cs.fontSize,
        opacity: cs.opacity,
        visibleNoScroll: r.top >= 0 && r.bottom <= innerHeight && scrollY === 0,
      };
    });
    log(`3 /${slug} orientation:`, JSON.stringify(o));
    if (!o.found || !/Stop \d of 5/.test(o.text) || !o.text.includes(`Stop ${n} of 5`)) log(`3 /${slug} MISMATCH: expected Stop ${n} of 5`);
    if (slug === "commissioners-office") await page.screenshot({ path: OUT + "f3-commissioners-orientation.png" });
    if (slug === "bakery") await page.screenshot({ path: OUT + "f3-bakery-orientation.png" });

    // Fix 2 on each chapter's hero: press-hold hint un-clipped + clear of burger
    const ph = await page.evaluate(() => {
      const span = [...document.querySelectorAll("span")].find((s) => /Press and hold to bring|Tap to reveal/.test(s.textContent));
      if (!span) return { found: false };
      const r = span.getBoundingClientRect();
      const burger = document.querySelector("button.cnwm-menu-burger");
      const br = burger ? burger.getBoundingClientRect() : null;
      const overlap = br ? r.left < br.right && r.right > br.left && r.top < br.bottom && r.bottom > br.top : null;
      return {
        found: true,
        text: span.textContent.trim().slice(0, 60),
        rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) },
        inViewport: r.top >= 0 && r.bottom <= innerHeight,
        clippedBottomPx: Math.max(0, Math.round(r.bottom - innerHeight)),
        burgerRect: br ? { left: Math.round(br.left), top: Math.round(br.top), w: Math.round(br.width), h: Math.round(br.height) } : null,
        burgerOverlapsHint: overlap,
        fontSize: getComputedStyle(span).fontSize,
      };
    });
    log(`2 /${slug} press-hold hint:`, JSON.stringify(ph));
  }
  await page.goto(BASE + "/commissioners-office", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: OUT + "f2-presshold-hint-390.png" });

  // Fix 4: scrub hit area + paragraph affordance line (scroll to the player)
  const play = page.locator('button[aria-label^="Play narration"]').first();
  await play.waitFor({ state: "attached", timeout: 15000 });
  await play.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const scrub = await page.evaluate(() => {
    const s = document.querySelector("input.cnwm-scrub");
    const r = s ? s.getBoundingClientRect() : null;
    const aff = [...document.querySelectorAll("p")].find((p) => /Tap any paragraph to hear it read aloud/.test(p.textContent));
    const ar = aff ? aff.getBoundingClientRect() : null;
    return {
      scrubFound: !!s,
      scrubRect: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
      scrubComputedHeight: s ? getComputedStyle(s).height : null,
      affordanceFound: !!aff,
      affordanceText: aff ? aff.textContent.trim() : null,
      affordanceVisible: ar ? ar.width > 0 && ar.height > 0 && getComputedStyle(aff).opacity !== "0" : false,
      affordanceFontSize: aff ? getComputedStyle(aff).fontSize : null,
      affordanceRect: ar ? { top: Math.round(ar.top), h: Math.round(ar.height) } : null,
    };
  });
  log("4 scrub + affordance:", JSON.stringify(scrub, null, 1));
  await page.screenshot({ path: OUT + "f4-scrub-and-affordance.png" });

  // functional: drag/keyboard on scrub still seeks (arrow key path as proxy)
  await ctx.close();
}

await browser.close();
log("DONE");
