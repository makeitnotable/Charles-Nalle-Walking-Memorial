import { launch, ctx, VPS, sleep, go } from "./juror8-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.d1440); const page = await c.newPage();
for (const r of ["/people", "/about", "/404-nope", "/map", "/paintings", "/bakery"]) {
  await go(page, r, 2000);
  const hits = await page.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const out = []; let n; while ((n = w.nextNode())) { if (n.textContent.includes("—")) { const p = n.parentElement; const cs = getComputedStyle(p); const r = p.getBoundingClientRect(); out.push({ tag: p.tagName, cls: p.className.toString().slice(0, 40), vis: cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0, txt: n.textContent.trim().slice(0, 80) }); } } return out; });
  console.log(r, JSON.stringify(hits));
}
await c.close(); await browser.close();
