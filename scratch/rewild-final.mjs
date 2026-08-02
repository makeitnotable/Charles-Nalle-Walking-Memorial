import { chromium } from "playwright";

const OUT = "docs/qa/inspiration/rewild";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://rewildyourself.com/", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(8000);

// 1) menu overlay: click hamburger, capture mid-animation and settled
const burger = await page.$(".header button, .c-burger, [class*='burger'], [class*='menu-btn'], header button");
const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map(a => a.getAttribute("href")).filter(h => h && h.startsWith("https://rewildyourself.com")).slice(0, 30));
console.log("links:", JSON.stringify([...new Set(links)]));
if (burger) {
  await burger.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/menu-mid.png` });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/menu-open.png` });
  const menuInfo = await page.evaluate(() => {
    const nav = document.querySelector("nav, .c-nav, [class*='nav']");
    return nav ? { cls: nav.className.slice(0, 80) } : null;
  });
  console.log("menu:", JSON.stringify(menuInfo));
}

// 2) forced-transform walk of home sections (composition reveal)
for (const y of [2000, 5000, 12000, 21000, 26000, 31000, 36000]) {
  await page.evaluate((y) => {
    const c = document.querySelector("[data-scroll-container]");
    c.style.transform = `matrix(1,0,0,1,0,${-y})`;
  }, y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/forced-1440-y${y}.png` });
  console.log("forced shot y", y);
}
await page.close();

// 3) interior page: welcome/about page with native-ish scroll?
const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p2.goto("https://rewildyourself.com/welcome/", { waitUntil: "networkidle", timeout: 90000 }).catch(async () => {
  await p2.goto("https://rewildyourself.com/about/", { waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
});
await p2.waitForTimeout(8000);
await p2.screenshot({ path: `${OUT}/interior-top.png` });
const vy2 = await p2.evaluate(() => {
  const c = document.querySelector("[data-scroll-container]");
  if (!c) return "no container";
  const t = getComputedStyle(c).transform;
  return t;
});
console.log("interior url:", p2.url(), "container transform:", vy2);
await p2.mouse.move(720, 450);
await p2.mouse.wheel(0, 2500);
await p2.waitForTimeout(1500);
await p2.screenshot({ path: `${OUT}/interior-scrolled.png` });
console.log("interior scrollY:", await p2.evaluate(() => window.scrollY));
await browser.close();
