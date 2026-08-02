#!/usr/bin/env node
/**
 * Follow-up for the three checks that the first interaction run left
 * unresolved (script locator bug, then browser crash): 1860 lens toggle,
 * paintings dialog open/close, 404 render.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:4321";
const results = [];
const pass = (n, d = "") => { results.push(true); console.log(`PASS  ${n}${d ? ` — ${d}` : ""}`); };
const fail = (n, d = "") => { results.push(false); console.log(`FAIL  ${n}${d ? ` — ${d}` : ""}`); };

const browser = await chromium.launch();

// ——— 1860 lens ———
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  try {
    await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(6000);
    const lensBtn = page.getByRole("button", { name: "See Troy in 1860" });
    await lensBtn.click({ timeout: 10000 });
    await page.waitForTimeout(1000);
    const backBtn = page.getByRole("button", { name: "Back to today" });
    const onVisible = await backBtn.isVisible();
    const overlayShown = await page
      .locator('img[alt*="1860"]')
      .evaluate((el) => {
        let n = el.parentElement;
        while (n && !n.hasAttribute("aria-hidden")) n = n.parentElement;
        return n ? { hidden: n.getAttribute("aria-hidden"), opacity: getComputedStyle(n).opacity } : null;
      });
    await backBtn.click();
    await page.waitForTimeout(1000);
    const offVisible = await page.getByRole("button", { name: "See Troy in 1860" }).isVisible();
    const overlayHidden = await page
      .locator('img[alt*="1860"]')
      .evaluate((el) => {
        let n = el.parentElement;
        while (n && !n.hasAttribute("aria-hidden")) n = n.parentElement;
        return n ? { hidden: n.getAttribute("aria-hidden"), opacity: getComputedStyle(n).opacity } : null;
      });
    if (onVisible && overlayShown?.hidden === "false" && offVisible && overlayHidden?.hidden === "true") {
      pass("1860 lens toggles", `on: opacity ${overlayShown.opacity}; off: aria-hidden restored`);
    } else {
      fail("1860 lens toggles", JSON.stringify({ onVisible, overlayShown, offVisible, overlayHidden }));
    }
    if (pageErrors.length) fail("map page errors during lens", pageErrors.join(" | "));
  } catch (e) {
    fail("1860 lens toggles", e.message.split("\n")[0]);
  }
  await context.close();
}

// ——— Paintings dialog ———
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  try {
    await page.goto(BASE + "/paintings", { waitUntil: "networkidle", timeout: 45000 });
    const first = page.locator(".painting-open").first();
    await first.scrollIntoViewIfNeeded();
    await first.click();
    await page.waitForTimeout(600);
    const dialog = page.locator("#painting-dialog");
    const opened = await dialog.evaluate((d) => d.open);
    const imgSrc = await page.locator("#painting-dialog-img").getAttribute("src");
    await page.locator("#painting-dialog-close").click();
    await page.waitForTimeout(600);
    const closed = !(await dialog.evaluate((d) => d.open));
    if (opened && closed) pass("paintings dialog opens/closes", `img ${imgSrc?.split("/").pop()}`);
    else fail("paintings dialog opens/closes", `opened=${opened} closed=${closed}`);
    if (pageErrors.length) fail("paintings page errors", pageErrors.join(" | "));
  } catch (e) {
    fail("paintings dialog opens/closes", e.message.split("\n")[0]);
  }
  await context.close();
}

// ——— 404 ———
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    const resp = await page.goto(BASE + "/nonexistent", { waitUntil: "networkidle", timeout: 45000 });
    const status = resp?.status();
    const h1 = (await page.locator("h1").textContent())?.replace(/\s+/g, " ").trim();
    const ctas = (await page.locator('a:has-text("Start at the beginning")').count()) > 0 &&
      (await page.locator('a:has-text("Open the map")').count()) > 0;
    if (h1?.includes("part of the memorial") && ctas) pass("404 page renders", `status ${status}, h1 "${h1}"`);
    else fail("404 page renders", `status ${status}, h1 "${h1}", ctas=${ctas}`);
  } catch (e) {
    fail("404 page renders", e.message.split("\n")[0]);
  }
  await context.close();
}

await browser.close();
console.log(`\n=== follow-up: ${results.filter(Boolean).length}/${results.length} passed ===`);
process.exit(results.every(Boolean) ? 0 : 1);
