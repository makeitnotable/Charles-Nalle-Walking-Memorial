import { launch, ctx, VPS, goto, shot, watch, sleep } from "./juror6-lib.mjs";
const vpName = process.argv[2] || "d1440";
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, "/paintings"); await sleep(4000);
await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
const S = () => page.evaluate(() => { const s0 = window.__museum.state; const st = typeof s0 === "function" ? s0() : s0; return { mode: st.mode, approached: st.approached, alive: st.alive, yaw: Math.round(st.look.yaw * 100) / 100, railIdx: st.railIdx }; });
const F = () => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return "body"; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return `${a.tagName}[${(a.getAttribute("aria-label") || a.innerText || "").trim().slice(0, 40)}] @${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} outline:${cs.outlineStyle}/${cs.outlineWidth} shadow:${cs.boxShadow.slice(0, 30)}`; });
// scroll into the hall
await page.evaluate(() => scrollTo(0, 2500)); await sleep(1000);
// Tab through: record first 14 stops
await page.evaluate(() => { const b = document.querySelector("button[aria-label='Open menu']"); b && b.focus(); });
const stops = [];
for (let i = 0; i < 16; i++) { await page.keyboard.press("Tab"); await sleep(120); stops.push(await F()); }
console.log("tab stops:\n  " + stops.join("\n  "));
// focus the 2nd dot and press Enter
await page.evaluate(() => { const b = document.querySelectorAll("button[aria-label^='Approach']")[1]; b.focus(); });
await page.keyboard.press("Enter"); await sleep(2500);
console.log("after Enter on dot 2:", JSON.stringify(await S()), "focus:", await F());
await shot(page, `muskb-${vpName}-1-approach`);
// arrows: next / prev work
await page.keyboard.press("ArrowRight"); await sleep(2200);
console.log("after ArrowRight:", JSON.stringify(await S()));
await page.keyboard.press("ArrowLeft"); await sleep(2200);
console.log("after ArrowLeft:", JSON.stringify(await S()));
// Tab to the painting button and Enter (alive)
const tabs2 = [];
for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); await sleep(120); tabs2.push(await F()); }
console.log("tabs in approach:\n  " + tabs2.join("\n  "));
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find(b => /life|rest/i.test(b.getAttribute("aria-label") || "")); b && b.focus(); });
console.log("focused alive btn:", await F());
await shot(page, `muskb-${vpName}-2-alive-focus`);
await page.keyboard.press("Enter"); await sleep(1500);
console.log("after Enter (alive):", JSON.stringify(await S()));
await page.keyboard.press("Escape"); await sleep(1800);
console.log("after Esc:", JSON.stringify(await S()), "focus:", await F());
// rail: arrows look
await page.keyboard.press("ArrowRight"); await sleep(800);
console.log("rail ArrowRight (look):", JSON.stringify(await S()));
await page.keyboard.press("ArrowDown"); await sleep(800);
console.log("rail ArrowDown (walk?):", JSON.stringify(await S()), "scrollY", await page.evaluate(() => scrollY));
console.log("errors:", log.errors);
await browser.close();
