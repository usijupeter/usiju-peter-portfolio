import { test as base, expect } from '@playwright/test';

/**
 * Every test: block Vercel analytics (only exists on Vercel) and real FormSubmit calls,
 * and fail on any uncaught page error or console error.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.route('**/_vercel/**', r => r.fulfill({ status: 204, body: '' }));
    await page.route('https://formsubmit.co/**', r => r.abort());
    await use(errors);
    expect(errors, 'no JS errors on the page').toEqual([]);
  }, { auto: true }],
});
export { expect };
