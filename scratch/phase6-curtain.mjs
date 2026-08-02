// Phase 6 FINAL — curtain on live: home Continue → map (stepped), + chapter
// over-title (APRIL 27, 1860) via a /map index stop card.
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase6-motion";
fs.mkdirSync(OUT, { recursive: true });
const LIVE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const errs = [];

const panelState = (p) =>
  p.evaluate(() => {
    const panel = document.getElementById("curtain-panel");
    if (!panel) return null;
    const r = panel.getBoundingClientRect();
    return {
      url: location.pathname,
      panelTop: Math.round(r.top),
      pointerEvents: panel.style.pointerEvents || getComputedStyle(panel).pointerEvents,
      text: document.getElementById("curtain-text-content")?.innerText.replace(/\n+/g, " | ") ?? "",
      flag: sessionStorage.getItem("cnwm-curtain"),
    };
  });

// ——— 1. home Continue → map, stepped ———
{
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push("nav: " + e.message));
  await p.goto(LIVE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2200); // entry animation settles
  await p.getByRole("link", { name: "Continue" }).first().click();
  await p.waitForTimeout(250);
  console.log("cover +250ms:", JSON.stringify(await panelState(p)));
  await p.screenshot({ path: `${OUT}/curtain-home-map-01-cover-250ms.png` });
  await p.waitForTimeout(300);
  console.log("cover +550ms:", JSON.stringify(await panelState(p)));
  await p.screenshot({ path: `${OUT}/curtain-home-map-02-cover-550ms.png` });
  // page B: poll until location is /map, then step the exit
  await p.waitForURL(/\/map\/?$/, { timeout: 10000 });
  await p.waitForTimeout(150);
  console.log("exit  +150ms:", JSON.stringify(await panelState(p)));
  await p.screenshot({ path: `${OUT}/curtain-home-map-03-exit-hold.png` });
  await p.waitForTimeout(450);
  console.log("exit  +600ms:", JSON.stringify(await panelState(p)));
  await p.screenshot({ path: `${OUT}/curtain-home-map-04-exit-mid.png` });
  await p.waitForTimeout(800);
  console.log("exit +1400ms:", JSON.stringify(await panelState(p)));
  await p.screenshot({ path: `${OUT}/curtain-home-map-05-exit-done.png` });
  await p.close();
}

// ——— 2. chapter nav over-title: /map index stop card → chapter ———
{
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push("overtitle: " + e.message));
  await p.goto(LIVE + "/map", { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  const card = p.locator("ol a[data-curtain-date]").first();
  await card.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await card.click();
  await p.waitForTimeout(550); // fully covered, label + date up
  const st = await panelState(p);
  console.log("overtitle cover +550ms:", JSON.stringify(st));
  console.log("HAS DATE OVER-TITLE:", /april 27, 1860/i.test(st.text));
  await p.screenshot({ path: `${OUT}/curtain-overtitle-cover.png` });
  await p.waitForURL(/\/(bakery|commissioners-office|mansion|ferry|barbershop)\/?$/, { timeout: 10000 });
  await p.waitForTimeout(120);
  const stB = await panelState(p);
  console.log("overtitle page B hold:", JSON.stringify(stB));
  console.log("PAGE B STILL SHOWS DATE:", /april 27, 1860/i.test(stB.text));
  await p.screenshot({ path: `${OUT}/curtain-overtitle-pageB-hold.png` });
  await p.waitForTimeout(1400);
  console.log("overtitle parked:", JSON.stringify(await panelState(p)));
  await p.close();
}

console.log("pageerrors:", errs.length ? errs : "none");
await browser.close();
console.log("curtain done");
