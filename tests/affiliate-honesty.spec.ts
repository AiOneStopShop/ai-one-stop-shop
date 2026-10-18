import { test, expect } from '@playwright/test';

test('a tool without an affiliate row shows no Paid link text', async ({ page }) => {
  await page.goto('/personas/sarah', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('toolkit-slot').first()).toBeVisible();
  await expect(page.getByText('Paid link:')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^Visit / }).first()).toBeVisible();

  await page.goto('/budget?persona=sarah&budget=0', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('toolkit-slot').first()).toBeVisible();
  await expect(page.getByText('Paid link:')).toHaveCount(0);

  // Pick a real tool without a paid link from the API so the test does not depend on one slug.
  const api = await page.request.get('/api/v1/tools?limit=50');
  const { tools } = await api.json();
  const unpaid = (tools as any[]).find((t) => t.paid_link === false);
  expect(unpaid, 'expected at least one tool without a paid link').toBeTruthy();
  await page.goto(`/tools/${unpaid.slug}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: unpaid.name })).toBeVisible();
  await expect(page.getByText('Paid link:')).toHaveCount(0);
  const visit = page.getByRole('link', { name: /^Visit / }).first();
  if (await visit.count()) {
    await expect(visit).not.toHaveAttribute('rel', /sponsored/);
  }
});
