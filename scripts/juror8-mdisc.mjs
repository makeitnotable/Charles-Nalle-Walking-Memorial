import { launch, ctx, VPS, watch, shot, sleep, go } from "./juror8-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.d1440); const page = await c.newPage(); const log = watch(page);
await go(page, "/paintings", 5000);
console.log(await page.evaluate(() => [...document.querySelectorAll("button, a, canvas, [role=button], [class*=chip], [class*=pill], h1, h2")].map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}#${e.id}.${[...e.classList].slice(0,5).join('.')} aria="${e.getAttribute("aria-label")||""}" txt="${(e.textContent||"").trim().slice(0,50)}" @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; }).join("\n")));
console.log("museum hook:", await page.evaluate(() => window.__museum ? Object.keys(window.__museum) : null));
console.log("state:", await page.evaluate(() => JSON.stringify(window.__museum?.state)));
console.log("H", await page.evaluate(() => document.documentElement.scrollHeight), log);
await c.close(); await browser.close();
