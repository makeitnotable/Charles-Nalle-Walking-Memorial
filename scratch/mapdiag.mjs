import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
p.on("console", (m) => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });
await p.goto("http://localhost:4321/map", { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(6000);
const info = await p.evaluate(() => {
  const m = window.__cnwmMap || null;
  return { hasGlobal: !!m };
});
console.log("errors:", errs.length ? errs.join("\n") : "none");
console.log(JSON.stringify(info));
await p.screenshot({ path: "docs/v4/qa/p3-map/diag-6s.png" });
await b.close();
