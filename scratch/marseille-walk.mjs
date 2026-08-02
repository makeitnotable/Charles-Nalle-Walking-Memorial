#!/usr/bin/env node
// Walk the Marseille experience: loader -> onboarding -> intro -> map -> pin states.
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
let shot = 0;
const snap = async (name) => {
  shot++;
  const f = `walk-${vpName}-${String(shot).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: join(OUT, f) });
  say(`SHOT ${f} | url=${page.url()}`);
};
const dumpDom = async (tag) => {
  const d = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const els = [...document.querySelectorAll("div,button,a,span,h1,h2,h3")].filter(
      (e) => vis(e) && e.className && typeof e.className === "string" &&
        /pin|marker|card|carousel|district|Button|menu|nav|title|question|intro|video|skip|sound|audio|compass|zoom/i.test(e.className)
    );
    const seen = new Set();
    return els.map((e) => {
      const key = e.className;
      if (seen.has(key)) return null;
      seen.add(key);
      const r = e.getBoundingClientRect();
      return { cls: e.className.slice(0, 70), text: (e.innerText || "").trim().slice(0, 70).replace(/\n/g, " / "), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    }).filter(Boolean).slice(0, 60);
  });
  say(`DOM[${tag}]: ` + JSON.stringify(d, null, 1));
  return d;
};

await page.goto("https://marseille.laphase5.com/en", { waitUntil: "networkidle", timeout: 120000 });
say("networkidle reached");
// loader counts to 100 then transitions; give it time
await page.waitForTimeout(8000);
await snap("post-loader");
await dumpDom("post-loader");

// Click "Next" style Preload button (real click)
for (const sel of [".Preload-Button", ".Button-container", "text=Next"]) {
  const loc = page.locator(sel).first();
  if (await loc.count()) {
    try { await loc.click({ timeout: 3000 }); say(`clicked ${sel}`); break; } catch (e) { say(`click ${sel} failed: ${e.message.split("\n")[0]}`); }
  }
}
await page.waitForTimeout(6000);
await snap("after-next");
await dumpDom("after-next");

// Generic advance loop: click any visible obvious CTA up to 6 times
for (let i = 0; i < 6; i++) {
  const info = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.y >= 0 && r.y < innerHeight; };
    const cands = [...document.querySelectorAll("[class*=Button], [class*=button], button, a, [class*=Skip], [class*=skip], [class*=Cta], [class*=cta]")]
      .filter(vis)
      .map((e) => {
        const r = e.getBoundingClientRect();
        return { text: (e.innerText || "").trim().slice(0, 50), cls: String(e.className).slice(0, 60), cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
      })
      .filter((c) => c.text || /Button|Skip|Cta/i.test(c.cls));
    return cands.slice(0, 12);
  });
  say(`cands: ` + JSON.stringify(info));
  const pick = info.find((c) => /skip|next|start|begin|explore|discover|continue|launch|visit|let/i.test(c.text)) ||
               info.find((c) => /Skip/i.test(c.cls)) || info[0];
  if (!pick) { say("no candidates; stopping advance loop"); break; }
  await page.mouse.click(pick.cx, pick.cy);
  say(`advance ${i}: clicked "${pick.text || pick.cls}" @ ${Math.round(pick.cx)},${Math.round(pick.cy)}`);
  await page.waitForTimeout(6000);
  await snap(`advance-${i}-${(pick.text || pick.cls).replace(/[^a-z0-9]+/gi, "_").slice(0, 16)}`);
  const bt = await page.evaluate(() => document.body.innerText.slice(0, 400).replace(/\n+/g, " | "));
  say(`bodyText: ${bt}`);
  if (/map|district|pin/i.test(await page.evaluate(() => [...document.querySelectorAll('[class*="pin" i],[class*="Map" i]')].map(e => e.className).join(",")))) {
    say("map-ish DOM detected");
  }
}
await dumpDom("end-of-advance");
writeFileSync(join(OUT, `walk-${vpName}-log.txt`), log.join("\n\n"));
await browser.close();
