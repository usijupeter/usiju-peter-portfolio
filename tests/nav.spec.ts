import { test, expect } from './fixtures';

test.describe('desktop navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('section links scroll to their section and mark it current', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator('#about')).toBeInViewport();
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'true');
  });

  test('skip link is the first tab stop and moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  test('opens, traps focus, closes with Escape and returns focus', async ({ page }) => {
    await page.goto('/');
    const opener = page.getByRole('button', { name: 'Open menu' });
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await expect(menu).toBeHidden();
    await opener.click();
    await expect(menu).toBeVisible();
    await expect(opener).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused();
    // background is unreachable while the dialog is open
    expect(await page.locator('main').evaluate(el => (el as HTMLElement).inert)).toBe(true);
    // Tab from the last item wraps to the first; Shift+Tab from the first wraps to the last
    const items = menu.locator('a, button');
    await items.last().focus();
    await page.keyboard.press('Tab');
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(items.last()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(opener).toBeFocused();
    expect(await page.locator('main').evaluate(el => (el as HTMLElement).inert)).toBe(false);
  });

  test('a menu link closes the menu and goes to the section', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Work' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
    await expect(page).toHaveURL(/#work$/);
  });

  test('theme can be switched from the menu', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('button', { name: /Dark mode/ }).click();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  });
});
