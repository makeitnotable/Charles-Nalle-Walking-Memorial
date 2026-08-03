import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = 'docs/v5/qa/juror-pass2-v6';
const log = [];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--autoplay-policy=no-user-gesture-required'] });

// AUDIO narration test
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => log.push('[pageerror] ' + e.message));
  await page.goto('http://localhost:4321/bakery', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // list candidate buttons
  const cands = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => ({ t: (b.textContent || '').trim().slice(0, 40), aria: b.getAttribute('aria-label'), cls: (b.className || '').toString().slice(0, 40) })));
  log.push('buttons: ' + JSON.stringify(cands.filter(c => c.t || c.aria)));
  // scroll to the audio player region
  const player = page.locator('button', { hasText: /listen/i }).first();
  try {
    await player.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/ix-audio--before.png` });
    await player.click();
    await page.waitForTimeout(3000);
    const st = await page.evaluate(() => Array.from(document.querySelectorAll('audio')).map(a => ({ src: (a.currentSrc || '').split('/').pop(), paused: a.paused, t: a.currentTime, readyState: a.readyState, err: a.error && a.error.code })));
    log.push('audio after 3s: ' + JSON.stringify(st));
    await page.screenshot({ path: `${OUT}/ix-audio--after3s.png` });
    await page.waitForTimeout(4000);
    const st2 = await page.evaluate(() => Array.from(document.querySelectorAll('audio')).map(a => ({ paused: a.paused, t: a.currentTime })));
    log.push('audio after 7s: ' + JSON.stringify(st2));
  } catch (e) { log.push('listen: ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// PHONE paintings: tap a work -> Bring it to life
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => log.push('[phone-paintings pageerror] ' + e.message));
  await page.goto('http://localhost:4321/paintings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // use approach button (dot) if exists
  const b = page.locator('button[aria-label^="Approach"]').first();
  try {
    await b.click({ timeout: 3000, force: true });
    log.push('phone: approached via dot');
  } catch (e) {
    // else scroll into hall and tap "View closely"
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(1000);
    const v = page.locator('button[aria-label^="View"]').first();
    try { await v.click({ timeout: 3000, force: true }); log.push('phone: view closely'); } catch (e2) { log.push('phone approach fail: ' + e2.message.split('\n')[0]); }
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/ix-paintings--phone--approached.png` });
  const life = page.locator('button', { hasText: /bring it to life/i }).first();
  try {
    await life.click({ timeout: 3000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${OUT}/ix-paintings--phone--life.png` });
    log.push('phone: bring it to life clicked');
  } catch (e) { log.push('phone life fail: ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// MAP: tap a stop marker properly (canvas marker), check card
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => log.push('[map pageerror] ' + e.message));
  await page.goto('http://localhost:4321/map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const stop = page.locator('button[aria-label^="Stop 1"]').first();
  try {
    await stop.click({ timeout: 3000, force: true });
    log.push('map: tapped Stop 1 marker');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/ix-map--phone--stop1-card.png` });
  } catch (e) { log.push('map stop tap fail: ' + e.message.split('\n')[0]); }
  // See Troy in 1860 toggle
  const troy = page.locator('button', { hasText: /see troy in 1860/i }).first();
  try {
    await troy.click({ timeout: 3000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/ix-map--phone--1860.png` });
    log.push('map: 1860 overlay toggled');
  } catch (e) { log.push('map 1860 fail: ' + e.message.split('\n')[0]); }
  await ctx.close();
}

fs.writeFileSync(`${OUT}/audio-log.txt`, log.join('\n'));
await browser.close();
console.log(log.join('\n'));
