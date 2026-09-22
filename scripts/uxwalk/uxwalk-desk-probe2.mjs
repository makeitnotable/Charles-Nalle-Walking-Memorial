import { chromium } from "playwright";
import sharp from "sharp";
const b = await chromium.launch();
const out = [];
for (const [route, id, vp] of [["/commissioners-office","moral-0",[1440,900]],["/barbershop","moral",[1440,900]],["/commissioners-office","moral-1",[1440,900]],["/barbershop","moral",[768,1024]],["/commissioners-office","moral-0",[768,1024]],["/bakery","scene-0",[1440,900]]]) {
  const p = await b.newPage({ viewport: { width: vp[0], height: vp[1] } });
  await p.goto("http://localhost:4321" + route, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "astro-dev-toolbar{display:none !important} .cnwm-menu{display:none!important}" });
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 700) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(120); }
  await p.evaluate((i) => { const el = document.getElementById(i).querySelector("h2"); scrollTo(0, el.getBoundingClientRect().top + scrollY - 120); }, id);
  await p.waitForTimeout(1500);
  const box = await p.evaluate((i) => { const h = document.getElementById(i).querySelector("h2"); const r = h.getBoundingClientRect(); return { x: Math.max(0, Math.round(r.x - 10)), y: Math.max(0, Math.round(r.y - 10)), w: Math.min(innerWidth - Math.max(0, Math.round(r.x - 10)), Math.round(r.width + 20)), h: Math.min(innerHeight - Math.max(0, Math.round(r.y - 10)), Math.round(r.height + 60)), text: h.innerText, spans: [...h.querySelectorAll(".line-box")].map(s => { const r = s.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), ov: getComputedStyle(s).overflow, lh: getComputedStyle(s).lineHeight, fs: getComputedStyle(s).fontSize } }) }; }, id);
  const a = await p.screenshot({ clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
  await p.addStyleTag({ content: ".line-box, .line-inner, .lines, h2 { overflow: visible !important; clip-path: none !important; }" });
  await p.waitForTimeout(300);
  const c = await p.screenshot({ clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
  const A = await sharp(a).raw().toBuffer({ resolveWithObject: true });
  const C = await sharp(c).raw().toBuffer({ resolveWithObject: true });
  let diff = 0; const rows = new Map();
  for (let i = 0; i < A.data.length; i += A.info.channels) { const d = Math.abs(A.data[i] - C.data[i]) + Math.abs(A.data[i+1] - C.data[i+1]) + Math.abs(A.data[i+2] - C.data[i+2]); if (d > 60) { diff++; const y = Math.floor(i / A.info.channels / A.info.width); rows.set(y, (rows.get(y) || 0) + 1); } }
  const slug = route.slice(1) + "-" + vp[0] + "-" + id;
  await sharp(a).toFile(`docs/v7/qa/uxwalk-desk/${slug}-clip-default.png`);
  await sharp(c).toFile(`docs/v7/qa/uxwalk-desk/${slug}-clip-unclipped.png`);
  out.push({ slug, text: box.text.replace(/\n/g, " / "), spans: box.spans, diffPixels: diff, diffRows: [...rows.entries()].filter(([, n]) => n > 3).map(([y, n]) => (y + box.y) + ":" + n).slice(0, 40) });
  await p.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
