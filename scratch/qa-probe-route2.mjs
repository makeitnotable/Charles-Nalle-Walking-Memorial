import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.route("**/map", () => {}); // stall forever: the "hung load"
page.on("console", (m) => {
  if (m.text().startsWith("CURTAIN ")) console.log(m.text());
});
await page.goto("http://localhost:4321/", { waitUntil: "load", timeout: 15000 });
await page.waitForTimeout(1500);
// recorder: logs curtain state every 500ms from inside the live renderer
await page.evaluate(() => {
  const t0 = performance.now();
  setInterval(() => {
    const p = document.getElementById("curtain-panel");
    if (!p) return;
    const r = p.getBoundingClientRect();
    console.log(
      "CURTAIN " +
        JSON.stringify({
          t: Math.round(performance.now() - t0),
          top: Math.round(r.top),
          pe: p.style.pointerEvents,
          flag: sessionStorage.getItem("cnwm-curtain"),
          path: location.pathname,
        }),
    );
  }, 500);
});
await page.evaluate(() => {
  document.querySelector('a[href="/map"]').dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
});
await page.waitForTimeout(6500);
await browser.close();
console.log("done");
