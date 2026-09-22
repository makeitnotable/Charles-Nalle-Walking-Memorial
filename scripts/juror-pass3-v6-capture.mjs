// Juror pass 3 — fresh adversarial capture. Static depths + console per route.
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = 'docs/v5/qa/juror-pass3-v6';
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = ['/', '/bakery', '/commissioners-office', '/mansion', '/ferry', '/barbershop', '/map', '/people', '/paintings', '/about', '/404'];
const BPS = [
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '1440', width: 1440, height: 900, mobile: false },
];

const consoleLog = {};

const browser = await chromium.launch({ args: ['--use-gl=angle'] });

for (const bp of BPS) {
  const ctx = await browser.newContext({
    viewport: { width: bp.width, height: bp.height },
    isMobile: bp.mobile,
    hasTouch: bp.mobile,
    deviceScaleFactor: 2,
    userAgent: bp.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });

  for (const route of ROUTES) {
    const slug = route === '/' ? 'home' : route.replace(/\//g, '');
    const key = `${bp.name}:${route}`;
    consoleLog[key] = [];
    const page = await ctx.newPage();
    page.on('console', m => {
      if (['error', 'warning'].includes(m.type())) consoleLog[key].push(`[${m.type()}] ${m.text()}`);
    });
    page.on('pageerror', e => consoleLog[key].push(`[pageerror] ${e.message}`));
    try {
      await page.goto(`http://localhost:4321${route}`, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      consoleLog[key].push(`[nav] ${e.message}`);
    }
    await page.waitForTimeout(2500);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = bp.height;
    const depths = H <= vh * 1.2 ? [0] : [0, 0.18, 0.38, 0.58, 0.78, 1.0];
    for (const d of depths) {
      const y = Math.round((H - vh) * d);
      await page.evaluate(yy => window.scrollTo(0, yy), y);
      await page.waitForTimeout(1400);
      await page.screenshot({ path: `${OUT}/${bp.name}-${slug}-d${Math.round(d * 100)}.png` });
    }
    console.log(`${key} H=${H} shots=${depths.length}`);
    await page.close();
  }
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/console.json`, JSON.stringify(consoleLog, null, 2));
console.log('DONE');
