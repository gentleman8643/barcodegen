// Minimal static file server for local development and tests. No dependencies.
// Usage: node scripts/dev-server.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../public', import.meta.url)));
const PORT = Number(process.argv[2] || process.env.PORT || 5173);

// Apply the same global response headers as production (vercel.json) so CSP issues show up locally
const VERCEL = JSON.parse(await readFile(new URL('../../vercel.json', import.meta.url), 'utf8'));
const GLOBAL_HEADERS = Object.fromEntries(
  (VERCEL.headers.find((h) => h.source === '/(.*)')?.headers || []).map((h) => [h.key, h.value]),
);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
};

export function startServer(port = PORT) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
      let file = resolve(join(ROOT, rel));
      if (file !== ROOT && !file.startsWith(ROOT + sep)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const info = await stat(file).catch(() => null);
      if (info?.isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type': TYPES[extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
        ...GLOBAL_HEADERS,
      });
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('dev-server.mjs')) {
  startServer().then((s) => console.log(`Zint web app: http://localhost:${s.address().port}`));
}
