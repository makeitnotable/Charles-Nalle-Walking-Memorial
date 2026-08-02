import { chromium } from "playwright";

const OUT = "docs/qa/inspiration/rewild";
const browser = await chromium.launch({ headless: false, args: ["--window-position=0,0"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://rewildyourself.com/", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(7000);

const vy = () => page.evaluate(() => {
  const c = document.querySelector("[data-scroll-container]");
  const t = getComputedStyle(c).transform;
  if (!t || t === "none") return 0;
  return Math.round(-new DOMMatrixReadOnly(t).m42);
});

await page.mouse.move(720, 450);
await page.mouse.wheel(0, 2000);
await page.waitForTimeout(1500);
let y = await vy();
console.log("after real wheel, virtualY =", y);

if (y < 100) {
  // fallback: click WELCOME
  try {
    await page.getByText("WELCOME", { exact: false }).first().click({ timeout: 5000 });
    await page.waitForTimeout(2500);
    y = await vy();
    console.log("after WELCOME click, virtualY =", y);
  } catch (e) { console.log("welcome click failed", e.message); }
}

if ((await vy()) > 100 || true) {
  let shot = 0;
  for (let i = 0; i < 25; i++) {
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(1300);
    shot++;
    y = await vy();
    await page.screenshot({ path: `${OUT}/journey-1440-${String(shot).padStart(2, "0")}-y${y}.png` });
    console.log("shot", shot, "virtualY", y);
  }
}
await browser.close();
