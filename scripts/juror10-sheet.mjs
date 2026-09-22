// Phone museum peek-sheet: tap and drag the header, Back to the hall, Esc; also 720x450 zoom, reduced motion
import { launch, ctx, VIEWPORTS, BASE, shot, sleep, watchConsole, touchDrag, touchTap } from "./juror10-lib.mjs";
const vpKey = process.argv[2] || "p390";
const vp = VIEWPORTS[vpKey];
const errs = [];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
watchConsole(page, `sheet-${vpKey}`, errs);
await page.goto(BASE + "/paintings", { waitUntil: "networkidle" });
await sleep(3500);
const st = () => page.evaluate(() => { const s = window.__museum.state; return { mode: s.mode, approached: s.approached, sheet: s.sheet, alive: s.alive, zoom: +s.zoom.toFixed(2) }; });
const rectOf = (i) => page.evaluate((i) => { const r = window.__museum.paintingRect(i); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }; }, i);
const sheetInfo = () => page.evaluate(() => {
  const sheet = document.querySelector(".museum-sheet"); if (!sheet) return null;
  const r = sheet.getBoundingClientRect();
  const handle = sheet.querySelector(".museum-sheet-head");
  const hr = handle?.getBoundingClientRect();
  const texts = [...sheet.querySelectorAll("p, h2, h3, span, blockquote")].filter((e) => e.children.length === 0 && e.textContent.trim()).map((e) => { const rr = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 50), top: Math.round(rr.top), bottom: Math.round(rr.bottom), inView: rr.top >= 0 && rr.bottom <= innerHeight }; });
  return { sheet: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], handle: hr && { l: Math.round(hr.left), t: Math.round(hr.top), r: Math.round(hr.right), b: Math.round(hr.bottom), label: handle.getAttribute("aria-label"), role: handle.getAttribute("role"), tabindex: handle.getAttribute("tabindex") }, texts, scrollable: sheet.scrollHeight > sheet.clientHeight + 2, ov: getComputedStyle(sheet).overflowY, transform: getComputedStyle(sheet).transform.slice(0, 50) };
});
await page.evaluate(() => scrollTo({ top: 3000, behavior: "instant" })); await sleep(1500);
console.log("rail state:", JSON.stringify(await st()), "scrollY", await page.evaluate(() => scrollY));
await page.evaluate(() => window.__museum.approach(3));
await sleep(2500);
console.log("approach state:", JSON.stringify(await st()));
let si = await sheetInfo();
console.log("sheet peek:", JSON.stringify(si));
await shot(page, `sheet-peek-${vpKey}`);
// drag header up
const hx = (si.sheet[0] + si.sheet[2]) / 2, hy = si.sheet[1] + 30;
await touchDrag(page, hx, hy, hx, hy - 320, 20, 320);
await sleep(1200);
console.log("after drag up:", JSON.stringify(await st()), JSON.stringify(await sheetInfo()), "painting", JSON.stringify(await rectOf(3)));
await shot(page, `sheet-full-${vpKey}`);
// is Back reachable?
const back = await page.evaluate(() => { const b = [...document.querySelectorAll("#museum-slot button")].find((b) => /back to the hall/i.test(b.textContent)); const r = b?.getBoundingClientRect(); return r && { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }; });
console.log("Back button:", JSON.stringify(back));
// drag header down
si = await sheetInfo();
const hy2 = si.sheet[1] + 30;
await touchDrag(page, hx, hy2, hx, hy2 + 320, 20, 320);
await sleep(1200);
console.log("after drag down:", JSON.stringify(await st()), JSON.stringify((await sheetInfo()).sheet));
// tap header
si = await sheetInfo();
await touchTap(page, hx, si.sheet[1] + 30); await sleep(1200);
console.log("after header tap:", JSON.stringify(await st()), JSON.stringify((await sheetInfo()).sheet));
await shot(page, `sheet-tapped-${vpKey}`);
// tap painting while sheet full → alive?
let r0 = await rectOf(3);
await touchTap(page, (r0.l + r0.r) / 2, (r0.t + r0.b) / 2); await sleep(2000);
console.log("after painting tap:", JSON.stringify(await st()));
await shot(page, `sheet-alive-${vpKey}`);
// Back to the hall
if (back) { await touchTap(page, (back.l + back.r) / 2, (back.t + back.b) / 2); await sleep(1500); console.log("after Back tap:", JSON.stringify(await st())); }
// last painting on phone with sheet full
await page.evaluate(() => window.__museum.approach(9)); await sleep(2500);
si = await sheetInfo();
await touchDrag(page, hx, si.sheet[1] + 30, hx, si.sheet[1] + 30 - 320, 20, 320); await sleep(1200);
console.log("last painting, sheet full:", JSON.stringify(await st()), "rect", JSON.stringify(await rectOf(9)), "sheet", JSON.stringify((await sheetInfo()).sheet));
await shot(page, `sheet-last-full-${vpKey}`);
await page.keyboard.press("Escape"); await sleep(1200);
console.log("after Esc:", JSON.stringify(await st()));
await c.close();
// reduced motion
{
  const c2 = await ctx(browser, vp, { reducedMotion: "reduce" });
  const p2 = await c2.newPage();
  watchConsole(p2, `rm-paintings-${vpKey}`, errs);
  await p2.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(2500);
  console.log("reduced-motion /paintings: museum?", await p2.evaluate(() => !!window.__museum), "canvas?", await p2.evaluate(() => !!document.querySelector("#museum-slot canvas")), "grid tiles", await p2.evaluate(() => document.querySelectorAll("button.painting-open").length));
  await shot(p2, `rm-paintings-${vpKey}`);
  await p2.evaluate(() => scrollTo({ top: 1200, behavior: "instant" })); await sleep(800);
  await shot(p2, `rm-paintings-scrolled-${vpKey}`);
  for (const route of ["/", "/bakery", "/map"]) {
    await p2.goto(BASE + route, { waitUntil: "networkidle" }); await sleep(2000);
    await shot(p2, `rm${route.replace("/", "-") || "-home"}-${vpKey}`);
    const hidden = await p2.evaluate(() => [...document.querySelectorAll("main h1, main h2, main p")].filter((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return r.width > 0 && (cs.opacity === "0" || cs.visibility === "hidden"); }).map((e) => e.textContent.trim().slice(0, 40)));
    console.log(`reduced-motion ${route}: invisible text blocks:`, JSON.stringify(hidden.slice(0, 8)));
    if (route === "/bakery") { await p2.evaluate(() => scrollTo({ top: document.querySelector("#moral").getBoundingClientRect().top + scrollY, behavior: "instant" })); await sleep(800); await shot(p2, `rm-bakery-moral-${vpKey}`); const hid2 = await p2.evaluate(() => [...document.querySelectorAll("#moral h2, #moral p, #history h2, #history p")].filter((e) => { const cs = getComputedStyle(e); return cs.opacity === "0" || cs.visibility === "hidden"; }).map((e) => e.textContent.trim().slice(0, 40))); console.log("rm bakery moral/history hidden:", JSON.stringify(hid2)); }
  }
  await c2.close();
}
await browser.close();
console.log("CONSOLE", JSON.stringify(errs, null, 1));
