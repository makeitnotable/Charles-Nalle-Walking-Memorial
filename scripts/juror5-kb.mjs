import { launch, ctx, watch, shot, sleep, save, goto, VPS, rect } from "./juror5-lib.mjs";
const key = process.argv[2] || "d1440";
const vp = VPS[key];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
const R = {};
const focused = () => page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return { l: (a.getAttribute("aria-label") || a.textContent || a.tagName).trim().replace(/\s+/g, " ").slice(0, 44), ring: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 ? cs.outlineWidth : cs.boxShadow !== "none" ? "shadow" : "none", y: Math.round(r.y), inView: r.top >= 0 && r.bottom <= innerHeight }; });
const st = () => page.evaluate(() => { const m = window.__museum; const s = typeof m.state === "function" ? m.state() : m.state; return { mode: s.mode, approached: s.approached, yaw: Math.round(s.look.yaw * 100) / 100, alive: s.alive, railT: Math.round(s.railT * 100) / 100 }; });
await goto(page, "/paintings");
await sleep(3500);
const seq = [];
for (let i = 0; i < 16; i++) { await page.keyboard.press("Tab"); await sleep(150); seq.push(await focused()); }
R.tabSeq = seq;
// go back to a dot: find "Approach" in seq
let cur = await focused();
let n = 0;
while (!/^approach/i.test(cur.l) && n < 30) { await page.keyboard.press("Shift+Tab"); await sleep(100); cur = await focused(); n++; }
R.dotFocused = cur;
await shot(page, `kb-${key}-01-dot-focus`);
await page.keyboard.press("Enter"); await sleep(2200);
R.afterEnter = await st();
await shot(page, `kb-${key}-02-enter`);
R.focusAfterEnter = await focused();
await page.keyboard.press("ArrowRight"); await sleep(1600);
R.afterRight = await st();
await page.keyboard.press("ArrowLeft"); await sleep(1600);
R.afterLeft = await st();
// Tab to the painting button and press Enter -> alive
let m = 0; cur = await focused();
while (!/bring the painting/i.test(cur.l) && m < 12) { await page.keyboard.press("Tab"); await sleep(120); cur = await focused(); m++; }
R.paintingBtnFocused = cur;
if (/bring the painting/i.test(cur.l)) { await page.keyboard.press("Enter"); await sleep(1500); R.afterAliveEnter = await st(); await shot(page, `kb-${key}-03-alive`); }
await page.keyboard.press("Escape"); await sleep(1500);
R.afterEsc = await st();
R.focusAfterEsc = await focused();
// rail arrows: look
await page.keyboard.press("ArrowLeft"); await sleep(900);
R.railLeft = await st();
await shot(page, `kb-${key}-04-rail-left`);
await page.keyboard.press("ArrowRight"); await sleep(900);
R.railRight = await st();
// walk with ArrowDown
const y0 = await page.evaluate(() => scrollY);
await page.keyboard.press("ArrowDown"); await sleep(600);
R.arrowDownScroll = { y0, y1: await page.evaluate(() => scrollY) };
R.log = log;
await c.close();
// menu keyboard on a chapter + Esc + focus return; and 1920 museum quick
const c2 = await ctx(browser, VPS.d1920);
const p2 = c2.newPage ? await c2.newPage() : null;
const log2 = watch(p2);
await goto(p2, "/paintings"); await sleep(3500);
await shot(p2, `mus-d1920-01-rest`);
await p2.evaluate(() => window.scrollTo({ top: innerHeight * 1.5 })); await sleep(1500);
await shot(p2, `mus-d1920-02-rail`);
R.d1920 = { chip: await p2.evaluate(() => [...document.querySelectorAll("*")].filter((e) => e.children.length <= 3 && /scroll to walk/i.test(e.textContent || "") && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().width < innerWidth * 0.9).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 60), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })), skip: await p2.getByRole("button", { name: /skip/i }).first().boundingBox(), burger: await p2.locator('button[aria-label*="menu" i]').first().boundingBox() };
const dots = await p2.evaluate(() => [...document.querySelectorAll("button")].filter((b) => /^approach/i.test(b.getAttribute("aria-label") || "")).map((b) => { const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
await p2.mouse.click(dots[9].x, dots[9].y); await sleep(2800);
await shot(p2, `mus-d1920-11-last`);
R.d1920.last = await p2.evaluate(() => { const b = [...document.querySelectorAll("button")].find((b) => /painting to life/i.test(b.getAttribute("aria-label") || "")); const r = b.getBoundingClientRect(); const dots = [...document.querySelectorAll("button")].filter((b) => /^approach/i.test(b.getAttribute("aria-label") || "")).map((d) => d.getBoundingClientRect()); return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), ar: Math.round((r.width / r.height) * 100) / 100 }, dotsTop: Math.round(Math.min(...dots.map((d) => d.top))) }; });
await p2.keyboard.press("Escape"); await sleep(1200);
await p2.mouse.click(dots[0].x, dots[0].y); await sleep(2800);
await shot(p2, `mus-d1920-06-approach`);
R.d1920.log = log2;
await c2.close();
await browser.close();
save(`kb-${key}.json`, R);
console.log(JSON.stringify(R, null, 1));
