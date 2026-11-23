import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { SITE_URL } from './src/data';

// index.html writes the site address as __SITE_URL__ so a domain change is one edit (SITE_URL in src/data.ts).
const siteUrl = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml: html => html.replaceAll('__SITE_URL__', SITE_URL),
});

// Preact (via preact/compat) renders the same React components at a fraction of React's size.
export default defineConfig({
  plugins: [preact({ prerender: { enabled: false } }), siteUrl()],
  // Fixed at build time so the server-rendered footer and the hydrated one always agree.
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  resolve: { alias: { react: 'preact/compat', 'react-dom': 'preact/compat', 'react/jsx-runtime': 'preact/jsx-runtime' } },
  ssr: { noExternal: ['lucide-react'] },
});
