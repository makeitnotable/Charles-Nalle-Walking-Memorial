// Probe 2: audio behavior, keyboard access to gate, media network requests.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const media = new Set();
page.on('request', r => {
  const u = r.url();
  if (/\.(mp3|ogg|wav|m4a|mp4|webm|ktx2?|basis|glb|gltf|draco|bin|hdr|exr)(\?|$)/i.test(u)) media.add(u);
});

// Wrap AudioContext to detect creation
await page.addInitScript(() => {
  window.__audioCtxs = [];
  const OrigAC = window.AudioContext || window.webkitAudioContext;
  if (OrigAC) {
    const Wrapped = new Proxy(OrigAC, {
      construct(t, args) { const c = new t(...args); window.__audioCtxs.push(c); return c; },
    });
    window.AudioContext = Wrapped;
    if (window.webkitAudioContext) window.webkitAudioContext = Wrapped;
  }
});

await page.goto('https://pasqua.it/', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(5000);

// Keyboard test: tab a bunch, report focused element each time
const tabbed = [];
for (let i = 0; i < 12; i++) {
  await page.keyboard.press('Tab');
  const f = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName}.${String(el.className).slice(0, 40)} "${(el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40)}"` : 'none';
  });
  tabbed.push(f);
}
console.log('TAB ORDER (pre-gate):', JSON.stringify(tabbed, null, 1));

const preAudio = await page.evaluate(() => ({
  ctxs: (window.__audioCtxs || []).map(c => c.state),
  htmlAudio: document.querySelectorAll('audio').length,
}));
console.log('PRE-GATE audio:', JSON.stringify(preAudio));

// Try keyboard-activating gate (Enter on focused CTA if reachable), else click
const gateBtn = page.locator('text=/start the experience/i').first();
await gateBtn.click({ timeout: 8000, force: true }).catch(e => console.log('click err', e.message));
await page.waitForTimeout(7000);

const postAudio = await page.evaluate(() => ({
  ctxs: (window.__audioCtxs || []).map(c => c.state),
  htmlAudio: [...document.querySelectorAll('audio')].map(a => ({ src: (a.currentSrc || '').split('/').pop(), paused: a.paused, loop: a.loop, vol: a.volume })),
  videos: [...document.querySelectorAll('video')].map(v => ({ src: (v.currentSrc || '').split('/').pop(), paused: v.paused, muted: v.muted })),
  soundToggle: [...document.querySelectorAll('button,[role=button],a,div[class*=sound],div[class*=audio]')].map(el => String(el.className)).filter(c => /sound|audio|mute/i.test(c)).slice(0, 8),
}));
console.log('POST-GATE audio:', JSON.stringify(postAudio, null, 1));

console.log('MEDIA REQUESTS:', JSON.stringify([...media].map(u => u.replace('https://pasqua.it', '')).slice(0, 40), null, 1));

// reduced-motion check
const rm = await ctx.newPage();
await rm.emulateMedia({ reducedMotion: 'reduce' });
await rm.goto('https://pasqua.it/', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
await rm.waitForTimeout(5000);
const rmState = await rm.evaluate(() => ({
  canvas: document.querySelectorAll('canvas').length,
  text: document.body.innerText.slice(0, 200),
}));
console.log('REDUCED MOTION:', JSON.stringify(rmState));

await browser.close();
