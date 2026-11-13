// Injects the server-rendered app into dist/index.html so crawlers and link previews see real content.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dist = resolve('dist');
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const html = await readFile(resolve(dist, 'index.html'), 'utf8');
if (!html.includes('<div id="root"></div>')) throw new Error('prerender: #root placeholder not found');
await writeFile(resolve(dist, 'index.html'), html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`));
await rm(resolve('dist-ssr'), { recursive: true, force: true });
console.log('prerender: dist/index.html rendered');
