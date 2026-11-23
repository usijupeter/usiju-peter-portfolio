// Smoke test for the built site (run after `npm run build`): catches broken SEO, share cards and prerendering.
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve('dist');
const read = p => readFile(resolve(dist, p), 'utf8');
const exists = p => access(resolve(dist, p)).then(() => true, () => false);
const attr = (html, re) => html.match(re)?.[1];
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };

const sitemap = await read('sitemap.xml');
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
check(routes.includes('/') && routes.some(r => r.startsWith('/work/')), 'sitemap.xml lists the home page and case studies');
check((await read('robots.txt')).includes('/sitemap.xml'), 'robots.txt points to the sitemap');

const titles = new Set();
for (const route of routes) {
  const file = route === '/' ? 'index.html' : `${route.slice(1)}/index.html`;
  if (!(await exists(file))) { fails.push(`${route}: no prerendered page`); continue; }
  const html = await read(file);
  const title = attr(html, /<title>([^<]*)<\/title>/);
  check(title && !titles.has(title), `${route}: unique <title>`); titles.add(title);
  check(!html.includes('__SITE_URL__'), `${route}: site URL placeholder replaced`);
  check(/<div id="root"><a [^>]*class="skipLink"/.test(html), `${route}: app prerendered into #root`);
  check((html.match(/<h1[\s>]/g) || []).length === 1, `${route}: exactly one <h1>`);
  check(attr(html, /<link rel="canonical" href="([^"]+)"/)?.endsWith(route === '/' ? '/' : route), `${route}: canonical matches the page`);
  const og = attr(html, /<meta property="og:image" content="([^"]+)"/);
  check(og === attr(html, /<meta name="twitter:image" content="([^"]+)"/), `${route}: og:image and twitter:image agree`);
  check(og && await exists(new URL(og).pathname.slice(1)), `${route}: share image ${og} exists`);
  if (route !== '/') {
    check(og?.includes(`/og/${route.split('/').pop()}.jpg`), `${route}: has its own share image`);
    check(/class="caseShot"><img[^>]+srcset=/i.test(html), `${route}: case-study screenshot is responsive`);
  }
  check(/© <span>\d{4}<\/span>/.test(html), `${route}: footer year rendered`);
}

if (fails.length) { console.error(`check-dist: ${fails.length} problem(s)\n - ${fails.join('\n - ')}`); process.exit(1); }
console.log(`check-dist: ${routes.length} pages OK`);
