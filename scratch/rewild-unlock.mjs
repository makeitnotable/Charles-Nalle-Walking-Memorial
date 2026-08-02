import { chromium } from "playwright";

const OUT = "docs/qa/inspiration/rewild";
const W = parseInt(process.argv[2] || "1440"), H = parseInt(process.argv[3] || "900");
const TAG = `${W}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
// patch the missing asset so the loader can genuinely finish
await page.route("**/atmosphere.webp", route => route.fulfill({
  status: 200, contentType: "image/webp",
  body: Buffer.from("UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==", "base64"),
}));
await page.goto("https://rewildyourself.com/", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(7000);

// kill any leftover loader overlay
await page.evaluate(() => {
  const l = document.querySelector(".c-loader");
  if (l) { l.style.display = "none"; l.style.pointerEvents = "none"; }
});

const vy = () => page.evaluate(() => {
  const c = document.querySelector("[data-scroll-container]");
  const t = getComputedStyle(c).transform;
  if (!t || t === "none") return 0;
  return Math.round(-new DOMMatrixReadOnly(t).m42);
});

await page.mouse.move(W / 2, H / 2);
await page.mouse.wheel(0, 1500);
await page.waitForTimeout(1500);
console.log("unlock test virtualY =", await vy());

let shot = 0;
for (let i = 0; i < 26; i++) {
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(1500);
  const y = await vy();
  shot++;
  await page.screenshot({ path: `${OUT}/journey-${TAG}-${String(shot).padStart(2, "0")}-y${y}.png` });
  console.log("shot", shot, "virtualY", y);
}
await browser.close();
