#!/usr/bin/env node
// Sample pixels from the legacy map screenshot to confirm marker pill colors.
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";

const img = pathToFileURL(
  process.cwd() + "/docs/qa/legacy/map--1440.png",
).href;

const browser = await chromium.launch({
  args: ["--allow-file-access-from-files", "--disable-web-security"],
});
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
await page.goto(img);
await page.waitForLoadState("networkidle");

const samples = await page.evaluate(async () => {
  const im = document.querySelector("img");
  await im.decode();
  const c = document.createElement("canvas");
  c.width = im.naturalWidth; c.height = im.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(im, 0, 0);
  const px = (x, y) => {
    const d = ctx.getImageData(x, y, 1, 1).data;
    return `#${[d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  };
  // Bakery pill ~ (816-860, 336-356); chip circle ~ (817,345); pill body right of label ~ (856,345)
  // Scan a horizontal strip through the Bakery pill and report distinct colors
  const strip = [];
  for (let x = 805; x <= 870; x += 1) strip.push(px(x, 345));
  return {
    bakeryPillBody: px(860, 340),
    bakeryPillBody2: px(830, 352),
    bakeryChip: px(817, 345),
    mansionPillBody: px(755, 240),
    mansionChip: px(713, 247),
    strip: [...new Set(strip)],
  };
});
await browser.close();
console.log(JSON.stringify(samples, null, 2));
