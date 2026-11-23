import { test, expect } from './fixtures';

test('home page renders the hero, projects, about and contact', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Usiju Peter/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Usiju Peter');
  await expect(page.locator('html')).toHaveAttribute('data-app', '');
  for (const name of ['Selected projects', 'A little more about the person behind the pixels.', 'Start a conversation.'])
    await expect(page.getByRole('heading', { name })).toBeAttached();
  await expect(page.locator('.workTiles a.project')).toHaveCount(3);
});

test('scroll-reveal sections become visible when scrolled into view', async ({ page }) => {
  await page.goto('/');
  const about = page.locator('#about .reveal').first();
  await about.scrollIntoViewIfNeeded();
  await expect(about).toHaveClass(/\bin\b/);
  await expect(about).toHaveCSS('opacity', '1');
});

test('content stays visible when the JavaScript bundle fails to load', async ({ page, errors }) => {
  await page.route('**/assets/*.js', r => r.abort());
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/\bjs\b/);
  await expect(page.locator('#about .reveal').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('#contact .reveal').first()).toHaveCSS('opacity', '1');
  errors.length = 0; // the blocked bundle itself logs a load error, which is the point of this test
});

test('theme toggle switches mode and is remembered after reload', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop header toggle; the mobile menu toggle is covered in nav.spec');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).not.toHaveClass(/\bdark\b/);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(html).toHaveClass(/\bdark\b/);
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  await page.reload();
  await expect(html).toHaveClass(/\bdark\b/);
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
});

test('system dark mode is used when nothing is saved', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
});

test('no horizontal scrolling at common widths', async ({ page, isMobile }) => {
  test.skip(isMobile, 'widths are set explicitly');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/work/mykaab']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test('CV link points to the PDF', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('a', { hasText: 'View CV' }).first().getAttribute('href');
  expect(href).toBe('/cv/usiju-peter-cv.pdf');
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('pdf');
});
