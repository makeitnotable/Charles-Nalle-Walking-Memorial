// Real wheel scrolling at natural pace on two chapters, mid-scroll frames. Plus landscape 844x390.
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = 'docs/v5/qa/juror-pass3-v6';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle'] });

async function wheelWalk(ctx, route, tag, shots) {
  const slug = route.replace(/\//g, '');
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(`http://localhost:4321${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.mouse.move(200, 400);
  let shot = 0;
  // natural pace: ~120px ticks, 16 ticks then pause, like a human flick-read
  for (let burst = 0; burst < 40 && shot < shots; burst++) {
    for (let t = 0; t < 14; t++) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(45);
    }
    // mid-scroll frame: shoot immediately, momentum-ish
    await page.mouse.wheel(0, 120);
    await page.screenshot({ path: `${OUT}/${tag}-${slug}-wheel${String(shot).padStart(2, '0')}-mid.png` });
    await page.waitForTimeout(900); // settle, reader pause
    await page.screenshot({ path: `${OUT}/${tag}-${slug}-wheel${String(shot).padStart(2, '0')}-settled.png` });
    shot++;
    const atEnd = await page.evaluate(() => window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4);
    if (atEnd) break;
  }
  console.log(`${tag} ${route} wheelshots=${shot} pageerrors=${errs.length}`, errs.slice(0, 3));
  await page.close();
}

// 390 wheel walk on two chapters
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await wheelWalk(m, '/bakery', 'wheel390', 10);
await wheelWalk(m, '/ferry', 'wheel390', 10);
await m.close();

// 1440 wheel walk on same two
const d = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
await wheelWalk(d, '/bakery', 'wheel1440', 10);
await wheelWalk(d, '/ferry', 'wheel1440', 10);
await d.close();

// landscape phone 844x390 on one chapter + /map
const l = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
for (const route of ['/bakery', '/map']) {
  const slug = route.replace(/\//g, '');
  const page = await l.newPage();
  await page.goto(`http://localhost:4321${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (const dd of [0, 0.3, 0.6, 0.9]) {
    await page.evaluate(y => window.scrollTo(0, y), Math.round((H - 390) * dd));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/land844-${slug}-d${Math.round(dd * 100)}.png` });
  }
  await page.close();
}
await l.close();
await browser.close();
console.log('DONE');
