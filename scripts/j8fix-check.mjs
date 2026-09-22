import { chromium } from "playwright";
const B = "http://localhost:4321";
const out = {};
const activeCount = () => [...document.querySelectorAll(".mapboxgl-marker")].filter(m => /#F26835/i.test(m.innerHTML) && /background:\s*#F26835|background-color:\s*#F26835|fill="#F26835"/i.test(m.innerHTML)).length;
// A) walk-state race at 390 (touch)
{
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(B + "/map", { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__troyMap?.map, null, { timeout: 30000 });
  await p.waitForTimeout(8000);
  const cdp = await ctx.newCDPSession(p);
  await p.getByRole("button", { name: /take the walk/i }).click();
  await p.waitForTimeout(5700);
  // drag one card left
  const y = 844 - 130;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 300, y }] });
  for (let i = 1; i <= 10; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 300 - i * 16, y }] }); await p.waitForTimeout(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await p.waitForTimeout(900);
  const btn = await p.evaluate(() => [...document.querySelectorAll("button")].map(b => b.innerText.trim()).find(t => /continue/i.test(t)));
  await p.getByRole("button", { name: /continue/i }).click();
  await p.waitForTimeout(3500);
  await p.getByRole("button", { name: /^back/i }).first().click();
  await p.waitForTimeout(1500);
  const st = await p.evaluate(() => ({ walk: window.__troyMap.state.walk, focused: window.__troyMap.state.focused, activeMarkers: [...document.querySelectorAll(".mapboxgl-marker")].filter(m => m.innerHTML.includes("#F26835") && /background(-color)?:\s*#F26835/i.test(m.innerHTML)).length, url: location.search }));
  await p.screenshot({ path: "docs/v7/qa/j8fix/map-390-after-back.png" });
  out.race = { continueBtn: btn, ...st };
  await b.close();
}
// B) plaque titles at 1024×768 + focus ring after pointer approach
{
  const b = await chromium.launch({ args: ["--use-gl=angle","--autoplay-policy=no-user-gesture-required"] });
  const p = await b.newPage({ viewport: { width: 1024, height: 768 } });
  await p.goto(B + "/paintings", { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__museum, null, { timeout: 30000 });
  await p.waitForTimeout(1200);
  const titles = {};
  for (const i of [6, 7, 9, 3]) {
    await p.evaluate((i) => window.__museum.approach(i), i);
    await p.waitForTimeout(1600);
    titles[i] = await p.evaluate(() => {
      const el = [...document.querySelectorAll("p.t-title-sm")].find(e => e.getBoundingClientRect().width > 0);
      // lines via range rects per text node
      const lines = new Map();
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n; while ((n = walker.nextNode())) { const r = document.createRange(); r.selectNodeContents(n); for (const rect of r.getClientRects()) { const k = Math.round(rect.top); lines.set(k, (lines.get(k) || 0) + rect.width); } }
      // last line text: use caretRange approach: get words and their line tops
      const words = []; const w2 = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let t;
      while ((t = w2.nextNode())) { const txt = t.textContent; let idx = 0; for (const m of txt.matchAll(/\S+/g)) { const r = document.createRange(); r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length); const rc = r.getClientRects()[0]; if (rc) words.push({ w: m[0], top: Math.round(rc.top) }); } }
      const tops = [...new Set(words.map(w => w.top))].sort((a,b)=>a-b);
      const byLine = tops.map(tp => words.filter(w => w.top === tp).map(w => w.w).join(" "));
      return { text: el.innerText, lines: byLine, cardW: Math.round(el.closest("div").getBoundingClientRect().width) };
    });
  }
  await p.screenshot({ path: "docs/v7/qa/j8fix/museum-1024-plaque.png" });
  await p.evaluate(() => window.__museum.approach(null));
  await p.waitForTimeout(800);
  // pointer approach: click the painting under the pointer (use paintingRect of work 0 after scrolling top)
  await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await p.waitForTimeout(600);
  const pr = await p.evaluate(() => window.__museum.paintingRect(0));
  await p.mouse.click(pr.left + (pr.right - pr.left) / 2, pr.top + (pr.bottom - pr.top) / 2);
  await p.waitForTimeout(2200);
  const focus = await p.evaluate(() => { const a = document.activeElement; const back = [...document.querySelectorAll("button")].find(b => /back to the hall/i.test(b.innerText)); return { active: a?.tagName + "." + (a?.className || "").slice(0, 30), backFocused: a === back, backFocusVisible: back?.matches(":focus-visible") ?? null, approached: window.__museum.state.approached }; });
  await p.screenshot({ path: "docs/v7/qa/j8fix/museum-1024-pointer-approach.png" });
  // keyboard approach: Esc, then Tab to a dot and Enter
  await p.keyboard.press("Escape"); await p.waitForTimeout(700);
  const kb = await p.evaluate(async () => { const dot = document.querySelector("button[aria-label^='Approach']"); dot.focus(); return !!dot; });
  await p.keyboard.press("Enter"); await p.waitForTimeout(2200);
  const focusKb = await p.evaluate(() => { const a = document.activeElement; const back = [...document.querySelectorAll("button")].find(b => /back to the hall/i.test(b.innerText)); return { backFocused: a === back, fv: back?.matches(":focus-visible") ?? null }; });
  out.plaque = titles; out.focusPointer = focus; out.focusKeyboard = { dotFound: kb, ...focusKb };
  await b.close();
}
// C) people roles at 768; player title at 390 bakery; 1858 pill at 720×450; lens caption at 390
{
  const b = await chromium.launch();
  let p = await b.newPage({ viewport: { width: 768, height: 1024 } });
  await p.goto(B + "/people", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  out.people768 = await p.evaluate(() => [...document.querySelectorAll("p.t-meta.whitespace-nowrap")].map(e => ({ t: e.textContent, over: e.scrollWidth - e.clientWidth })).filter(x => x.over > 0));
  await p.close();
  p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await p.goto(B + "/bakery", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector("#scene-0 button[aria-label*='Play']").scrollIntoView({ block: "center", behavior: "instant" })); await p.waitForTimeout(1200);
  out.playerTitle390 = await p.evaluate(() => { const e = document.querySelector("#scene-0 p.t-meta-body"); const r = e.getBoundingClientRect(); return { text: e.innerText, h: Math.round(r.height), over: e.scrollWidth - e.clientWidth, lh: getComputedStyle(e).lineHeight }; });
  await p.screenshot({ path: "docs/v7/qa/j8fix/bakery-390-player.png" });
  await p.goto(B + "/map", { waitUntil: "networkidle" }); await p.waitForFunction(() => window.__troyMap?.map, null, { timeout: 30000 }); await p.waitForTimeout(6000);
  await p.getByRole("button", { name: /see troy in 1858/i }).click(); await p.waitForTimeout(1500);
  out.lensCaption390 = await p.evaluate(() => { const e = document.querySelector("figcaption"); return { text: e.innerText, lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)) }; });
  await p.screenshot({ path: "docs/v7/qa/j8fix/lens-390.png" });
  await p.close();
  p = await b.newPage({ viewport: { width: 720, height: 450 } });
  await p.goto(B + "/map", { waitUntil: "networkidle" }); await p.waitForTimeout(7000);
  out.pill720 = await p.evaluate(() => { const e = [...document.querySelectorAll("button")].find(b => /see troy in 1858/i.test(b.innerText) && b.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width) }; });
  await b.close();
}
console.log(JSON.stringify(out, null, 1));
