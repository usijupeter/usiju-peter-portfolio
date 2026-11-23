import { test, expect } from './fixtures';

const slugs = ['444-premium', 'mykaab', 'ubbcakes'];

for (const slug of slugs) {
  test(`case study /work/${slug} has its own title, image and share card`, async ({ page, request }) => {
    await page.goto(`/work/${slug}`);
    await expect(page).toHaveTitle(/Case study by Usiju Peter/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const shot = page.locator('.caseShot img');
    await expect(shot).toHaveAttribute('srcset', /640w.*1280w/);
    await expect.poll(() => shot.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toContain(`/og/${slug}.jpg`);
    expect((await request.get(new URL(og!).pathname)).status()).toBe(200);
    await expect(page.getByRole('link', { name: 'Visit live site' })).toHaveAttribute('target', '_blank');
  });
}

test('project cards open their case study, which links on to the next one', async ({ page }) => {
  await page.goto('/');
  await page.locator('.workTiles a.project').first().click();
  await expect(page).toHaveURL(/\/work\/444-premium$/);
  await page.getByRole('link', { name: /Next project/ }).click();
  await expect(page).toHaveURL(/\/work\/mykaab$/);
  await page.getByRole('link', { name: 'All projects' }).click();
  await expect(page).toHaveURL(/\/#work$/);
});
