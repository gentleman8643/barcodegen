# Zint Barcode Generator (web)

The full Zint C library (`../backend`) compiled to WebAssembly, with a responsive web UI.
Barcodes are generated in the visitor's browser. Nothing is uploaded and there is no server code.

## Features
- 100+ symbologies: QR, Micro QR, rMQR, Code 128, Code 39/93, EAN/UPC, GS1-128, GS1 DataBar, GS1 Composite, Data Matrix, PDF417, Aztec, MaxiCode, DotCode, Han Xin, Grid Matrix, Code One, Ultracode, HIBC, postal codes and more
- Export SVG, PNG, EPS, EMF, GIF, BMP, TIFF, PCX, TXT
- Live preview, per-symbology options (error correction, version, size, columns...)
- Colours, transparent background, margins, borders, rotation, quiet zones, dot mode, text options, ECI
- GS1 `(AI)value` input, escape sequences
- Batch generation to a ZIP, copy image / SVG, shareable links, dark mode

## Deploy to Vercel
The compiled engine (`public/wasm/zint.js` + `zint.wasm`) is committed, so Vercel needs no build step.
`../vercel.json` serves `web/public` as a static site with security and cache headers.

```
npm i -g vercel
vercel          # from the repository root
vercel --prod
```
Or import the repository in the Vercel dashboard and keep the defaults (no framework, no build command).

## Develop
```
npm install
npm run dev      # http://localhost:5173
npm test         # real-browser tests: all symbologies x all formats, UI, downloads, batch, share links
```

## Rebuild the WebAssembly engine
Only needed if `../backend` or `wasm/zint_wasm.c` changes. Requires the [Emscripten SDK](https://emscripten.org) (installed to `~/emsdk` or set `$env:EMSDK`).
```
npm run build:wasm
```

## Licence
Zint library: BSD-3-Clause. This web interface: GPL-3.0-or-later, like the Zint frontends.
