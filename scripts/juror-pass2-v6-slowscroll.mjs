import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle'] });
async function slowTo(page, target) {
  await page.evaluate(async (target) => {
    const step = 300;
    for (let y = window.scrollY; y < target; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    window.scrollTo(0, target);
  }, target);
  await page.waitForTimeout(1500);
}
// commissioners phone ~50%
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/commissioners-office', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await slowTo(page, Math.round(total * 0.5));
  await page.screenshot({ path: 'docs/v5/qa/juror-pass2-v6/verify-commissioners--phone--50-slow.png' });
  await slowTo(page, Math.round(total * 0.56));
  await page.screenshot({ path: 'docs/v5/qa/juror-pass2-v6/verify-commissioners--phone--56-slow.png' });
  await ctx.close();
}
// ferry desktop ~50%
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/ferry', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await slowTo(page, Math.round(total * 0.5));
  await page.screenshot({ path: 'docs/v5/qa/juror-pass2-v6/verify-ferry--desktop--50-slow.png' });
  await slowTo(page, Math.round(total * 0.55));
  await page.screenshot({ path: 'docs/v5/qa/juror-pass2-v6/verify-ferry--desktop--55-slow.png' });
  await ctx.close();
}
await browser.close();
console.log('done');
