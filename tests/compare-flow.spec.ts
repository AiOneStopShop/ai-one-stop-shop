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
      localStorage.setItem('cookieConsent', 'declined');
      localStorage.removeItem('compareList');
    });
  });

  test('can select 3 tools, click Compare (n), and land on compare URL', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    await page.getByRole('checkbox', { name: /^Compare / }).first().waitFor({ state: 'visible', timeout: 15000 });

    const labels = page.locator('label:has(input[type="checkbox"])').filter({ hasText: 'Compare' });
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

    await page.screenshot({ path: 'test-results/compare-step3-three-selected.png', fullPage: true });

    await compareButton.click();
    await page.waitForURL(/\/compare\?tools=/, { timeout: 10000 });

    const url = page.url();
    const toolsParam = new URL(url).searchParams.get('tools') || '';
    const urlSlugs = toolsParam.split(',').filter(Boolean);
    expect(urlSlugs).toHaveLength(3);
    expect(urlSlugs.sort()).toEqual([...slugs].sort());

    await page.screenshot({ path: 'test-results/compare-step4-compare-page.png', fullPage: true });
  });

  test('blocks a 4th tool at the 3-tool cap', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    const checkboxes = page.getByRole('checkbox', { name: /^Compare / });
    await checkboxes.first().waitFor({ state: 'visible', timeout: 15000 });

    expect(await checkboxes.count()).toBeGreaterThanOrEqual(4);

    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();
    await expect(page.locator('button:has-text("Compare (3)")')).toBeVisible({ timeout: 5000 });

    await checkboxes.nth(3).click();
    await expect(checkboxes.nth(3)).not.toBeChecked();
    await expect(page.locator('button:has-text("Compare (3)")')).toBeVisible();
    await expect(page.locator('button:has-text("Compare (4)")')).toHaveCount(0);

    const slugs = await page.evaluate(() => JSON.parse(localStorage.getItem('compareList') || '[]'));
    expect(slugs).toHaveLength(3);
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

    await page.screenshot({ path: 'test-results/tool-detail-compare-button.png', fullPage: true });

    await compareButton.click();
    await page.waitForURL(/\/compare\?tools=/, { timeout: 10000 });
    const slug = (href || '').split('tools=')[1];
    expect(page.url()).toContain(slug);

    await expect(page.locator('#compare-selector')).toBeVisible();
    await expect(page.getByLabel('Select tool 1')).toHaveValue(slug);
    await expect(page.locator('table')).toHaveCount(0);
  });

  test('keeps column order as selection order and ignores unknown slugs', async ({ page }) => {
    await page.goto('/compare?tools=not-a-real-tool,copy-ai,jasper-ai', { waitUntil: 'domcontentloaded' });
    const headers = await page.locator('table thead th').allTextContents();
    expect(headers.slice(1).map((name) => name.trim())).toEqual(['Copy.ai', 'Jasper AI']);
    await expect(page.locator('[role="status"]').first()).toHaveText('2 tools selected');
  });

  test('Change selection moves focus to the selector', async ({ page }) => {
    await page.goto('/compare?tools=copy-ai,jasper-ai', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: 'Change selection' }).click();
    await expect(page.getByLabel('Select tool 1')).toBeFocused();
  });
});

test.describe('Compare button vs cookie banner', () => {
  test('sticky Compare sits above the cookie buttons at 768px while the banner is visible', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.addInitScript(() => {
      localStorage.removeItem('cookieConsent');
      localStorage.removeItem('compareList');
    });

    await page.goto('/tools', { waitUntil: 'domcontentloaded' });

    const gotIt = page.getByRole('button', { name: 'Allow analytics' });
    await expect(gotIt).toBeVisible({ timeout: 10000 });
    await expect(page.locator('html')).toHaveClass(/has-cookie-banner/);

    const checkboxes = page.getByRole('checkbox', { name: /^Compare / });
    await checkboxes.first().waitFor({ state: 'visible', timeout: 15000 });
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    const compareBtn = page.locator('.sticky-compare-btn');
    await expect(compareBtn).toBeVisible({ timeout: 5000 });

    const compareBox = await compareBtn.boundingBox();
    const gotItBox = await gotIt.boundingBox();
    expect(compareBox).toBeTruthy();
    expect(gotItBox).toBeTruthy();

    const overlap = !(
      compareBox!.x + compareBox!.width <= gotItBox!.x ||
      gotItBox!.x + gotItBox!.width <= compareBox!.x ||
      compareBox!.y + compareBox!.height <= gotItBox!.y ||
      gotItBox!.y + gotItBox!.height <= compareBox!.y
    );
    expect(overlap, 'Compare button must not cover the cookie banner buttons').toBe(false);
    expect(compareBox!.y + compareBox!.height).toBeLessThanOrEqual(gotItBox!.y);
  });
});
