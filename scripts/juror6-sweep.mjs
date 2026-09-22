// Sweep: every route at a viewport (optionally reduced motion) — console errors, overflow, top+full shots.
import { launch, ctx, VPS, goto, shot, watch, sleep, save } from "./juror6-lib.mjs";
const vpName = process.argv[2] || "p390";
const rm = process.argv[3] === "rm";
const vp = VPS[vpName];
const routes = ["/", "/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop", "/map", "/people", "/paintings", "/about", "/404", "/bakery/"];
const browser = await launch();
const out = {};
for (const route of routes) {
  const c = await ctx(browser, vp, rm ? { reducedMotion: "reduce" } : {});
  const page = await c.newPage();
  const log = watch(page);
  const t0 = Date.now();
  await goto(page, route);
  await sleep(/map|paintings/.test(route) ? 4500 : 1800);
  const slug = route.replace(/\//g, "") || "home";
  const tag = `${slug}${route.endsWith("/") && route.length > 1 ? "-slash" : ""}-${vpName}${rm ? "-rm" : ""}`;
  await shot(page, `sweep-${tag}-top`);
  const info = await page.evaluate(() => {
    const de = document.documentElement;
    const overflow = de.scrollWidth > de.clientWidth + 1;
    // hidden text check: elements with text but opacity 0 / visibility hidden / transform off-screen (reduced-motion visibility)
    const hiddenText = [...document.querySelectorAll("h1,h2,h3,p,a,button")].filter(e => { const t = (e.innerText || "").trim(); if (!t) return false; const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return false; let op = 1, p = e; while (p && p !== document.body) { op *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement; } const r = e.getBoundingClientRect(); return op < 0.1 && r.width > 0 && r.top < innerHeight * 3; }).map(e => e.tagName + ":" + e.innerText.trim().slice(0, 30));
    return { url: location.href, title: document.title, overflow, sw: de.scrollWidth, cw: de.clientWidth, docH: de.scrollHeight, hiddenText: hiddenText.slice(0, 8), h1: document.querySelector("h1") && document.querySelector("h1").innerText.replace(/\s+/g, " ").slice(0, 60) };
  });
  // scroll through the page collecting errors
  const steps = Math.min(12, Math.ceil(info.docH / vp.height));
  for (let i = 1; i <= steps; i++) { await page.evaluate((y) => scrollTo(0, y), i * vp.height); await sleep(250); }
  await sleep(500);
  const bottomHidden = await page.evaluate(() => [...document.querySelectorAll("h1,h2,h3,p")].filter(e => { const t = (e.innerText || "").trim(); if (!t) return false; const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return false; let op = 1, p = e; while (p && p !== document.body) { op *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement; } const r = e.getBoundingClientRect(); return op < 0.1 && r.width > 0 && r.top < innerHeight && r.bottom > 0; }).map(e => e.tagName + ":" + e.innerText.trim().slice(0, 30)));
  await shot(page, `sweep-${tag}-bottom`);
  out[route] = { ...info, bottomHidden, errors: log.errors, warnings: log.warnings.slice(0, 5), failed: log.failed.filter(f => !/ERR_ABORTED|pbf/.test(f)), ms: Date.now() - t0 };
  await c.close();
}
await browser.close();
save(`sweep-${vpName}${rm ? "-rm" : ""}.json`, out);
for (const [r, v] of Object.entries(out)) console.log(r.padEnd(24), "| overflow", v.overflow, v.sw + "/" + v.cw, "| h1:", v.h1, "| hiddenTop", v.hiddenText.length, "| hiddenBottom", v.bottomHidden.length, JSON.stringify(v.bottomHidden.slice(0, 3)), "| errors", JSON.stringify(v.errors), "| failed", JSON.stringify(v.failed), "| url", v.url.slice(-30));
