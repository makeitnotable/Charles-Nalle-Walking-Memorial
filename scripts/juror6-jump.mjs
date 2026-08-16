// Does clicking Continue move page A before the curtain covers? Sample scrollY + doc height per rAF; click via raw mouse.
import { launch, ctx, VPS, goto, sleep, watch } from "./juror6-lib.mjs";
const vpName = process.argv[2] || "p390";
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
watch(page);
await goto(page, "/bakery"); await sleep(1500);
await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
const cont = page.locator("a:has-text('Continue')").first();
await cont.scrollIntoViewIfNeeded(); await sleep(400);
// place the button mid-viewport
await page.evaluate(() => { const a = [...document.querySelectorAll("a")].find(a => /continue/i.test(a.innerText)); const r = a.getBoundingClientRect(); scrollBy(0, r.top - innerHeight * 0.45); });
await sleep(600);
const bb = await cont.boundingBox();
console.log("button box", JSON.stringify(bb), "scrollY", await page.evaluate(() => scrollY), "docH", await page.evaluate(() => document.documentElement.scrollHeight));
await page.evaluate(() => { window.__s = []; const t0 = performance.now(); const f = () => { window.__s.push([Math.round(performance.now() - t0), Math.round(scrollY), document.documentElement.scrollHeight, getComputedStyle(document.body).position, getComputedStyle(document.body).overflow, document.documentElement.className.slice(0, 40)]); if (window.__s.length < 400) requestAnimationFrame(f); }; requestAnimationFrame(f); });
await sleep(200);
await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await sleep(700);
let s = null; try { s = await page.evaluate(() => window.__s); } catch (e) { console.log("page navigated before read:", String(e).slice(0, 80)); }
if (s) { let last = null; for (const row of s) { const k = row.slice(1).join("|"); if (k !== last) { console.log(row.join(" | ")); last = k; } } }
console.log("url now", page.url().slice(-30));
await browser.close();
