#!/usr/bin/env node
/**
 * Phase 6 FINAL live interactions gate.
 *  1+2. menu links navigate x2 ("3. Mansion", "The Walk")
 *  3.   chapter "Continue the walk" navigates — and the curtain carries the
 *       "April 27, 1860" over-title (elevation C13)
 *  4.   map: marker click -> carousel -> active card click -> navigates to chapter
 *  5.   paintings dialog opens (animated mp4 plays where available, G2) / closes
 *  6.   404 page renders at /nonexistent
 * Evidence screenshots into docs/qa/phase6-qa/.
 */
import { chromium } from "playwright";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const OUT = "docs/qa/phase6-qa";
const results = [];
const pass = (name, detail = "") => { results.push({ name, ok: true, detail }); console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`); };
const fail = (name, detail = "") => { results.push({ name, ok: false, detail }); console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`); };

const browser = await chromium.launch();

async function newPage(opts = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    ...opts,
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  return { context, page, pageErrors };
}

// ——— 1+2. Menu links x2 ———
const menuSamples = [
  { label: "3. Mansion", urlPart: "/mansion" },
  { label: "The Walk", urlPart: "/map" },
];
for (const s of menuSamples) {
  const { context, page } = await newPage();
  try {
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
    await page.locator(".cnwm-menu-burger").click();
    const link = page.locator(".cnwm-menu-panel a", { hasText: s.label }).first();
    await link.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(700); // open animation
    await link.click();
    await page.waitForURL(`**${s.urlPart}**`, { timeout: 20000 });
    await page.waitForLoadState("networkidle", { timeout: 45000 });
    pass(`menu link "${s.label}" navigates`, page.url());
  } catch (e) {
    fail(`menu link "${s.label}" navigates`, e.message.split("\n")[0]);
  }
  await context.close();
}

// ——— 3. Continue the walk + curtain C13 date over-title ———
{
  const { context, page } = await newPage();
  try {
    await page.goto(BASE + "/mansion", { waitUntil: "networkidle", timeout: 60000 });
    // record curtain content whenever it changes (C13 evidence)
    await page.evaluate(() => {
      window.__curtainLog = [];
      const content = document.getElementById("curtain-text-content");
      if (content) {
        new MutationObserver(() => {
          window.__curtainLog.push(content.textContent.replace(/\s+/g, " ").trim());
        }).observe(content, { childList: true, subtree: true });
      }
    });
    const cont = page.locator('a:has-text("Continue the walk")');
    await cont.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const curtainLogP = page
      .waitForFunction(() => window.__curtainLog && window.__curtainLog.length > 0, null, { timeout: 5000 })
      .then(() => page.evaluate(() => window.__curtainLog))
      .catch(() => []);
    await cont.click();
    const log = await curtainLogP;
    await page.waitForURL((u) => !u.pathname.endsWith("/mansion") && !u.pathname.endsWith("/mansion/"), { timeout: 20000 });
    pass('"Continue the walk" navigates', page.url());
    const hasDate = (log || []).some((t) => t.includes("April 27, 1860"));
    if (hasDate) pass("C13 curtain date over-title", `curtain read: "${(log || []).find((t) => t.includes("April 27"))}"`);
    else fail("C13 curtain date over-title", `curtain log: ${JSON.stringify(log)}`);
  } catch (e) {
    fail('"Continue the walk" navigates', e.message.split("\n")[0]);
  }
  await context.close();
}

// ——— 4. Map: marker -> carousel -> active card -> chapter ———
{
  const { context, page, pageErrors } = await newPage();
  try {
    await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(9000); // overview prologue + route draw settle

    const marker = page.locator('button[aria-label^="Stop 3"]').first();
    await marker.waitFor({ state: "visible", timeout: 20000 });
    await marker.click({ timeout: 8000 });
    const carousel = page.locator('[role="region"][aria-label="Stop cards"]');
    await carousel.waitFor({ state: "visible", timeout: 8000 });
    const cardCount = await carousel.locator(".keen-slider__slide").count();
    pass("marker click -> carousel appears", `${cardCount} cards`);
    await page.waitForTimeout(6500); // flyTo settle
    await page.screenshot({ path: `${OUT}/map-marker3-carousel-1440.png` });

    const activeCard = page.locator('[role="button"][aria-label^="Enter Chapter 3"]');
    await activeCard.waitFor({ state: "visible", timeout: 8000 });
    await activeCard.click();
    await page.waitForURL("**/barbershop**", { timeout: 20000 });
    pass("active card -> navigates to chapter", page.url());
  } catch (e) {
    fail("map marker/carousel/card navigation", e.message.split("\n")[0]);
  }
  if (pageErrors.length) console.log("  map pageerrors:", pageErrors.join(" | "));
  await context.close();
}

// ——— 5. Paintings dialog (+ G2 animated loop) ———
{
  const { context, page, pageErrors } = await newPage();
  try {
    await page.goto(BASE + "/paintings", { waitUntil: "networkidle", timeout: 60000 });
    // prefer a painting with an animated variant (G2)
    const withVideo = page.locator(".painting-open[data-video]").first();
    const target = (await withVideo.count()) ? withVideo : page.locator(".painting-open").first();
    await target.scrollIntoViewIfNeeded();
    await target.click();
    const dialog = page.locator("#painting-dialog");
    await page.waitForTimeout(1200);
    const openAttr = await dialog.evaluate((d) => d.open);
    if (!openAttr) throw new Error("dialog did not open");
    const vid = await page.evaluate(() => {
      const v = document.getElementById("painting-dialog-video");
      return {
        hidden: v.classList.contains("hidden"),
        src: v.currentSrc || v.src || "",
        paused: v.paused,
        readyState: v.readyState,
      };
    });
    await page.screenshot({ path: `${OUT}/paintings-dialog-1440.png` });
    await page.locator("#painting-dialog-close").click();
    await page.waitForTimeout(500);
    const stillOpen = await dialog.evaluate((d) => d.open);
    if (!stillOpen) pass("paintings dialog opens/closes");
    else fail("paintings dialog opens/closes", "dialog did not close");
    if (!vid.hidden && vid.src.endsWith(".mp4") && !vid.paused)
      pass("G2 dialog animated painting plays", vid.src.split("/").slice(-2).join("/"));
    else
      fail("G2 dialog animated painting plays", JSON.stringify(vid));
  } catch (e) {
    fail("paintings dialog opens/closes", e.message.split("\n")[0]);
  }
  if (pageErrors.length) console.log("  paintings pageerrors:", pageErrors.join(" | "));
  await context.close();
}

// ——— 6. 404 page ———
{
  const { context, page } = await newPage();
  try {
    const resp = await page.goto(BASE + "/nonexistent", { waitUntil: "networkidle", timeout: 60000 });
    const status = resp?.status();
    const h1 = (await page.locator("h1").textContent())?.replace(/\s+/g, " ").trim();
    const hasCtas = (await page.locator('a:has-text("Start at the beginning")').count()) > 0;
    await page.screenshot({ path: `${OUT}/404-live-1440.png` });
    if (status === 404 && h1?.includes("part of the memorial") && hasCtas) {
      pass("404 page renders on live", `status ${status}, h1 "${h1}"`);
    } else {
      fail("404 page renders on live", `status ${status}, h1 "${h1}", ctas=${hasCtas}`);
    }
  } catch (e) {
    fail("404 page renders on live", e.message.split("\n")[0]);
  }
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n=== interactions: ${results.length - failed.length}/${results.length} passed ===`);
process.exit(failed.length ? 1 : 0);
