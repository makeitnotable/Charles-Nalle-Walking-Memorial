// Probe pasqua.it: click through the entry gate, capture immersion, inspect tech.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/qa/inspiration/pasqua';
mkdirSync(OUT, { recursive: true });

async function probe(width, height, tag) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width, height },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  await page.goto('https://pasqua.it/', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(4000);

  // Tech inspection BEFORE gate
  const pre = await page.evaluate(() => ({
    videos: [...document.querySelectorAll('video')].map(v => ({
      src: v.currentSrc || v.src,
      autoplay: v.autoplay, muted: v.muted, loop: v.loop,
      playing: !v.paused, w: v.videoWidth, h: v.videoHeight,
      poster: v.poster,
    })),
    canvases: [...document.querySelectorAll('canvas')].map(c => {
      let kind = 'unknown';
      try { if (c.getContext('webgl2') || c.getContext('webgl')) kind = 'webgl'; } catch (e) {}
      return { w: c.width, h: c.height, kind, cls: c.className };
    }),
    audios: [...document.querySelectorAll('audio')].map(a => ({ src: a.currentSrc || a.src, paused: a.paused })),
    gateText: document.body.innerText.slice(0, 500),
    buttons: [...document.querySelectorAll('button, [role=button], a')].slice(0, 20).map(b => b.innerText.trim()).filter(Boolean),
    libs: {
      three: !!window.THREE, gsap: !!window.gsap, pixi: !!window.PIXI,
      next: !!document.querySelector('#__next, [data-nextjs-router]'),
      nuxt: !!window.__NUXT__,
    },
    scriptSrcs: [...document.querySelectorAll('script[src]')].map(s => s.src).slice(0, 15),
    bodyOverflow: getComputedStyle(document.body).overflow,
  }));
  console.log(`=== PRE-GATE (${tag}) ===`);
  console.log(JSON.stringify(pre, null, 1));

  // Click the gate
  const gate = page.locator('text=/start the experience/i').first();
  if (await gate.count()) {
    await gate.click({ timeout: 5000 }).catch(e => console.log('gate click failed:', e.message));
    console.log('clicked gate');
  } else {
    console.log('NO GATE FOUND — capturing as-is');
  }
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/post-gate-0--${tag}.png` });

  // Post-gate tech
  const post = await page.evaluate(() => ({
    videos: [...document.querySelectorAll('video')].map(v => ({
      src: (v.currentSrc || v.src || '').slice(0, 120),
      muted: v.muted, playing: !v.paused, loop: v.loop,
      rect: (r => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }))(v.getBoundingClientRect()),
      objectFit: getComputedStyle(v).objectFit,
    })),
    audios: [...document.querySelectorAll('audio')].map(a => ({ src: (a.currentSrc || a.src || '').slice(0, 120), paused: a.paused, loop: a.loop })),
    canvases: document.querySelectorAll('canvas').length,
    fixedChrome: [...document.querySelectorAll('*')].filter(el => {
      const s = getComputedStyle(el);
      return (s.position === 'fixed' || s.position === 'sticky') && el.offsetHeight > 0 && el.offsetHeight < 200 && el.innerText.trim();
    }).slice(0, 12).map(el => ({ tag: el.tagName, cls: String(el.className).slice(0, 60), text: el.innerText.trim().slice(0, 80) })),
    scrollH: document.documentElement.scrollHeight,
    innerH: window.innerHeight,
    firstText: document.body.innerText.slice(0, 800),
  }));
  console.log(`=== POST-GATE (${tag}) ===`);
  console.log(JSON.stringify(post, null, 1));

  // Scroll captures — the site may hijack scroll; try wheel events
  for (let i = 1; i <= 5; i++) {
    await page.mouse.wheel(0, height * 0.9);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/post-gate-${i}--${tag}.png` });
  }
  const after = await page.evaluate(() => ({
    scrollY: window.scrollY,
    text: document.body.innerText.slice(0, 400),
  }));
  console.log(`=== AFTER SCROLL (${tag}) ===`, JSON.stringify(after));

  await browser.close();
}

await probe(1440, 900, '1440');
await probe(390, 844, '390');
console.log('done');
