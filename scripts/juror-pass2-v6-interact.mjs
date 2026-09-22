// Juror pass 2 (v6) — interaction evidence
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = 'docs/v5/qa/juror-pass2-v6';
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:4321';
const log = [];
const browser = await chromium.launch({ args: ['--use-gl=angle'] });

function watch(page, tag) {
  page.on('console', m => { if (m.type() === 'error') log.push(`${tag} [console.error] ${m.text()}`); });
  page.on('pageerror', e => log.push(`${tag} [pageerror] ${e.message}`));
}

// ---------- PAINTINGS: 3D hall, approach painting via dot, Bring it to life ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  watch(page, 'paintings-desktop');
  await page.goto(BASE + '/paintings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/ix-paintings--desktop--arrive.png` });
  // scroll into the hall gradually
  for (let i = 1; i <= 5; i++) {
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/ix-paintings--desktop--scroll${i}.png` });
  }
  // Look for dots / interactive elements
  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button, a, [role=button]')).map(b => ({ t: (b.textContent || '').trim().slice(0, 60), aria: b.getAttribute('aria-label'), vis: !!(b.offsetWidth || b.offsetHeight || b.getClientRects().length) })));
  log.push('paintings buttons: ' + JSON.stringify(btns));
  // Try to click a dot (aria-label likely). Search for elements with aria-label containing painting titles or "dot"
  const dot = page.locator('button[aria-label]').first();
  const dots = await page.locator('button').all();
  // Click any button whose aria-label mentions a painting / go to
  let clicked = false;
  for (const d of dots) {
    const al = (await d.getAttribute('aria-label')) || '';
    const txt = ((await d.textContent()) || '').trim();
    if (/paint|go to|view|approach|dot|stop/i.test(al + ' ' + txt)) {
      try { await d.click({ timeout: 2000 }); clicked = true; log.push('clicked dot: ' + (al || txt)); break; } catch (e) { }
    }
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/ix-paintings--desktop--after-dot.png` });
  // find "Bring it to life"
  const life = page.getByText(/bring it to life/i).first();
  try {
    await life.click({ timeout: 4000 });
    log.push('clicked Bring it to life');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/ix-paintings--desktop--life-1.png` });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${OUT}/ix-paintings--desktop--life-2.png` });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUT}/ix-paintings--desktop--life-3.png` });
  } catch (e) { log.push('Bring it to life not clickable: ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// ---------- PAINTINGS on phone ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  watch(page, 'paintings-phone');
  await page.goto(BASE + '/paintings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/ix-paintings--phone--arrive.png` });
  for (let i = 1; i <= 4; i++) {
    await page.evaluate(() => window.scrollBy({ top: 1400, behavior: 'instant' }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/ix-paintings--phone--scroll${i}.png` });
  }
  const life = page.getByText(/bring it to life/i).first();
  try {
    await life.scrollIntoViewIfNeeded({ timeout: 3000 });
    await page.waitForTimeout(800);
    await life.click({ timeout: 3000 });
    log.push('phone: clicked Bring it to life');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${OUT}/ix-paintings--phone--life.png` });
  } catch (e) { log.push('phone Bring it to life: ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// ---------- MAP: tap a stop, Take the walk ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  watch(page, 'map-phone');
  await page.goto(BASE + '/map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/ix-map--phone--arrive.png` });
  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button, a')).map(b => ({ t: (b.textContent || '').trim().slice(0, 60), aria: b.getAttribute('aria-label') })));
  log.push('map elements: ' + JSON.stringify(btns));
  // tap a stop
  const stops = await page.locator('button').all();
  for (const s of stops) {
    const al = ((await s.getAttribute('aria-label')) || '') + ' ' + (((await s.textContent()) || '').trim());
    if (/bakery|office|mansion|ferry|barbershop|stop/i.test(al)) {
      try { await s.click({ timeout: 2000 }); log.push('map: tapped stop ' + al.trim().slice(0, 50)); break; } catch (e) { }
    }
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/ix-map--phone--stop-tapped.png` });
  // Take the walk
  const walk = page.getByText(/take the walk/i).first();
  try {
    await walk.scrollIntoViewIfNeeded({ timeout: 3000 });
    await page.screenshot({ path: `${OUT}/ix-map--phone--walk-btn.png` });
    await walk.click({ timeout: 3000 });
    log.push('map: clicked Take the walk -> ' + page.url());
    await page.waitForTimeout(2500);
    log.push('map: after walk url ' + page.url());
    await page.screenshot({ path: `${OUT}/ix-map--phone--walk-after.png` });
  } catch (e) { log.push('Take the walk: ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// ---------- CHAPTER: narration + end-to-end + Continue ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  watch(page, 'chapter-phone');
  await page.goto(BASE + '/bakery', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/ix-bakery--phone--arrive.png` });
  // find play/listen control
  const play = page.locator('button').filter({ hasText: /listen|play|hear/i }).first();
  const playAria = page.locator('button[aria-label*="isten" i], button[aria-label*="lay" i]').first();
  let played = false;
  for (const cand of [play, playAria]) {
    try { await cand.click({ timeout: 2500 }); played = true; break; } catch (e) { }
  }
  log.push('chapter: narration play clicked = ' + played);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/ix-bakery--phone--playing.png` });
  const audioState = await page.evaluate(() => Array.from(document.querySelectorAll('audio')).map(a => ({ src: (a.currentSrc || '').split('/').pop(), paused: a.paused, t: a.currentTime, dur: a.duration })));
  log.push('chapter audio: ' + JSON.stringify(audioState));
  // scroll end to end in steps
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 700) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(180);
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/ix-bakery--phone--end.png` });
  // Continue path
  const cont = page.locator('a, button').filter({ hasText: /continue|next|chapter/i }).last();
  try {
    const t = ((await cont.textContent()) || '').trim();
    await cont.click({ timeout: 3000 });
    await page.waitForTimeout(2500);
    log.push(`chapter: continue "${t.slice(0, 60)}" -> ${page.url()}`);
    await page.screenshot({ path: `${OUT}/ix-bakery--phone--continue-dest.png` });
  } catch (e) { log.push('continue: ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// ---------- COLD QR ARRIVAL: fresh phone context straight to a mid-story chapter ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  watch(page, 'qr-arrival');
  const t0 = Date.now();
  await page.goto(BASE + '/ferry', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: `${OUT}/ix-qr--ferry--0ms.png` });
  log.push('qr: domcontentloaded at ' + (Date.now() - t0) + 'ms');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/ix-qr--ferry--1s.png` });
  await ctx.close();
}

fs.writeFileSync(`${OUT}/interact-log.txt`, log.join('\n'));
await browser.close();
console.log(log.join('\n'));
