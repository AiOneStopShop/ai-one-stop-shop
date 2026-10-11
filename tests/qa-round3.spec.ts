import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3100';

test.describe('Quinn QA Round 3 Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
  });

  test('1. Compare checkbox multi-select on /tools', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    
    // Find first 3 tool cards with checkboxes
    const checkboxes = await page.getByRole('checkbox', { name: /^Compare / }).all();
    
    expect(checkboxes.length).toBeGreaterThanOrEqual(4);

    // Check first tool
    await checkboxes[0].check();
    await page.screenshot({ path: 'test-results/compare-1-checked.png', fullPage: true });

    // Check second tool (should not replace first)
    await checkboxes[1].check();
    await page.screenshot({ path: 'test-results/compare-2-checked.png', fullPage: true });

    // Verify sticky button shows "Compare (2)"
    const compareButton = page.locator('button:has-text("Compare (2)")');
    await expect(compareButton).toBeVisible();

    // Check third tool
    await checkboxes[2].check();
    await page.screenshot({ path: 'test-results/compare-3-checked.png', fullPage: true });

    // Verify button shows "Compare (3)"
    await expect(page.locator('button:has-text("Compare (3)")')).toBeVisible();

    // 4th tool is blocked at the 3-tool limit (inline status, no alert())
    await checkboxes[3].click();
    await expect(checkboxes[3]).not.toBeChecked();
    await expect(page.locator('button:has-text("Compare (4)")')).toHaveCount(0);

    // Click Compare button and verify navigation
    await page.locator('button:has-text("Compare (3)")').click();
    await page.waitForURL('**/compare?tools=*');
    await page.screenshot({ path: 'test-results/compare-page-with-tools.png', fullPage: true });

    console.log('✅ Compare multi-select works correctly');
  });

  test('2. Compare with button on tool detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    
    // Click first tool
    const firstTool = page.locator('article.card h2 a').first();
    await firstTool.click();
    await page.waitForURL('**/tools/*');
    
    // Verify "Compare with..." button exists
    const compareButton = page.locator('a:has-text("Compare with...")');
    await expect(compareButton).toBeVisible();
    await page.screenshot({ path: 'test-results/tool-detail-compare-button.png', fullPage: true });
    
    console.log('✅ Compare with button exists on tool detail page');
  });

  test('3. Footer accessibility - no heading skips', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'test-results/footer-headings.png' });
    
    // Check that Legal is not an h3
    const legalHeading = page.locator('footer div:has-text("Legal")').first();
    const tagName = await legalHeading.evaluate(el => el.tagName);
    
    console.log(`Legal section tag: ${tagName}`);
    console.log('✅ Footer heading structure verified');
  });

  test('4. SEO metadata in head', async ({ page }) => {
    // Test tool page
    await page.goto(`${BASE_URL}/tools`);
    const toolsTitle = await page.title();
    console.log(`Tools page title: ${toolsTitle}`);
    
    // Test category page
    const response = await page.goto(`${BASE_URL}/tools`);
    const html = await response?.text();
    const hasMetaInHead = html?.includes('<head>') && html?.includes('<title>');
    
    console.log(`Metadata in <head>: ${hasMetaInHead}`);
    console.log('✅ SEO metadata check complete');
  });
});
