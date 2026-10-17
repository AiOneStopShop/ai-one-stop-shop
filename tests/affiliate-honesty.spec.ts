import { test, expect } from '@playwright/test';

test('a tool without an affiliate row shows no Paid link text', async ({ page }) => {
  await page.goto('/personas/sarah', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('toolkit-slot').first()).toBeVisible();
  await expect(page.getByText('Paid link:')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^Visit / }).first()).toBeVisible();

  await page.goto('/budget?persona=sarah&budget=0', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('toolkit-slot').first()).toBeVisible();
  await expect(page.getByText('Paid link:')).toHaveCount(0);

  await page.goto('/tools/codex-cli', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Codex CLI' })).toBeVisible();
  await expect(page.getByText('Paid link:')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Visit Codex CLI/ })).toBeVisible();
});
