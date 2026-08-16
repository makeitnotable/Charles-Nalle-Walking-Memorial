import { launch, ctx, VPS, shot, goto, watchConsole, log, sleep, cdp } from "./juror11-lib.mjs";
const vpKey = process.argv[2] || "d1440";
const vp = VPS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const errs = watchConsole(page, `walk-${vpKey}`);
const tag = `walk-${vpKey}`;
const session = await cdp(page);
await goto(page, "/map", 6000);
await shot(page, `${tag}-01-overview`);
const btns = async () => page.evaluate(() => [...document.querySelectorAll("button, a")].filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.top >= 0 && r.top < 120; }).map((b) => ({ t: b.textContent.trim().replace(/\s+/g, " "), a: b.getAttribute("aria-label"), r: b.getBoundingClientRect().toJSON() })).map((b) => `${b.t}${b.a ? " [" + b.a + "]" : ""}@${Math.round(b.r.x)},${Math.round(b.r.y)}`));
const active = async () => page.evaluate(() => {
  const slides = [...document.querySelectorAll(".keen-slider__slide")].map((s, i) => ({ i, r: s.getBoundingClientRect() }));
  const cur = slides.find((s) => Math.abs(s.r.x + s.r.width / 2 - innerWidth / 2) < s.r.width / 2);
  const hi = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => ({ t: m.textContent.trim().replace(/\s+/g, " ").slice(0, 25), cls: [...m.querySelectorAll("*")].map((e) => e.className).join(" ").match(/active|current|is-on|highlight|focus/gi) || null, hasVisibleLabel: [...m.querySelectorAll("*")].some((e) => e.getBoundingClientRect().width > 60 && getComputedStyle(e).opacity !== "0") }));
  return { card: cur ? cur.i : null, markers: hi };
});
const tw = page.locator("button:visible, a:visible", { hasText: /Take the walk/i }).first();
const twb = await tw.boundingBox();
if (vp.mobile) { await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: twb.x + twb.width / 2, y: twb.y + twb.height / 2 }] }); await sleep(40); await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); }
else await page.mouse.click(twb.x + twb.width / 2, twb.y + twb.height / 2);
await sleep(5000);
log("5s in:", JSON.stringify(await active()), JSON.stringify(await btns()));
await shot(page, `${tag}-02-5s`);
const strip = await page.evaluate(() => { const s = document.querySelector(".keen-slider"); const r = s.getBoundingClientRect(); return { y: r.y + r.height / 2, slides: [...s.querySelectorAll(".keen-slider__slide")].map((sl) => { const q = sl.getBoundingClientRect(); return [Math.round(q.x), Math.round(q.right)]; }) }; });
log("strip:", JSON.stringify(strip));
// drag right-to-left ~180px
const y = strip.y;
const x0 = vp.width * 0.65;
if (vp.mobile) {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
  for (let i = 1; i <= 12; i++) { await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 - i * 15, y }] }); await sleep(16); }
} else {
  await page.mouse.move(x0, y); await page.mouse.down();
  for (let i = 1; i <= 12; i++) { await page.mouse.move(x0 - i * 15, y); await sleep(16); }
}
log("mid-drag buttons:", JSON.stringify(await btns()));
if (vp.mobile) await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); else await page.mouse.up();
const samples = [];
for (let i = 0; i < 30; i++) { samples.push(await page.evaluate(() => Math.round(document.querySelector(".keen-slider__slide").getBoundingClientRect().x))); await sleep(16); }
// reversal check
let rev = 0; for (let i = 2; i < samples.length; i++) { const d1 = samples[i - 1] - samples[i - 2], d2 = samples[i] - samples[i - 1]; if (d1 * d2 < 0 && Math.abs(d2) > 2) rev++; }
log("release samples:", samples.join(","), "reversals:", rev);
await sleep(900);
const a1 = await active();
log("after drag:", JSON.stringify(a1), JSON.stringify(await btns()));
const peek = await page.evaluate(() => [...document.querySelectorAll(".keen-slider__slide")].map((sl) => { const r = sl.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.right)]; }).filter((r) => r[1] > 0 && r[0] < innerWidth));
log("visible slides (x,right):", JSON.stringify(peek), "iw", vp.width);
await shot(page, `${tag}-03-after-drag`);
await sleep(4000);
const a2 = await active();
log("4s later (paused holds?):", a1.card, "->", a2.card);
// Continue
const cont = page.locator("button:visible", { hasText: /^Continue$/i }).first();
const cb = await cont.boundingBox();
log("Continue btn:", JSON.stringify(cb));
if (vp.mobile) { await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: cb.x + cb.width / 2, y: cb.y + cb.height / 2 }] }); await sleep(40); await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); }
else await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
await sleep(3500);
log("3.5s after Continue:", JSON.stringify(await active()), JSON.stringify(await btns()));
await shot(page, `${tag}-04-continued`);
// Back
const back = page.locator("button:visible, a:visible", { hasText: /Back to map|^Back$/i }).first();
const bb = await back.boundingBox();
if (vp.mobile) { await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }] }); await sleep(40); await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); }
else await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await sleep(3000);
const a3 = await active();
log("after Back:", JSON.stringify(a3), JSON.stringify(await btns()));
const pillStyles = await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const els = [...m.querySelectorAll("*")].filter((e) => e.getBoundingClientRect().width > 15); return els.map((e) => `${e.tagName}.${String(e.className).slice(0, 40)} bg=${getComputedStyle(e).backgroundColor} op=${getComputedStyle(e).opacity} tf=${getComputedStyle(e).transform}`).slice(0, 3); }));
log("pill styles after Back:", JSON.stringify(pillStyles));
await shot(page, `${tag}-05-back`);
log("console errors:", errs.length ? errs : "none");
await browser.close();
