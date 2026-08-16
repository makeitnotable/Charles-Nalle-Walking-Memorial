import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const k = process.argv[2] || "d1440";
const c = await ctx(browser, VPS[k]);
const page = await c.newPage();
const log = watch(page);
await page.goto(BASE + "/commissioners-office", { waitUntil: "networkidle" });
await sleep(1000);
const state = () => page.evaluate(() => ({
  audio: [...document.querySelectorAll("audio")].map((a) => ({ src: a.currentSrc.split("/").pop(), t: +a.currentTime.toFixed(2), paused: a.paused, rs: a.readyState, ns: a.networkState })),
  btns: [...document.querySelectorAll('button[aria-label*="narration"]')].map((b) => b.getAttribute("aria-label")),
  fixed: [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 0 && !e.id.startsWith("curtain") && !e.matches("nav,.cnwm-menu,.cnwm-menu *")).map((e) => { const r = e.getBoundingClientRect(); return `@${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} "${e.textContent.trim().slice(0, 30)}"`; }),
}));
const out = [];
out.push({ step: "load", ...(await state()) });
// Part 2 first (fresh)
await page.evaluate(() => document.getElementById("scene-1")?.scrollIntoView({ behavior: "instant" }));
await sleep(800);
const btn2 = page.locator("#scene-1 button[aria-label*='narration']").first();
out.push({ step: "btn2 label", label: await btn2.getAttribute("aria-label") });
await btn2.click();
for (let i = 1; i <= 6; i++) { await sleep(700); out.push({ step: `pt2 +${i * 700}ms`, ...(await state()) }); }
await shot(page, `ch2audio-${k}-pt2-playing`);
// now scroll to part 1 and play it → pt2 should pause, single mini
await page.evaluate(() => document.getElementById("scene-0")?.scrollIntoView({ behavior: "instant" }));
await sleep(800);
const btn1 = page.locator("#scene-0 button[aria-label*='narration']").first();
await btn1.click();
for (let i = 1; i <= 4; i++) { await sleep(700); out.push({ step: `pt1 +${i * 700}ms`, ...(await state()) }); }
await page.evaluate(() => window.scrollBy(0, innerHeight * 1.4));
await sleep(1200);
out.push({ step: "scrolled away", ...(await state()) });
await shot(page, `ch2audio-${k}-mini`);
// tap-to-seek in part 1
const p = page.locator("#scene-0 p.t-prose").nth(2);
await p.scrollIntoViewIfNeeded(); await sleep(400);
await p.click();
await sleep(1200);
out.push({ step: "tapped p3 in pt1", ...(await state()) });
await shot(page, `ch2audio-${k}-tap`);
// scroll to onward → mini collapsed?
await page.evaluate(() => document.getElementById("onward")?.scrollIntoView({ behavior: "instant" }));
await sleep(1500);
out.push({ step: "onward", ...(await state()) });
await shot(page, `ch2audio-${k}-onward`);
out.push({ log });
save(`ch2audio-${k}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
