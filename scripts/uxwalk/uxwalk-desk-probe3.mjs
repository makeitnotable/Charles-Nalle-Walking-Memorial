import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => {
  window.__playLog = [];
  const orig = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { const r = orig.apply(this, arguments); window.__playLog.push("play() called"); r.then(() => window.__playLog.push("resolved")).catch((e) => window.__playLog.push("rejected:" + e.name + ":" + e.message)); return r; };
  const op = HTMLMediaElement.prototype.pause;
  HTMLMediaElement.prototype.pause = function () { window.__playLog.push("pause() called"); return op.apply(this, arguments); };
  document.addEventListener("click", (e) => { window.__playLog.push("click on " + e.target.tagName + " trusted=" + e.isTrusted); }, true);
  document.addEventListener("keydown", (e) => { window.__playLog.push("keydown " + e.key + " on " + e.target.tagName + " defaultPrevented=" + e.defaultPrevented); }, true);
});
await p.goto("http://localhost:4321/bakery", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
// Tab to the button
for (let i = 0; i < 12; i++) { await p.keyboard.press("Tab"); const t = await p.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName); if (/Play narration/.test(t)) break; }
await p.evaluate(() => { window.__playLog.push("focused: " + document.activeElement.getAttribute("aria-label")); });
await p.keyboard.press("Enter");
await p.waitForTimeout(2000);
console.log("after Enter #1", await p.evaluate(() => [window.__playLog, [...document.querySelectorAll("audio")].map(a => a.paused + "@" + a.currentTime.toFixed(1))]));
await p.keyboard.press("Enter");
await p.waitForTimeout(2000);
console.log("after Enter #2", await p.evaluate(() => [window.__playLog.slice(-8), [...document.querySelectorAll("audio")].map(a => a.paused + "@" + a.currentTime.toFixed(1))]));
await b.close();
