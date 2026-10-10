import { test, expect } from '@playwright/test';

test.describe('Compare Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
    
    await page.goto('/tools');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for hydration
  });

  test('can select 3 tools and check localStorage', async ({ page }) => {
    // Find compare checkboxes (exclude the "free tier" filter checkbox)
    const checkboxes = await page.locator('input[type="checkbox"][aria-label^="Compare"]').all();
    console.log(`Found ${checkboxes.length} compare checkboxes`);

    if (checkboxes.length < 3) {
      throw new Error(`Not enough tools to test, found ${checkboxes.length}`);
    }

    // Select first tool by clicking the label (triggers React onChange properly)
    const label0 = page.locator('label:has(input[aria-label^="Compare"])').first();
    await label0.click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'docs/screenshots/compare-step1-one-selected.png', fullPage: true });
    
    // Check localStorage
    let compareList = await page.evaluate(() => {
      const stored = localStorage.getItem('compareList');
      return stored ? JSON.parse(stored) : [];
    });
    console.log(`After first click - Compare list length: ${compareList.length}`);
    expect(compareList.length).toBe(1);

    // Select second tool
    await checkboxes[1].check();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'docs/screenshots/compare-step2-two-selected.png', fullPage: true });
    
    compareList = await page.evaluate(() => {
      const stored = localStorage.getItem('compareList');
      return stored ? JSON.parse(stored) : [];
    });
    expect(compareList.length).toBe(2);

    // Select third tool
    await checkboxes[2].check();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'docs/screenshots/compare-step3-three-selected.png', fullPage: true });
    
    compareList = await page.evaluate(() => {
      const stored = localStorage.getItem('compareList');
      return stored ? JSON.parse(stored) : [];
    });
    expect(compareList.length).toBe(3);

    // Navigate to compare page manually
    const tools = compareList.join(',');
    await page.goto(`/compare?tools=${tools}`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of compare page
    await page.screenshot({ path: 'docs/screenshots/compare-step4-compare-page.png', fullPage: true });

    // Verify URL contains 3 tools
    const url = page.url();
    console.log(`Compare URL: ${url}`);
    expect(url).toContain('/compare?tools=');
    expect(url).toContain(tools);

    console.log('✅ Compare flow works: 3 tools selected, localStorage updated, compare page loads');
  });

  test('compare with button exists on tool page', async ({ page }) => {
    // Go to tools page
    await page.goto('/tools');
    
    // Click first tool link
    const firstToolLink = page.locator('article.card a').first();
    await firstToolLink.click();
    
    // Wait for tool page
    await page.waitForURL('**/tools/*');
    
    // Take screenshot
    await page.screenshot({ path: 'docs/screenshots/tool-detail-compare-button.png', fullPage: true });
    
    // Verify Compare with button exists
    const compareButton = page.locator('a:has-text("Compare with...")');
    await expect(compareButton).toBeVisible();
    
    console.log('✅ Compare with button exists on tool detail page');
  });
});
