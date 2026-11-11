import { loadEngine, OUT, MODE, CAP } from './engine.js';
import {
  GROUPS, SYMBOLOGIES, POPULAR_IDS, BY_ID, OPTION_DEFS, ECI_CHOICES, FORMATS,
} from './symbologies.js';
import { createZip } from './zip.js';

const $ = (id) => document.getElementById(id);
const DEFAULT_SYMBOLOGY = 58; // QR Code
const MAX_BATCH = 1000;
const HEX_RE = /^[0-9a-f]{6}([0-9a-f]{2})?$/i;

// Simple controls persisted in the URL and reset by "Reset all": [key, element id, kind]
const FIELDS = [
  ['d', 'data', 'value'], ['p', 'primary', 'value'], ['g', 'gs1', 'check'], ['e', 'escape', 'check'],
  ['sc', 'scale', 'value'], ['h', 'height', 'value'], ['fg', 'fg-text', 'value'], ['bg', 'bg-text', 'value'],
  ['tr', 'transparent', 'check'], ['mx', 'margin-x', 'value'], ['my', 'margin-y', 'value'],
  ['bd', 'border', 'value'], ['bw', 'border-width', 'value'], ['rot', 'rotate', 'value'], ['q', 'quiet', 'value'],
  ['hrt', 'hrt', 'check'], ['sm', 'text-small', 'check'], ['bo', 'text-bold', 'check'], ['gd', 'guard', 'check'],
  ['dt', 'dotty', 'check'], ['cp', 'compliant', 'check'], ['ri', 'readerinit', 'check'], ['eci', 'eci', 'value'],
  ['dp', 'dpmm', 'value'], ['sf', 'fmt-svg-font', 'value'], ['st', 'strict', 'check'], ['f', 'format', 'value'],
];

let engine = null;
let defaults = {};
let optionValues = {}; // symbology-specific option values by OPTION_DEFS key
let previewUrl = null;
let lastSvg = '';
let renderTimer = 0;
let toastTimer = 0;

