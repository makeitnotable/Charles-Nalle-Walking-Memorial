import { chromium } from "playwright";

const OUT = "docs/qa/inspiration/rewild";
const W = parseInt(process.argv[2] || "1440"), H = parseInt(process.argv[3] || "900");
const SHOTS = parseInt(process.argv[4] || "24");
const browser = await chromium.launch({
  args: ["--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"],
});
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: "/tmp/rewild-video", size: { width: 640, height: 400 } },
});
const page = await ctx.newPage();
await page.route("**/atmosphere.webp", route => route.fulfill({
  status: 200, contentType: "image/webp",
  body: Buffer.from("UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==", "base64"),
}));
await page.goto("https://rewildyourself.com/", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(12000); // loader + intro timeline with real frames

const vy = () => page.evaluate(() => {
  const c = document.querySelector("[data-scroll-container]");
  const t = getComputedStyle(c).transform;
  if (!t || t === "none") return 0;
  return Math.round(-new DOMMatrixReadOnly(t).m42);
});

await page.mouse.move(W / 2, H / 2);
await page.mouse.wheel(0, 1200);
await page.waitForTimeout(1200);
console.log("unlock test virtualY =", await vy());

let last = -1;
for (let shot = 1; shot <= SHOTS; shot++) {
  await page.mouse.wheel(0, 1300);
  await page.waitForTimeout(350);
  await page.mouse.wheel(0, 1300);
  await page.waitForTimeout(1400); // let smooth lerp settle
  const y = await vy();
  await page.screenshot({ path: `${OUT}/journey-${W}-${String(shot).padStart(2, "0")}-y${y}.png` });
  console.log("shot", shot, "virtualY", y);
  if (y === last && y > 30000) break;
  last = y;
}
await ctx.close();
await browser.close();
