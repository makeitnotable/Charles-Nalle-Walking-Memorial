import { launch, ctx, watch, shot, sleep, save, goto, VPS, floating, touchDrag, touchTap } from "./juror4-lib.mjs";
const vpk = process.argv[2] || "p390";
const vp = VPS[vpk];
const lensOnly = process.argv[3] === "lens";
const R = { vpk, steps: [] };
const step = (name, data) => { R.steps.push({ name, ...data }); console.log(name, JSON.stringify(data).slice(0, 700)); };
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/map"); await sleep(4000);

const ui = () => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.opacity !== "0" && cs.display !== "none"; };
  const rect = (e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; };
  const btns = [...document.querySelectorAll("button, a.btn, a[class*=btn]")].filter(vis).filter((b) => !/mapboxgl-marker/.test(b.className)).map((b) => `${(b.innerText || b.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 40)} @${rect(b)}`);
  const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); const lab = m.querySelector("span, div"); const lr = lab?.getBoundingClientRect(); return { label: (m.getAttribute("aria-label") || m.innerText || "").slice(0, 30), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, txt: m.innerText.replace(/\s+/g, " ").slice(0, 30) }; });
  const chip = [...document.querySelectorAll("div, span, p")].filter((e) => vis(e) && /April 27, 1860/.test(e.innerText) && e.innerText.length < 40).map((e) => `${e.innerText.trim()} @${rect(e)}`);
  const cards = [...document.querySelectorAll(".keen-slider__slide, [class*=slide]")].filter(vis).map((s) => ({ t: s.innerText.replace(/\s+/g, " ").slice(0, 50), r: rect(s), tf: getComputedStyle(s).transform.slice(0, 40), op: getComputedStyle(s).opacity, active: /active|is-active|current/.test(s.className) }));
  const burger = document.querySelector(".cnwm-menu"); const bcs = burger && getComputedStyle(burger);
  return { btns, markers, chip, cards: cards.slice(0, 8), nCards: cards.length, burger: burger ? { r: rect(burger), op: bcs.opacity, vis: bcs.visibility, tf: bcs.transform.slice(0, 40), pe: bcs.pointerEvents, walk: burger.getAttribute("data-walk") } : null };
});
// 1 overview
if (!lensOnly) {
await shot(page, `map-${vpk}-01-overview`);
step("overview", await ui());
// 2 scroll past the map to the index
await page.evaluate(() => scrollTo(0, innerHeight * 0.9)); await sleep(700);
await shot(page, `map-${vpk}-02-below`);
step("below-burger", { burger: (await ui()).burger });
await page.evaluate(() => { const h = document.querySelector("h1"); scrollTo(0, h.getBoundingClientRect().top + scrollY - 40); }); await sleep(700);
await shot(page, `map-${vpk}-03-copy`);
const idx = page.locator('a[href*="/bakery"]:has-text("Spot")').first();
await idx.scrollIntoViewIfNeeded(); await sleep(400); await page.evaluate(() => scrollBy(0, -80)); await sleep(500);
await shot(page, `map-${vpk}-04-index`);
step("index-titles", { titles: await page.evaluate(() => [...document.querySelectorAll('main a[href*="Memorial/"]')].filter((a) => /Spot 0\d/i.test(a.innerText)).map((a) => a.innerText.replace(/\n/g, " | ").slice(0, 120))) });
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(500);
await shot(page, `map-${vpk}-05-footer`);
// back to top, menu open/close on map
await page.evaluate(() => scrollTo(0, 0)); await sleep(800);
step("top-burger", { burger: (await ui()).burger });
const burger = page.locator(".cnwm-menu-burger");
await burger.click({ force: true }); await sleep(700);
await shot(page, `map-${vpk}-06-menu`);
await page.locator(".cnwm-menu-close").click(); await sleep(600);
// 3 Take the walk
const walkBtn = page.locator('button:has-text("Take the walk")').first();
step("walkbtn", { box: await walkBtn.boundingBox() });
await walkBtn.click(); await sleep(2500);
await shot(page, `map-${vpk}-07-walk-start`);
step("walk-start", await ui());
await sleep(4500);
await shot(page, `map-${vpk}-08-walk-mid`);
step("walk-mid", await ui());
// 4 drag the cards mid-walk
const cardEl = page.locator(".keen-slider").first();
const box = await cardEl.boundingBox();
step("strip", { box });
const y = box.y + box.height / 2;
const x0 = box.x + box.width * 0.6, x1 = box.x + box.width * 0.25;
const samples = [];
const sampler = async () => { for (let i = 0; i < 26; i++) { const s = await page.evaluate(() => { const first = document.querySelector(".keen-slider__slide"); if (!first) return null; const r = first.getBoundingClientRect(); return { x: Math.round(r.left * 10) / 10 }; }); samples.push({ t: Date.now(), ...s }); await sleep(16); } };
if (vp.mobile) { await touchDrag(page, x0, y, x1, y, 14, 260); } else { await page.mouse.move(x0, y); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(x0 + ((x1 - x0) * i) / 14, y); await sleep(18); } await page.mouse.up(); }
const t0 = Date.now();
await sampler();
const btnAfterDrag = await ui();
await shot(page, `map-${vpk}-09-after-drag`);
// analyse reversal
let reversals = 0; for (let i = 2; i < samples.length; i++) { const d1 = samples[i - 1].x - samples[i - 2].x, d2 = samples[i].x - samples[i - 1].x; if (d1 * d2 < 0 && Math.abs(d2) > 3) reversals++; }
step("after-drag", { btns: btnAfterDrag.btns, reversals, samples: samples.map((s) => s.x), burger: btnAfterDrag.burger, cards: btnAfterDrag.cards });
await sleep(1500);
await shot(page, `map-${vpk}-10-after-drag-settled`);
step("after-drag-settled", { btns: (await ui()).btns, cards: (await ui()).cards });
// Continue
const contBtn = page.locator('button:has-text("Continue")').first();
if (await contBtn.count()) { await contBtn.click(); await sleep(3500); await shot(page, `map-${vpk}-11-continued`); step("continued", { btns: (await ui()).btns }); }
// stop the walk
const stopBtn = page.locator('button:has-text("Stop the walk")').first();
if (await stopBtn.count()) { await stopBtn.click(); await sleep(1500); step("stopped", { btns: (await ui()).btns }); await shot(page, `map-${vpk}-12-stopped`); }
// menu while focused (phones hide the burger)
step("focused-burger", { burger: (await ui()).burger });
// Back
const backBtn = page.locator('button:has-text("Back")').first();
step("back", { label: await backBtn.innerText().catch(() => null), box: await backBtn.boundingBox().catch(() => null) });
await backBtn.click(); await sleep(2500);
await shot(page, `map-${vpk}-13-after-back`);
step("after-back", await ui());
}
// 5 lens
const lensBtn = page.locator('button:has-text("See Troy in 1858"):visible').first();
step("lensbtn", { box: await lensBtn.boundingBox() });
await lensBtn.click(); await sleep(2500);
await shot(page, `map-${vpk}-14-lens`);
step("lens", { ...(await ui()), caption: await page.evaluate(() => [...document.querySelectorAll("p, figcaption, span")].filter((e) => /1858|Drag to explore|Library of Congress/.test(e.innerText) && e.getBoundingClientRect().width > 0).map((e) => { const r = e.getBoundingClientRect(); return { t: e.innerText.replace(/\s+/g, " ").slice(0, 90), lines: e.getClientRects().length, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; })), imgs: await page.evaluate(() => [...document.querySelectorAll("img")].filter((i) => /1858|troy/i.test(i.currentSrc) && i.getBoundingClientRect().width > 0).map((i) => { const r = i.getBoundingClientRect(); return { src: i.currentSrc.split("/").pop(), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), nat: `${i.naturalWidth}x${i.naturalHeight}`, tf: getComputedStyle(i).transform.slice(0, 60) }; })) });
// zoom in with keyboard + and drag
await page.keyboard.press("+"); await sleep(400); await page.keyboard.press("+"); await sleep(600);
await shot(page, `map-${vpk}-15-lens-zoomed`);
await page.keyboard.press("0"); await sleep(600);
const backToday = page.locator('button:has-text("Back to today"):visible').first();
step("backtoday", { box: await backToday.boundingBox() });
await backToday.click(); await sleep(1500);
await shot(page, `map-${vpk}-16-after-lens`);
step("after-lens", await ui());
R.log = log.filter((l) => !/reqfail.*(pbf|mp3)/.test(l));
save(`map-${vpk}.json`, R);
console.log("LOG", R.log);
await browser.close();
