import { test, expect } from './fixtures';

// Hosting behaviour from vercel.json (mirrored locally by scripts/serve-dist.mjs).
test.describe('hosting', () => {
  test.skip(({ isMobile }) => isMobile, 'server behaviour is the same on every device');

  test('unknown pages get the designed 404 page with a 404 status', async ({ page, errors }) => {
    const res = await page.goto('/this-page-does-not-exist');
    expect(res?.status()).toBe(404);
    errors.splice(0, errors.length, ...errors.filter(e => !e.includes('status of 404'))); // the expected 404 itself
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page wandered off.');
    await page.getByRole('link', { name: 'Back to the portfolio' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Usiju Peter');
  });

  test('security headers are sent', async ({ request }) => {
    const h = (await request.get('/')).headers();
    expect(h['content-security-policy']).toContain("script-src 'self'");
    expect(h['content-security-policy']).toContain('https://formsubmit.co');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['strict-transport-security']).toContain('max-age=');
  });

  test('old CV address redirects to the current one', async ({ request }) => {
    const res = await request.get('/cv/peter-usiju-cv.pdf', { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()['location']).toBe('/cv/usiju-peter-cv.pdf');
  });

  test('sitemap and robots.txt list the live site', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    for (const path of ['/', '/work/444-premium', '/work/mykaab', '/work/ubbcakes'])
      expect(sitemap).toContain(`<loc>https://usijupeter.vercel.app${path}</loc>`);
    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://usijupeter.vercel.app/sitemap.xml');
  });
});
