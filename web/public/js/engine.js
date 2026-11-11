// Thin JavaScript wrapper over the Zint WebAssembly module.
import createZint from '../wasm/zint.js';

// output_options bit flags (backend/zint.h)
export const OUT = {
  BIND_TOP: 0x00001,
  BIND: 0x00002,
  BOX: 0x00004,
  READER_INIT: 0x00010,
  SMALL_TEXT: 0x00020,
  BOLD_TEXT: 0x00040,
  CMYK_COLOUR: 0x00080,
  DOTTY_MODE: 0x00100,
  GS1_GS_SEPARATOR: 0x00200,
  QUIET_ZONES: 0x00800,
  NO_QUIET_ZONES: 0x01000,
  COMPLIANT_HEIGHT: 0x02000,
  EANUPC_GUARD_WHITESPACE: 0x04000,
  EMBED_VECTOR_FONT: 0x08000,
};

// input_mode flags
export const MODE = {
  DATA: 0,
  UNICODE: 1,
  GS1: 2,
  ESCAPE: 0x0008,
  GS1PARENS: 0x0010,
  GS1NOCHECK: 0x0020,
  HEIGHTPERROW: 0x0040,
  FAST: 0x0080,
  EXTRA_ESCAPE: 0x0100,
};

// ZBarcode_Cap flags
export const CAP = {
  HRT: 0x0001,
  STACKABLE: 0x0002,
  EANUPC: 0x0004,
  COMPOSITE: 0x0008,
  ECI: 0x0010,
  GS1: 0x0020,
  DOTTY: 0x0040,
  QUIET_ZONES: 0x0080,
  FIXED_RATIO: 0x0100,
  READER_INIT: 0x0200,
  FULL_MULTIBYTE: 0x0400,
  MASK: 0x0800,
  STRUCTAPP: 0x1000,
  COMPLIANT_HEIGHT: 0x2000,
  BINDABLE: 0x4000,
};

export const WARN_MAX = 4; // return values 1..4 are warnings (output still valid), >= 5 are errors

let modulePromise = null;

export function loadEngine() {
  if (!modulePromise) {
    modulePromise = createZint({
      locateFile: (path) => new URL(`../wasm/${path}`, import.meta.url).href,
    }).then((m) => new Engine(m));
  }
  return modulePromise;
}

const DEFAULTS = {
  symbology: 20,
  data: '',
  filetype: 'svg',
  inputMode: MODE.UNICODE,
  height: 0,
  scale: 1,
  whitespaceWidth: 0,
  whitespaceHeight: 0,
  borderWidth: 0,
  outputOptions: 0,
  fg: '',
  bg: '',
  option1: 0,
  option2: 0,
  option3: 0,
  showText: true,
  eci: 0,
  dpmm: 0,
  primary: '',
  rotate: 0,
  dotSize: 0,
  textGap: -1,
  guardDescent: -1,
  strict: false,
};

class Engine {
  constructor(mod) {
    this.m = mod;
    this.encoder = new TextEncoder();
  }

  get version() {
    const v = this.m._zw_version();
    const major = Math.floor(v / 10000);
    const minor = Math.floor((v % 10000) / 100);
    const rest = v % 100;
    const release = Math.floor(rest / 10);
    const build = rest % 10;
    return build ? `${major}.${minor}.${release}.${build}` : `${major}.${minor}.${release}`;
  }

  get hasPng() {
    return !!this.m._zw_have_png();
  }

  cap(id, flag) {
    return (this.m._zw_cap(id, flag) & flag) !== 0;
  }

  caps(id) {
    const out = {};
    for (const [k, flag] of Object.entries(CAP)) out[k] = this.cap(id, flag);
    return out;
  }

  isValid(id) {
    return !!this.m._zw_valid_id(id);
  }

  /** Allocates a NUL-terminated UTF-8 string in WASM memory. Caller must free. */
  _cstr(str) {
    const m = this.m;
    const len = m.lengthBytesUTF8(str) + 1;
    const ptr = m._malloc(len);
    m.stringToUTF8(str, ptr, len);
    return ptr;
  }

  /**
   * Generates a barcode.
   * @returns {{code:number, ok:boolean, warning:boolean, message:string, bytes:Uint8Array|null,
   *            hrt:string, rows:number, width:number}}
   */
  generate(options) {
    const o = { ...DEFAULTS, ...options };
    const m = this.m;
    const dataBytes = this.encoder.encode(o.data);
    const dataPtr = m._malloc(dataBytes.length + 1);
    m.HEAPU8.set(dataBytes, dataPtr);
    m.HEAPU8[dataPtr + dataBytes.length] = 0;

    const ptrs = [dataPtr];
    const s = (str) => {
      const p = this._cstr(str || '');
      ptrs.push(p);
      return p;
    };

    let code;
    try {
      code = m._zw_encode(
        o.symbology,
        dataPtr,
        dataBytes.length,
        s(o.filetype),
        o.inputMode,
        o.height,
        o.scale,
        o.whitespaceWidth,
        o.whitespaceHeight,
        o.borderWidth,
        o.outputOptions,
        s(o.fg),
        s(o.bg),
        o.option1,
        o.option2,
        o.option3,
        o.showText ? 1 : 0,
        o.eci,
        o.dpmm,
        s(o.primary),
        o.rotate,
        o.dotSize,
        o.textGap,
        o.guardDescent,
        o.strict ? 2 : 0,
      );
    } finally {
      for (const p of ptrs) m._free(p);
    }

    const message = m.UTF8ToString(m._zw_error());
    const hrt = m.UTF8ToString(m._zw_hrt());
    const ok = code === 0 || code <= WARN_MAX;
    let bytes = null;
    if (ok) {
      const ptr = m._zw_out_ptr();
      const size = m._zw_out_size();
      if (ptr && size > 0) bytes = m.HEAPU8.slice(ptr, ptr + size); // copy: WASM memory may move
    }
    const result = {
      code,
      ok: ok && bytes !== null,
      warning: code > 0 && code <= WARN_MAX,
      message,
      bytes,
      hrt,
      rows: m._zw_rows(),
      width: m._zw_width(),
    };
    m._zw_free();
    return result;
  }
}
