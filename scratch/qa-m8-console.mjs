import { chromium } from "playwright";
const browser = await chromium.launch();
for (const path of ["/", "/bakery", "/map", "/about"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 140)));
  page.on("console", (m) => {
    if (m.type() === "error") errs.push("console: " + m.text().slice(0, 140));
  });
  await page.goto("http://localhost:4321" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(1000);
  console.log(path, errs.length ? JSON.stringify(errs) : "clean");
  await page.close();
}
await browser.close();
