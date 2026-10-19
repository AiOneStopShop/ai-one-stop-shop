/**
 * Analytics consent: Vercel Web Analytics loads only after "Allow analytics", never on /admin,
 * and every page carries a nonce CSP without 'unsafe-inline' in script-src.
 * Needs a running server (PLAYWRIGHT_BASE_URL, default http://localhost:3100).
 */
import { test, expect, type Page } from '@playwright/test';

const analyticsScripts = (page: Page) =>
  page.locator('script[src*="/_vercel/insights/"], script[src*="va.vercel-scripts.com"], script[data-sdkn="@vercel/analytics"]');

test('default: banner offers a real choice and no analytics loads', async ({ page }) => {
  const res = await page.goto('/', { waitUntil: 'networkidle' });
  const csp = res?.headers()['content-security-policy'] ?? '';
  const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
  expect(scriptSrc).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
  expect(scriptSrc).not.toContain('unsafe-inline');

  const allow = page.getByRole('button', { name: 'Allow analytics' });
  const decline = page.getByRole('button', { name: 'No thanks' });
  await expect(allow).toBeVisible();
  await expect(decline).toBeVisible();
  for (const b of [allow, decline]) {
    const box = await b.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  await expect(analyticsScripts(page)).toHaveCount(0);
});

test('No thanks: banner closes, choice persists, analytics stays off', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'No thanks' }).click();
  await expect(page.getByRole('button', { name: 'Allow analytics' })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('cookieConsent'))).toBe('declined');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'No thanks' })).toHaveCount(0);
  await expect(analyticsScripts(page)).toHaveCount(0);
});

test('Allow analytics loads the analytics script; Cookie settings lets you change it', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' && /Content Security Policy/i.test(m.text())) errors.push(m.text()); });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Allow analytics' }).click();
  await expect(analyticsScripts(page).first()).toBeAttached({ timeout: 10_000 });
  expect(await page.evaluate(() => localStorage.getItem('cookieConsent'))).toBe('accepted');

  await page.goto('/privacy', { waitUntil: 'networkidle' });
  await expect(async () => {
    await page.getByRole('main').getByRole('button', { name: 'Cookie settings' }).click();
    await expect(page.getByRole('button', { name: 'No thanks' })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 10_000 });
  await page.getByRole('button', { name: 'No thanks' }).click();
  expect(await page.evaluate(() => localStorage.getItem('cookieConsent'))).toBe('declined');
  expect(errors, 'no CSP violations').toEqual([]);
});

test('old "Got it" value is not consent: banner shows again', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cookieConsent', 'dismissed'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'Allow analytics' })).toBeVisible();
  await expect(analyticsScripts(page)).toHaveCount(0);
});

test('never on /admin, even with consent', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cookieConsent', 'accepted'));
  await page.goto('/admin/login', { waitUntil: 'networkidle' });
  await expect(analyticsScripts(page)).toHaveCount(0);
});

test('cross-origin server action POST gets 403, not 500', async ({ request }) => {
  const res = await request.post('/', {
    headers: { Origin: 'https://evil.example', 'Next-Action': '0'.repeat(40), 'Content-Type': 'text/plain;charset=UTF-8' },
    data: '[]',
  });
  expect(res.status()).toBe(403);
});

test('both banner buttons share one identical visual style', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const styleOf = (name: string) =>
    page.getByRole('button', { name }).evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        className: el.className,
        color: s.color, background: s.backgroundColor, border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
        fontSize: s.fontSize, fontWeight: s.fontWeight, boxShadow: s.boxShadow, borderRadius: s.borderRadius,
        padding: s.padding, height: Math.round(r.height),
      };
    });
  expect(await styleOf('Allow analytics')).toEqual(await styleOf('No thanks'));
});

test.describe('Global Privacy Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true, configurable: true }));
  });

  test('GPC counts as No thanks: no prompt, no analytics', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'Allow analytics' })).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveClass(/has-cookie-banner/);
    await expect(analyticsScripts(page)).toHaveCount(0);
  });

  test('Cookie settings shows "off" under GPC, and an explicit Allow still wins', async ({ page }) => {
    await page.goto('/privacy', { waitUntil: 'networkidle' });
    await expect(async () => {
      await page.getByRole('main').getByRole('button', { name: 'Cookie settings' }).click();
      await expect(page.getByTestId('cookie-current-choice')).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await expect(page.getByTestId('cookie-current-choice')).toContainText('currently off');
    await expect(page.getByTestId('cookie-current-choice')).toContainText('Global Privacy Control');
    await page.getByRole('button', { name: 'Allow analytics' }).click();
    await expect(analyticsScripts(page).first()).toBeAttached({ timeout: 10_000 });
  });
});

test('reopened banner shows the current choice', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('cookieConsent', 'accepted'); sessionStorage.setItem('seeded', '1'); } });
  await page.goto('/privacy', { waitUntil: 'networkidle' });
  await expect(async () => {
    await page.getByRole('main').getByRole('button', { name: 'Cookie settings' }).click();
    await expect(page.getByTestId('cookie-current-choice')).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 10_000 });
  await expect(page.getByTestId('cookie-current-choice')).toContainText('currently on');
  await page.getByRole('button', { name: 'No thanks' }).click();
  await page.getByRole('main').getByRole('button', { name: 'Cookie settings' }).click();
  await expect(page.getByTestId('cookie-current-choice')).toContainText('currently off');
});

test('privacy page lists a contact email and newsletter wording', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByText(/Email us at\s*aionestopshop25@gmail\.com\./)).toBeVisible();
  const html = await page.content();
  expect(html).not.toContain('Contact information will be added');
  expect(html).not.toContain('Waitlist emails');
  expect(html).not.toContain('hello@aionestop.shop');
});
