import { launch, newPage, shot, goto, sleep, report, BASE, VIEWPORTS } from "./juror3-lib.mjs";
import fs from "node:fs";
import path from "node:path";

// 1. favicon set
console.log("== favicon set");
for (const f of ["favicon.svg", "favicon.ico", "favicon-32.png", "favicon-16.png", "apple-touch-icon.png", "site.webmanifest", "icon-192.png", "icon-512.png", "og.png"]) {
  const r = await fetch(`${BASE}/${f}`);
  const buf = Buffer.from(await r.arrayBuffer());
  let extra = "";
  if (f.endsWith(".ico")) extra = `ico header: reserved=${buf.readUInt16LE(0)} type=${buf.readUInt16LE(2)} count=${buf.readUInt16LE(4)} sizes=${[...Array(buf.readUInt16LE(4))].map((_, i) => `${buf[6 + i * 16] || 256}x${buf[7 + i * 16] || 256}`).join(",")}`;
  if (f.endsWith(".png")) extra = `png ${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
  if (f.endsWith(".webmanifest")) extra = buf.toString().slice(0, 400).replace(/\s+/g, " ");
  if (f.endsWith(".svg")) extra = `svg has <path>: ${/<path/.test(buf.toString())} has <text>: ${/<text/.test(buf.toString())} len ${buf.length}`;
  console.log(`  ${f}: ${r.status} ${r.headers.get("content-type")} ${buf.length}B ${extra}`);
  if (f === "favicon.svg") fs.writeFileSync(path.resolve("docs/v7/qa/juror-pass3/favicon.svg"), buf);
}
// trailing slash / 404
for (const u of ["/bakery/", "/nope", "/map/"]) { const r = await fetch(BASE + u, { redirect: "manual" }); console.log(`  ${u}: ${r.status}`); }

const routes = ["/", "/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop", "/map", "/people", "/paintings", "/about", "/404", "/nope"];

// 2. Console errors + menu open/close + scroll-hide on every page at 390 and 1440
for (const vp of ["p390", "d1440"]) {
  const browser = await launch();
  for (const route of routes) {
    const page = await newPage(browser, vp);
    await goto(page, route);
    await sleep(1500);
    const errsAfterLoad = page.__errors.length;
    // menu
    const open = await page.$('button[aria-label="Open menu"]');
    let menuNote = "no burger";
    if (open) {
      await open.click(); await sleep(800);
      const st = await page.evaluate(() => { const c = document.querySelector('button[aria-label="Close menu"]'); const r = c?.getBoundingClientRect(); const links = [...document.querySelectorAll("nav a, [role=dialog] a")].filter((a) => a.getBoundingClientRect().width > 0).length; return { close: r && { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }, links, focus: document.activeElement?.tagName + " " + (document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 20)) }; });
      if (route === "/mansion" || route === "/about") await shot(page, `menu-${route.replace("/", "") || "home"}-${vp}`);
      // close: watch the X rotate
      const closeBtn = await page.$('button[aria-label="Close menu"]');
      const t0 = await page.evaluate(() => { const c = document.querySelector('button[aria-label="Close menu"]'); const i = c.querySelector("svg, span, i") || c; return getComputedStyle(i).transform; });
      await closeBtn.hover();
      await closeBtn.click();
      const tMid = await page.evaluate(() => { const c = document.querySelector('button[aria-label="Close menu"]'); const i = c.querySelector("svg, span, i") || c; return getComputedStyle(i).transform + " op=" + getComputedStyle(c).opacity; });
      await sleep(900);
      const closed = await page.evaluate(() => { const c = document.querySelector('button[aria-label="Close menu"]'); const r = c.getBoundingClientRect(); return { w: Math.round(r.width), vis: getComputedStyle(c).visibility, focus: document.activeElement?.getAttribute("aria-label") }; });
      menuNote = `open: close@${JSON.stringify(st.close)} links=${st.links} focus=${st.focus} · X transform before=${t0} onclick=${tMid} · closed: ${JSON.stringify(closed)}`;
    }
    // scroll-hide (only where the page scrolls)
    let hideNote = "";
    const sh = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    if (open && sh > 600) {
      // scroll down in steps like a wheel
      for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 60); await sleep(50); }
      await sleep(600);
      const hidden = await page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const w = b.closest(".cnwm-menu") || b.parentElement; return getComputedStyle(w).opacity; });
      for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -30); await sleep(50); }
      await sleep(600);
      const shown = await page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const w = b.closest(".cnwm-menu") || b.parentElement; return getComputedStyle(w).opacity; });
      hideNote = `scroll-hide: after 720px down op=${hidden}, after 90px up op=${shown}`;
    }
    const total = page.__errors.length;
    console.log(`${vp} ${route}: title="${await page.title()}" errors(load)=${errsAfterLoad} errors(total)=${total} · ${menuNote} · ${hideNote}`);
    if (total) console.log("    ", page.__errors.slice(0, 5).join("\n     "));
    await page.close();
  }
  await browser.close();
}
