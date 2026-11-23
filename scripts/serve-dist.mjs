// Serves dist/ the way Vercel does for this site, so tests see what visitors see:
// clean URLs (/work/x -> work/x/index.html), 404.html with a 404 status, redirects and headers from vercel.json.
// Usage: node scripts/serve-dist.mjs [port]   (vite preview can't do this: it answers every path with the home page)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('dist');
const port = Number(process.argv[2] ?? 4173);
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain',
};
const pattern = src => new RegExp(`^${src.replace(/\(\.\*\)/g, '.*')}$`);
const isFile = p => stat(p).then(s => s.isFile(), () => false);

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  for (const r of vercel.redirects ?? []) if (path === r.source) { res.writeHead(r.permanent ? 308 : 307, { Location: r.destination }).end(); return; }
  for (const h of vercel.headers ?? []) if (pattern(h.source).test(path)) for (const { key, value } of h.headers) res.setHeader(key, value);

  const safe = normalize(path).replace(/^([/\\])+/, '');
  if (safe.startsWith('..')) { res.writeHead(400).end(); return; }
  // cleanUrls: /a -> a.html or a/index.html; trailingSlash false: /a/ -> /a
  if (path.length > 1 && path.endsWith('/')) { res.writeHead(308, { Location: path.slice(0, -1) }).end(); return; }
  const candidates = [join(root, safe), join(root, `${safe}.html`), join(root, safe, 'index.html')];
  let file;
  for (const c of candidates) if (await isFile(c)) { file = c; break; }
  const status = file ? 200 : 404;
  file ??= join(root, '404.html');
  res.writeHead(status, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(port, () => console.log(`serve-dist: http://localhost:${port}`));
