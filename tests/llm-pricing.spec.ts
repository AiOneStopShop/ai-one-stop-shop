import { test, expect } from '@playwright/test';

test.describe('LLM Pricing Comparison Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compare/llm-pricing');
  });

  test('should load and display page title', async ({ page }) => {
    await expect(page).toHaveTitle(/LLM API & Token Cost Comparison/);
    await expect(page.locator('h1')).toContainText('LLM API & Token Cost Comparison');
  });

  test('should display pricing disclaimer', async ({ page }) => {
    const disclaimer = page.locator('text=Pricing Disclaimer');
    await expect(disclaimer).toBeVisible();
    await expect(page.locator('text=October 13, 2026')).toBeVisible();
  });

  test('should have functional filters', async ({ page }) => {
    // Check that filters exist
    await expect(page.locator('#category-filter')).toBeVisible();
    await expect(page.locator('#provider-filter')).toBeVisible();
    await expect(page.locator('#search')).toBeVisible();

    // Filter by category
    await page.selectOption('#category-filter', 'api-model');
    await expect(page.locator('text=API Model')).toBeVisible();

    // Clear filters
    await page.click('text=Clear all filters');
    await expect(page.locator('#category-filter')).toHaveValue('all');
  });

  test('should display and sort pricing table', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check headers exist
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Provider")')).toBeVisible();
    await expect(page.locator('th:has-text("Category")')).toBeVisible();
    await expect(page.locator('th:has-text("Input $/1M")')).toBeVisible();
    await expect(page.locator('th:has-text("Output $/1M")')).toBeVisible();

    // Test sorting by clicking name header
    const nameHeader = page.locator('th button:has-text("Name")');
    await nameHeader.click();
    await expect(nameHeader).toContainText('↑');

    // Click again to reverse sort
    await nameHeader.click();
    await expect(nameHeader).toContainText('↓');
  });

  test('should have functional cost calculator', async ({ page }) => {
    // Check calculator exists
    await expect(page.locator('text=Monthly Cost Calculator')).toBeVisible();

    // Input tokens should be present
    const inputTokensField = page.locator('#input-tokens');
    await expect(inputTokensField).toBeVisible();
    await expect(inputTokensField).toHaveValue('1000000');

    // Output tokens should be present
    const outputTokensField = page.locator('#output-tokens');
    await expect(outputTokensField).toBeVisible();
    await expect(outputTokensField).toHaveValue('1000000');

    // Change values
    await inputTokensField.fill('2000000');
    await outputTokensField.fill('500000');

    // Verify estimated costs are shown in table
    await expect(page.locator('th:has-text("Est. Cost")')).toBeVisible();
  });

  test('should display pricing data rows', async ({ page }) => {
    // Wait for table to load
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

    // Should have multiple rows
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Check that at least one row has provider info
    await expect(page.locator('td:has-text("anthropic"), td:has-text("openai"), td:has-text("google")')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.locator('#search');
    
    // Search for specific provider
    await searchInput.fill('claude');
    
    // Should show filtered results
    const showingText = page.locator('text=/Showing \\d+ of \\d+ items/');
    await expect(showingText).toBeVisible();

    // Clear search
    await searchInput.clear();
  });

  test('should have breadcrumb navigation', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await expect(page.locator('a[href="/"]')).toBeVisible();
    await expect(page.locator('a[href="/compare"]')).toBeVisible();
  });

  test('should have links to related pages', async ({ page }) => {
    await expect(page.locator('a[href="/budget"]')).toBeVisible();
    await expect(page.locator('a[href="/compare"]')).toBeVisible();
  });

  test('should have accessible table with proper ARIA attributes', async ({ page }) => {
    const table = page.locator('table');
    
    // Check for caption
    await expect(table.locator('caption')).toBeVisible();

    // Check sortable headers have aria-sort
    const nameButton = page.locator('th button:has-text("Name")');
    await nameButton.click();
    await expect(nameButton).toHaveAttribute('aria-sort');
  });

  test('should display context window information', async ({ page }) => {
    await expect(page.locator('th:has-text("Context")')).toBeVisible();
  });

  test('should show source links to official pricing pages', async ({ page }) => {
    // Scroll to bottom where source links are
    await page.locator('text=All prices verified from').scrollIntoViewIfNeeded();
    
    await expect(page.locator('a[href*="openai.com"]')).toBeVisible();
    await expect(page.locator('a[href*="anthropic.com"]')).toBeVisible();
    await expect(page.locator('a[href*="google"]')).toBeVisible();
  });

  test('should handle category badge display', async ({ page }) => {
    // Check for category badges in table
    const badges = page.locator('span:has-text("API Model"), span:has-text("Consumer Plan"), span:has-text("Local/Open-Source")');
    await expect(badges.first()).toBeVisible();
  });

  test('should display free tier information', async ({ page }) => {
    // Look for free tier notes in the table
    await expect(page.locator('text=/Free:/i').first()).toBeVisible({ timeout: 5000 });
  });
});
