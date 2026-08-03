import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
page.on('pageerror', e => console.log('[pageerror]', e.message));
page.on('console', m => { if (m.type()==='error') console.log('[console]', m.text()); });
await page.goto('http://localhost:4321/bakery', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const b = page.locator('button[aria-label^="Play narration"]').first();
await b.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: 'docs/v5/qa/juror-pass2-v6/ix-audio--before.png' });
await b.click();
for (const wait of [1000, 2000, 4000]) {
  await page.waitForTimeout(wait);
  const st = await page.evaluate(() => Array.from(document.querySelectorAll('audio')).map(a => ({ src: (a.currentSrc||'').split('/').pop(), paused: a.paused, t: +a.currentTime.toFixed(2), ready: a.readyState, err: a.error && a.error.code })));
  console.log('audio:', JSON.stringify(st));
}
await page.screenshot({ path: 'docs/v5/qa/juror-pass2-v6/ix-audio--playing.png' });
// aria-label now?
console.log('btn aria now:', await b.getAttribute('aria-label'));
await ctx.close(); await browser.close();