// ------------------------------------------------------------------ helpers
const current = () => BY_ID.get(Number($('symbology').value)) || BY_ID.get(DEFAULT_SYMBOLOGY);

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function luminance(hex) {
  const v = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ------------------------------------------------------------------ symbology list
function buildSymbologySelect(filter = '') {
  const select = $('symbology');
  const selected = select.value || String(DEFAULT_SYMBOLOGY);
  const q = filter.trim().toLowerCase();
  const matches = (s) =>
    !q || s.name.toLowerCase().includes(q) || s.group.toLowerCase().includes(q) || String(s.id) === q;

  select.textContent = '';
  const addGroup = (label, items) => {
    if (!items.length) return;
    const og = document.createElement('optgroup');
    og.label = label;
    for (const s of items) og.append(new Option(s.name, String(s.id)));
    select.append(og);
  };

  if (!q) addGroup('Popular', POPULAR_IDS.map((id) => BY_ID.get(id)));
  for (const g of GROUPS.filter((x) => x !== 'Popular')) {
    addGroup(g, SYMBOLOGIES.filter((s) => s.group === g && matches(s)));
  }
  if (!select.options.length) select.append(new Option('No matching barcode types', ''));
  if ([...select.options].some((o) => o.value === selected)) select.value = selected;
}

// ------------------------------------------------------------------ symbology-specific options
function buildSymbologyOptions(sym, saved = {}) {
  const host = $('symbology-options');
  host.textContent = '';
  const keys = sym.opts || [];
  $('symbology-options-card').hidden = keys.length === 0;
  optionValues = {};

  for (const key of keys) {
    const def = OPTION_DEFS[key];
    const id = `opt-${key}`;
    const wrap = document.createElement('div');
    wrap.className = def.type === 'check' ? 'check-wrap span-2' : 'field';
    let input;

    if (def.type === 'select') {
      wrap.append(Object.assign(document.createElement('label'), { htmlFor: id, textContent: def.label }));
      input = document.createElement('select');
      for (const [v, text] of def.choices) input.append(new Option(text, String(v)));
      input.value = String(saved[key] ?? def.choices[0][0]);
    } else if (def.type === 'number') {
      wrap.append(Object.assign(document.createElement('label'), { htmlFor: id, textContent: def.label }));
      input = Object.assign(document.createElement('input'), { type: 'number', min: def.min, max: def.max, step: 1 });
      input.value = String(saved[key] ?? 0);
    } else {
      const label = document.createElement('label');
      label.className = 'check';
      input = Object.assign(document.createElement('input'), { type: 'checkbox' });
      input.checked = !!saved[key];
      label.append(input, Object.assign(document.createElement('span'), { textContent: def.label }));
      wrap.append(label);
    }
    input.id = id;
    input.dataset.opt = key;
    if (def.type !== 'check') wrap.append(input);
    if (def.hint && def.type !== 'select') {
      wrap.append(Object.assign(document.createElement('p'), { className: 'hint', textContent: def.hint }));
    }
    host.append(wrap);
  }
}

function readSymbologyOptions(sym) {
  const slots = { option_1: 0, option_2: 0, option_3: 0 };
  const values = {};
  for (const key of sym.opts || []) {
    const def = OPTION_DEFS[key];
    const el = $(`opt-${key}`);
    if (!el) continue;
    if (def.type === 'check') {
      values[key] = el.checked;
      if (el.checked) slots[def.slot] |= def.on;
    } else {
      let v = parseInt(el.value, 10);
      if (Number.isNaN(v)) v = 0;
      if (def.type === 'number') v = Math.max(def.min, Math.min(def.max, v));
      values[key] = v;
      slots[def.slot] = v;
    }
  }
  return { slots, values };
}

// ------------------------------------------------------------------ apply symbology capabilities to the UI
function applySymbology(sym, { keepData = true } = {}) {
  const caps = engine.caps(sym.id);
  $('symbology-hint').textContent = `Zint ID ${sym.id} - ${sym.group}`;

  $('hrt-row').hidden = !caps.HRT;
  $('text-opts').hidden = !caps.HRT;
  $('guard-row').hidden = !caps.EANUPC;
  $('dotty-row').hidden = !caps.DOTTY;
  $('compliant-row').hidden = !caps.COMPLIANT_HEIGHT;
  $('readerinit-row').hidden = !caps.READER_INIT;
  $('gs1-row').hidden = !caps.GS1;
  $('eci-field').hidden = !caps.ECI;
  $('height-field').hidden = caps.FIXED_RATIO;

  const hasPrimary = sym.primary !== undefined;
  $('primary-field').hidden = !hasPrimary;
  if (hasPrimary) {
    const maxi = sym.id === 57;
    $('primary-label').textContent = maxi ? 'Primary message (modes 2 and 3 only)' : 'Linear component';
    $('primary').placeholder = sym.primary || '';
    $('primary-hint').textContent = maxi
      ? 'Postcode + country code + service class, e.g. 152382802840001. Leave empty for standard mode 4.'
      : 'The EAN/UPC, GS1-128 or DataBar part. The content field above holds the 2D composite part.';
    if (!keepData || $('primary').value === '') $('primary').value = maxi ? '' : sym.primary || '';
  } else {
    $('primary').value = '';
  }

  $('gs1').checked = !!sym.gs1;
  if (!keepData) $('data').value = sym.example ?? '';
  $('char-count').textContent = String([...$('data').value].length);
}

// ------------------------------------------------------------------ settings -> engine options
function colourValue(text, label) {
  const hex = text.replace(/^#/, '').trim();
  if (!HEX_RE.test(hex)) throw new Error(`${label} must be a hex colour such as 000000`);
  return hex;
}

function gatherOptions(filetype) {
  const sym = current();
  const { slots } = readSymbologyOptions(sym);

  const fg = colourValue($('fg-text').value, 'Bars colour');
  let bg = colourValue($('bg-text').value, 'Background colour');
  if ($('transparent').checked) bg = `${bg.slice(0, 6)}00`;

  let out = 0;
  const border = $('border').value;
  if (border === 'box') out |= OUT.BOX;
  if (border === 'bind') out |= OUT.BIND;
  if (border === 'bindtop') out |= OUT.BIND_TOP;
  if ($('quiet').value === 'add') out |= OUT.QUIET_ZONES;
  if ($('quiet').value === 'none') out |= OUT.NO_QUIET_ZONES;
  if ($('text-small').checked) out |= OUT.SMALL_TEXT;
  if ($('text-bold').checked) out |= OUT.BOLD_TEXT;
  if ($('guard').checked && !$('guard-row').hidden) out |= OUT.EANUPC_GUARD_WHITESPACE;
  if ($('dotty').checked && !$('dotty-row').hidden) out |= OUT.DOTTY_MODE;
  if ($('compliant').checked && !$('compliant-row').hidden) out |= OUT.COMPLIANT_HEIGHT;
  if ($('readerinit').checked && !$('readerinit-row').hidden) out |= OUT.READER_INIT;
  if (filetype === 'svg' && $('fmt-svg-font').value === 'embed') out |= OUT.EMBED_VECTOR_FONT;

  let mode = MODE.UNICODE;
  if (!$('gs1-row').hidden && $('gs1').checked) mode = MODE.GS1 | MODE.GS1PARENS;
  if ($('escape').checked) mode |= MODE.ESCAPE;

  const hasBorder = border !== 'none';
  const primary = $('primary-field').hidden ? '' : $('primary').value;
  // MaxiCode: "Auto" means mode 4 unless a primary message (modes 2/3) was supplied
  if (sym.id === 57 && slots.option_1 === 0 && !primary.trim()) slots.option_1 = 4;
  return {
    symbology: sym.id,
    filetype,
    inputMode: mode,
    height: $('height-field').hidden ? 0 : Number($('height').value),
    scale: Number($('scale').value),
    whitespaceWidth: Number($('margin-x').value) || 0,
    whitespaceHeight: Number($('margin-y').value) || 0,
    borderWidth: hasBorder ? Math.max(1, Number($('border-width').value) || 1) : 0,
    outputOptions: out,
    fg,
    bg,
    option1: slots.option_1,
    option2: slots.option_2,
    option3: slots.option_3,
    showText: $('hrt-row').hidden ? true : $('hrt').checked,
    eci: $('eci-field').hidden ? 0 : Number($('eci').value) || 0,
    dpmm: Number($('dpmm').value) || 0,
    primary,
    rotate: Number($('rotate').value) || 0,
    strict: $('strict').checked,
  };
}

// ------------------------------------------------------------------ rendering
function setStatus(kind, text) {
  const s = $('status');
  s.textContent = '';
  if (!text) return;
  const span = document.createElement('span');
  span.className = kind;
  span.textContent = text;
  s.append(span);
}

function showEmpty(message) {
  $('preview-img').hidden = true;
  $('empty').hidden = false;
  $('empty').textContent = message;
  $('meta').textContent = '';
  $('hrt-line').hidden = true;
  lastSvg = '';
}

function updateSliderLabels() {
  $('scale-out').textContent = $('scale').value;
  $('height-out').textContent = Number($('height').value) === 0 ? 'Auto' : $('height').value;
}

function updateContrast() {
  const fg = $('fg-text').value.replace('#', '');
  const bg = $('bg-text').value.replace('#', '');
  let low = false;
  if (HEX_RE.test(fg) && HEX_RE.test(bg) && !$('transparent').checked) {
    low = contrast(fg.slice(0, 6), bg.slice(0, 6)) < 3;
  }
  $('contrast-warning').hidden = !low;
}

function render() {
  if (!engine) return;
  updateSliderLabels();
  updateContrast();
  const data = $('data').value;
  $('char-count').textContent = String([...data].length);

  if (!data) {
    setStatus('', '');
    showEmpty('Enter some data to generate a barcode.');
    return;
  }

  let opts;
  try {
    opts = gatherOptions('svg');
  } catch (e) {
    setStatus('err', e.message);
    return;
  }

  const r = engine.generate({ ...opts, data });
  if (!r.ok) {
    setStatus('err', r.message || `Could not generate barcode (code ${r.code}).`);
    $('preview-img').hidden = true;
    $('empty').hidden = false;
    $('empty').textContent = 'Fix the issue above to see a preview.';
    $('meta').textContent = '';
    $('hrt-line').hidden = true;
    lastSvg = '';
    return;
  }

  lastSvg = new TextDecoder().decode(r.bytes);
  const blob = new Blob([r.bytes], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = $('preview-img');
  img.src = url;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = url;
  fitPreview(lastSvg);
  img.hidden = false;
  $('empty').hidden = true;

  if (r.warning) setStatus('wrn', r.message);
  else setStatus('ok', 'Ready');

  const rows = r.rows > 1 ? `${r.rows} rows x ` : '';
  $('meta').textContent = r.width ? `${rows}${r.width} modules` : '';
  const hrtLine = $('hrt-line');
  hrtLine.hidden = !r.hrt;
  hrtLine.textContent = r.hrt ? `Text: ${r.hrt}` : '';
}

// Show the SVG sharply, filling the stage but never absurdly large
function fitPreview(svgText) {
  const img = $('preview-img');
  const m = svgText.match(/<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/);
  const w = m ? parseFloat(m[1]) : 0;
  const h = m ? parseFloat(m[2]) : 0;
  if (!w || !h) {
    img.style.width = '';
    return;
  }
  const stage = $('stage');
  const availW = Math.max(160, stage.clientWidth - 48);
  const k = Math.min(availW / w, 380 / h, 10);
  img.style.width = `${Math.max(60, Math.round(w * Math.max(k, 0.25)))}px`;
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    render();
    syncUrl();
  }, 60);
}

// ------------------------------------------------------------------ URL state
function collectState() {
  const sym = current();
  const p = new URLSearchParams();
  p.set('t', String(sym.id));
  for (const [key, id, kind] of FIELDS) {
    const el = $(id);
    const val = kind === 'check' ? (el.checked ? '1' : '0') : el.value;
    if (val !== defaults[id]) p.set(key, val);
  }
  const { values } = readSymbologyOptions(sym);
  for (const [k, v] of Object.entries(values)) p.set(`o_${k}`, v === true ? '1' : v === false ? '0' : String(v));
  return p;
}

function syncUrl() {
  const p = collectState();
  history.replaceState(null, '', `${location.pathname}#${p.toString()}`);
}

function applyState(p) {
  const id = Number(p.get('t'));
  if (BY_ID.has(id)) {
    $('symbology-search').value = '';
    buildSymbologySelect();
    $('symbology').value = String(id);
  }
  const sym = current();
  const saved = {};
  for (const key of sym.opts || []) {
    const raw = p.get(`o_${key}`);
    if (raw === null) continue;
    saved[key] = OPTION_DEFS[key].type === 'check' ? raw === '1' : Number(raw);
  }
  buildSymbologyOptions(sym, saved);
  applySymbology(sym, { keepData: true });

  for (const [key, elId, kind] of FIELDS) {
    const el = $(elId);
    const raw = p.get(key);
    if (raw === null) continue;
    if (kind === 'check') el.checked = raw === '1';
    else el.value = raw;
  }
  syncColourInputs();
  updateSliderLabels();
}

// ------------------------------------------------------------------ colours
function syncColourInputs() {
  for (const base of ['fg', 'bg']) {
    const text = $(`${base}-text`).value.replace('#', '');
    if (HEX_RE.test(text)) $(base).value = `#${text.slice(0, 6)}`;
  }
}

function wireColour(base) {
  $(base).addEventListener('input', () => {
    $(`${base}-text`).value = $(base).value.slice(1).toUpperCase();
    scheduleRender();
  });
  $(`${base}-text`).addEventListener('input', () => {
    syncColourInputs();
    const ok = HEX_RE.test($(`${base}-text`).value.replace('#', ''));
    $(`${base}-text`).setAttribute('aria-invalid', String(!ok));
    scheduleRender();
  });
}

// ------------------------------------------------------------------ actions
function chosenFormat() {
  return FORMATS.find((f) => f.ext === $('format').value) || FORMATS[0];
}

function generateFile(format, data = $('data').value) {
  const opts = gatherOptions(format.ext);
  return engine.generate({ ...opts, data });
}

function onDownload() {
  const fmt = chosenFormat();
  if (!$('data').value) return toast('Enter some data first');
  try {
    const r = generateFile(fmt);
    if (!r.ok) return toast(r.message || 'Could not generate barcode');
    download(new Blob([r.bytes], { type: fmt.mime }), `${slug(current().name)}.${fmt.ext}`);
    toast(`Downloaded ${fmt.label}`);
  } catch (e) {
    toast(e.message);
  }
}

async function onCopyImage() {
  if (!$('data').value) return toast('Enter some data first');
  try {
    const r = generateFile(FORMATS.find((f) => f.ext === 'png'));
    if (!r.ok) return toast(r.message || 'Could not generate barcode');
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      return toast('Your browser does not support copying images. Use Download.');
    }
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': new Blob([r.bytes], { type: 'image/png' }) })]);
    toast('Image copied');
  } catch (e) {
    toast(e.message || 'Copy failed. Use Download instead.');
  }
}

