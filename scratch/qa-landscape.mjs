#!/usr/bin/env node
/**
 * Phase 2+3 QA smoke: landscape phone captures.
 * /bakery and /map at 844x390 (landscape iPhone).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:4321";
const OUT = "docs/qa/phase23-qa";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 844, height: 390 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
page.on("pageerror", (e) => console.error(`pageerror: ${e}`));

for (const route of ["/bakery", "/map"]) {
  const slug = route.replace(/\//g, "");
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(OUT, `${slug}--landscape-844x390.png`) });
  // one mid-scroll shot on the long page
  const docH = await page.evaluate(() => document.body.scrollHeight);
  if (docH > 390 * 1.5) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(docH / 2));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT, `${slug}--landscape-844x390--mid.png`) });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 390));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT, `${slug}--landscape-844x390--end.png`) });
  }
  // horizontal overflow check
  const overflow = await page.evaluate(() => {
    const d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth };
  });
  console.log(`${slug}: docWidth ${overflow.scrollW} vs viewport ${overflow.clientW}${overflow.scrollW > overflow.clientW ? "  << HORIZONTAL OVERFLOW" : ""}`);
}

await browser.close();
console.log("landscape captures done");
