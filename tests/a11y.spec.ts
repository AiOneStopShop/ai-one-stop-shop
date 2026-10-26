import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/tools', '/categories', '/finder', '/submit', '/compare', '/personas', '/budget', '/admin/login', '/guides', '/guides/best-ai-tools-for-teachers'];

test.describe('Dolly a11y routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookieConsent', 'declined');
    });
  });

  for (const route of routes) {
    test(`axe has no serious or critical issues on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
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
  }

  test('skip link targets focusable main', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip.locator('xpath=ancestor::nav')).toHaveAttribute('aria-label', 'Skip links');
    await skip.focus();
    await skip.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();
  });

  test('axe region rule passes on the skip link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page }).withRules(['region']).analyze();
    expect(results.violations, results.violations.map((v) => v.help).join('\n')).toEqual([]);
  });

  test('/tools renders one card and one compare checkbox per tool', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    await page.getByRole('checkbox', { name: /^Compare / }).first().waitFor({ state: 'visible', timeout: 15000 });

    const cards = page.locator('article.card');
    const checkboxes = page.getByRole('checkbox', { name: /^Compare / });
    const cardCount = await cards.count();
    const checkboxCount = await checkboxes.count();

    expect(cardCount).toBeGreaterThan(0);
    expect(checkboxCount).toBe(cardCount);
  });
});
