// End-to-end checks, run in a real browser against the real WebAssembly build.
//   1. Every catalogue entry's example encodes to every output format.
//   2. The generated files have the correct signatures.
//   3. The UI loads without console errors and produces a barcode.
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { startServer } from '../scripts/dev-server.mjs';

const CANDIDATES = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) throw new Error('No Chrome/Edge found. Set BROWSER_PATH.');

const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(String(e)));

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error('FAIL', msg);
};

try {
  // ---- 1 & 2: engine over the whole catalogue ----
  await page.goto(`${base}/index.html`);
  await page.waitForSelector('#preview-img:not([hidden])', { timeout: 15000 });

  const report = await page.evaluate(async () => {
    const { loadEngine, MODE } = await import('/js/engine.js');
    const { SYMBOLOGIES, FORMATS } = await import('/js/symbologies.js');
    const engine = await loadEngine();
    const sig = {
      svg: (b) => new TextDecoder().decode(b.slice(0, 200)).includes('<svg'),
      png: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
      gif: (b) => String.fromCharCode(...b.slice(0, 3)) === 'GIF',
      bmp: (b) => b[0] === 0x42 && b[1] === 0x4d,
      tif: (b) => (b[0] === 0x49 && b[1] === 0x49) || (b[0] === 0x4d && b[1] === 0x4d),
      eps: (b) => String.fromCharCode(...b.slice(0, 2)) === '%!',
      emf: (b) => b.length > 88,
      pcx: (b) => b[0] === 0x0a,
      txt: (b) => b.length > 0,
    };
    const problems = [];
    let n = 0;
    for (const s of SYMBOLOGIES) {
      if (!engine.isValid(s.id)) problems.push(`${s.name}: id ${s.id} not valid in this build`);
      for (const f of FORMATS) {
        const mode = s.gs1 ? MODE.GS1 | MODE.GS1PARENS : MODE.UNICODE;
        const r = engine.generate({
          symbology: s.id, data: s.example, filetype: f.ext, inputMode: mode, primary: s.primary || '',
          option1: s.id === 57 ? 4 : 0,
        });
        n++;
        if (!r.ok) problems.push(`${s.name} [${f.ext}] code ${r.code}: ${r.message}`);
        else if (!sig[f.ext](r.bytes)) problems.push(`${s.name} [${f.ext}] bad signature`);
      }
    }
    return { n, problems, version: engine.version, png: engine.hasPng };
  });
  console.log(`Engine ${report.version} (PNG: ${report.png}) - ${report.n} encodes`);
  report.problems.forEach(fail);

  // ---- 3: UI behaviour ----
  const ids = await page.$$eval('#symbology option', (o) => [...new Set(o.map((x) => x.value))]);
  let uiChecked = 0;
  for (const id of ids) {
    await page.selectOption('#symbology', id);
    await page.waitForFunction(() => document.querySelector('#status .ok, #status .err, #status .wrn'), null, { timeout: 5000 });
    await page.waitForTimeout(90);
    const err = await page.$eval('#status', (s) => s.querySelector('.err')?.textContent || '');
    if (err) fail(`UI symbology ${id}: ${err}`);
    uiChecked++;
  }
  console.log(`UI rendered ${uiChecked} symbologies without errors`);

  // Typing updates the preview
  await page.selectOption('#symbology', '20');
  await page.fill('#data', 'HELLO-123');
  await page.waitForTimeout(250);
  if (!(await page.$eval('#preview-img', (i) => i.src.startsWith('blob:') && !i.hidden))) fail('preview not shown');
  if (!(await page.$eval('#hrt-line', (e) => e.textContent.includes('HELLO-123')))) fail('human readable text line missing');

  // Invalid input shows an error, not a crash
  await page.selectOption('#symbology', '15'); // EAN-13
  await page.fill('#data', 'abc');
  await page.waitForTimeout(250);
  if (!(await page.$('#status .err'))) fail('invalid EAN-13 data should show an error');

  // Downloads: SVG and PNG
  await page.fill('#data', '123456789012');
  await page.waitForTimeout(250);
  for (const [ext, magic] of [['svg', '<svg'], ['png', '\x89PNG']]) {
    await page.selectOption('#format', ext);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#download-btn')]);
    const fs = await import('node:fs/promises');
    const buf = await fs.readFile(await dl.path());
    if (!buf.toString('latin1').includes(magic)) fail(`download .${ext} has wrong content`);
    if (!dl.suggestedFilename().endsWith('.' + ext)) fail(`download filename ${dl.suggestedFilename()}`);
  }

  // Batch ZIP
  await page.click('#batch-open');
  await page.fill('#batch-data', '111111111111\n222222222222\nbad\n333333333333');
  await page.selectOption('#batch-format', 'svg');
  const [zipDl] = await Promise.all([page.waitForEvent('download'), page.click('#batch-run')]);
  {
    const fs = await import('node:fs/promises');
    const zip = await fs.readFile(await zipDl.path());
    const entries = zip.toString('latin1').match(/PK\x03\x04/g)?.length;
    if (entries !== 3) fail(`batch zip should contain 3 files (1 invalid skipped), got ${entries}`);
    const msg = await page.$eval('#batch-result', (e) => e.textContent);
    if (!/Created 3 files/.test(msg) || !/1 skipped/.test(msg)) fail('batch summary: ' + msg);
  }
  await page.click('#batch-cancel');

  // Share link round trip
  await page.selectOption('#symbology', '58');
  await page.fill('#data', 'round trip \u2713');
  await page.selectOption('#opt-qrEcc', '4');
  await page.waitForTimeout(250);
  const hash = await page.evaluate(() => location.hash);
  const page2 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page2.on('pageerror', (e) => consoleErrors.push(String(e)));
  await page2.goto(`${base}/${hash}`);
  await page2.waitForSelector('#preview-img:not([hidden])');
  const restored = await page2.evaluate(() => ({
    t: document.getElementById('symbology').value,
    d: document.getElementById('data').value,
    e: document.getElementById('opt-qrEcc').value,
  }));
  if (restored.t !== '58' || restored.d !== 'round trip \u2713' || restored.e !== '4') fail('share link did not restore state: ' + JSON.stringify(restored));

  // Visual smoke test
  const fs = await import('node:fs/promises');
  await fs.mkdir(new URL('../.artifacts/', import.meta.url), { recursive: true });
  await page2.screenshot({ path: fileURLToPath(new URL('../.artifacts/desktop.png', import.meta.url)) });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${base}/${hash}`);
  await mobile.waitForSelector('#preview-img:not([hidden])');
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (overflow) fail('horizontal overflow on mobile');
  await mobile.screenshot({ path: fileURLToPath(new URL('../.artifacts/mobile.png', import.meta.url)) });

  if (consoleErrors.length) fail('console errors: ' + consoleErrors.join(' | '));
} finally {
  await browser.close();
  server.close();
}

if (failures) {
  console.error(`\n${failures} problem(s)`);
  process.exit(1);
}
console.log('All checks passed');
