import { launch, newPage, shot, goto, sleep, report, cdp, touchDrag, VIEWPORTS } from "./juror3-lib.mjs";

// A. Map: hint persistence, Walk again after stop 5, p360 overview, d1920 overview, landscape
{
  const browser = await launch();
  let page = await newPage(browser, "p390");
  await goto(page, "/map"); await sleep(3000);
  const hint = () => page.evaluate(() => { const el = [...document.querySelectorAll("*")].find((e) => e.children.length === 0 && /Drag to explore/i.test(e.textContent)); if (!el) return null; const r = el.getBoundingClientRect(); return { op: getComputedStyle(el).opacity, y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width) }; });
  console.log("hint @3s:", await hint());
  await sleep(6000); console.log("hint @9s:", await hint());
  await sleep(6000); console.log("hint @15s:", await hint());
  await shot(page, "map-p390-hint-15s");
  // pan the map a bit
  const s = await cdp(page);
  await touchDrag(s, { x: 200, y: 400 }, { x: 240, y: 460 }, 10); await sleep(1500);
  console.log("hint after a pan:", await hint());
  // Walk to the end: Take the walk and wait for stop 5 → button text
  await (await page.$('button:has-text("Take the walk")')).click();
  const btnText = () => page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /Stop the walk|Continue|Walk again/.test(b.textContent))?.textContent.trim());
  const active = () => page.evaluate(() => document.querySelector('[aria-label^="Enter Spot"]')?.getAttribute("aria-label")?.slice(0, 13));
  for (let i = 0; i < 40; i++) { await sleep(1000); const t = await btnText(); const a = await active(); if (t === "Walk again") { console.log(`after ${i + 1}s: btn=${t} active=${a}`); break; } if (i % 5 === 4) console.log(`t+${i + 1}s btn=${t} active=${a}`); }
  await shot(page, "map-p390-walk-end");
  const wa = await page.$('button:has-text("Walk again")');
  if (wa) { await wa.click(); await sleep(3000); console.log("after Walk again: btn", await btnText(), "active", await active()); await shot(page, "map-p390-walk-again"); }
  await page.close();
  for (const vp of ["p360", "d1920", "land", "t1024"]) {
    page = await newPage(browser, vp);
    await goto(page, "/map"); await sleep(4500);
    await shot(page, `map-${vp}-01-overview`);
    const m = await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((mk) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const el of mk.querySelectorAll("*")) { const r = el.getBoundingClientRect(); if (!r.width) continue; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); } return `${mk.textContent.trim().slice(0, 12)} @${Math.round(x0)},${Math.round(y0)} in=${x0 >= 0 && y0 >= 0 && x1 <= innerWidth && y1 <= innerHeight}`; }));
    console.log(vp, "markers:", m);
    if (vp === "land" || vp === "t1024") {
      await (await page.$('button:has-text("Take the walk")')).click(); await sleep(6500);
      await shot(page, `map-${vp}-05-walk`);
      const lens = await page.$('button:has-text("Back"), button[aria-label="Back to map"]'); if (lens) { await lens.click(); await sleep(2000); }
      const l = await page.$('button:has-text("See Troy in 1858"):visible'); if (l) { await l.click(); await sleep(2500); await shot(page, `map-${vp}-10-lens`); }
    }
    report(page, `map ${vp}`);
    await page.close();
  }
  await browser.close();
}

// B. Footers + chapters at other viewports (with the mini-player latched)
{
  const browser = await launch();
  for (const [vp, route] of [["t1024", "/ferry"], ["d1920", "/mansion"], ["t768", "/about"], ["d1920", "/about"], ["land", "/bakery"], ["p360", "/mansion"]]) {
    const page = await newPage(browser, vp);
    await goto(page, route); await sleep(1200);
    const tag = `${route.replace("/", "")}-${vp}`;
    await shot(page, `${tag}-arrival`);
    const play = await page.$('button[aria-label^="Play narration"]');
    if (play) { await play.scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -200)); await sleep(500); await play.click(); await sleep(1500); await page.evaluate(() => window.scrollBy(0, innerHeight)); await sleep(1000); await shot(page, `${tag}-mini`); }
    await page.evaluate(() => document.querySelector("#onward")?.scrollIntoView()); await sleep(1000);
    if (play) await shot(page, `${tag}-onward`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(1200);
    await shot(page, `${tag}-footer`);
    const foot = await page.evaluate(() => { const wm = [...document.querySelectorAll("footer *")].find((e) => e.children.length === 0 && /Charles Nalle Walking Memorial/.test(e.textContent)); const d = [...document.querySelectorAll("footer *")].find((e) => e.children.length === 0 && /Walking routes/.test(e.textContent)); const lines = (el) => { if (!el) return null; const r = document.createRange(); r.selectNodeContents(el); return [...new Set([...r.getClientRects()].map((x) => Math.round(x.top)))].length; }; const pill = [...document.querySelectorAll("*")].find((e) => getComputedStyle(e).position === "fixed" && /\d\d:\d\d/.test(e.textContent) && e.getBoundingClientRect().width < 300); return { wordmarkLines: lines(wm), disclaimerLines: lines(d), disclaimerLast: d?.textContent.trim().split(/\s+/).slice(-2).join(" "), pill: pill && { op: getComputedStyle(pill).opacity, y: Math.round(pill.getBoundingClientRect().y) }, audio: [...document.querySelectorAll("audio")].map((a) => a.paused) }; });
    console.log(tag, "footer:", JSON.stringify(foot));
    report(page, tag);
    await page.close();
  }
  await browser.close();
}

