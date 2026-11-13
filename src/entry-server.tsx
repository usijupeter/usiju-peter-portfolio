import { renderToString } from 'preact-render-to-string';
import { App } from './App';
import { projects, site, SITE_URL } from './data';

export const routes = ['/', ...projects.map(p => `/work/${p.slug}`)];

/** Per-route <head> values so each case study has its own title, description, canonical and share card. */
export function meta(path: string) {
  const p = projects.find(x => path === `/work/${x.slug}`);
  if (!p) return null;
  return {
    title: `${p.title} — Case study by ${site.name}`,
    description: `${p.description} ${p.category} project by ${site.name}, creative developer.`,
    url: `${SITE_URL}${path}`,
    image: `${SITE_URL}/projects/${p.image}-1280.webp`,
  };
}

export function render(path: string) {
  return renderToString(<App path={path} />);
}
