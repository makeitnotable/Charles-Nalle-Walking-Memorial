// Interactions: paintings hall (walk, approach, bring to life), map (stop tap, take the walk),
// chapter narration (play, highlight sync, Continue).
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = 'docs/v5/qa/juror-pass3-v6';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--autoplay-policy=no-user-gesture-required'] });
const log = [];

// ---------- 1. PAINTINGS HALL (1440 + 390) ----------
for (const bp of [{ n: '1440', w: 1440, h: 900, mob: false }, { n: '390', w: 390, h: 844, mob: true }]) {
  const ctx = await browser.newContext({ viewport: { width: bp.w, height: bp.h }, isMobile: bp.mob, hasTouch: bp.mob, deviceScaleFactor: bp.mob ? 2 : 1.5 });
  const page = await ctx.newPage();
  page.on('pageerror', e => log.push(`paintings${bp.n} pageerror: ${e.message}`));
  await page.goto('http://localhost:4321/paintings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // scroll-walk into the hall with wheel
  await page.mouse.move(bp.w / 2, bp.h / 2);
  for (let i = 0; i < 3; i++) {
    for (let t = 0; t < 12; t++) { await page.mouse.wheel(0, 130); await page.waitForTimeout(50); }
    await page.screenshot({ path: `${OUT}/int-${bp.n}-paintings-walk${i}.png` });
    await page.waitForTimeout(700);
  }
  // approach via keyboard-path work list button (the "dot")
  const approach = page.locator('button[aria-label^="Approach"]').first();
  const nApproach = await page.locator('button[aria-label^="Approach"]').count();
  log.push(`paintings${bp.n}: approach buttons = ${nApproach}`);
  if (nApproach) {
    await approach.scrollIntoViewIfNeeded().catch(() => {});
    await approach.click({ force: true }).catch(e => log.push(`paintings${bp.n} approach click fail: ${e.message}`));
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/int-${bp.n}-paintings-approached.png` });
    const life = page.getByRole('button', { name: /Bring it to life/i }).first();
    if (await life.count()) {
      await life.click().catch(e => log.push(`paintings${bp.n} life click fail: ${e.message}`));
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${OUT}/int-${bp.n}-paintings-alive1.png` });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `${OUT}/int-${bp.n}-paintings-alive2.png` });
      log.push(`paintings${bp.n}: bring-it-to-life clicked OK`);
    } else log.push(`paintings${bp.n}: NO bring-it-to-life button visible after approach`);
  }
  await page.close(); await ctx.close();
}

// ---------- 2. MAP: tap a stop, Take the walk (390 touch) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', e => log.push(`map pageerror: ${e.message}`));
  await page.goto('http://localhost:4321/map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${OUT}/int-390-map-initial.png` });
  // tap a stop marker
  const marker = page.locator('div[aria-label]').filter({ hasText: /2|3/ }).first();
  const stopBtns = await page.locator('.mapboxgl-marker').count();
  log.push(`map: mapbox markers = ${stopBtns}`);
  if (stopBtns) {
    const m2 = page.locator('.mapboxgl-marker').nth(1);
    await m2.tap({ force: true }).catch(async e => { log.push(`map marker tap fail: ${e.message}`); await m2.click({ force: true }).catch(() => {}); });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/int-390-map-stop-tapped.png` });
  }
  // Take the walk
  const walk = page.getByRole('button', { name: /Take the walk/i }).first();
  if (await walk.count()) {
    await walk.scrollIntoViewIfNeeded().catch(() => {});
    await walk.click().catch(e => log.push(`walk click fail: ${e.message}`));
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(2200);
      await page.screenshot({ path: `${OUT}/int-390-map-walk${i}.png` });
    }
    log.push('map: Take the walk clicked OK');
  } else log.push('map: NO Take the walk button found');
  await page.close(); await ctx.close();
}

// ---------- 3. CHAPTER NARRATION (/commissioners-office 390) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', e => log.push(`chapter pageerror: ${e.message}`));
  await page.goto('http://localhost:4321/commissioners-office', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const play = page.locator('button[aria-label^="Play narration"]').first();
  const nPlay = await page.locator('button[aria-label^="Play narration"]').count();
  log.push(`chapter: play buttons = ${nPlay}`);
  if (nPlay) {
    await play.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/int-390-chapter-preplay.png` });
    await play.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${OUT}/int-390-chapter-playing4s.png` });
    // check paragraph highlight state
    const hl = await page.evaluate(() => {
      const cands = [...document.querySelectorAll('[aria-current], .is-active, [data-active="true"], mark')];
      const audio = document.querySelector('audio');
      return {
        audioTime: audio ? audio.currentTime : null,
        paused: audio ? audio.paused : null,
        activeEls: cands.slice(0, 4).map(e => ({ tag: e.tagName, cls: e.className && String(e.className).slice(0, 80), txt: (e.textContent || '').trim().slice(0, 60) })),
      };
    });
    log.push('chapter narration state @4s: ' + JSON.stringify(hl));
    await page.waitForTimeout(9000);
    await page.screenshot({ path: `${OUT}/int-390-chapter-playing13s.png` });
    const hl2 = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      const cands = [...document.querySelectorAll('[aria-current], .is-active, [data-active="true"]')];
      return { audioTime: audio ? audio.currentTime : null, active: cands.slice(0, 3).map(e => (e.textContent || '').trim().slice(0, 60)) };
    });
    log.push('chapter narration state @13s: ' + JSON.stringify(hl2));
  }
  // Continue link at the bottom
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/int-390-chapter-footerContinue.png` });
  const cont = page.locator('a').filter({ hasText: /Continue|Next/i }).last();
  if (await cont.count()) {
    const href = await cont.getAttribute('href');
    log.push(`chapter continue href = ${href}`);
    await cont.click().catch(e => log.push(`continue click fail: ${e.message}`));
    await page.waitForTimeout(2500);
    log.push(`after continue url = ${page.url()}`);
    await page.screenshot({ path: `${OUT}/int-390-chapter-afterContinue.png` });
  } else log.push('chapter: no Continue link found');
  await page.close(); await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/interact-log.json`, JSON.stringify(log, null, 2));
console.log(log.join('\n'));
