import { launch, ctx, watch, shot, sleep, save, goto, VPS } from "./juror5-lib.mjs";
const browser = await launch();
const R = {};
// reduced motion at 390 and 1440
for (const key of ["p390", "d1440"]) {
  const c = await ctx(browser, VPS[key], { reducedMotion: "reduce" });
  const page = await c.newPage();
  const log = watch(page);
  R[key] = {};
  for (const route of ["/", "/ferry", "/map", "/paintings"]) {
    await goto(page, route); await sleep(2500);
    const name = route.replace(/\//g, "") || "home";
    await shot(page, `rm-${name}-${key}`);
    const info = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll("h1,h2,p,a,button")].filter((e) => { const r = e.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return false; const cs = getComputedStyle(e); return parseFloat(cs.opacity) < 0.5 || cs.visibility === "hidden"; }).slice(0, 12).map((e) => e.tagName + " " + (e.textContent || "").trim().slice(0, 30) + " op=" + getComputedStyle(e).opacity);
      return { hidden, canvas: !!document.querySelector("canvas"), museumRunning: (() => { const m = window.__museum; if (!m) return null; const s = typeof m.state === "function" ? m.state() : m.state; return s.running; })(), grid: document.querySelectorAll("button[aria-label^='View']").length };
    });
    R[key][route] = info;
    if (route === "/paintings") { await page.evaluate(() => window.scrollTo({ top: innerHeight * 1.5 })); await sleep(1200); await shot(page, `rm-paintings-${key}-scrolled`); }
    if (route === "/ferry") { await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight * 0.45 })); await sleep(1200); await shot(page, `rm-ferry-${key}-mid`); R[key].ferryMidHidden = await page.evaluate(() => [...document.querySelectorAll("h2,p,img,figure")].filter((e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.width > 0; }).filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.5).map((e) => e.tagName + " " + (e.textContent || e.getAttribute("alt") || "").trim().slice(0, 30) + " op=" + getComputedStyle(e).opacity)); }
    if (route === "/map") { await page.getByRole("button", { name: /take the walk/i }).click(); await sleep(2500); await shot(page, `rm-map-${key}-walk`); }
  }
  R[key].log = log;
  await c.close();
}
// menu close spin: check the close button's transform mid-animation (non-reduced)
{
  const c = await ctx(browser, VPS.p390);
  const page = await c.newPage();
  await goto(page, "/mansion"); await sleep(1200);
  await page.locator('button[aria-label*="menu" i]').first().click(); await sleep(900);
  const close = page.locator('button[aria-label*="close" i]').first();
  const box = await close.boundingBox();
  const samplesP = page.evaluate(async () => { const b = document.querySelector('button[aria-label*="lose" i]'); const icon = b.querySelector("svg, span, i") || b; const out = []; const t0 = performance.now(); while (performance.now() - t0 < 700) { out.push({ t: Math.round(performance.now() - t0), tf: getComputedStyle(icon).transform, btf: getComputedStyle(b).transform }); await new Promise((r) => requestAnimationFrame(r)); } return out; });
  await close.click();
  const samples = await samplesP;
  const tfs = [...new Set(samples.map((s) => s.tf + "|" + s.btf))];
  R.menuSpin = { closeBox: box, distinctTransforms: tfs.length, first: tfs.slice(0, 3), last: tfs.slice(-2), closedAfter: await page.evaluate(() => [...document.querySelectorAll("[aria-expanded]")].map((e) => e.getAttribute("aria-expanded"))) };
  await c.close();
}
// walk cadence: sample active card index over 24s at 390
{
  const c = await ctx(browser, VPS.p390);
  const page = await c.newPage();
  await goto(page, "/map"); await sleep(6000);
  await page.getByRole("button", { name: /take the walk/i }).click();
  const t0 = Date.now(); const cad = [];
  for (let i = 0; i < 60; i++) { await sleep(400); cad.push({ t: Date.now() - t0, active: await page.evaluate(() => { const s = [...document.querySelectorAll("[aria-label^='Enter Spot']")][0]; return s ? s.getAttribute("aria-label").slice(11, 13) : null; }), moving: await page.evaluate(() => !!document.querySelector(".mapboxgl-canvas") && (window.__map ? window.__map.isMoving() : null)) }); }
  const changes = []; let last = null; for (const s of cad) { if (s.active !== last) { changes.push({ t: s.t, active: s.active }); last = s.active; } }
  R.walkCadence = changes;
  await c.close();
}
await browser.close();
save("rm.json", R);
console.log(JSON.stringify(R, null, 1));
