#!/usr/bin/env node
// Deep map probe: pin hover/click choreography, All places, drag, edge counters.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "docs/qa/inspiration/marseille";
mkdirSync(OUT, { recursive: true });
const vpName = process.argv[2] === "390" ? "390" : "1440";
const vp = vpName === "390" ? { width: 390, height: 844 } : { width: 1440, height: 900 };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const log = [];
const say = (s) => { log.push(s); console.log(s); };
let n = 0;
const snap = async (name) => {
  n++;
  const f = `map-${vpName}-${String(n).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: join(OUT, f) });
  say(`SHOT ${f} | ${page.url()}`);
};

await page.goto("https://marseille.laphase5.com/en", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(8000);
// onboarding Next
try { await page.locator(".Preload-Button").first().click({ timeout: 5000 }); say("clicked Next"); } catch { say("no Next"); }
await page.waitForTimeout(3000);
// skip intro
try { await page.locator(".intro-skip .Button, .intro-skip").first().click({ timeout: 8000 }); say("clicked Skip intro"); } catch (e) { say("no skip: " + e.message.split("\n")[0]); }
await page.waitForTimeout(7000);
await snap("map-initial");

// Dump full map DOM structure
const dom = await page.evaluate(() => {
  const out = [];
  const walk = (el, depth) => {
    if (depth > 7 || out.length > 120) return;
    const cls = typeof el.className === "string" ? el.className : "";
    if (cls && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      if (r.width > 0)
        out.push(`${"  ".repeat(depth)}${el.tagName}.${cls.split(" ").join(".")} [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}] "${(el.innerText || "").trim().slice(0, 40).replace(/\n/g, "/")}"`);
    }
    for (const c of el.children) walk(c, depth + 1);
  };
  walk(document.body, 0);
  return out.join("\n");
});
say("MAP DOM TREE:\n" + dom);

// Find pins: DOM elements with class containing pin/Pin
const pins = await page.evaluate(() => {
  return [...document.querySelectorAll("[class*='pin' i]")].map((e) => {
    const r = e.getBoundingClientRect();
    return { cls: String(e.className).slice(0, 60), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width), h: Math.round(r.height), text: (e.innerText || "").trim().slice(0, 40) };
  }).filter((p) => p.w > 0);
});
say("PINS: " + JSON.stringify(pins, null, 1));

// Hover a pin (DOM pin if exists, else a known pin coordinate from screenshot)
let target = pins.find((p) => p.y > 100 && p.y < vp.height - 100);
const hoverPt = target ? { x: target.x, y: target.y } : vpName === "390" ? { x: 195, y: 350 } : { x: 755, y: 360 };
await page.mouse.move(hoverPt.x, hoverPt.y, { steps: 20 });
await page.waitForTimeout(2500);
await snap("pin-hover");

// Click the pin
await page.mouse.click(hoverPt.x, hoverPt.y);
say(`clicked pin @ ${hoverPt.x},${hoverPt.y}`);
await page.waitForTimeout(2500);
await snap("pin-click-during"); // mid camera move
await page.waitForTimeout(5000);
await snap("pin-click-settled");
const bt1 = await page.evaluate(() => document.body.innerText.slice(0, 600).replace(/\n+/g, " | "));
say("after pin click bodyText: " + bt1);
const dom2 = await page.evaluate(() =>
  [...document.querySelectorAll("[class*='card' i],[class*='place' i],[class*='panel' i],[class*='detail' i],[class*='vignette' i],[class*='popup' i]")].map((e) => {
    const r = e.getBoundingClientRect();
    return `${e.tagName}.${String(e.className).slice(0, 70)} [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}] "${(e.innerText || "").trim().slice(0, 80).replace(/\n/g, "/")}"`;
  }).filter((s) => !s.includes(" 0x")).slice(0, 30).join("\n")
);
say("CARD DOM:\n" + dom2);

// If a detail/place view opened, try to go deeper or close
const closeBtn = page.locator(".CloseButton:not(.Button-inactive)").first();
// try clicking a "Discover"/"Visit" CTA inside card
const cta = await page.evaluate(() => {
  const els = [...document.querySelectorAll("[class*=Button], button")].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && /discover|visit|explore|see|360|enter/i.test(e.innerText || "");
  });
  if (els.length) { const r = els[0].getBoundingClientRect(); return { text: els[0].innerText.trim().slice(0, 40), x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
  return null;
});
if (cta) {
  await page.mouse.click(cta.x, cta.y);
  say(`clicked card CTA "${cta.text}"`);
  await page.waitForTimeout(8000);
  await snap("place-detail");
  const bt2 = await page.evaluate(() => document.body.innerText.slice(0, 700).replace(/\n+/g, " | "));
  say("detail bodyText: " + bt2);
  // close back to map
  try { await page.locator(".CloseButton").first().click({ timeout: 4000 }); await page.waitForTimeout(5000); await snap("back-to-map"); } catch {}
} else {
  say("no card CTA found");
  try { if (await closeBtn.count()) { await closeBtn.click({ timeout: 3000 }); await page.waitForTimeout(4000); await snap("closed-card"); } } catch {}
}

// All places list
try {
  await page.locator(".footer-button_list").first().click({ timeout: 5000 });
  await page.waitForTimeout(4000);
  await snap("all-places");
  const bt3 = await page.evaluate(() => document.body.innerText.slice(0, 900).replace(/\n+/g, " | "));
  say("all-places bodyText: " + bt3);
  // click first list item
  const item = await page.evaluate(() => {
    const els = [...document.querySelectorAll("[class*='list' i] [class*='item' i], [class*='Place' i]")].filter((e) => e.getBoundingClientRect().height > 20);
    if (els.length) { const r = els[0].getBoundingClientRect(); return { text: (els[0].innerText || "").trim().slice(0, 50), x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
    return null;
  });
  if (item) {
    await page.mouse.click(item.x, item.y);
    say(`clicked list item "${item.text}"`);
    await page.waitForTimeout(6000);
    await snap("list-item-selected");
  }
} catch (e) { say("all places failed: " + e.message.split("\n")[0]); }

// Drag the map to show edge counters shifting
await page.mouse.move(vp.width / 2, vp.height / 2);
await page.mouse.down();
await page.mouse.move(vp.width / 2 - 400, vp.height / 2 - 150, { steps: 30 });
await page.mouse.up();
await page.waitForTimeout(3000);
await snap("after-drag");

// Center the map
try { await page.locator(".footer-button_center").first().click({ timeout: 4000 }); await page.waitForTimeout(4000); await snap("recentered"); } catch (e) { say("center failed"); }

writeFileSync(join(OUT, `map-${vpName}-log.txt`), log.join("\n\n"));
await browser.close();