async function copyText(text, okMsg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg);
  } catch {
    toast('Copy failed. Your browser blocked clipboard access.');
  }
}

function onCopySvg() {
  if (!lastSvg) return toast('Nothing to copy yet');
  copyText(lastSvg, 'SVG code copied');
}

function onShare() {
  syncUrl();
  copyText(location.href, 'Link copied');
}

// ------------------------------------------------------------------ batch
function batchLines() {
  return $('batch-data').value.split(/\r?\n/).map((l) => l.replace(/\s+$/, '')).filter((l) => l.length > 0);
}

function updateBatchCount() {
  const n = batchLines().length;
  $('batch-count').textContent = `${n} item${n === 1 ? '' : 's'}${n > MAX_BATCH ? ` (max ${MAX_BATCH})` : ''}`;
}

async function runBatch() {
  const lines = batchLines().slice(0, MAX_BATCH);
  const result = $('batch-result');
  result.hidden = false;
  if (!lines.length) {
    result.textContent = 'Add at least one line.';
    return;
  }
  const fmt = FORMATS.find((f) => f.ext === $('batch-format').value) || FORMATS[0];
  const files = [];
  const failed = [];
  const pad = String(lines.length).length;
  $('batch-run').disabled = true;
  try {
    for (let i = 0; i < lines.length; i++) {
      const r = generateFile(fmt, lines[i]);
      if (r.ok) {
        const label = slug(lines[i]).slice(0, 40) || 'item';
        files.push({ name: `${String(i + 1).padStart(pad, '0')}-${label}.${fmt.ext}`, data: r.bytes });
      } else {
        failed.push(`line ${i + 1}: ${r.message}`);
      }
      if (i % 20 === 19) {
        result.textContent = `Working... ${i + 1} / ${lines.length}`;
        await new Promise((res) => setTimeout(res));
      }
    }
    if (!files.length) {
      result.textContent = `Nothing created. ${failed.slice(0, 3).join('; ')}`;
      return;
    }
    download(createZip(files), `${slug(current().name)}-batch.zip`);
    result.textContent =
      `Created ${files.length} file${files.length === 1 ? '' : 's'}.` +
      (failed.length ? ` ${failed.length} skipped: ${failed.slice(0, 3).join('; ')}${failed.length > 3 ? '...' : ''}` : '');
  } catch (e) {
    result.textContent = e.message;
  } finally {
    $('batch-run').disabled = false;
  }
}

