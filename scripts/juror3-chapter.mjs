import { launch, newPage, shot, goto, sleep, report } from "./juror3-lib.mjs";

const route = process.argv[2] || "/bakery";
const vp = process.argv[3] || "p390";
const tag = `${route.replace(/\//g, "")}-${vp}`;

const browser = await launch();
const page = await newPage(browser, vp);
const H = (await page.viewportSize()).height;

const scrollTo = async (y) => { await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y); await sleep(700); };
const scrollToEl = async (sel, off = 0) => { await page.evaluate(({ sel, off }) => { const el = document.querySelector(sel); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - off, behavior: "instant" }); }, { sel, off }); await sleep(800); };
const menuState = () => page.evaluate(() => {
  const b = document.querySelector('button[aria-label="Open menu"]');
  if (!b) return null;
  const r = b.getBoundingClientRect(); const cs = getComputedStyle(b);
  const wrap = b.closest("[data-walk],.cnwm-menu,nav,div");
  const wcs = wrap ? getComputedStyle(wrap) : null;
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), op: cs.opacity, vis: cs.visibility, transform: cs.transform, wrapT: wcs?.transform, wrapOp: wcs?.opacity, wrapVis: wcs?.visibility, wrapPE: wcs?.pointerEvents, inView: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth };
});

// 1. Arrival
await goto(page, route);
await sleep(1500);
await shot(page, `${tag}-01-arrival`);
console.log("menu at arrival", await menuState());

// 2. Play buttons
const plays = await page.$$('button[aria-label^="Play narration"]');
console.log("play buttons:", plays.length);
for (let i = 0; i < plays.length; i++) {
  const btn = plays[i];
  await btn.scrollIntoViewIfNeeded();
  await page.evaluate((el) => window.scrollBy(0, -Math.round(innerHeight * 0.35)), btn);
  await sleep(600);
  await shot(page, `${tag}-02-player${i}-inview`);
  await btn.click();
  await sleep(2500);
  const audioState = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime.toFixed(2), src: a.currentSrc.split("/").pop() })));
  console.log(`after play ${i}`, audioState);
  await shot(page, `${tag}-03-player${i}-playing`);
  // scroll down into the paragraphs -> mini player should latch
  await page.evaluate(() => window.scrollBy(0, Math.round(innerHeight * 0.9)));
  await sleep(1200);
  await shot(page, `${tag}-04-player${i}-mini`);
  const mini = await page.evaluate(() => {
    const els = [...document.querySelectorAll("*")].filter((el) => { const cs = getComputedStyle(el); return cs.position === "fixed" && el.getBoundingClientRect().width > 0 && el.offsetParent !== undefined; });
    return els.map((el) => { const r = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join(".")} "${(el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40)}" @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`; });
  });
  console.log("fixed els while playing:", mini);
  // highlight?
  const hl = await page.evaluate(() => {
    const act = document.querySelector(".narration-active, [data-active='true'], .is-active, [aria-current='true']");
    return act ? `${act.tagName} "${act.textContent.trim().slice(0, 50)}"` : null;
  });
  console.log("active paragraph:", hl);
  // tap a paragraph further down (3rd prose p in this scene)
  const ps = await page.$$("p.t-prose");
  const target = ps[Math.min(ps.length - 1, i === 0 ? 3 : ps.length - 3)];
  if (target) {
    await target.scrollIntoViewIfNeeded();
    await sleep(300);
    const before = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => a.currentTime));
    await target.tap().catch(() => target.click());
    await sleep(800);
    const after = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ t: a.currentTime.toFixed(2), paused: a.paused })));
    console.log("tap-to-seek: before", before.map((t) => t.toFixed(2)), "after", after);
    await shot(page, `${tag}-05-player${i}-tapseek`);
  }
}

// 3. Scroll the whole page: interlude, history, moral, onward, footer
for (const sel of ["#history", "#moral, #moral-0", "#onward"]) {
  await scrollToEl(sel, 0);
  await shot(page, `${tag}-06-${sel.replace(/[#,\s]/g, "")}`);
}
// moral heading close-up
await scrollToEl("#moral-heading, #moral-0-heading", Math.round(H * 0.3));
await shot(page, `${tag}-07-moral-heading`);
// where to next
await scrollToEl("#onward", -Math.round(H * 0.15));
await shot(page, `${tag}-08-onward`);
// footer bottom with mini-player
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await sleep(1200);
await shot(page, `${tag}-09-footer`);
console.log("menu at footer (after long scroll down)", await menuState());
const fixedAtFoot = await page.evaluate(() => [...document.querySelectorAll("*")].filter((el) => getComputedStyle(el).position === "fixed" && el.getBoundingClientRect().width > 0).map((el) => { const r = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30)}" @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)} op=${getComputedStyle(el).opacity}`; }));
console.log("fixed at footer:", fixedAtFoot);
console.log("audio at footer:", await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime.toFixed(1) }))));
console.log("moral body color:", await page.evaluate(() => { const ps = [...document.querySelectorAll("[id^=moral] p")].map(p => `${p.className.slice(0,30)} ${getComputedStyle(p).color} "${p.textContent.trim().slice(0,25)}"`); return ps; }));
// scroll up a bit -> burger returns?
await page.evaluate(() => window.scrollBy(0, -80));
await sleep(700);
console.log("menu after 80px scroll up", await menuState());
await shot(page, `${tag}-10-footer-scrollup`);

// 4. Menu open/close
const open = await page.$('button[aria-label="Open menu"]');
await open.click();
await sleep(900);
await shot(page, `${tag}-11-menu-open`);
const closeBtn = await page.$('button[aria-label="Close menu"]');
await closeBtn.click();
await sleep(900);
await shot(page, `${tag}-12-menu-closed`);

// 5. Continue → next chapter
await scrollToEl("#onward", -Math.round(H * 0.15));
const cont = await page.$('a:has-text("Continue")');
if (cont) {
  await cont.click();
  await sleep(2400);
  console.log("after Continue url:", page.url());
  await shot(page, `${tag}-13-after-continue`);
}
report(page, tag);
await browser.close();
