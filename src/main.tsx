import { hydrate, render } from 'preact';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root')!;
const app = <App path={location.pathname} />;
// Production pages are pre-rendered into #root; hydrate them. In dev #root is empty, so render fresh.
if (root.firstElementChild) hydrate(app, root);
else render(app, root);
// Tells theme.js the app is running, so it keeps the scroll-reveal styles (see the safety net there).
document.documentElement.setAttribute('data-app', '');

if (import.meta.env.PROD) {
  // Analytics load after the page is idle so they never compete with first paint.
  const start = () => { inject(); injectSpeedInsights(); };
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 4000 });
  else setTimeout(start, 2000);
}
