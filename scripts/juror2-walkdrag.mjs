import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
async function drag(page, vp, from, to, steps = 14, ms = 260) {
  if (vp.mobile) { const cdp = await page.context().newCDPSession(page); const pt = (x, y) => ({ x, y, radiusX: 2, radiusY: 2, force: 1, id: 1 }); await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pt(from.x, from.y)] }); for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [pt(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps)] }); await sleep(ms / steps); } await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cdp.detach(); }
  else { await page.mouse.move(from.x, from.y); await page.mouse.down(); for (let i = 1; i <= steps; i++) { await page.mouse.move(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps); await sleep(ms / steps); } await page.mouse.up(); }
}
const sample = (page) => page.evaluate(() => { const active = document.querySelector("[aria-label^='Enter Spot']"); const ar = active?.getBoundingClientRect(); const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return { lab: (m.textContent || "").trim().replace(/\s+/g, " ").slice(0, 16), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), bottom: Math.round(r.bottom) }; }); const over = markers.filter((m) => ar && m.bottom > ar.top && m.y < ar.bottom && m.x + m.w > ar.left && m.x < ar.right && m.w > 0); const btn = [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).find((t) => /Continue|Stop the walk|Walk again/.test(t)); return `${active?.getAttribute("aria-label")?.slice(11, 24)} btn=${btn} over=${over.map((o) => o.lab + "@" + o.y + "-" + o.bottom).join("|")} cardTop=${ar && Math.round(ar.top)}`; });
for (const vpk of (process.argv[2] || "d1440,t1024,p390").split(",")) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/map", 6000);
  await page.locator('button:visible:has-text("Take the walk")').click(); await sleep(8500);
  console.log(vpk, "before drag:", await sample(page));
  const card = await page.locator("[aria-label^='Enter Spot']").first().boundingBox(); const cy = card.y + card.height / 2;
  await drag(page, vp, { x: card.x + card.width * 0.7, y: cy }, { x: card.x + card.width * 0.7 - Math.min(220, vp.width * 0.5), y: cy });
  for (let i = 1; i <= 4; i++) { await sleep(700); console.log(vpk, `drag+${i * 700}ms:`, await sample(page)); }
  await shot(page, `walkdrag-${vpk}-after-drag`);
  // second drag (another card)
  await drag(page, vp, { x: card.x + card.width * 0.7, y: cy }, { x: card.x + card.width * 0.7 - Math.min(220, vp.width * 0.5), y: cy });
  for (let i = 1; i <= 3; i++) { await sleep(800); console.log(vpk, `drag2+${i * 800}ms:`, await sample(page)); }
  await shot(page, `walkdrag-${vpk}-after-drag2`);
  await page.locator("button", { hasText: /^Continue$/ }).first().click();
  for (let i = 1; i <= 9; i++) { await sleep(1000); console.log(vpk, `continue+${i}s:`, await sample(page)); }
  await shot(page, `walkdrag-${vpk}-continued`);
  await c.close();
}
await browser.close();
