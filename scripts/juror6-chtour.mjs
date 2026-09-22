// Chapter tour at a viewport: hero, story open (drop cap), interlude, history, moral, onward, footer w/ mini latched.
import { launch, ctx, VPS, goto, shot, watch, sleep, save, FLOATING_JS } from "./juror6-lib.mjs";

const vpName = process.argv[2] || "t768";
const route = process.argv[3] || "/bakery";
const vp = VPS[vpName];
const slug = route.replace("/", "");
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, route);
await sleep(1500);
await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
await shot(page, `tour-${slug}-${vpName}-0-hero`);
// play
const play = page.locator("button[aria-label^='Play narration']").first();
await play.scrollIntoViewIfNeeded(); await sleep(500);
await play.click(); await sleep(1200);
// drop cap / story open
await page.evaluate(() => { const p = document.querySelector("#scene-0 p.t-prose"); p && p.scrollIntoView({ block: "center" }); });
await sleep(600);
await shot(page, `tour-${slug}-${vpName}-1-story`);
const dc = await page.evaluate(() => { const p = document.querySelector("#scene-0 p.t-prose"); if (!p) return null; const cs = getComputedStyle(p, "::first-letter"); return { fs: cs.fontSize, ff: cs.fontFamily.slice(0, 30), float: cs.float, lh: cs.lineHeight, pfs: getComputedStyle(p).fontSize }; });
console.log("drop cap:", JSON.stringify(dc));
// interlude (archival photo + credit) — figure with .t-meta credit between scene and history
await page.evaluate(() => { const h = document.getElementById("history"); if (h) { window.scrollTo(0, h.getBoundingClientRect().top + scrollY - innerHeight * 0.9); } });
await sleep(900);
await shot(page, `tour-${slug}-${vpName}-2-interlude`);
for (const id of ["history", "moral", "onward"]) {
  await page.evaluate((id) => { const el = document.getElementById(id); el && el.scrollIntoView({ block: "start" }); }, id);
  await sleep(900);
  await shot(page, `tour-${slug}-${vpName}-3-${id}`);
  if (id === "moral") {
    await page.evaluate(() => { const f = document.querySelector("#moral figure"); f && f.scrollIntoView({ block: "center" }); });
    await sleep(700);
    await shot(page, `tour-${slug}-${vpName}-3-moral-study`);
    const geo = await page.evaluate(() => { const f = document.querySelector("#moral figure"); if (!f) return null; const img = f.querySelector("img"); const cap = f.querySelector("figcaption, div"); const r = (e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; }; return { fig: r(f), img: img && r(img), cap: cap && r(cap), grid: getComputedStyle(f).display, align: getComputedStyle(f).alignItems }; });
    console.log("study geometry:", JSON.stringify(geo));
  }
}
// gap moral -> onward
const gaps = await page.evaluate(() => { const m = document.getElementById("moral"); const o = document.getElementById("onward"); const s = document.getElementById("scene-0"); const h2 = s && s.querySelector("h2"); const q = s && s.querySelector("blockquote, .t-quote"); return { moralBottomToOnwardTop: o && m ? Math.round(o.getBoundingClientRect().top - m.getBoundingClientRect().bottom) : null, moralPadBottom: m && getComputedStyle(m).paddingBottom, onwardPadTop: o && getComputedStyle(o).paddingTop, headToQuote: h2 && q ? Math.round(q.getBoundingClientRect().top - h2.getBoundingClientRect().bottom) : null }; });
console.log("rhythm:", JSON.stringify(gaps));
// footer
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(900);
await shot(page, `tour-${slug}-${vpName}-4-footer`);
const foot = await page.evaluate(() => {
  const f = document.querySelector("footer");
  const r = (e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
  const links = [...f.querySelectorAll("a, button")].map(a => ({ t: a.innerText.trim().replace(/\s+/g, " "), ...r(a), lines: a.getClientRects().length, arrowInline: !!a.querySelector("svg") }));
  const wm = [...f.querySelectorAll("p, span, div")].find(e => /Charles Nalle Walking Memorial/.test(e.innerText) && e.children.length === 0);
  const disc = [...f.querySelectorAll("p")].find(e => /Walking routes/.test(e.innerText));
  const rects = (e) => e ? [...e.getClientRects()].length : null;
  // lines of the disclaimer via range
  let discLines = null; if (disc) { const rg = document.createRange(); rg.selectNodeContents(disc); discLines = new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size; }
  let wmLines = null; if (wm) { const rg = document.range || document.createRange(); rg.selectNodeContents(wm); wmLines = new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size; }
  const menu = document.querySelector("button[aria-label='Open menu']");
  return { footer: r(f), links, wm: wm && { ...r(wm), lines: wmLines, t: wm.innerText }, disc: disc && { ...r(disc), lines: discLines, color: getComputedStyle(disc).color, op: getComputedStyle(disc).opacity, last: disc.innerText.split(/\s+/).slice(-2).join(" ") }, menu: menu && { ...r(menu), op: getComputedStyle(menu).opacity, vis: getComputedStyle(menu).visibility } };
});
console.log("footer:", JSON.stringify(foot));
const fl = await page.evaluate(FLOATING_JS);
console.log("floating at footer:", JSON.stringify(fl.filter(f => !/curtain/.test(f.t))));
// overlap check: mini pill vs any footer link
const pill = fl.find(f => f.pos === "fixed" && /bottom|Pause|Play/.test(f.t) && f.h < 120);
if (pill) {
  const hits = foot.links.filter(l => !(l.x + l.w < pill.x || l.x > pill.x + pill.w || l.y + l.h < pill.y || l.y > pill.y + pill.h));
  console.log("pill", JSON.stringify(pill), "overlaps:", JSON.stringify(hits));
}
console.log("errors:", log.errors, "failed:", log.failed.filter(f => !/mp3|pbf/.test(f)));
await browser.close();
