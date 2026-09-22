#!/usr/bin/env node
/**
 * UX walk (tablet + desktop) — script 04: keyboard-only · reduced motion · 200% zoom.
 * READ-ONLY on the site. Output: docs/v7/qa/uxwalk-desk/<route>-<vp>-<step>.png + 04-a11y.json
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:4321";
const OUT = "docs/v7/qa/uxwalk-desk";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
const report = { keyboard: {}, reduced: {}, zoom: {} };
const HIDE = "astro-dev-toolbar{display:none !important}";

const FOCUS_INFO = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return { tag: "BODY" };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const fv = el.matches(":focus-visible");
  return {
    tag: el.tagName,
    text: (el.getAttribute("aria-label") || el.innerText || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
    role: el.getAttribute("role"),
    focusVisible: fv,
    outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor,
    boxShadow: cs.boxShadow.slice(0, 80),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    inViewport: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
    scrollY: Math.round(scrollY),
  };
};

// ——— Keyboard pass at 1440 ———
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 200)));
  const shot = (f) => page.screenshot({ path: join(OUT, f) });

  const tabWalk = async (route, n, extra) => {
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.addStyleTag({ content: HIDE }).catch(() => {});
    await page.waitForTimeout(2500);
    const stops = [];
    for (let i = 0; i < n; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(120);
      stops.push(await page.evaluate(FOCUS_INFO));
    }
    return stops;
  };

  // HOME
  report.keyboard.home = { stops: await tabWalk("/", 6) };
  await shot("home-1440-kb-01-tab-cta.png");
  // MAP
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: HIDE }).catch(() => {});
  await page.waitForFunction(() => window.__troyMap?.map?.loaded(), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const mapStops = [];
  for (let i = 0; i < 16; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(120); mapStops.push(await page.evaluate(FOCUS_INFO)); }
  report.keyboard.map = { stops: mapStops };
  await shot("map-1440-kb-01-tabs.png");
  // Try to focus & activate the menu burger via keyboard: find its index
  const burgerIdx = mapStops.findIndex((s) => /open menu/i.test(s.text));
  // Activate "Take the walk" via keyboard: tab until it is focused
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: HIDE }).catch(() => {});
  await page.waitForFunction(() => window.__troyMap?.map?.loaded(), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  let found = false;
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab"); await page.waitForTimeout(80);
    const f = await page.evaluate(FOCUS_INFO);
    if (/take the walk/i.test(f.text)) { found = true; break; }
  }
  report.keyboard.mapTakeWalkReachable = found;
  if (found) {
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2500);
    await shot("map-1440-kb-02-walk-started.png");
    // Where is focus now? Tab a few times: does a card get focus?
    const after = [];
    for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(100); after.push(await page.evaluate(FOCUS_INFO)); }
    report.keyboard.mapAfterWalkTabs = after;
    await shot("map-1440-kb-03-walk-tabs.png");
    // Escape: does it stop the walk?
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    report.keyboard.mapEscDuringWalk = await page.evaluate(() => window.__troyMap.state);
    // Stop the walk via keyboard if still touring
    if (report.keyboard.mapEscDuringWalk.touring) {
      for (let i = 0; i < 20; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(60); const f = await page.evaluate(FOCUS_INFO); if (/stop the walk/i.test(f.text)) { await page.keyboard.press("Enter"); break; } }
      await page.waitForTimeout(800);
    }
    // Now focused mode: Tab to a card
    const cardTabs = [];
    for (let i = 0; i < 12; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(80); const f = await page.evaluate(FOCUS_INFO); cardTabs.push(f); if (/enter chapter|focus spot/i.test(f.text)) break; }
    report.keyboard.mapCardTabs = cardTabs;
    await shot("map-1440-kb-04-card-focus.png");
    // Escape in focused mode → back to overview?
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    report.keyboard.mapEscFocused = await page.evaluate(() => window.__troyMap.state);
  }
  // Lens via keyboard + Escape
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: HIDE }).catch(() => {});
  await page.waitForFunction(() => window.__troyMap?.map?.loaded(), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  for (let i = 0; i < 20; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(60); const f = await page.evaluate(FOCUS_INFO); if (/see troy/i.test(f.text)) { await page.keyboard.press("Enter"); break; } }
  await page.waitForTimeout(2200);
  report.keyboard.lensOpened = await page.evaluate(() => window.__troyMap.state.lens);
  report.keyboard.lensFocusAfterOpen = await page.evaluate(FOCUS_INFO);
  await shot("map-1440-kb-05-lens.png");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  report.keyboard.lensAfterEsc = await page.evaluate(() => window.__troyMap.state.lens);
  // Tab into the lens application, arrow keys pan?
  const lensTabs = [];
  for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(60); lensTabs.push(await page.evaluate(FOCUS_INFO)); }
  report.keyboard.lensTabs = lensTabs;
  // Menu via keyboard on map
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: HIDE }).catch(() => {});
  await page.waitForTimeout(3000);
  let menuFound = false;
  for (let i = 0; i < 25; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(60); const f = await page.evaluate(FOCUS_INFO); if (/open menu/i.test(f.text)) { menuFound = true; break; } }
  report.keyboard.menuReachableOnMap = menuFound;
  if (menuFound) {
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    report.keyboard.menuOpenFocus = await page.evaluate(FOCUS_INFO);
    const inMenu = [];
    for (let i = 0; i < 4; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(80); inMenu.push(await page.evaluate(FOCUS_INFO)); }
    report.keyboard.menuTabs = inMenu;
    await shot("map-1440-kb-06-menu-open.png");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    report.keyboard.menuAfterEsc = await page.evaluate(() => ({ expanded: document.querySelector(".cnwm-menu-burger")?.getAttribute("aria-expanded"), focus: (document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName) }));
  }

  // BAKERY
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: HIDE }).catch(() => {});
  await page.waitForTimeout(2500);
  const bk = [];
  for (let i = 0; i < 40; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(90); const f = await page.evaluate(FOCUS_INFO); bk.push(f); if (/continue/i.test(f.text)) break; }
  report.keyboard.bakery = { stops: bk };
  await shot("bakery-1440-kb-01-tabs.png");
  // Menu on chapter via keyboard: burger is early in DOM? find
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: HIDE }).catch(() => {});
  await page.waitForTimeout(2000);
  let bm = false;
  for (let i = 0; i < 40; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(60); const f = await page.evaluate(FOCUS_INFO); if (/open menu/i.test(f.text)) { bm = true; break; } }
  report.keyboard.bakeryMenuReachable = bm;
  if (bm) { await page.keyboard.press("Enter"); await page.waitForTimeout(700); await shot("bakery-1440-kb-02-menu.png"); report.keyboard.bakeryMenuFocus = await page.evaluate(FOCUS_INFO); await page.keyboard.press("Escape"); await page.waitForTimeout(400); }
  // Play via keyboard
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: HIDE }).catch(() => {});
  await page.waitForTimeout(2000);
  for (let i = 0; i < 40; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(60); const f = await page.evaluate(FOCUS_INFO); if (/play|listen/i.test(f.text) && f.tag === "BUTTON") { await page.keyboard.press("Enter"); await page.waitForTimeout(3000); await shot("bakery-1440-kb-03-play.png"); report.keyboard.bakeryPlayFocus = f; break; } }
  report.keyboard.bakeryPlaying = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime })));

  // PAINTINGS
  await page.goto(BASE + "/paintings", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: HIDE }).catch(() => {});
  await page.waitForFunction(() => window.__museum, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const pt = [];
  for (let i = 0; i < 20; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(90); const f = await page.evaluate(FOCUS_INFO); pt.push(f); if (/approach/i.test(f.text)) break; }
  report.keyboard.paintings = { stops: pt };
  await shot("paintings-1440-kb-01-tabs.png");
  const lastP = pt[pt.length - 1];
  if (/approach/i.test(lastP.text)) {
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2600);
    report.keyboard.paintingsApproached = await page.evaluate(() => window.__museum.state.approached);
    report.keyboard.paintingsFocusAfterApproach = await page.evaluate(FOCUS_INFO);
    await shot("paintings-1440-kb-02-approached.png");
    const inPlaque = [];
    for (let i = 0; i < 4; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(80); inPlaque.push(await page.evaluate(FOCUS_INFO)); }
    report.keyboard.paintingsPlaqueTabs = inPlaque;
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1500);
    report.keyboard.paintingsAfterEsc = await page.evaluate(() => window.__museum.state.approached);
    report.keyboard.paintingsFocusAfterEsc = await page.evaluate(FOCUS_INFO);
  }
  // Skip the hall reachable?
  report.keyboard.skipHallInStops = pt.some((s) => /skip the hall/i.test(s.text));
  // Space/PageDown scroll walks the rail?
  await page.keyboard.press("PageDown"); await page.waitForTimeout(800);
  report.keyboard.paintingsPageDown = await page.evaluate(() => ({ y: scrollY, railT: window.__museum.state.railT }));
  report.keyboard.pageErrors = errs;
  await ctx.close();
}

// ——— Reduced motion pass at 1440 ———
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const shot = (f) => page.screenshot({ path: join(OUT, f) });
  for (const route of ["/", "/bakery", "/map", "/paintings"]) {
    const slug = route === "/" ? "home" : route.slice(1);
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.addStyleTag({ content: HIDE }).catch(() => {});
    await page.waitForTimeout(3000);
    await shot(`${slug}-1440-rm-00-top.png`);
    const rep = (report.reduced[slug] = {});
    rep.videos = await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => ({ paused: v.paused, autoplay: v.autoplay, src: (v.currentSrc || "").split("/").pop() })));
    rep.animations = await page.evaluate(() => document.getAnimations().length);
    if (route === "/bakery") {
      // Scroll: do reveals show?
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += 800) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(150); }
      rep.hiddenReveals = await page.evaluate(() => [...document.querySelectorAll(".reveal, .lines, .reveal-quote, .wipe")].filter((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return r.height > 0 && (+cs.opacity < 0.5 || cs.visibility === "hidden"); }).map((el) => el.className.toString().slice(0, 40) + " :: " + (el.innerText || "").slice(0, 30)));
      await page.evaluate(() => { const el = document.getElementById("moral"); scrollTo(0, el.getBoundingClientRect().top + scrollY); });
      await page.waitForTimeout(800);
      await shot(`${slug}-1440-rm-01-moral.png`);
      await page.evaluate(() => { const el = document.querySelector(".painting-interlude"); scrollTo(0, el.getBoundingClientRect().top + scrollY - 100); });
      await page.waitForTimeout(800);
      await shot(`${slug}-1440-rm-02-interlude.png`);
    }
    if (route === "/map") {
      await page.waitForFunction(() => window.__troyMap?.map?.loaded(), null, { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(2000);
      rep.cam = await page.evaluate(() => ({ pitch: window.__troyMap.map.getPitch(), zoom: window.__troyMap.map.getZoom() }));
      await page.getByRole("button", { name: /take the walk/i }).first().click().catch(() => {});
      await page.waitForTimeout(1500);
      await shot(`${slug}-1440-rm-01-walk.png`);
      rep.walkCam = await page.evaluate(() => ({ pitch: window.__troyMap.map.getPitch(), zoom: window.__troyMap.map.getZoom(), state: window.__troyMap.state }));
      await page.waitForTimeout(1300);
      await shot(`${slug}-1440-rm-02-walk2.png`);
      rep.walkCam2 = await page.evaluate(() => ({ pitch: window.__troyMap.map.getPitch(), zoom: window.__troyMap.map.getZoom(), state: window.__troyMap.state }));
    }
    if (route === "/paintings") {
      await page.waitForFunction(() => window.__museum, null, { timeout: 30000 }).catch(() => {});
      rep.museum = await page.evaluate(() => ({ present: !!window.__museum, state: window.__museum && { running: window.__museum.state.running, mode: window.__museum.state.mode } }));
      await page.evaluate(() => scrollTo(0, 2500));
      await page.waitForTimeout(1500);
      await shot(`${slug}-1440-rm-01-rail.png`);
      rep.afterScroll = await page.evaluate(() => window.__museum && { railT: window.__museum.state.railT, cur: window.__museum.state.cur });
      await page.locator("nav[aria-label='Works in the hall'] button").nth(2).click().catch(() => {});
      await page.waitForTimeout(2500);
      await shot(`${slug}-1440-rm-02-approach.png`);
      rep.approach = await page.evaluate(() => window.__museum && { mode: window.__museum.state.mode, approached: window.__museum.state.approached, cur: window.__museum.state.cur });
    }
  }
  await ctx.close();
}

// ——— 200% zoom pass: 720×450 viewport ———
{
  const ctx = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const shot = (f) => page.screenshot({ path: join(OUT, f) });
  for (const route of ["/", "/bakery", "/map", "/paintings"]) {
    const slug = route === "/" ? "home" : route.slice(1);
    const rep = (report.zoom[slug] = {});
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.addStyleTag({ content: HIDE }).catch(() => {});
    await page.waitForTimeout(3000);
    await shot(`${slug}-z200-00-top.png`);
    rep.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    rep.fixed = await page.evaluate(() => [...document.querySelectorAll("*")].filter((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return (cs.position === "fixed" || cs.position === "absolute") && r.width > 30 && r.height > 20 && +cs.opacity > 0.05 && cs.visibility !== "hidden" && r.top < innerHeight && r.bottom > 0 && el.matches("button, a, [role=button], p, nav, div[class*='pill'], div[class*='chip']"); }).map((el) => ({ tag: el.tagName, text: (el.getAttribute("aria-label") || el.innerText || "").replace(/\s+/g, " ").slice(0, 30), r: (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(el.getBoundingClientRect()) })));
    if (route === "/bakery") {
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += 400) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(120); }
      for (const [id, k] of [["scene-0", "01"], ["history", "02"], ["moral", "03"], ["onward", "04"]]) {
        await page.evaluate((i) => { const el = document.getElementById(i); scrollTo(0, el.getBoundingClientRect().top + scrollY); }, id);
        await page.waitForTimeout(700);
        await shot(`${slug}-z200-${k}-${id}.png`);
      }
      // play + mini-player at 200%
      await page.evaluate(() => { const el = document.getElementById("scene-0"); scrollTo(0, el.getBoundingClientRect().top + scrollY + 300); });
      await page.waitForTimeout(400);
      const btn = page.locator("#scene-0 button").first();
      if (await btn.count()) { await btn.click().catch(() => {}); await page.waitForTimeout(2500); await page.evaluate(() => scrollTo(0, scrollY + 1200)); await page.waitForTimeout(800); await shot(`${slug}-z200-05-miniplayer.png`); }
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(600); await shot(`${slug}-z200-06-footer.png`);
    }
    if (route === "/map") {
      await page.waitForFunction(() => window.__troyMap?.map?.loaded(), null, { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(2500);
      await shot(`${slug}-z200-01-overview.png`);
      rep.overview = await page.evaluate(() => [...document.querySelectorAll("button, .mapboxgl-marker, p")].filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 4 && r.top < innerHeight && r.bottom > 0 && +cs.opacity > 0.05 && el.closest("[class*='absolute'],[class*='fixed'],.mapboxgl-marker,.mapboxgl-ctrl"); }).map((el) => ({ t: (el.getAttribute("aria-label") || el.innerText || "").replace(/\s+/g, " ").slice(0, 30), r: (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(el.getBoundingClientRect()) })));
      await page.getByRole("button", { name: /take the walk/i }).first().click().catch(() => {});
      await page.waitForTimeout(4500);
      await shot(`${slug}-z200-02-walk.png`);
      rep.walk = await page.evaluate(() => [...document.querySelectorAll("button, [role=button]")].filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 4 && r.top < innerHeight && r.bottom > 0 && +cs.opacity > 0.05; }).map((el) => ({ t: (el.getAttribute("aria-label") || el.innerText || "").replace(/\s+/g, " ").slice(0, 30), r: (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(el.getBoundingClientRect()) })));
      await page.getByRole("button", { name: /stop the walk/i }).first().click().catch(() => {});
      await page.waitForTimeout(600);
      const back = page.getByRole("button", { name: /back to map/i });
      if (await back.count()) { await back.first().click(); await page.waitForTimeout(2500); }
      await page.getByRole("button", { name: /see troy in 1858/i }).first().click().catch(() => {});
      await page.waitForTimeout(2200);
      await shot(`${slug}-z200-03-lens.png`);
      rep.lens = await page.evaluate(() => { const b = document.querySelector("[role='application']"); return b ? b.getBoundingClientRect().toJSON() : null; });
    }
    if (route === "/paintings") {
      await page.waitForFunction(() => window.__museum, null, { timeout: 30000 }).catch(() => {});
      await page.evaluate(() => scrollTo(0, 1500)); await page.waitForTimeout(1500);
      await shot(`${slug}-z200-01-rail.png`);
      rep.rail = await page.evaluate(() => window.__museum && { fov: window.__museum.state.fov, portrait: window.__museum.state.portrait, railT: window.__museum.state.railT });
      await page.locator("nav[aria-label='Works in the hall'] button").nth(2).click().catch(() => {});
      await page.waitForTimeout(2500);
      await shot(`${slug}-z200-02-approach.png`);
      rep.approach = await page.evaluate(() => { const back = [...document.querySelectorAll("button")].find((b) => /back to the hall/i.test(b.innerText)); let n = back?.parentElement; while (n && n !== document.body && !(n.getBoundingClientRect().width > 120 && getComputedStyle(n).backgroundColor !== "rgba(0, 0, 0, 0)")) n = n.parentElement; return { card: n && n !== document.body ? n.getBoundingClientRect().toJSON() : null, rect: window.__museum.paintingRect(2), vp: [innerWidth, innerHeight] }; });
    }
  }
  await ctx.close();
}

writeFileSync(join(OUT, "04-a11y.json"), JSON.stringify(report, null, 1));
await browser.close();
console.log("done 04");
