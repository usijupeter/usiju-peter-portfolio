import { renderToString } from 'preact-render-to-string';
import { App } from './App';
import { projects, site, SITE_URL } from './data';

export { SITE_URL };
export const routes = ['/', ...projects.map(p => `/work/${p.slug}`)];

/** Per-route <head> values so each case study has its own title, description, canonical and share card. */
export function meta(path: string) {
  const p = projects.find(x => path === `/work/${x.slug}`);
  if (!p) return null;
  return {
    title: `${p.title} — Case study by ${site.name}`,
    description: `${p.description} ${p.category} project by ${site.name}, creative developer.`,
    url: `${SITE_URL}${path}`,
    // 1200x630 JPG made by `npm run images` (same size as the default card, so og:image:width/height stay valid).
    image: `${SITE_URL}/og/${p.image}.jpg`,
    imageAlt: `${p.title} website, designed and built by ${site.name}`,
  };
}

export function render(path: string) {
  return renderToString(<App path={path} />);
}
