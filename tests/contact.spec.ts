import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

const form = (page: Page) => page.locator('form.contactForm');
const fill = async (page: Page, v: { name?: string; email?: string; message?: string }) => {
  if (v.name !== undefined) await page.getByLabel('Name').fill(v.name);
  if (v.email !== undefined) await page.getByLabel('Email').fill(v.email);
  if (v.message !== undefined) await page.getByLabel('Message').fill(v.message);
};
const send = (page: Page) => form(page).getByRole('button', { name: /Send message/ }).click();
const good = { name: 'Test Person', email: 'test@example.com', message: 'Hello, I would like a website.' };

test.beforeEach(async ({ page }) => {
  await page.clock.install(); // lets tests jump past the 3 s anti-bot time trap
  await page.goto('/#contact');
});

test('empty form shows an error on every field and focuses the first', async ({ page }) => {
  await send(page);
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByText('Please enter your email address.')).toBeVisible();
  await expect(page.getByText('Please tell me a little about your project.')).toBeVisible();
  await expect(page.getByLabel('Name')).toBeFocused();
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-describedby', 'f-name-error');
});

test('invalid email is rejected and the error clears when typing', async ({ page }) => {
  await fill(page, { ...good, email: 'not-an-email' });
  await send(page);
  await expect(page.getByText(/valid email address/)).toBeVisible();
  await expect(page.getByLabel('Email')).toBeFocused();
  await page.getByLabel('Email').pressSequentially('x');
  await expect(page.getByText(/valid email address/)).toBeHidden();
});

test('a valid message is sent to FormSubmit and the form resets', async ({ page }) => {
  let body: Record<string, string> | undefined;
  await page.route('https://formsubmit.co/ajax/**', async r => { body = r.request().postDataJSON(); await r.fulfill({ json: { success: 'true' } }); });
  await page.clock.fastForward(5000);
  await fill(page, good);
  await send(page);
  await expect(page.getByRole('status')).toHaveText(/message is on its way/);
  expect(body).toMatchObject({ name: good.name, email: good.email, message: good.message, _replyto: good.email });
  await expect(page.getByLabel('Name')).toHaveValue('');
});

test('a server failure shows the fallback message and keeps the text', async ({ page, errors }) => {
  await page.route('https://formsubmit.co/ajax/**', r => r.fulfill({ status: 500, body: 'error' }));
  await page.clock.fastForward(5000);
  await fill(page, good);
  await send(page);
  await expect(page.getByRole('status')).toHaveText(/couldn’t be sent/);
  await expect(page.getByLabel('Message')).toHaveValue(good.message);
  // the faked 500 is logged by the browser; that one is expected, anything else still fails the test
  errors.splice(0, errors.length, ...errors.filter(e => !e.includes('status of 500')));
});

test('bots are not sent: honeypot filled', async ({ page }) => {
  let sent = false;
  await page.route('https://formsubmit.co/**', r => { sent = true; return r.abort(); });
  await page.clock.fastForward(5000);
  await fill(page, good);
  await page.locator('input[name="_honey"]').evaluate((el: HTMLInputElement) => { el.value = 'spam'; });
  await send(page);
  await expect(page.getByRole('status')).toHaveText('');
  expect(sent).toBe(false);
});

test('bots are not sent: submitted within 3 seconds, but told it worked', async ({ page }) => {
  let sent = false;
  await page.route('https://formsubmit.co/**', r => { sent = true; return r.abort(); });
  await fill(page, good);
  await send(page);
  await expect(page.getByRole('status')).toHaveText(/message is on its way/);
  expect(sent).toBe(false);
});
