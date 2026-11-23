import { defineConfig, devices } from '@playwright/test';

// Tests run against the production build (`npm run build` first) served the way Vercel serves it (scripts/serve-dist.mjs: clean URLs, 404 page, vercel.json headers incl. CSP).
// Locally they use the installed Microsoft Edge, so no browser download is needed; CI installs Chromium.
const ci = !!process.env.CI;
const browser = ci ? {} : { channel: 'msedge' as const };

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  workers: ci ? 2 : 1, // one worker keeps the 8 GB laptop responsive
  retries: ci ? 1 : 0,
  forbidOnly: ci,
  reporter: ci ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure', ...browser },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...browser } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...browser } },
  ],
  webServer: { command: 'node scripts/serve-dist.mjs 4173', url: 'http://localhost:4173', reuseExistingServer: !ci, timeout: 60_000 },
});
