// Pre-renders every route into static HTML so crawlers, link previews and first paint see real content,
// then writes sitemap.xml and robots.txt from the same route list (nothing to update by hand).
import { readFile, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const dist = resolve('dist');
const { render, routes, meta, SITE_URL } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const template = await readFile(resolve(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: #root placeholder not found');

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
/** Replace the content/href of one tag, failing loudly if the tag is missing so a template change can't silently break SEO. */
const set = (html, pattern, value) => {
  if (!pattern.test(html)) throw new Error(`prerender: tag not found: ${pattern}`);
  return html.replace(pattern, `$1${value}`);
};

for (const route of routes) {
  let html = template.replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`);
  const m = meta(route);
  if (m) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`);
    html = set(html, /(<meta name="description" content=")[^"]*/, esc(m.description));
    html = set(html, /(<link rel="canonical" href=")[^"]*/, m.url);
    html = set(html, /(<meta property="og:url" content=")[^"]*/, m.url);
    html = set(html, /(<meta property="og:type" content=")[^"]*/, 'article');
    html = set(html, /(<meta property="og:title" content=")[^"]*/, esc(m.title));
    html = set(html, /(<meta name="twitter:title" content=")[^"]*/, esc(m.title));
    html = set(html, /(<meta property="og:description" content=")[^"]*/, esc(m.description));
    html = set(html, /(<meta name="twitter:description" content=")[^"]*/, esc(m.description));
    html = set(html, /(<meta property="og:image" content=")[^"]*/, m.image);
    html = set(html, /(<meta name="twitter:image" content=")[^"]*/, m.image);
    html = set(html, /(<meta property="og:image:alt" content=")[^"]*/, esc(m.imageAlt));
    // the hero portrait preload is only useful on the home page
    html = html.replace(/\s*<link rel="preload" as="image"[^>]*>/, '');
  }
  const file = route === '/' ? resolve(dist, 'index.html') : resolve(dist, `.${route}/index.html`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log('prerender:', route);
}

// lastmod = date of the last commit (falls back to today when git history isn't available, e.g. a CLI upload).
let lastmod = new Date().toISOString().slice(0, 10);
try { lastmod = execSync('git log -1 --format=%cs', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || lastmod; } catch { /* no git */ }
const urls = routes.map(r => `  <url><loc>${SITE_URL}${r}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
await writeFile(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('prerender: sitemap.xml, robots.txt');

for (const r of routes) {
  const m = meta(r);
  if (m) await access(resolve(dist, `.${new URL(m.image).pathname}`)).catch(() => { throw new Error(`prerender: missing share image for ${r} — run npm run images`); });
}
await rm(resolve('dist-ssr'), { recursive: true, force: true });
