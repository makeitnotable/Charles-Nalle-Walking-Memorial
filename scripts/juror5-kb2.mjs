import { launch, ctx, watch, shot, sleep, save, goto, VPS } from "./juror5-lib.mjs";
const key = process.argv[2] || "d1440";
const vp = VPS[key];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
const R = {};
const focused = () => page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return { l: (a.getAttribute("aria-label") || a.textContent || a.tagName).trim().replace(/\s+/g, " ").slice(0, 44), ring: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 ? cs.outlineWidth : cs.boxShadow !== "none" ? "shadow" : "none", y: Math.round(r.y), sy: Math.round(scrollY) }; });
const st = () => page.evaluate(() => { const m = window.__museum; const s = typeof m.state === "function" ? m.state() : m.state; return { mode: s.mode, approached: s.approached, yaw: Math.round(s.look.yaw * 100) / 100, alive: s.alive, railT: Math.round(s.railT * 100) / 100, sy: Math.round(scrollY) }; });
await goto(page, "/paintings");
await sleep(3500);
for (let i = 0; i < 4; i++) { await page.keyboard.press("Tab"); await sleep(150); }
R.f1 = await focused(); // dot 1
await page.keyboard.press("Enter"); await sleep(2200);
R.s1 = await st(); R.f2 = await focused();
await shot(page, `kb2-${key}-01-enter-dot1`);
await page.keyboard.press("ArrowRight"); await sleep(1800);
R.s2 = await st();
await page.keyboard.press("ArrowRight"); await sleep(1800);
R.s3 = await st();
await shot(page, `kb2-${key}-02-right2`);
// tab order inside approach
const seq = [];
for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); await sleep(150); seq.push(await focused()); }
R.tabInApproach = seq;
// find painting button
let cur = await focused(); let n = 0;
while (!/painting to life|let the painting/i.test(cur.l) && n < 16) { await page.keyboard.press("Shift+Tab"); await sleep(120); cur = await focused(); n++; }
R.pb = cur;
if (/painting/i.test(cur.l)) { await page.keyboard.press("Enter"); await sleep(1500); R.sAlive = await st(); await page.keyboard.press("Enter"); await sleep(800); R.sRest = await st(); }
await page.keyboard.press("Escape"); await sleep(1500);
R.sEsc = await st(); R.fEsc = await focused();
await shot(page, `kb2-${key}-03-esc`);
await page.keyboard.press("ArrowLeft"); await sleep(1000);
R.sLook = await st();
await shot(page, `kb2-${key}-04-look-left`);
await page.keyboard.press("ArrowRight"); await sleep(1000);
R.sLookBack = await st();
await page.keyboard.press("ArrowDown"); await sleep(700);
R.sDown = await st();
await page.keyboard.press("PageDown"); await sleep(900);
R.sPgDn = await st();
R.log = log;
await c.close(); await browser.close();
save(`kb2-${key}.json`, R);
console.log(JSON.stringify(R, null, 1));
