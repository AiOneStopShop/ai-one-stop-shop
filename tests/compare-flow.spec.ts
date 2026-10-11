import { test, expect } from '@playwright/test';

test.describe('Compare Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });

    await page.addInitScript(() => {
      localStorage.setItem('cookieConsent', 'accepted');
      localStorage.removeItem('compareList');
    });
  });

  test('can select 3 tools, click Compare (n), and land on compare URL', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="checkbox"][aria-label^="Compare"]').first().waitFor({ state: 'visible', timeout: 15000 });

    const labels = page.locator('label:has(input[aria-label^="Compare"])');
    const count = await labels.count();
    expect(count).toBeGreaterThanOrEqual(3);

    await labels.nth(0).click();
    await expect(page.locator('button:has-text("Compare (1)")')).toBeVisible({ timeout: 5000 });

    await labels.nth(1).click();
    await expect(page.locator('button:has-text("Compare (2)")')).toBeVisible({ timeout: 5000 });

    await labels.nth(2).click();
    const compareButton = page.locator('button:has-text("Compare (3)")');
    await expect(compareButton).toBeVisible({ timeout: 5000 });

    const slugs = await page.evaluate(() => JSON.parse(localStorage.getItem('compareList') || '[]'));
    expect(slugs).toHaveLength(3);

    await page.screenshot({ path: 'docs/screenshots/compare-step3-three-selected.png', fullPage: true });

    await compareButton.click();
    await page.waitForURL(/\/compare\?tools=/, { timeout: 10000 });

    const url = page.url();
    const toolsParam = new URL(url).searchParams.get('tools') || '';
    const urlSlugs = toolsParam.split(',').filter(Boolean);
    expect(urlSlugs).toHaveLength(3);
    expect(urlSlugs.sort()).toEqual([...slugs].sort());

    await page.screenshot({ path: 'docs/screenshots/compare-step4-compare-page.png', fullPage: true });
  });

  test('compare with button exists on tool page and pre-fills that tool', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    const firstToolLink = page.locator('article.card h2 a').first();
    await firstToolLink.waitFor({ state: 'visible', timeout: 15000 });
    await firstToolLink.click();
    await page.waitForURL(/\/tools\/[^/]+/, { timeout: 10000 });

    const compareButton = page.locator('a:has-text("Compare with...")');
    await expect(compareButton).toBeVisible({ timeout: 10000 });

    const href = await compareButton.getAttribute('href');
    expect(href).toMatch(/^\/compare\?tools=[^&]+$/);

    await page.screenshot({ path: 'docs/screenshots/tool-detail-compare-button.png', fullPage: true });

    await compareButton.click();
    await page.waitForURL(/\/compare\?tools=/, { timeout: 10000 });
    const slug = (href || '').split('tools=')[1];
    expect(page.url()).toContain(slug);
  });
});
