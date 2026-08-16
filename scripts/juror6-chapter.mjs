// Read a whole chapter: play audio, tap a paragraph, scroll to end, sample the pause control at every step.
import { launch, ctx, VPS, goto, shot, watch, sleep, save, FLOATING_JS } from "./juror6-lib.mjs";

const vpName = process.argv[2] || "p390";
const route = process.argv[3] || "/bakery";
const vp = VPS[vpName];
const slug = route.replace("/", "");
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, route);
await sleep(1500);

const CTRL_JS = () => {
  const out = [];
  for (const el of document.querySelectorAll("button, [role=button], a")) {
    const t = (el.getAttribute("aria-label") || el.innerText || "").trim().replace(/\s+/g, " ");
    if (!/pause|play|resume|narration|continue/i.test(t)) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width < 4 || r.height < 4 || cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.05) continue;
    const onscreen = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    out.push({ t: t.slice(0, 50), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), onscreen, pos: cs.position });
  }
  const a = document.querySelector("audio");
  return { ctrls: out, audio: a ? { paused: a.paused, t: Math.round(a.currentTime * 10) / 10 } : null, scrollY: Math.round(scrollY) };
};

// scroll to the play button and press it
const play = page.locator("button[aria-label^='Play narration']").first();
await play.scrollIntoViewIfNeeded();
await sleep(600);
await shot(page, `ch-${slug}-${vpName}-1-player`);
await play.click();
await sleep(2500);
let s = await page.evaluate(CTRL_JS);
console.log("after play:", JSON.stringify(s));
await shot(page, `ch-${slug}-${vpName}-2-playing`);

// tap a paragraph (3rd narrated paragraph)
const paras = await page.evaluate(() => [...document.querySelectorAll("#scene-0 p")].map((p, i) => ({ i, t: p.innerText.slice(0, 40), y: Math.round(p.getBoundingClientRect().top + scrollY), h: Math.round(p.getBoundingClientRect().height), cls: p.className })));
console.log("paras", paras.length, JSON.stringify(paras.slice(0, 6)));
const target = paras[Math.min(3, paras.length - 1)];
await page.evaluate((y) => scrollTo(0, y - 200), target.y);
await sleep(600);
const pEl = page.locator("#scene-0 p").nth(target.i);
await pEl.click({ position: { x: 40, y: 10 } });
await sleep(1200);
s = await page.evaluate(CTRL_JS);
console.log("after para tap:", JSON.stringify(s));
const hi = await page.evaluate(() => { const el = document.querySelector("#scene-0 .narration-active, #scene-0 [data-active='true'], #scene-0 [aria-current]"); return el ? el.innerText.slice(0, 50) : null; });
console.log("highlighted:", hi);
await shot(page, `ch-${slug}-${vpName}-3-paratap`);

// walk down the page in 500px steps; record whether a pause control is on screen
const docH = await page.evaluate(() => document.documentElement.scrollHeight);
const samples = [];
let missing = [];
for (let y = 0; y < docH; y += 500) {
  await page.evaluate((y) => scrollTo(0, y), y);
  await sleep(350);
  const st = await page.evaluate(CTRL_JS);
  const onscreen = st.ctrls.filter(c => c.onscreen && /pause|play|resume/i.test(c.t));
  samples.push({ y, audioPaused: st.audio?.paused, ctrls: onscreen.map(c => `${c.t}@${c.x},${c.y} ${c.w}x${c.h} ${c.pos}`) });
  if (!onscreen.length && st.audio && !st.audio.paused) missing.push(y);
}
console.log("MISSING pause control while playing at scrollY:", missing);
for (const smp of samples) console.log(" ", smp.y, smp.audioPaused, smp.ctrls.join(" | "));

// key section shots
for (const id of ["history", "moral", "onward"]) {
  const ok = await page.evaluate((id) => { const el = document.getElementById(id); if (!el) return false; el.scrollIntoView({ block: "start" }); return true; }, id);
  if (!ok) continue;
  await sleep(900);
  await shot(page, `ch-${slug}-${vpName}-4-${id}`);
  if (id === "moral") {
    const m = await page.evaluate(() => {
      const sec = document.getElementById("moral");
      const h = sec.querySelector("h2"); const ps = [...sec.querySelectorAll("p")];
      const c = (e) => getComputedStyle(e).color;
      return { h: { t: h.innerText.slice(0, 40), color: c(h) }, ps: ps.map(p => ({ t: p.innerText.slice(0, 40), color: c(p), fs: getComputedStyle(p).fontSize, cls: p.className.slice(0, 40) })) };
    });
    console.log("MORAL colours:", JSON.stringify(m));
    // scroll to the moral body
    await page.evaluate(() => { const p = document.querySelector("#moral p"); p && p.scrollIntoView({ block: "center" }); });
    await sleep(700);
    await shot(page, `ch-${slug}-${vpName}-4-moral-body`);
  }
}
// bottom
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
await sleep(900);
await shot(page, `ch-${slug}-${vpName}-5-footer`);
const foot = await page.evaluate(() => {
  const f = document.querySelector("footer");
  const links = [...f.querySelectorAll("a, button")].map(a => { const r = a.getBoundingClientRect(); return { t: a.innerText.trim().replace(/\s+/g, " "), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), lines: a.getClientRects().length }; });
  const st = (window.__ctrl = null);
  return { links };
});
console.log("footer:", JSON.stringify(foot));
const st2 = await page.evaluate(CTRL_JS);
console.log("at footer:", JSON.stringify(st2));
const fl = await page.evaluate(FLOATING_JS);
console.log("floating at footer:", JSON.stringify(fl));
console.log("errors:", log.errors, "failed:", log.failed.filter(f => !/mp3/.test(f)));
save(`ch-${slug}-${vpName}.json`, { samples, missing, foot, st2, fl, log });
await browser.close();