// C. Phone: why does the mini pill hide at the very bottom? sample opacity vs scroll position near the foot
{
  const browser = await launch();
  const page = await newPage(browser, "p390");
  await goto(page, "/mansion"); await sleep(1000);
  const play = await page.$('button[aria-label^="Play narration"]');
  await play.scrollIntoViewIfNeeded(); await play.click(); await sleep(1200);
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const rows = [];
  for (const off of [1400, 1000, 800, 600, 400, 300, 200, 120, 60, 0]) {
    await page.evaluate((y) => window.scrollTo(0, y), H - off); await sleep(700);
    rows.push(await page.evaluate((off) => { const pill = [...document.querySelectorAll("*")].find((e) => getComputedStyle(e).position === "fixed" && /\d\d:\d\d/.test(e.textContent) && e.getBoundingClientRect().width < 300); const onward = document.querySelector("#onward")?.getBoundingClientRect(); const footer = document.querySelector("footer")?.getBoundingClientRect(); return `bottom-${off}: pill op=${pill ? getComputedStyle(pill).opacity : "none"} w=${pill ? Math.round(pill.getBoundingClientRect().width) : "-"} · onward top=${Math.round(onward?.top)} · footer top=${Math.round(footer?.top)} · audio paused=${document.querySelector("audio").paused}`; }, off));
  }
  console.log(rows.join("\n"));
  await shot(page, "mansion-p390-foot-pill");
  await browser.close();
}

// D. Museum landscape phone + p360 quick + 1920 approach
{
  const browser = await launch();
  for (const vp of ["land", "p360", "d1920"]) {
    const page = await newPage(browser, vp);
    const V = VIEWPORTS[vp];
    await goto(page, "/paintings"); await sleep(2000);
    const st = await page.evaluate(() => document.querySelector("#museum-slot").getBoundingClientRect().top + scrollY);
    const sh = await page.evaluate(() => document.querySelector("#museum-slot").getBoundingClientRect().height);
    await page.evaluate((y) => window.scrollTo(0, y), st + (sh - V.height) * 0.12); await sleep(2000);
    await shot(page, `museum-${vp}-rail`);
    await (await page.$$('button[aria-label^="Approach"]'))[1].click(); await sleep(2500);
    await shot(page, `museum-${vp}-approach`);
    const r = await page.evaluate(() => { const m = window.__museum; const r = m.paintingRect(1); const cs = [...document.querySelectorAll("button,a")].filter((b) => b.getBoundingClientRect().width > 0 && !b.closest("section,footer")).map((b) => `${(b.getAttribute("aria-label") || b.textContent).trim().slice(0, 24)}@${Math.round(b.getBoundingClientRect().x)},${Math.round(b.getBoundingClientRect().y)}`); const quote = [...document.querySelectorAll("#museum-slot *")].find((e) => e.children.length === 0 && /^“/.test(e.textContent.trim())); return { rect: r && { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top) }, cx: r && (((r.left + r.right) / 2) / innerWidth * 100).toFixed(1), quoteVisible: quote ? getComputedStyle(quote).display !== "none" && quote.getBoundingClientRect().width > 0 : null, cs }; });
    console.log(vp, "approach:", JSON.stringify(r));
    await (await page.$$('button[aria-label^="Approach"]'))[9].click(); await sleep(2500);
    await shot(page, `museum-${vp}-last`);
    report(page, `museum ${vp}`);
    await page.close();
  }
  await browser.close();
}
