#!/usr/bin/env node
/**
 * UX walk (tablet + desktop) — script 06: targeted probes.
 *  a) museum: burger returns on scroll-up mid-hall — collides with "Skip the hall"?
 *  b) narration highlight look (bakery, 1440)
 *  c) deep link /bakery#scene-0 fresh load; back button after a curtain navigation
 *  d) 404 at 1440 / 768
 *  e) museum "end of hall" straight-ahead view
 * Output: docs/v7/qa/uxwalk-desk/*.png + 06-probes.json
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const BASE = "http://localhost:4321";
const OUT = "docs/v7/qa/uxwalk-desk";
const HIDE = "astro-dev-toolbar{display:none !important}";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
const rep = {};

// a) museum burger vs skip
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/paintings", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  await page.waitForFunction(() => window.__museum, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.evaluate(() => scrollTo(0, 2400)); await page.waitForTimeout(700);
  await page.evaluate(() => scrollTo(0, 2300)); await page.waitForTimeout(900);
  rep.museumBurgerVsSkip = await page.evaluate(() => {
    const m = document.querySelector(".cnwm-menu"); const b = m.querySelector(".cnwm-menu-burger");
    const skip = [...document.querySelectorAll("button")].find((x) => /skip the hall/i.test(x.innerText));
    return { menuHidden: m.dataset.hidden, menuOpacity: getComputedStyle(m).opacity, burger: b.getBoundingClientRect().toJSON(), skip: skip?.getBoundingClientRect().toJSON() };
  });
  await page.screenshot({ path: join(OUT, "paintings-1440-40-burger-vs-skip.png") });
  // end of hall view: scroll to the end and screenshot the straight-ahead
  await page.evaluate(() => { const c = document.querySelector("canvas"); const w = c.closest(".relative"); scrollTo(0, w.getBoundingClientRect().top + scrollY + w.getBoundingClientRect().height - innerHeight - 5); });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: join(OUT, "paintings-1440-41-hall-end.png") });
  await page.close();
}

// b) narration highlight
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  await page.evaluate(() => { const el = document.getElementById("scene-0"); scrollTo(0, el.getBoundingClientRect().top + scrollY + 500); });
  await page.waitForTimeout(800);
  await page.locator("#scene-0 button[aria-label^='Play']").first().click();
  await page.waitForTimeout(9000);
  rep.narration = await page.evaluate(() => {
    const a = document.querySelector(".narration-active");
    if (!a) return { active: null };
    a.scrollIntoView({ block: "center" });
    const cs = getComputedStyle(a);
    return { active: a.innerText.slice(0, 80), bg: cs.backgroundColor, color: cs.color, tag: a.tagName, rect: a.getBoundingClientRect().toJSON(), audio: [...document.querySelectorAll("audio")].map((x) => ({ paused: x.paused, t: x.currentTime })) };
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, "bakery-1440-42-narration-highlight.png") });
  // mini-player when scrolled far
  await page.evaluate(() => { const el = document.getElementById("moral"); scrollTo(0, el.getBoundingClientRect().top + scrollY + 300); });
  await page.waitForTimeout(900);
  rep.miniPlayer = await page.evaluate(() => [...document.querySelectorAll("*")].filter((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.position === "fixed" && r.width > 100 && r.height > 40 && r.top > 0 && +cs.opacity > 0.05 && /\d\d:\d\d/.test(el.innerText || ""); }).map((el) => ({ text: el.innerText.replace(/\s+/g, " ").slice(0, 60), rect: el.getBoundingClientRect().toJSON(), bg: getComputedStyle(el).backgroundColor })));
  await page.screenshot({ path: join(OUT, "bakery-1440-43-miniplayer-on-moral.png") });
  await page.close();
}

// c) deep link + back button
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/bakery#scene-0", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(2500);
  rep.deepLink = await page.evaluate(() => ({ scrollY, hash: location.hash, sceneTop: document.getElementById("scene-0").getBoundingClientRect().top, h2Visible: (() => { const h = document.querySelector("#scene-0 h2"); const r = h.getBoundingClientRect(); return { top: r.top, opacity: getComputedStyle(h).opacity, lineOpacity: [...h.querySelectorAll(".line-inner")].map((s) => getComputedStyle(s).opacity + "/" + getComputedStyle(s).transform.slice(0, 20)) }; })(), railVisible: (() => { const r = document.querySelector("#scene-0 nav.rail"); return r ? getComputedStyle(r).opacity : null; })(), curtain: (() => { const p = document.getElementById("curtain-panel"); return { transform: getComputedStyle(p).transform, pe: p.style.pointerEvents }; })() }));
  await page.screenshot({ path: join(OUT, "bakery-1440-44-deeplink-scene0.png") });
  // Back button after curtain nav: map → card → bakery → back
  await page.goto(BASE + "/map", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  await page.waitForFunction(() => window.__troyMap?.map?.loaded(), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: /take the walk/i }).first().click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /stop the walk/i }).first().click().catch(() => {});
  await page.waitForTimeout(1000);
  await page.locator("[role='button'][aria-label^='Enter Chapter']").first().click({ force: true });
  await page.waitForURL(/\/bakery/, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  rep.afterCardNav = { url: page.url(), curtain: await page.evaluate(() => { const p = document.getElementById("curtain-panel"); return { transform: getComputedStyle(p).transform, pe: p.style.pointerEvents }; }) };
  await page.goBack({ waitUntil: "load" }).catch(() => {});
  await page.waitForTimeout(2500);
  rep.afterBack = await page.evaluate(() => ({ url: location.href, curtain: (() => { const p = document.getElementById("curtain-panel"); return p ? { transform: getComputedStyle(p).transform, pe: p.style.pointerEvents, textOpacity: getComputedStyle(document.getElementById("curtain-text")).opacity } : null; })(), state: window.__troyMap?.state ?? null, mapPresent: !!document.querySelector(".mapboxgl-canvas") }));
  await page.screenshot({ path: join(OUT, "map-1440-45-after-back.png") });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(OUT, "map-1440-46-after-back-3s.png") });
  rep.afterBack3s = await page.evaluate(() => ({ curtain: (() => { const p = document.getElementById("curtain-panel"); return p ? { transform: getComputedStyle(p).transform, pe: p.style.pointerEvents } : null; })(), state: window.__troyMap?.state ?? null }));
  // Forward again then browser back from chapter Continue
  await page.close();
}

// d) 404
{
  for (const vp of [[1440, 900], [768, 1024]]) {
    const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] } });
    await page.goto(BASE + "/this-page-does-not-exist", { waitUntil: "networkidle" }).catch(() => {});
    await page.addStyleTag({ content: HIDE });
    await page.waitForTimeout(1200);
    rep["notFound" + vp[0]] = await page.evaluate(() => ({ title: document.title, h1: document.querySelector("h1")?.innerText, links: [...document.querySelectorAll("main a")].map((a) => a.innerText.trim().slice(0, 30)), status: null }));
    await page.screenshot({ path: join(OUT, `404-${vp[0]}-40-random-url.png`) });
    await page.close();
  }
}

// e) menu open on map at 768 (bottom-right)
{
  const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await page.goto(BASE + "/map", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(3000);
  await page.locator(".cnwm-menu-burger").click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "map-768-40-menu-open.png") });
  await page.close();
}

writeFileSync(join(OUT, "06-probes.json"), JSON.stringify(rep, null, 1));
console.log(JSON.stringify(rep, null, 1));
await browser.close();
