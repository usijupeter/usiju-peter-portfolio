import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;
// The production build pre-renders the page into #root; hydrate it. In dev it is empty, so render fresh.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);

if (import.meta.env.PROD) { inject(); injectSpeedInsights(); }
