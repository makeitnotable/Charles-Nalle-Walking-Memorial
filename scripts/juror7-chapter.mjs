// Chapter walk-through: /bakery (and /barbershop arrival) at a given viewport
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson } from "./juror7-lib.mjs";

const vp = process.argv[2] || "390";
const route = process.argv[3] || "/bakery";
const tag = route.replace("/", "") + "-" + vp;
const errs = [];
const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, tag, errs);

const fixedEls = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("*")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed" && cs.position !== "sticky") return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          cls: (typeof el.className === "string" ? el.className : "").slice(0, 70),
          text: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
          rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
          pos: getComputedStyle(el).position,
        };
      })
  );
const btns = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((b) => {
        const r = b.getBoundingClientRect();
        const cs = getComputedStyle(b);
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== "hidden";
      })
      .map((b) => ({ label: (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60), rect: b.getBoundingClientRect().toJSON() }))
      .map((b) => ({ label: b.label, rect: [Math.round(b.rect.x), Math.round(b.rect.y), Math.round(b.rect.width), Math.round(b.rect.height)] }))
  );

// 1. QR arrival
await goto(page, route);
await sleep(2200);
await shot(page, `${tag}-01-arrival`);
log.arrivalMenu = await page.evaluate(() => document.querySelector('button[aria-label="Open menu"]')?.getBoundingClientRect().toJSON());

// scroll a bit and check menu hides / returns
await page.mouse.wheel(0, 700);
await sleep(700);
log.menuAfterScrollDown = await page.evaluate(() => {
  const b = document.querySelector('button[aria-label="Open menu"]');
  const r = b.getBoundingClientRect();
  return { y: Math.round(r.y), opacity: getComputedStyle(b).opacity, visible: r.bottom > 0 && r.top < innerHeight && getComputedStyle(b).visibility !== "hidden" && parseFloat(getComputedStyle(b).opacity) > 0.1, transform: getComputedStyle(b).transform };
});
await page.mouse.wheel(0, -120);
await sleep(700);
log.menuAfterScrollUp = await page.evaluate(() => {
  const b = document.querySelector('button[aria-label="Open menu"]');
  const r = b.getBoundingClientRect();
  return { y: Math.round(r.y), opacity: getComputedStyle(b).opacity, visible: r.bottom > 0 && r.top < innerHeight && getComputedStyle(b).visibility !== "hidden" && parseFloat(getComputedStyle(b).opacity) > 0.1, transform: getComputedStyle(b).transform };
});

// 2. play narration
const play = page.locator('button[aria-label^="Play narration"]').first();
await play.scrollIntoViewIfNeeded();
await sleep(400);
await page.evaluate(() => scrollBy(0, -140));
await sleep(600);
await shot(page, `${tag}-02-player`);
const playBox = await play.boundingBox();
await page.mouse.click(playBox.x + playBox.width / 2, playBox.y + playBox.height / 2);
await sleep(2500);
log.audio1 = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime, src: a.currentSrc.split("/").pop() })));
await shot(page, `${tag}-03-playing`);
log.buttonsWhilePlaying = await btns();

// 3. tap a paragraph (the 3rd .t-prose p) — seek?
const paras = page.locator("p.t-prose");
const nP = await paras.count();
log.nParas = nP;
const target = paras.nth(Math.min(3, nP - 1));
await target.scrollIntoViewIfNeeded();
await sleep(500);
const tb = await target.boundingBox();
const before = await page.evaluate(() => document.querySelector("audio")?.currentTime);
await page.mouse.click(tb.x + 40, tb.y + 10);
await sleep(700);
const after = await page.evaluate(() => document.querySelector("audio")?.currentTime);
log.tapSeek = { before, after };
await shot(page, `${tag}-04-tapped-para`);

