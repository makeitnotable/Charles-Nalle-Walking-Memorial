#!/usr/bin/env node
/**
 * UX walk (tablet + desktop) — script 03: /paintings museum rail · drag look · approach · grid.
 * READ-ONLY on the site. Output: docs/v7/qa/uxwalk-desk/paintings-<vp>-<step>.png + 03-museum.json
 * Usage: node scripts/uxwalk-desk-03-museum.mjs [--vp 768,1024,1280,1440,1920]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] ? args[i + 1] : d; };
const BASE = "http://localhost:4321";
const OUT = "docs/v7/qa/uxwalk-desk";
mkdirSync(OUT, { recursive: true });
const ALL_VP = { 768: { width: 768, height: 1024 }, 1024: { width: 1024, height: 768 }, 1280: { width: 1280, height: 800 }, 1440: { width: 1440, height: 900 }, 1920: { width: 1920, height: 1080 } };
const VPS = flag("vp", "768,1024,1280,1440,1920").split(",").map((n) => ({ name: n, ...ALL_VP[n] }));
const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader"] });
const report = {};

const UI = () => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 4 && r.height > 4 && cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0.05; };
  const rect = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const controls = [...document.querySelectorAll("button, a, [role='button']")].filter(vis).map((el) => ({ text: (el.getAttribute("aria-label") || el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 44), rect: rect(el) })).filter((c) => c.rect.x >= 0 && c.rect.y > -2 && c.rect.y < innerHeight);
  const chips = [...document.querySelectorAll("p")].filter(vis).filter((p) => p.closest("[class*='absolute'],[class*='fixed']") && p.getBoundingClientRect().top < innerHeight).map((p) => ({ text: p.innerText.replace(/\s+/g, " ").slice(0, 60), rect: rect(p) }));
  const s = window.__museum?.state ?? null;
  const rects = window.__museum ? Array.from({ length: s.works }, (_, i) => { try { return window.__museum.paintingRect(i); } catch { return null; } }) : null;
  const canvas = document.querySelector("canvas");
  const back = [...document.querySelectorAll("button")].find((b) => /back to the hall/i.test(b.innerText));
  let card = null;
  if (back) { let n = back.parentElement; while (n && n !== document.body && !(n.getBoundingClientRect().width > 120 && getComputedStyle(n).backgroundColor !== "rgba(0, 0, 0, 0)")) n = n.parentElement; if (n && n !== document.body) card = rect(n); }
  const menu = document.querySelector(".cnwm-menu-burger");
  return { state: s, rects, controls, chips, card, canvas: canvas ? rect(canvas) : null, menu: menu ? rect(menu) : null, vp: [innerWidth, innerHeight], scrollY, docH: document.documentElement.scrollHeight, cam: window.__museum ? { fov: window.__museum.camera.fov, pos: window.__museum.camera.position.toArray().map((v) => +v.toFixed(2)), rot: window.__museum.camera.rotation.toArray().slice(0, 3).map((v) => +(+v).toFixed(3)) } : null, placements: window.__museum?.placements?.map((p) => ({ side: p.side, w: +(p.w ?? p.width ?? 0).toFixed?.(2), h: +(p.h ?? p.height ?? 0).toFixed?.(2), z: +(p.z ?? 0).toFixed?.(2), aspect: p.aspect })) };
};

for (const vp of VPS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrs = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") consoleErrs.push({ type: m.type(), text: m.text().slice(0, 300) }); });
  page.on("pageerror", (e) => consoleErrs.push({ type: "pageerror", text: String(e).slice(0, 300) }));
  const rep = (report[vp.name] = { shots: [] });
  const shot = async (step) => { const f = `paintings-${vp.name}-${step}.png`; await page.screenshot({ path: join(OUT, f) }); rep.shots.push(f); return f; };

  await page.goto(BASE + "/paintings", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" }).catch(() => {});
  await page.waitForFunction(() => window.__museum && window.__museum.state, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  rep.title = await page.title();
  await shot("00-rail-start");
  rep.start = await page.evaluate(UI);

  // Rail: scroll in steps of 40% viewport for the first 4 screens; shot at 25/50/75/100% of slot
  const slotH = await page.evaluate(() => { const c = document.querySelector("canvas"); const w = c?.closest(".relative"); return w ? w.getBoundingClientRect().height : document.documentElement.scrollHeight; });
  rep.slotH = slotH;
  const H = vp.height;
  const marks = [0.15, 0.35, 0.5, 0.75, 0.98];
  let n = 1;
  for (const m of marks) {
    const y = Math.round((slotH - H) * m);
    // scroll gradually
    const cur = await page.evaluate(() => scrollY);
    const stepPx = 120;
    for (let yy = cur; yy < y; yy += stepPx) { await page.evaluate((v) => scrollTo(0, v), yy); await page.waitForTimeout(40); }
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(1600);
    await shot(`0${n}-rail-${Math.round(m * 100)}`);
    rep[`rail${Math.round(m * 100)}`] = await page.evaluate(UI);
    n++;
  }
  // past the hall: what's below
  await page.evaluate((h) => scrollTo(0, h + 10), slotH);
  await page.waitForTimeout(1200);
  await shot(`0${n++}-below-hall`);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  let k = 0;
  for (let y = slotH; y < total && k < 5; y += Math.round(H * 0.9)) {
    await page.evaluate((yy) => scrollTo(0, yy), y);
    await page.waitForTimeout(700);
    await shot(`1${k}-grid-${k}`);
    k++;
  }
  rep.grid = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const wrap = canvas?.closest(".relative");
    const imgs = [...document.querySelectorAll("img")].filter((i) => !wrap?.contains(i) && i.getBoundingClientRect().width > 80);
    return imgs.map((i) => { const r = i.getBoundingClientRect(); return { src: i.currentSrc.split("/").pop(), natural: [i.naturalWidth, i.naturalHeight], rendered: [Math.round(r.width), Math.round(r.height)], natAspect: +(i.naturalWidth / i.naturalHeight).toFixed(3), renAspect: +(r.width / r.height).toFixed(3), fit: getComputedStyle(i).objectFit, y: Math.round(r.top + scrollY), x: Math.round(r.left) }; });
  });
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  await shot(`19-footer`);

  // Back to rail middle; drag look
  await page.evaluate((v) => scrollTo(0, v), Math.round((slotH - H) * 0.4));
  await page.waitForTimeout(1500);
  const cv = await page.locator("canvas").first().boundingBox();
  if (cv) {
    const cx = cv.x + cv.width / 2, cy = cv.y + cv.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let i = 1; i <= 30; i++) { await page.mouse.move(cx - i * 25, cy, { steps: 1 }); await page.waitForTimeout(16); }
    await page.mouse.up();
    await page.waitForTimeout(900);
    await shot("20-drag-left-max");
    rep.dragLeft = await page.evaluate(() => window.__museum.state.look);
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let i = 1; i <= 60; i++) { await page.mouse.move(cx + i * 25, cy, { steps: 1 }); await page.waitForTimeout(16); }
    await page.mouse.up();
    await page.waitForTimeout(900);
    await shot("21-drag-right-max");
    rep.dragRight = await page.evaluate(() => window.__museum.state.look);
    // Vertical drag
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let i = 1; i <= 30; i++) { await page.mouse.move(cx, cy - i * 25, { steps: 1 }); await page.waitForTimeout(16); }
    await page.mouse.up();
    await page.waitForTimeout(900);
    await shot("22-drag-up-max");
    rep.dragUp = await page.evaluate(() => window.__museum.state.look);
    // reset look via small reverse drags? Just reload state by clicking approach later.
  }

  // Approach painting 3 via a real click on the canvas at its projected rect
  const r3 = await page.evaluate(() => { try { return window.__museum.paintingRect(2); } catch { return null; } });
  rep.r3 = r3;
  // Prefer the wayfinding dot for approaching (a11y path) — but ALSO test a canvas click
  let clicked = false;
  if (r3 && !r3.behind && r3.left >= 0 && r3.right <= vp.width) {
    await page.mouse.click((r3.left + r3.right) / 2, (r3.top + r3.bottom) / 2);
    clicked = true;
  } else {
    await page.locator("nav[aria-label='Works in the hall'] button").nth(2).click().catch(() => {});
  }
  rep.approachVia = clicked ? "canvas-click" : "dot";
  await page.waitForTimeout(2600);
  await shot("30-approach-3");
  rep.approach3 = await page.evaluate(UI);
  // Bring it to life
  const alive = page.getByRole("button", { name: /bring it to life/i });
  if (await alive.count()) { await alive.first().click(); await page.waitForTimeout(2500); await shot("31-alive-3"); rep.alive3 = await page.evaluate(UI); }
  // Escape → back to rail
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2200);
  rep.afterEsc = await page.evaluate(() => window.__museum.state.mode + "/" + window.__museum.state.approached);
  await shot("32-after-esc");
  // Approach the last (portrait) painting
  const last = await page.evaluate(() => window.__museum.state.works - 1);
  await page.locator("nav[aria-label='Works in the hall'] button").nth(last).click().catch(() => {});
  await page.waitForTimeout(2800);
  await shot("33-approach-last");
  rep.approachLast = await page.evaluate(UI);
  // Also approach painting 0 for the first
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1500);
  await page.locator("nav[aria-label='Works in the hall'] button").nth(0).click().catch(() => {});
  await page.waitForTimeout(2800);
  await shot("34-approach-0");
  rep.approach0 = await page.evaluate(UI);
  // Back to the hall via button
  const backBtn = page.getByRole("button", { name: /back to the hall/i });
  if (await backBtn.count()) { await backBtn.first().click(); await page.waitForTimeout(1500); }
  // texture info: aspect of textures vs placements
  rep.textures = await page.evaluate(() => {
    const m = window.__museum;
    if (!m) return null;
    return (m.placements || []).map((p, i) => { let o = {}; try { o = JSON.parse(JSON.stringify(p, (k, v) => (typeof v === "number" ? +v.toFixed(3) : v))); } catch {} return { i, ...o }; });
  });
  rep.console = consoleErrs;
  console.log(vp.name, "done", rep.shots.length, "shots", consoleErrs.length, "console");
  await context.close();
}
writeFileSync(join(OUT, "03-museum.json"), JSON.stringify(report, null, 1));
await browser.close();
