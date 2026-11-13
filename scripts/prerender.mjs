// Pre-renders every route into static HTML so crawlers, link previews and first paint see real content.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const dist = resolve('dist');
const { render, routes, meta } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const template = await readFile(resolve(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: #root placeholder not found');

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
for (const route of routes) {
  let html = template.replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`);
  const m = meta(route);
  if (m) {
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(m.description)}`)
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${m.url}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${m.url}`)
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(m.title)}`)
      .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(m.title)}`)
      .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(m.description)}`)
      .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(m.description)}`)
      .replace(/(<meta property="og:type" content=")[^"]*/, '$1article')
      // the hero portrait preload is only useful on the home page
      .replace(/\s*<link rel="preload" as="image"[^>]*>/, '');
  }
  const file = route === '/' ? resolve(dist, 'index.html') : resolve(dist, `.${route}/index.html`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log('prerender:', route);
}
await rm(resolve('dist-ssr'), { recursive: true, force: true });