// 4. scroll UP away from the player — pause control on screen?
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await sleep(900);
log.fixedAtTopWhilePlaying = await fixedEls();
log.btnsAtTopWhilePlaying = await btns();
await shot(page, `${tag}-05-scrolled-up-playing`);
// scroll DOWN away
await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight * 0.45, behavior: "instant" }));
await sleep(900);
log.fixedMidWhilePlaying = await fixedEls();
log.btnsMidWhilePlaying = await btns();
await shot(page, `${tag}-06-scrolled-down-playing`);
// menu + mini-player combined
await page.click('button[aria-label="Open menu"]').catch(() => {});
await sleep(900);
await shot(page, `${tag}-07-menu-open-playing`);
log.menuOpenBtns = await btns();
await page.keyboard.press("Escape");
await sleep(700);

// 5. moral section
const moralH = page.locator('[id^="moral"] h2, #moral h2, section[id^="moral"] h2').first();
if (await moralH.count()) {
  await moralH.scrollIntoViewIfNeeded();
  await sleep(500);
  await page.evaluate(() => scrollBy(0, -80));
  await sleep(1200);
  await shot(page, `${tag}-08-moral`);
  log.moral = await page.evaluate(() => {
    const sec = document.querySelector('[id^="moral"]');
    const h = sec.querySelector("h2");
    const ps = [...sec.querySelectorAll("p")];
    return { heading: h.textContent.trim().replace(/\s+/g, " "), hColor: getComputedStyle(h).color, bodies: ps.map((p) => ({ t: p.textContent.trim().slice(0, 40), color: getComputedStyle(p).color, cls: p.className.slice(0, 40) })) };
  });
}
// scroll to onward
await page.evaluate(() => document.querySelector("#onward")?.scrollIntoView({ block: "start" }));
await sleep(1200);
await shot(page, `${tag}-09-onward`);
log.fixedAtOnward = await fixedEls();
log.audioAtOnward = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime })));
// footer
await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
await sleep(1000);
await shot(page, `${tag}-10-footer-with-player`);
log.fixedAtFooter = await fixedEls();
log.footerLinks = await page.evaluate(() => [...document.querySelectorAll("footer a, footer button")].map((a) => ({ t: a.textContent.trim().slice(0, 40), rect: a.getBoundingClientRect().toJSON() })).map((a) => ({ t: a.t, rect: [Math.round(a.rect.x), Math.round(a.rect.y), Math.round(a.rect.width), Math.round(a.rect.height)] })));
// overlap check: fixed elements vs footer links
log.footerCovered = (() => {
  const ov = [];
  for (const f of log.fixedAtFooter) for (const l of log.footerLinks) {
    const [fx, fy, fw, fh] = f.rect; const [lx, ly, lw, lh] = l.rect;
    if (fx < lx + lw && fx + fw > lx && fy < ly + lh && fy + fh > ly) ov.push({ fixed: f.text || f.cls, link: l.t });
  }
  return ov;
})();
// pause the audio via whatever visible pause control exists
const pauseBtn = page.locator('button[aria-label*="ause"]').first();
log.pauseBtnCount = await page.locator('button[aria-label*="ause"]').count();
if (await pauseBtn.count()) { await pauseBtn.click({ force: true }).catch(() => {}); await sleep(400); }
log.audioAfterPause = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => a.paused));

// 6. Continue → next chapter (raw click)
await page.evaluate(() => document.querySelector("#onward")?.scrollIntoView({ block: "start" }));
await sleep(800);
const cont = page.locator('a:has-text("Continue")').first();
const cb = await cont.boundingBox();
log.continueHref = await cont.getAttribute("href");
await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
await sleep(300);
await shot(page, `${tag}-11-curtain-mid`);
await page.waitForURL(/mansion|commissioners-office|ferry|barbershop|bakery/, { timeout: 15000 }).catch(() => {});
await sleep(1800);
await shot(page, `${tag}-12-next-chapter`);
log.nextUrl = page.url();

writeJson(`chapter-${tag}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
console.log("ERRS", JSON.stringify(errs, null, 1));
await browser.close();
