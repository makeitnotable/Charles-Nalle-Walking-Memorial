import { chromium } from "playwright";
const B = "http://localhost:4321";
const out = {};
// desktop wheel
{
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(B + "/map", { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__troyMap?.map?.loaded?.(), null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(8000); // arrival + hint gone
  const z0 = await p.evaluate(() => window.__troyMap.map.getZoom());
  await p.mouse.move(720, 450);
  await p.mouse.wheel(0, 600);
  await p.waitForTimeout(500);
  const chip = await p.evaluate(() => { const e = document.querySelector(".mapboxgl-scroll-zoom-blocker"); if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { text: e.textContent, opacity: cs.opacity, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top), font: cs.fontFamily.slice(0, 20) }; });
  await p.screenshot({ path: "docs/v7/qa/j7fix/map-1440-wheel.png" });
  const s1 = await p.evaluate(() => ({ scrollY: Math.round(scrollY), zoom: window.__troyMap.map.getZoom(), coop: window.__troyMap.map._cooperativeGestures }));
  await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await p.waitForTimeout(1500);
  await p.keyboard.down("Meta"); await p.mouse.wheel(0, -300); await p.keyboard.up("Meta");
  await p.waitForTimeout(900);
  const s2 = await p.evaluate(() => ({ scrollY: Math.round(scrollY), zoom: window.__troyMap.map.getZoom() }));
  out.desktop = { z0, afterPlainWheel: s1, chip, afterMetaWheel: s2 };
  await b.close();
}
// phone: touch pan still pans, coop off; card peeks; index title
for (const w of [360, 390]) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: w === 360 ? 800 : 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(B + "/map", { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__troyMap?.map, null, { timeout: 30000 });
  await p.waitForTimeout(8000);
  const coop = await p.evaluate(() => window.__troyMap.map._cooperativeGestures);
  const c0 = await p.evaluate(() => window.__troyMap.map.getCenter().toArray());
  const cdp = await ctx.newCDPSession(p);
  const tp = { x: w / 2, y: 300 };
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [tp] });
  for (let i = 1; i <= 8; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: tp.x, y: tp.y - i * 20 }] }); await p.waitForTimeout(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await p.waitForTimeout(700);
  const c1 = await p.evaluate(() => window.__troyMap.map.getCenter().toArray());
  const panned = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) > 1e-5;
  const scrollAfterPan = await p.evaluate(() => Math.round(scrollY));
  // index title
  const idx = await p.evaluate(() => [...document.querySelectorAll(".map-index-title")].map(e => ({ t: e.textContent.trim().split("\n")[0], sw: e.scrollWidth, cw: e.clientWidth, fs: getComputedStyle(e).fontSize })));
  // focus a stop → card peeks
  await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await p.getByRole("button", { name: /take the walk/i }).click();
  await p.waitForTimeout(2500);
  const peeks = await p.evaluate(() => {
    const slides = [...document.querySelectorAll(".walk-slide")];
    const inners = slides.map(s => s.firstElementChild.getBoundingClientRect());
    const active = inners.findIndex(r => Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 30);
    const right = inners[active + 1], left = inners[active - 1];
    return { active, rightPeek: right ? Math.round(innerWidth - right.left) : null, leftPeek: left ? Math.round(left.right) : null, activeW: Math.round(inners[active].width) };
  });
  await p.screenshot({ path: `docs/v7/qa/j7fix/map-${w}-cards.png` });
  out["phone" + w] = { coop, panned, scrollAfterPan, idx, peeks };
  await b.close();
}
console.log(JSON.stringify(out, null, 1));
