import { launch, ctx, watch, shot, sleep, save, goto, VPS, FLOATING_JS, touchDrag, touchTap, rect } from "./juror5-lib.mjs";

const which = process.argv[2] ? process.argv[2].split(",") : ["p390"];
const EXTRA = { z720: { width: 720, height: 450, mobile: false } };
const results = {};
const browser = await launch();
const controls = () =>
  [...document.querySelectorAll("button, a, [role=button]")]
    .filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05; })
    .map((b) => { const r = b.getBoundingClientRect(); return { l: (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 44), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
const chipInfo = () => [...document.querySelectorAll("*")].filter((e) => e.children.length <= 3 && /scroll to walk|face forward|the museum/i.test(e.textContent || "") && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().width < innerWidth * 0.9).slice(0, 4).map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 60), tag: e.tagName, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(e).opacity }; });
const overlap = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const museumState = () => { const m = window.__museum; if (!m) return null; try { const s = typeof m.state === "function" ? m.state() : m.state; return JSON.parse(JSON.stringify(s)).constructor === Object ? s : s; } catch (e) { return String(e); } };
const paintingRect = (i) => { const m = window.__museum; if (!m || !m.paintingRect) return null; try { return m.paintingRect(i); } catch (e) { return String(e); } };

for (const key of which) {
  const vp = VPS[key] || EXTRA[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  const R = (results[key] = { vp });
  await goto(page, "/paintings");
  await sleep(4000);
  R.docH = await page.evaluate(() => document.documentElement.scrollHeight);
  R.hasCanvas = await page.evaluate(() => !!document.querySelector("canvas"));
  R.rest = { controls: await page.evaluate(controls), chip: await page.evaluate(chipInfo), floating: await page.evaluate(FLOATING_JS), state: await page.evaluate(museumState) };
  await shot(page, `mus-${key}-01-rest`);
  // chip vs skip vs burger
  const skip = R.rest.controls.find((c) => /skip/i.test(c.l));
  const burger = R.rest.controls.find((c) => /menu/i.test(c.l));
  const chip = R.rest.chip.sort((a, b) => a.w * a.h - b.w * b.h)[0];
  R.restLanes = { skip, burger, chip, chipVsSkip: overlap(chip, skip), chipVsBurger: overlap(chip, burger), skipVsBurger: overlap(skip, burger) };
  // scroll the rail
  const H = R.docH;
  const stageH = await page.evaluate(() => { const st = document.querySelector("canvas")?.closest("section, div"); return st ? st.getBoundingClientRect().height : innerHeight; });
  await page.evaluate(() => window.scrollTo({ top: innerHeight * 1.5 }));
  await sleep(1500);
  await shot(page, `mus-${key}-02-rail-mid`);
  R.railMid = { controls: await page.evaluate(controls), chip: await page.evaluate(chipInfo), state: await page.evaluate(museumState) };
  await page.evaluate(() => window.scrollTo({ top: innerHeight * 4 }));
  await sleep(1500);
  await shot(page, `mus-${key}-03-rail-deep`);
  // drag to look
  const cvs = await page.evaluate(() => { const c = document.querySelector("canvas"); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  R.canvas = cvs;
  const cx = cvs.x + cvs.w / 2, cy = cvs.y + cvs.h / 2;
  if (vp.mobile) await touchDrag(page, { x: cx + 60, y: cy }, { x: cx - 160, y: cy }, 12, 16); else { await page.mouse.move(cx + 60, cy); await page.mouse.down(); for (let i = 1; i <= 12; i++) { await page.mouse.move(cx + 60 - (220 * i) / 12, cy); await sleep(16); } await page.mouse.up(); }
  await sleep(1200);
  await shot(page, `mus-${key}-04-looked`);
  R.looked = { controls: await page.evaluate(controls), chip: await page.evaluate(chipInfo), state: await page.evaluate(museumState) };
  const ff = page.getByRole("button", { name: /face forward|recenter/i }).first();
  R.faceForward = rect(await ff.boundingBox().catch(() => null));
  if (R.faceForward) { await ff.click(); await sleep(1200); R.afterFF = { chip: await page.evaluate(chipInfo), state: await page.evaluate(museumState) }; await shot(page, `mus-${key}-05-faced`); }
  // click a painting: use the debug hook to know rects; else click centre-ish where a painting is
  R.rects = await page.evaluate(() => { const m = window.__museum; if (!m || !m.paintingRect) return "no hook"; const out = []; for (let i = 0; i < 10; i++) { try { out.push(m.paintingRect(i)); } catch (e) { out.push(String(e)); } } return out; });
  // approach via the dot rail (Approach “...”) — the 4th work
  const dots = (await page.evaluate(controls)).filter((c) => /^approach/i.test(c.l));
  R.dots = dots.map((d) => d.l);
  const target = dots[3] || dots[0];
  if (target) {
    if (vp.mobile) await touchTap(page, target.x + target.w / 2, target.y + target.h / 2); else await page.mouse.click(target.x + target.w / 2, target.y + target.h / 2);
    await sleep(2500);
    await shot(page, `mus-${key}-06-approach`);
    R.approach = { controls: await page.evaluate(controls), floating: await page.evaluate(FLOATING_JS), state: await page.evaluate(museumState), rect: await page.evaluate(() => { const m = window.__museum; if (!m) return null; const s = typeof m.state === "function" ? m.state() : m.state; const i = s?.approach ?? s?.active ?? s?.current ?? s?.index; try { return { i, r: m.paintingRect(i) }; } catch (e) { return String(e); } }), card: await page.evaluate(() => { const els = [...document.querySelectorAll("h2,h3,p")].filter((e) => e.getBoundingClientRect().width > 0 && /mark priest|nalle series|chapter/i.test(e.textContent)); const e = els[0]; if (!e) return null; const card = e.closest("div, aside, section"); const r = card.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), text: card.innerText.replace(/\n+/g, " | ").slice(0, 200) }; }) };
    // painting rect centre vs viewport centre
    const pr = R.approach.rect?.r;
    if (pr && pr.w) { R.approach.centre = { cx: Math.round((pr.x + pr.w / 2) / vp.width * 100), cy: Math.round((pr.y + pr.h / 2) / vp.height * 100), pr }; R.approach.rectVsCard = overlap({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }, R.approach.card); }
    // tap the painting -> alive
    const alive = page.getByRole("button", { name: /bring the painting to life/i }).first();
    R.aliveBtn = rect(await alive.boundingBox().catch(() => null));
    if (R.aliveBtn) {
      if (vp.mobile) await touchTap(page, R.aliveBtn.x + R.aliveBtn.w / 2, R.aliveBtn.y + R.aliveBtn.h / 2); else await page.mouse.click(R.aliveBtn.x + R.aliveBtn.w / 2, R.aliveBtn.y + R.aliveBtn.h / 2);
      await sleep(2500);
      R.alive = { videos: await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => ({ src: v.currentSrc.split("/").pop(), paused: v.paused, t: v.currentTime, w: v.videoWidth, h: v.videoHeight }))), controls: (await page.evaluate(controls)).filter((c) => /life|rest|back|expand|collapse/i.test(c.l)), state: await page.evaluate(museumState) };
      await shot(page, `mus-${key}-07-alive`);
    }
    // phone sheet: drag header up
    const expand = (await page.evaluate(controls)).find((c) => /expand the plaque|sheet|plaque/i.test(c.l));
    R.expandBtn = expand;
    if (expand && vp.mobile) {
      await touchDrag(page, { x: expand.x + expand.w / 2, y: expand.y + 30 }, { x: expand.x + expand.w / 2, y: expand.y - 260 }, 12, 16);
      await sleep(1200);
      await shot(page, `mus-${key}-08-sheet-up`);
      R.sheetUp = { controls: await page.evaluate(controls), floating: await page.evaluate(FLOATING_JS), state: await page.evaluate(museumState), rect: await page.evaluate(() => { const m = window.__museum; if (!m) return null; const s = typeof m.state === "function" ? m.state() : m.state; const i = s?.approach ?? s?.active ?? s?.current ?? s?.index; try { return { i, r: m.paintingRect(i) }; } catch (e) { return String(e); } }) };
      // drag back down
      const hdr = (await page.evaluate(controls)).find((c) => /collapse|expand|plaque/i.test(c.l)) || expand;
      await touchDrag(page, { x: hdr.x + hdr.w / 2, y: hdr.y + 20 }, { x: hdr.x + hdr.w / 2, y: hdr.y + 300 }, 12, 16);
      await sleep(1200);
      await shot(page, `mus-${key}-09-sheet-down`);
      R.sheetDown = { controls: (await page.evaluate(controls)).filter((c) => /back|plaque|expand|collapse/i.test(c.l)) };
    }
    // Back to the hall
    const back = page.getByRole("button", { name: /back to the hall/i }).first();
    R.backBtn = rect(await back.boundingBox().catch(() => null));
    if (R.backBtn) { await back.click(); await sleep(2000); R.afterBack = { controls: (await page.evaluate(controls)).filter((c) => /back|skip|face|approach/i.test(c.l)).slice(0, 4), state: await page.evaluate(museumState) }; await shot(page, `mus-${key}-10-back`); }
  }
  // LAST painting (portrait): approach via last dot
  const dots2 = (await page.evaluate(controls)).filter((c) => /^approach/i.test(c.l));
  const last = dots2[dots2.length - 1];
  if (last) {
    if (vp.mobile) await touchTap(page, last.x + last.w / 2, last.y + last.h / 2); else await page.mouse.click(last.x + last.w / 2, last.y + last.h / 2);
    await sleep(2800);
    await shot(page, `mus-${key}-11-last`);
    R.last = { state: await page.evaluate(museumState), rect: await page.evaluate(() => { const m = window.__museum; if (!m) return null; const s = typeof m.state === "function" ? m.state() : m.state; const i = s?.approach ?? s?.active ?? s?.current ?? s?.index; try { return { i, r: m.paintingRect(i) }; } catch (e) { return String(e); } }), controls: await page.evaluate(controls) };
    const pr = R.last.rect?.r; const dotRail = R.last.controls.filter((c) => /^approach/i.test(c.l));
    if (pr && pr.w) { R.last.aspect = Math.round((pr.w / pr.h) * 100) / 100; R.last.vsDots = dotRail.some((d) => overlap({ x: pr.x, y: pr.y, w: pr.w, h: pr.h }, d)); R.last.centre = { cx: Math.round((pr.x + pr.w / 2) / vp.width * 100), cy: Math.round((pr.y + pr.h / 2) / vp.height * 100) }; }
    // Esc back
    await page.keyboard.press("Escape"); await sleep(1500);
    R.afterEsc = { state: await page.evaluate(museumState), back: (await page.evaluate(controls)).some((c) => /back to the hall/i.test(c.l)) };
  }
  // keyboard: Tab to a dot, Enter, Esc, arrows
  await page.evaluate(() => window.scrollTo({ top: innerHeight * 2 })); await sleep(600);
  const kb = [];
  for (let i = 0; i < 12; i++) { await page.keyboard.press("Tab"); await sleep(120); kb.push(await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return { l: (a.getAttribute("aria-label") || a.textContent || a.tagName).trim().slice(0, 40), ring: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 ? cs.outlineWidth : (cs.boxShadow !== "none" ? "shadow" : "none"), y: Math.round(r.y) }; })); }
  R.tabs = kb;
  // find a focused dot & press Enter
  const idx = kb.findIndex((k) => /^approach/i.test(k.l));
  if (idx >= 0) {
    // re-tab until an approach dot is focused
    let cur = await page.evaluate(() => (document.activeElement.getAttribute("aria-label") || ""));
    let n = 0; while (!/^approach/i.test(cur) && n < 20) { await page.keyboard.press("Tab"); await sleep(80); cur = await page.evaluate(() => (document.activeElement.getAttribute("aria-label") || "")); n++; }
    await page.keyboard.press("Enter"); await sleep(2200);
    R.kbEnter = { state: await page.evaluate(museumState), back: (await page.evaluate(controls)).some((c) => /back to the hall/i.test(c.l)) };
    await shot(page, `mus-${key}-12-kb-approach`);
    await page.keyboard.press("ArrowRight"); await sleep(1500);
    R.kbRight = { state: await page.evaluate(museumState) };
    await page.keyboard.press("Escape"); await sleep(1200);
    R.kbEsc = { state: await page.evaluate(museumState) };
    await page.keyboard.press("ArrowLeft"); await sleep(800);
    R.kbLeftRail = { state: await page.evaluate(museumState), chip: await page.evaluate(chipInfo) };
  }
  // scroll to the end of the hall and past into the grid
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight * 0.55 })); await sleep(1500);
  await shot(page, `mus-${key}-13-hall-end`);
  const skipBtn = page.getByRole("button", { name: /skip/i }).first();
  await page.evaluate(() => window.scrollTo({ top: 0 })); await sleep(800);
  if (await skipBtn.count()) { await skipBtn.click(); await sleep(1800); R.afterSkip = { scrollY: await page.evaluate(() => scrollY), docH: await page.evaluate(() => document.documentElement.scrollHeight) }; await shot(page, `mus-${key}-14-after-skip`); }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight - innerHeight * 2 })); await sleep(1000);
  await shot(page, `mus-${key}-15-grid`);
  R.grid = await page.evaluate(() => [...document.querySelectorAll("button, a")].filter((b) => b.querySelector("img")).map((b) => { const r = b.getBoundingClientRect(); const img = b.querySelector("img"); return { t: (b.getAttribute("aria-label") || b.textContent).trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), ar: Math.round((r.width / r.height) * 100) / 100, nat: img.naturalWidth + "x" + img.naturalHeight }; }));
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight })); await sleep(800);
  await shot(page, `mus-${key}-16-foot`);
  // menu on paintings
  const bb = page.locator('button[aria-label*="menu" i]').first();
  await page.evaluate(() => window.scrollTo({ top: 0 })); await sleep(600);
  await bb.click(); await sleep(800); await shot(page, `mus-${key}-17-menu`);
  await page.keyboard.press("Escape"); await sleep(500);
  R.log = log;
  await c.close();
}
await browser.close();
save(`museum-${which.join("_")}.json`, results);
console.log(JSON.stringify(results, null, 1));
