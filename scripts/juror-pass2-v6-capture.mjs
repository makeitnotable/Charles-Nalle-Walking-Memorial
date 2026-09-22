// Juror pass 2 (v6) — evidence capture: all routes, 3 viewports, multiple scroll depths, console errors
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = 'docs/v5/qa/juror-pass2-v6';
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:4321';
const routes = ['/', '/bakery', '/commissioners-office', '/mansion', '/ferry', '/barbershop', '/map', '/people', '/paintings', '/about', '/404'];

const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

const consoleLog = {};

const browser = await chromium.launch({ args: ['--use-gl=angle'] });

async function shoot(page, route, vpName) {
  const slug = route === '/' ? 'home' : route.replace(/\//g, '');
  const errs = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', e => errs.push(`[pageerror] ${e.message}`));
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('[nav] ' + e.message));
  await page.waitForTimeout(2500);
  // top
  await page.screenshot({ path: `${OUT}/${slug}--${vpName}--00-top.png` });
  // scroll depths
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  const depths = [0.25, 0.5, 0.75, 1.0];
  for (const d of depths) {
    const y = Math.max(0, Math.round((total - vh) * d));
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${slug}--${vpName}--${String(Math.round(d * 100)).padStart(2, '0')}pct.png` });
  }
  consoleLog[`${slug}--${vpName}`] = { errors: errs, scrollHeight: total };
}

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.name === 'phone', hasTouch: vp.name === 'phone' });
  const page = await ctx.newPage();
  for (const r of routes) {
    await shoot(page, r, vp.name);
  }
  await ctx.close();
}

// landscape phone: one chapter + map
{
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  for (const r of ['/bakery', '/map']) {
    await shoot(page, r, 'landscape');
  }
  await ctx.close();
}

fs.writeFileSync(`${OUT}/console-log.json`, JSON.stringify(consoleLog, null, 2));
await browser.close();
console.log('DONE');
console.log(JSON.stringify(Object.fromEntries(Object.entries(consoleLog).map(([k, v]) => [k, { nErr: v.errors.length, h: v.scrollHeight }])), null, 1));
