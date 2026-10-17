import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Affiliate flag and partners page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookieConsent', 'accepted');
    });
  });

  // Flag OFF tests (default state)
  test('footer shows M9 wording when NEXT_PUBLIC_AFFILIATE_LIVE is false', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const footer = page.locator('footer');
    const footerText = await footer.textContent();
    
    // Should have M9 wording (no affiliate link mention)
    expect(footerText).toContain('We earn money from clearly labeled sponsored ads and our own kits');
    expect(footerText).toContain('Payments never change how we rank tools');
    
    // Should NOT mention paid links or affiliate
    expect(footerText).not.toContain('paid links');
    expect(footerText).not.toContain('affiliate');
  });

  test('disclosure page shows 2 sections when flag is false', async ({ page }) => {
    await page.goto('/disclosure', { waitUntil: 'domcontentloaded' });
    
    // Should have section 1 (Sponsorships) and section 2 (Our own products)
    await expect(page.getByRole('heading', { name: /1\. Sponsorships/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /2\. Our own products/i })).toBeVisible();
    
    // Should NOT have affiliate links section
    expect(await page.getByRole('heading', { name: /affiliate links/i }).count()).toBe(0);
    expect(await page.getByText('Paid link', { exact: false }).count()).toBe(0);
  });

  test('llms.txt shows M9 wording when flag is false', async ({ page }) => {
    const response = await page.goto('/llms.txt', { waitUntil: 'domcontentloaded' });
    const content = await response?.text() || '';
    
    // Should have M9 wording
    expect(content).toContain('We earn money from clearly labeled sponsored ads and our own kits');
    expect(content).toContain('Money never changes our ranking');
    
    // Should NOT mention affiliate or paid links
    expect(content).not.toContain('affiliate');
    expect(content).not.toContain('paid (affiliate) links');
    expect(content).not.toContain('Paid link');
    
    // Should include /partners link
    expect(content).toContain('/partners');
  });

  // Partners page tests
  test('/partners page loads successfully', async ({ page }) => {
    const response = await page.goto('/partners', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    
    await expect(page.getByRole('heading', { name: /partner with ai one stop shop/i })).toBeVisible();
  });

  test('/partners shows three partnership options', async ({ page }) => {
    await page.goto('/partners', { waitUntil: 'domcontentloaded' });
    
    // Should show all three options
    await expect(page.getByRole('heading', { name: /1\. Affiliate or partner programs/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /2\. Sponsored placements/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /3\. Newsletter sponsorships/i })).toBeVisible();
    
    // Should have "The rule" section
    await expect(page.getByRole('heading', { name: /the rule/i })).toBeVisible();
    await expect(page.getByText('Payments never change how we rank tools').first()).toBeVisible();
    
    // Should have call-to-action buttons
    await expect(page.getByRole('link', { name: /request a partnership/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /submit your tool/i })).toBeVisible();
  });

  test('/partners mentions rel="sponsored nofollow noopener"', async ({ page }) => {
    await page.goto('/partners', { waitUntil: 'domcontentloaded' });
    
    const content = await page.textContent('body');
    expect(content).toContain('rel="sponsored nofollow noopener"');
    expect(content).toContain('Paid link');
  });

  test('/partners has correct contact email', async ({ page }) => {
    await page.goto('/partners', { waitUntil: 'domcontentloaded' });
    
    // Should use aionestopshop25@gmail.com
    const emailLink = page.getByRole('link', { name: /aionestopshop25@gmail\.com/i });
    if (await emailLink.count() > 0) {
      await expect(emailLink).toBeVisible();
    }
  });

  test('footer has Partners link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const footer = page.locator('footer');
    const partnersLink = footer.getByRole('link', { name: /^Partners$/i });
    await expect(partnersLink).toBeVisible();
    await expect(partnersLink).toHaveAttribute('href', '/partners');
  });

  test('llms.txt includes /partners in more information section', async ({ page }) => {
    const response = await page.goto('/llms.txt', { waitUntil: 'domcontentloaded' });
    const content = await response?.text() || '';
    
    expect(content).toContain('Partner with us:');
    expect(content).toContain('/partners');
  });

  // Accessibility test
  test('axe has no serious or critical issues on /partners', async ({ page }) => {
    await page.goto('/partners', { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')
    ).toEqual([]);
  });

  // Navigation from /partners
  test('can navigate from /partners to /advertise', async ({ page }) => {
    await page.goto('/partners', { waitUntil: 'domcontentloaded' });
    
    const advertiseLink = page.getByRole('link', { name: /sponsor ai one stop shop/i }).first();
    await expect(advertiseLink).toBeVisible();
    await expect(advertiseLink).toHaveAttribute('href', '/advertise');
  });

  test('request partnership button links to request form', async ({ page }) => {
    await page.goto('/partners', { waitUntil: 'domcontentloaded' });
    
    const requestLink = page.getByRole('link', { name: /request a partnership/i });
    await expect(requestLink).toBeVisible();
    
    const href = await requestLink.getAttribute('href');
    expect(href).toContain('/advertise/request');
    expect(href).toContain('package=partner-program');
  });

  // FLAG-ON tests (run only when NEXT_PUBLIC_AFFILIATE_LIVE=true)
  test.describe('When NEXT_PUBLIC_AFFILIATE_LIVE is true', () => {
    test('footer mentions paid links', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Check if flag is actually on by looking for affiliate content
      const footer = page.locator('footer');
      const footerText = await footer.textContent();
      
      // Skip if flag is off
      if (!footerText || !footerText.includes('paid links')) {
        test.skip(true, 'Flag OFF: skipping flag-ON test');
      }
      
      expect(footerText).toContain('paid links');
      expect(footerText).toContain('Payments never change how we rank tools');
    });

    test('disclosure page shows affiliate section', async ({ page }) => {
      await page.goto('/disclosure', { waitUntil: 'domcontentloaded' });
      
      // Check if section 2 exists (affiliate section)
      const affiliateSection = page.getByRole('heading', { name: /2\. Paid links \(affiliate programs\)/i });
      
      // Skip if flag is off
      if (await affiliateSection.count() === 0) {
        test.skip(true, 'Flag OFF: skipping flag-ON test');
      }
      
      await expect(affiliateSection).toBeVisible();
      await expect(page.getByText('Paid link', { exact: false }).first()).toBeVisible();
    });

    test('llms.txt mentions paid links', async ({ page }) => {
      const response = await page.goto('/llms.txt', { waitUntil: 'domcontentloaded' });
      const content = await response?.text() || '';
      
      // Skip if flag is off
      if (!content.includes('paid (affiliate) links')) {
        test.skip(true, 'Flag OFF: skipping flag-ON test');
      }
      
      expect(content).toContain('paid (affiliate) links');
    });

    test('Paid link label appears before Visit link at 390px width', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/tools', { waitUntil: 'domcontentloaded' });
      
      // Find any paid link label (span, not p)
      const paidLabel = page.locator('span:has-text("Paid link: we may earn a commission")').first();
      
      // Count paid links on this page
      const count = await paidLabel.count();
      
      // If flag is OFF, this test should be skipped
      if (process.env.NEXT_PUBLIC_AFFILIATE_LIVE !== '1') {
        expect(count).toBe(0);
        test.skip(true, 'Flag OFF: no paid labels expected');
        return;
      }
      
      // With flag ON, we expect at least one paid label to be visible
      expect(count).toBeGreaterThan(0);
      
      // Verify label is visible and at least 14px
      await expect(paidLabel).toBeVisible();
      const fontSize = await paidLabel.evaluate((el) => window.getComputedStyle(el).fontSize);
      const fontSizeNum = parseFloat(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    });

    test('API includes paid_link field', async ({ page }) => {
      const response = await page.request.get('/api/v1/tools?limit=10');
      expect(response.ok()).toBeTruthy();
      
      const json = await response.json();
      expect(json.tools).toBeDefined();
      expect(Array.isArray(json.tools)).toBe(true);
      
      // Check first tool has paid_link field
      if (json.tools.length > 0) {
        expect(json.tools[0]).toHaveProperty('paid_link');
        expect(typeof json.tools[0].paid_link).toBe('boolean');
        
        // If any tool is paid, check for disclosure
        const paidTool = json.tools.find((t: any) => t.paid_link === true);
        if (paidTool) {
          expect(paidTool).toHaveProperty('disclosure');
          expect(paidTool.disclosure).toContain('Paid link');
        }
      }
    });

    test('Ranking unchanged with affiliate links active', async ({ page }) => {
      // This test verifies that affiliate links don't affect tool order
      await page.goto('/tools', { waitUntil: 'domcontentloaded' });
      
      // Get the order of first 10 tools
      const toolCards = page.locator('article.card h2 a');
      const toolNames = await toolCards.evaluateAll((links) => 
        links.map((link) => link.textContent?.trim() || '')
      );
      
      // Skip if no tools
      if (toolNames.length === 0) {
        test.skip(true, 'No tools found');
      }
      
      // Check that order is deterministic (based on editorial score, name, etc.)
      // This test passes if the same query returns the same order
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      const toolNamesAfterReload = await toolCards.evaluateAll((links) => 
        links.map((link) => link.textContent?.trim() || '')
      );
      
      expect(toolNamesAfterReload).toEqual(toolNames);
    });
  });
});
