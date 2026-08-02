#!/usr/bin/env node
/**
 * Phase 2+3 QA smoke: interaction checklist.
 *  1. menu links navigate (sample 3: Mansion, The Walk, About)
 *  2. chapter "Continue the walk" navigates
 *  3. share button doesn't throw
 *  4. map marker click -> carousel appears
 *  5. map Overview button returns to overview
 *  6. 1860 lens toggles
 *  7. paintings dialog opens/closes
 *  8. 404 page renders for /nonexistent
 */
import { chromium } from "playwright";

const BASE = "http://localhost:4321";
const results = [];
const pass = (name, detail = "") => { results.push({ name, ok: true, detail }); console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`); };
const fail = (name, detail = "") => { results.push({ name, ok: false, detail }); console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`); };

const browser = await chromium.launch();

async function newPage(opts = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    permissions: ["clipboard-read", "clipboard-write"],
    ...opts,
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  return { context, page, pageErrors };
}

// ——— 1. Menu links (sample 3) ———
const menuSamples = [
  { label: "3. Mansion", urlPart: "/mansion" },
  { label: "The Walk", urlPart: "/map" },
  { label: "About", urlPart: "/about" },
];
for (const s of menuSamples) {
  const { context, page } = await newPage();
  try {
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 45000 });
    await page.locator(".cnwm-menu-burger").click();
    const link = page.locator(".cnwm-menu-panel a", { hasText: s.label }).first();
    await link.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(700); // open animation
    await link.click();
    await page.waitForURL(`**${s.urlPart}**`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 30000 });
    pass(`menu link "${s.label}" navigates`, page.url());
  } catch (e) {
    fail(`menu link "${s.label}" navigates`, e.message.split("\n")[0]);
  }
  await context.close();
}

// ——— 2 + 3. Chapter page: Continue the walk + Share ———
{
  const { context, page, pageErrors } = await newPage();
  try {
    await page.goto(BASE + "/mansion", { waitUntil: "networkidle", timeout: 45000 });
    const shareBtn = page.locator("#share-btn");
    await shareBtn.scrollIntoViewIfNeeded();
    await shareBtn.click();
    await page.waitForTimeout(1000);
    const txt = await shareBtn.textContent();
    if (pageErrors.length) fail("share button doesn't throw", pageErrors.join(" | "));
    else pass("share button doesn't throw", `button text now: "${txt?.trim()}"`);
  } catch (e) {
    fail("share button doesn't throw", e.message.split("\n")[0]);
  }
  try {
    const cont = page.locator('a:has-text("Continue the walk")');
    await cont.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await cont.click();
    await page.waitForURL((u) => u.pathname !== "/mansion", { timeout: 15000 });
    pass('"Continue the walk" navigates', page.url());
  } catch (e) {
    fail('"Continue the walk" navigates', e.message.split("\n")[0]);
  }
  if (pageErrors.length) console.log("  chapter pageerrors:", pageErrors.join(" | "));
  await context.close();
}

// ——— 4/5/6. Map interactions ———
{
  const { context, page, pageErrors } = await newPage();
  try {
    await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(8000); // overview prologue + route draw settle

    // 4. marker click -> carousel
    const marker = page.locator('button[aria-label^="Stop 3"]');
    await marker.waitFor({ state: "visible", timeout: 15000 });
    await marker.click({ timeout: 8000 });
    const carousel = page.locator('[role="region"][aria-label="Stop cards"]');
    await carousel.waitFor({ state: "visible", timeout: 8000 });
    const cardCount = await carousel.locator(".keen-slider__slide").count();
    pass("marker click -> carousel appears", `${cardCount} cards`);

    // 5. Overview returns
    const overviewBtn = page.locator('button:has-text("Overview")');
    await overviewBtn.click({ timeout: 5000 });
    await carousel.waitFor({ state: "detached", timeout: 8000 });
    const doorsVisible = await page.locator('button:has-text("See Troy in 1860")').isVisible();
    if (doorsVisible) pass("Overview button returns to overview");
    else fail("Overview button returns to overview", "experience doors not visible after Overview");

    // 6. 1860 lens toggles
    const lensBtn = page.locator('button:has-text("See Troy in 1860")');
    await lensBtn.click();
    await page.waitForTimeout(900);
    const lensImg = page.locator('img[alt*="1860"]');
    const shown = await lensImg.evaluate((el) => {
      const overlay = el.closest("div.absolute.inset-0") ?? el.closest("div[aria-hidden]");
      const wrap = el.closest(".pointer-events-none") ?? overlay;
      return wrap ? getComputedStyle(wrap).opacity : "?";
    });
    const btnText1 = (await page.locator('button[aria-pressed]').textContent())?.trim();
    const backBtn = page.locator('button:has-text("Back to today")');
    const toggledOn = (await backBtn.count()) > 0 && shown === "1";
    await backBtn.click();
    await page.waitForTimeout(900);
    const toggledOff = (await page.locator('button:has-text("See Troy in 1860")').count()) > 0;
    if (toggledOn && toggledOff) pass("1860 lens toggles", `overlay opacity ${shown}, button "${btnText1}" -> back`);
    else fail("1860 lens toggles", `on=${toggledOn} (opacity ${shown}), off=${toggledOff}`);
  } catch (e) {
    fail("map interactions", e.message.split("\n")[0]);
  }
  if (pageErrors.length) console.log("  map pageerrors:", pageErrors.join(" | "));
  await context.close();
}

// ——— 7. Paintings dialog ———
{
  const { context, page, pageErrors } = await newPage();
  try {
    await page.goto(BASE + "/paintings", { waitUntil: "networkidle", timeout: 45000 });
    const first = page.locator(".painting-open").first();
    await first.scrollIntoViewIfNeeded();
    await first.click();
    const dialog = page.locator("#painting-dialog");
    await page.waitForTimeout(500);
    const openAttr = await dialog.evaluate((d) => d.open);
    if (!openAttr) throw new Error("dialog did not open");
    const imgSrc = await page.locator("#painting-dialog-img").getAttribute("src");
    await page.locator("#painting-dialog-close").click();
    await page.waitForTimeout(500);
    const stillOpen = await dialog.evaluate((d) => d.open);
    if (!stillOpen) pass("paintings dialog opens/closes", `img: ${imgSrc?.split("/").pop()}`);
    else fail("paintings dialog opens/closes", "dialog did not close");
  } catch (e) {
    fail("paintings dialog opens/closes", e.message.split("\n")[0]);
  }
  if (pageErrors.length) console.log("  paintings pageerrors:", pageErrors.join(" | "));
  await context.close();
}

// ——— 8. 404 page ———
{
  const { context, page, pageErrors } = await newPage();
  try {
    const resp = await page.goto(BASE + "/nonexistent", { waitUntil: "networkidle", timeout: 45000 });
    const status = resp?.status();
    const h1 = (await page.locator("h1").textContent())?.replace(/\s+/g, " ").trim();
    const hasCtas = (await page.locator('a:has-text("Start at the beginning")').count()) > 0;
    if (h1?.includes("part of the memorial") && hasCtas) {
      pass("404 page renders", `status ${status}, h1 "${h1}"`);
    } else {
      fail("404 page renders", `status ${status}, h1 "${h1}", ctas=${hasCtas}`);
    }
  } catch (e) {
    fail("404 page renders", e.message.split("\n")[0]);
  }
  if (pageErrors.length) console.log("  404 pageerrors:", pageErrors.join(" | "));
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n=== interactions: ${results.length - failed.length}/${results.length} passed ===`);
process.exit(failed.length ? 1 : 0);
