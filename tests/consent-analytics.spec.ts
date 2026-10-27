/**
 * Site analytics (Lexi legal check, Oct 2026): cookieless Vercel Web Analytics loads for
 * everyone without a consent prompt, writes nothing to cookies, localStorage or
 * sessionStorage, never loads on /admin; nonce CSP stays intact; privacy page wording.
 * Needs a running server (PLAYWRIGHT_BASE_URL, default http://localhost:3100).
 */
import { test, expect, type Page } from '@playwright/test';

const analyticsScripts = (page: Page) =>
  page.locator('script[src*="/_vercel/insights/"], script[src*="va.vercel-scripts.com"], script[data-sdkn="@vercel/analytics"]');

async function storageSnapshot(page: Page) {
  return page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    documentCookie: document.cookie,
  }));
}

test('analytics loads without consent and sets no cookies or storage', async ({ page, context }) => {
  const res = await page.goto('/', { waitUntil: 'networkidle' });
  const csp = res?.headers()['content-security-policy'] ?? '';
  const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
  expect(scriptSrc).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
  expect(scriptSrc).not.toContain('unsafe-inline');

  await expect(analyticsScripts(page).first()).toBeAttached({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Allow analytics' })).toHaveCount(0);

  await page.goto('/tools', { waitUntil: 'networkidle' });
  await page.goto('/privacy', { waitUntil: 'networkidle' });
  const snap = await storageSnapshot(page);
  expect(snap.local).toEqual([]);
  expect(snap.session).toEqual([]);
  expect(snap.documentCookie).toBe('');
  expect(await context.cookies()).toEqual([]);
});

test('Global Privacy Control: no prompt, cookieless analytics still loads, nothing stored', async ({ page, context }) => {
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true, configurable: true }));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'Allow analytics' })).toHaveCount(0);
  await expect(analyticsScripts(page).first()).toBeAttached({ timeout: 10_000 });
  expect((await storageSnapshot(page)).local).toEqual([]);
  expect(await context.cookies()).toEqual([]);
});

test('never on /admin', async ({ page }) => {
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

test('privacy page: site analytics section, contact email, no forbidden words', async ({ page }) => {
  await page.goto('/privacy');
  const section = page.locator('#site-analytics');
  await expect(section.getByRole('heading', { name: 'Site analytics' })).toBeVisible();
  await expect(section).toContainText('We use Vercel Web Analytics, which counts page views, referring sites and general device and country information without cookies and without storing IP addresses.');
  await expect(section).toContainText('campaign tags in links (UTM codes)');
  await expect(section).toContainText('we rely on our legitimate interest');
  await expect(section).toContainText("we'll ask for your consent first");
  await expect(page.getByText(/Email us at\s*aionestopshop25@gmail\.com\./)).toBeVisible();
  const text = (await page.locator('main').innerText()).toLowerCase();
  expect(text).not.toContain('anonymous');
  expect(text).not.toContain('hashed ip');
  expect(text).not.toContain('user-agent string');
  const html = await page.content();
  expect(html).not.toContain('Contact information will be added');
  expect(html).not.toContain('hello@aionestop.shop');
});
