// Focused probes: tap-to-seek on narrated paragraph, menu scroll-hide, Continue navigation
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, cdp, touchTap } from "./juror7-lib.mjs";

const vp = process.argv[2] || "390";
const route = process.argv[3] || "/bakery";
const tag = route.replace("/", "") + "-" + vp;
const errs = [];
const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, tag, errs);
await goto(page, route);
await sleep(1500);

const menuState = () =>
  page.evaluate(() => {
    const m = document.querySelector(".cnwm-menu");
    const b = m?.querySelector("button");
    const cs = m ? getComputedStyle(m) : null;
    const r = b?.getBoundingClientRect();
    return { scrollY: Math.round(scrollY), transform: cs?.transform, opacity: cs?.opacity, vis: cs?.visibility, cls: m?.className.slice(0, 120), attrs: m ? [...m.attributes].map((a) => a.name + "=" + a.value).join(" ").slice(0, 200) : null, btnY: r ? Math.round(r.y) : null, btnOnScreen: r ? r.bottom > 0 && r.top < innerHeight : null };
  });

// menu scroll-hide: scroll down in steps
log.menu0 = await menuState();
for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 120); await sleep(120); }
await sleep(700);
log.menuDown = await menuState();
await shot(page, `${tag}-m1-scrolled-down`, { clip: { x: 0, y: 0, width: Number(vp === "720z" ? 720 : vp === "1920" ? 1920 : vp === "1440" ? 1440 : vp === "1024" ? 1024 : vp === "768" ? 768 : vp === "360" ? 360 : 390), height: 160 } });
for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -40); await sleep(120); }
await sleep(700);
log.menuUp = await menuState();
await shot(page, `${tag}-m2-scrolled-up`, { clip: { x: 0, y: 0, width: Number(vp === "720z" ? 720 : vp === "1920" ? 1920 : vp === "1440" ? 1440 : vp === "1024" ? 1024 : vp === "768" ? 768 : vp === "360" ? 360 : 390), height: 160 } });

// tap-to-seek: find the narrated paragraphs (siblings after the "Tap or click a paragraph" hint)
const info = await page.evaluate(() => {
  const hint = [...document.querySelectorAll("p,span,div")].find((e) => /tap or click a paragraph/i.test(e.textContent || "") && e.children.length <= 1);
  const root = hint?.closest("section, div[class*='story'], article") || hint?.parentElement?.parentElement;
  const ps = [...(root || document).querySelectorAll("p")].filter((p) => (p.textContent || "").trim().length > 60);
  return { hint: hint?.textContent.trim().slice(0, 50), rootTag: root?.tagName, rootCls: root?.className.slice(0, 80), n: ps.length, first: ps.slice(0, 6).map((p) => ({ t: p.textContent.trim().slice(0, 40), cls: p.className.slice(0, 60), attrs: [...p.attributes].map((a) => a.name).join(",") })) };
});
log.narrInfo = info;
// play
const play = page.locator('button[aria-label^="Play narration"]').first();
await play.scrollIntoViewIfNeeded();
await sleep(600);
const pb = await play.boundingBox();
await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2);
await sleep(1500);
// pick the 3rd narrated paragraph
const para = page.locator("p").filter({ hasText: /.{60,}/ }).filter({ has: page.locator("xpath=ancestor::*[contains(@class,'story') or contains(@class,'narr') or contains(@class,'audio')]") });
const nn = await para.count();
log.narrCount = nn;
// fallback: use the paragraph texts from info
const idx = Math.min(2, (info.first.length || 1) - 1);
const targetText = info.first[idx]?.t;
const target = page.locator("p", { hasText: targetText.slice(0, 30) }).first();
await target.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
await sleep(600);
const tb = await target.boundingBox();
const before = await page.evaluate(() => document.querySelector("audio")?.currentTime);
const session = await cdp(page);
if (vp === "390" || vp === "360" || vp === "768") await touchTap(session, tb.x + tb.width / 2, tb.y + tb.height / 2);
else await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
await sleep(700);
const after = await page.evaluate(() => document.querySelector("audio")?.currentTime);
log.tapSeek = { targetText, before, after, jumped: Math.abs(after - before) > 2 };
log.activeAfterTap = await page.evaluate(() => {
  const a = document.querySelector(".narration-active, [data-active='true'], [aria-current='true']");
  return a ? { t: a.textContent.trim().slice(0, 40), cls: a.className.slice(0, 60), bg: getComputedStyle(a).backgroundColor } : null;
});
await shot(page, `${tag}-m3-tapped-narrated`);

// Continue navigation with frames
await page.evaluate(() => scrollTo({ top: document.querySelector("#onward").getBoundingClientRect().top + scrollY - 40, behavior: "instant" }));
await sleep(1200);
const cont = page.locator('a[href$="/commissioners-office"], a[href$="/mansion"], a[href$="/ferry"], a[href$="/barbershop"], a[href$="/bakery"]').filter({ hasText: /Continue/ }).first();
const cb = await cont.boundingBox();
log.contBox = cb;
await shot(page, `${tag}-m4-before-continue`);
await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
const t0 = Date.now();
await sleep(150); await shot(page, `${tag}-m5-cont-150`);
await sleep(300); await shot(page, `${tag}-m6-cont-450`);
await sleep(300); await shot(page, `${tag}-m7-cont-750`);
await page.waitForURL((u) => !u.toString().includes(route), { timeout: 15000 }).catch(() => {});
log.navMs = Date.now() - t0;
await sleep(200); await shot(page, `${tag}-m8-after-nav`);
await sleep(1500); await shot(page, `${tag}-m9-next-settled`);
log.nextUrl = page.url();
writeJson(`chapter2-${tag}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
console.log("ERRS", JSON.stringify(errs.filter((e) => !/ERR_ABORTED/.test(e.text)), null, 1));
await browser.close();
