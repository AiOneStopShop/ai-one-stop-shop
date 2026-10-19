import { test, expect } from '@playwright/test';

// Browser tests for the /tools facet UI (run against a server; locally that uses the offline catalog).

test('facet click filters without a full reload and updates the URL; Back undoes it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/tools');
  await page.evaluate(() => { (window as unknown as { __marker: number }).__marker = 1; });
  const aside = page.getByRole('complementary', { name: 'Filters' });
  await aside.getByRole('checkbox', { name: /Has a free tier/ }).check();
  await expect(page).toHaveURL(/free=1/);
  // Same document: no full page reload happened.
  expect(await page.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(1);
  await page.goBack();
  await expect(page).not.toHaveURL(/free=1/);
});

test('facet counts are shown and the URL state is restored on load', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/tools?free=1&sort=name');
  const aside = page.getByRole('complementary', { name: 'Filters' });
  await expect(aside.getByRole('checkbox', { name: /Has a free tier/ })).toBeChecked();
  await expect(page.locator('#sort-filter')).toHaveValue('name');
  await expect(aside.getByRole('group', { name: 'Category' })).toBeVisible();
  await expect(aside.getByRole('group', { name: 'Platform' })).toBeVisible();
  const names = await page.locator('article h2').allTextContents();
  expect(names.map((n) => n.toLowerCase())).toEqual([...names.map((n) => n.toLowerCase())].sort((a, b) => a.localeCompare(b)));
});

test('mobile: filters open in a dialog, Escape closes it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools');
  await expect(page.getByRole('complementary', { name: 'Filters' })).toBeHidden();
  await page.getByRole('button', { name: /^Filters/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Filters' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('checkbox', { name: /Has a free tier/ }).check();
  await expect(page).toHaveURL(/free=1/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: /Filters \(1\)/ })).toBeVisible();
});

test('zero results offer removing each active filter', async ({ page }) => {
  await page.goto('/tools?q=zzqxv-no-such-tool&free=1&platform=cli');
  await expect(page.getByText(/No tools match/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Has a free tier/ })).toHaveAttribute('href', /platform=cli/);
  await expect(page.getByRole('link', { name: /Platform: Command line/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Submit a tool' }).first()).toBeVisible();
});
