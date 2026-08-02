#!/usr/bin/env node
// Pin choreography probe: hover exact WebGL pin, click, frame-by-frame transition, 360 detail, Discover more.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "docs/qa/inspiration/marseille";
mkdirSync(OUT, { recursive: true });
const vpName = process.argv[2] === "390" ? "390" : "1440";
const vp = vpName === "390" ? { width: 390, height: 844 } : { width: 1440, height: 900 };
// pin coords on the deterministic initial camera (from map-1440-01 screenshot)
const PIN = vpName === "390" ? { x: 205, y: 355 } : { x: 755, y: 362 };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const log = [];
const say = (s) => { log.push(s); console.log(s); };
let n = 0;
const snap = async (name) => {
  n++;
  const f = `pin-${vpName}-${String(n).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: join(OUT, f) });
  say(`SHOT ${f} | ${page.url()}`);
};

await page.goto("https://marseille.laphase5.com/en", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(8000);
try { await page.locator(".Preload-Button").first().click({ timeout: 5000 }); } catch {}
await page.waitForTimeout(3000);
try { await page.locator(".intro-skip .Button, .intro-skip").first().click({ timeout: 8000 }); } catch {}
await page.waitForTimeout(7000);
await snap("map");

// hover exact pin
await page.mouse.move(PIN.x, PIN.y, { steps: 25 });
await page.waitForTimeout(1800);
await snap("hover");
const hoverDom = await page.evaluate(() =>
  [...document.querySelectorAll("[class*='ooltip' i],[class*='hover' i],[class*='label' i],[class*='Preview' i],[class*='name' i]")]
    .map((e) => { const r = e.getBoundingClientRect(); return { cls: String(e.className).slice(0, 60), t: (e.innerText || "").trim().slice(0, 50), w: Math.round(r.width), x: Math.round(r.x), y: Math.round(r.y) }; })
    .filter((d) => d.w > 0 && (d.t || /ooltip|hover|Preview/i.test(d.cls))).slice(0, 15)
);
say("HOVER DOM: " + JSON.stringify(hoverDom));
const cursor = await page.evaluate(() => getComputedStyle(document.querySelector(".WebGL canvas") || document.body).cursor);
say("cursor on hover: " + cursor);

// click and capture transition frames
await page.mouse.click(PIN.x, PIN.y);
say(`clicked pin @ ${PIN.x},${PIN.y}`);
for (let i = 1; i <= 5; i++) {
  await page.waitForTimeout(900);
  await snap(`t${i}`);
}
await page.waitForTimeout(4000);
await snap("settled");
say("url now: " + page.url());
const bt = await page.evaluate(() => document.body.innerText.slice(0, 500).replace(/\n+/g, " | "));
say("bodyText: " + bt);

// Discover more
try {
  const dm = page.locator("text=Discover more").first();
  if (await dm.count()) {
    await dm.click({ timeout: 4000 });
    await page.waitForTimeout(4000);
    await snap("discover-more");
    const bt2 = await page.evaluate(() => document.body.innerText.slice(0, 1200).replace(/\n+/g, " | "));
    say("discover bodyText: " + bt2);
  } else say("no Discover more");
} catch (e) { say("discover failed: " + e.message.split("\n")[0]); }

// drag inside 360 to look around
await page.mouse.move(vp.width / 2, vp.height / 2);
await page.mouse.down();
await page.mouse.move(vp.width / 2 + 350, vp.height / 2, { steps: 25 });
await page.mouse.up();
await page.waitForTimeout(2000);
await snap("look-around");

// close back to map
try { await page.locator(".CloseButton").first().click({ timeout: 4000 }); await page.waitForTimeout(2500); await snap("closing"); await page.waitForTimeout(4000); await snap("back-on-map"); } catch (e) { say("close failed"); }

writeFileSync(join(OUT, `pin-${vpName}-log.txt`), log.join("\n\n"));
await browser.close();