// ------------------------------------------------------------------ init
function populateStatic() {
  $('eci').append(...ECI_CHOICES.map(([v, t]) => new Option(t, String(v))));
  for (const id of ['format', 'batch-format']) {
    $(id).append(...FORMATS.map((f) => new Option(`${f.label}`, f.ext)));
  }
}

function captureDefaults() {
  defaults = {};
  for (const [, id, kind] of FIELDS) defaults[id] = kind === 'check' ? ($(id).checked ? '1' : '0') : $(id).value;
}

function reset() {
  for (const [, id, kind] of FIELDS) {
    if (id === 'data' || id === 'primary') continue;
    if (kind === 'check') $(id).checked = defaults[id] === '1';
    else $(id).value = defaults[id];
  }
  const sym = current();
  buildSymbologyOptions(sym);
  applySymbology(sym, { keepData: false });
  syncColourInputs();
  scheduleRender();
  toast('Settings reset');
}

function onSymbologyChange() {
  const sym = current();
  buildSymbologyOptions(sym);
  applySymbology(sym, { keepData: false });
  scheduleRender();
}

function updateFormatNote() {
  $('format-note').textContent = chosenFormat().note;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('zint-theme', theme); } catch { /* storage unavailable */ }
}

async function init() {
  populateStatic();
  buildSymbologySelect();
  captureDefaults();

  $('theme-toggle').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });

  try {
    engine = await loadEngine();
  } catch (e) {
    console.error(e);
    $('empty').textContent = 'Could not load the barcode engine. Your browser may not support WebAssembly.';
    setStatus('err', String(e.message || e));
    return;
  }
  $('version-badge').textContent = `Zint ${engine.version}`;

  // Initial state: URL hash, else default QR with example
  const hash = new URLSearchParams(location.hash.slice(1));
  $('symbology').value = String(DEFAULT_SYMBOLOGY);
  if (hash.has('t')) {
    applyState(hash);
    if (!hash.has('d')) $('data').value = current().example ?? '';
  } else {
    onSymbologyChange();
  }
  updateFormatNote();

  // events
  $('symbology').addEventListener('change', onSymbologyChange);
  $('symbology-search').addEventListener('input', (e) => {
    buildSymbologySelect(e.target.value);
    if ($('symbology').value) onSymbologyChange();
  });
  $('example-btn').addEventListener('click', () => {
    $('data').value = current().example ?? '';
    const sym = current();
    if (sym.primary !== undefined && sym.id !== 57) $('primary').value = sym.primary;
    scheduleRender();
  });
  $('controls').addEventListener('input', scheduleRender);
  $('controls').addEventListener('change', scheduleRender);
  $('controls').addEventListener('submit', (e) => e.preventDefault());
  wireColour('fg');
  wireColour('bg');
  $('format').addEventListener('change', () => { updateFormatNote(); syncUrl(); });
  $('download-btn').addEventListener('click', onDownload);
  $('copy-img-btn').addEventListener('click', onCopyImage);
  $('copy-svg-btn').addEventListener('click', onCopySvg);
  $('share-btn').addEventListener('click', onShare);
  $('reset-btn').addEventListener('click', reset);
  addEventListener('resize', () => lastSvg && fitPreview(lastSvg));

  // batch dialog
  const dlg = $('batch-dialog');
  $('batch-open').addEventListener('click', () => {
    $('batch-result').hidden = true;
    $('batch-format').value = $('format').value;
    updateBatchCount();
    dlg.showModal();
    $('batch-data').focus();
  });
  $('batch-cancel').addEventListener('click', () => dlg.close());
  $('batch-data').addEventListener('input', updateBatchCount);
  $('batch-run').addEventListener('click', runBatch);
  $('batch-form').addEventListener('submit', (e) => e.preventDefault());

  render();
  syncUrl();
  document.documentElement.dataset.ready = 'true';
}

init();
