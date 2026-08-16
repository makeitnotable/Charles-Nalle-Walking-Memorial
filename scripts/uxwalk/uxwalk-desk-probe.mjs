import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 768, height: 1024 } });
await p.goto("http://localhost:4321/bakery", { waitUntil: "networkidle" });
await p.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" });
for (let y = 0; y < 3000; y += 400) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(250); }
await p.evaluate(() => { const el = document.getElementById("scene-0"); scrollTo(0, el.getBoundingClientRect().top + scrollY); });
await p.waitForTimeout(1200);
const info = await p.evaluate(() => {
  const s = document.getElementById("scene-0");
  const h = s.querySelector("h2");
  const cs = getComputedStyle(h);
  const spans = [...h.querySelectorAll("*")].map(e => ({ tag: e.tagName, cls: e.className.toString().slice(0,50), op: getComputedStyle(e).opacity, tr: getComputedStyle(e).transform, cp: getComputedStyle(e).clipPath, r: e.getBoundingClientRect().toJSON() }));
  const rail = s.querySelector("nav.rail");
  return { secTop: s.getBoundingClientRect().top, h2: { text: h.innerText, r: h.getBoundingClientRect().toJSON(), op: cs.opacity, vis: cs.visibility, cp: cs.clipPath }, spans: spans.slice(0,6), rail: rail ? { r: rail.getBoundingClientRect().toJSON(), op: getComputedStyle(rail).opacity, display: getComputedStyle(rail).display } : null, prev: s.previousElementSibling.tagName + "#" + s.previousElementSibling.id + " h=" + s.previousElementSibling.getBoundingClientRect().height };
});
console.log(JSON.stringify(info, null, 1));
await p.screenshot({ path: "docs/v7/qa/uxwalk-desk/bakery-768-probe-scene0.png" });
await b.close();
