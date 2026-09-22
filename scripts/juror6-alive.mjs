import { launch, ctx, VPS, goto, shot, watch, sleep, touchTap, touchDrag } from "./juror6-lib.mjs";
const vpName = process.argv[2] || "p390";
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/paintings"); await sleep(4000);
await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
const S = () => page.evaluate(() => { const s = window.__museum.state; const st = typeof s === "function" ? s() : s; return { mode: st.mode, approached: st.approached, alive: st.alive, zoom: st.zoom, sheet: st.sheet }; });
const dots = () => page.evaluate(() => [...document.querySelectorAll("button[aria-label^='Approach']")].map(b => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
await page.evaluate(() => scrollTo(0, 2000)); await sleep(1200);
let d = (await dots())[3];
if (vp.mobile) await touchTap(page, d.x, d.y); else await page.mouse.click(d.x, d.y);
await sleep(2500);
console.log("approach:", JSON.stringify(await S()));
const btn = () => page.evaluate(() => [...document.querySelectorAll("button")].filter(b => /life|rest/i.test(b.getAttribute("aria-label") || "")).map(b => { const r = b.getBoundingClientRect(); return { t: b.getAttribute("aria-label"), x: r.left, y: r.top, w: r.width, h: r.height }; }));
let b = await btn(); console.log("alive btn:", JSON.stringify(b));
const vids = () => page.evaluate(() => [...document.querySelectorAll("video")].map(v => ({ src: v.currentSrc.slice(-35), paused: v.paused, t: Math.round(v.currentTime * 10) / 10, rs: v.readyState })));
// tap the painting centre (real touch)
const bb = b[0];
if (vp.mobile) await touchTap(page, bb.x + bb.w / 2, bb.y + bb.h / 2); else await page.mouse.click(bb.x + bb.w / 2, bb.y + bb.h / 2);
await sleep(3000);
console.log("after tap: state", JSON.stringify(await S()), "btn", JSON.stringify(await btn()), "videos", JSON.stringify(await vids()));
await shot(page, `alive-${vpName}-1-after-tap`);
// tap again to rest
b = await btn();
if (vp.mobile) await touchTap(page, b[0].x + b[0].w / 2, b[0].y + b[0].h / 2); else await page.mouse.click(b[0].x + b[0].w / 2, b[0].y + b[0].h / 2);
await sleep(1500);
console.log("after 2nd tap: state", JSON.stringify(await S()), "btn", JSON.stringify(await btn()), "videos", JSON.stringify(await vids()));
// keyboard: focus the alive button and press Enter
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(b => /life|rest/i.test(b.getAttribute("aria-label") || "")); b && b.focus(); });
await page.keyboard.press("Enter"); await sleep(2000);
console.log("after Enter: state", JSON.stringify(await S()), "videos", JSON.stringify(await vids()));
await shot(page, `alive-${vpName}-2-after-enter`);
// zoom in via wheel (desktop) / pinch not available; try + key
await page.keyboard.press("Escape"); await sleep(1500);
console.log("after Esc:", JSON.stringify(await S()));
// sheet on phone
if (vp.mobile) {
  d = (await dots())[0]; await touchTap(page, d.x, d.y); await sleep(2500);
  const hdr = await page.evaluate(() => { const e = document.querySelector("[aria-label*='plaque']"); const r = e && e.getBoundingClientRect(); return e ? { tag: e.tagName, role: e.getAttribute("role"), t: e.getAttribute("aria-label"), x: r.left, y: r.top, w: r.width, h: r.height, tabindex: e.getAttribute("tabindex") } : null; });
  console.log("sheet header:", JSON.stringify(hdr), "state", JSON.stringify(await S()));
  await touchTap(page, hdr.x + hdr.w / 2, hdr.y + 24); await sleep(1500);
  const hdr2 = await page.evaluate(() => { const e = document.querySelector("[aria-label*='plaque']"); const r = e.getBoundingClientRect(); return { t: e.getAttribute("aria-label"), y: r.top, h: r.height }; });
  console.log("after header tap:", JSON.stringify(hdr2), "state", JSON.stringify(await S()));
  await shot(page, `alive-${vpName}-3-sheet-tap`);
  const pr = await page.evaluate(() => window.__museum.paintingRect(0));
  console.log("painting rect with sheet:", JSON.stringify(pr));
  // drag header down
  await touchDrag(page, { x: hdr.x + hdr.w / 2, y: hdr2.y + 24 }, { x: hdr.x + hdr.w / 2, y: hdr2.y + 24 + 320 }, 16, 16, 80); await sleep(1500);
  const hdr3 = await page.evaluate(() => { const e = document.querySelector("[aria-label*='plaque']"); const r = e.getBoundingClientRect(); return { t: e.getAttribute("aria-label"), y: r.top, h: r.height }; });
  console.log("after drag down:", JSON.stringify(hdr3), "state", JSON.stringify(await S()));
  await shot(page, `alive-${vpName}-4-sheet-drag-down`);
  // drag header up
  await touchDrag(page, { x: hdr.x + hdr.w / 2, y: hdr3.y + 24 }, { x: hdr.x + hdr.w / 2, y: hdr3.y + 24 - 320 }, 16, 16, 80); await sleep(1500);
  const hdr4 = await page.evaluate(() => { const e = document.querySelector("[aria-label*='plaque']"); const r = e.getBoundingClientRect(); return { t: e.getAttribute("aria-label"), y: r.top, h: r.height }; });
  console.log("after drag up:", JSON.stringify(hdr4), "state", JSON.stringify(await S()));
  await shot(page, `alive-${vpName}-5-sheet-drag-up`);
  console.log("painting rect with sheet up:", JSON.stringify(await page.evaluate(() => window.__museum.paintingRect(0))));
  const back = page.locator("button:has-text('Back to the hall'):visible").first();
  console.log("back visible with sheet up:", JSON.stringify(await back.boundingBox()));
}
console.log("errors:", log.errors);
await browser.close();
