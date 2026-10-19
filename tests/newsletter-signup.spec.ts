import { test, expect } from '@playwright/test';

const thisYear = new Date().getFullYear();

async function fill(page: any, email: string, year: string) {
  const box = page.getByTestId('newsletter-signup').first();
  await box.getByLabel('Email', { exact: true }).fill(email);
  await box.getByLabel('Birth year').fill(year);
  return box;
}

test.describe('newsletter signup box', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/newsletter');
    await page.evaluate(() => localStorage.removeItem('aios_ns_block'));
    await page.reload();
  });

  test('field order and no age hint', async ({ page }) => {
    const box = page.getByTestId('newsletter-signup').first();
    await expect(box).not.toContainText('16');
    await expect(box.getByRole('checkbox')).not.toBeChecked();
    await box.getByLabel('Email', { exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(box.getByLabel('Birth year')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(box.getByRole('checkbox')).toBeFocused();
  });

  test('format errors for blank / bad / future / 1899 years', async ({ page }) => {
    for (const y of ['', '19o2', String(thisYear + 1), '1899']) {
      const box = await fill(page, 'a@b.co', y);
      await box.getByRole('button', { name: 'Subscribe' }).click();
      await expect(box.getByText('Enter your birth year as 4 digits.')).toBeVisible();
    }
  });

  test('age 15 blocks with no network request and sets flag', async ({ page }) => {
    const calls: string[] = [];
    page.on('request', (r) => { if (r.url().includes('/api/newsletter')) calls.push(r.url()); });
    const box = await fill(page, 'kid@example.com', String(thisYear - 15));
    await box.getByRole('button', { name: 'Subscribe' }).click();
    await expect(box.getByText('Thanks for your interest!')).toBeVisible();
    expect(calls).toHaveLength(0);
    const flag = await page.evaluate(() => localStorage.getItem('aios_ns_block'));
    expect(Number(flag)).toBeGreaterThan(0);
    await page.reload();
    await expect(page.getByText('Thanks for your interest!')).toBeVisible();
    await page.evaluate(() => localStorage.setItem('aios_ns_block', String(Date.now() - 86_400_001)));
    await page.reload();
    await expect(page.getByLabel('Birth year')).toBeVisible();
  });

  test('age 16 and 17 pass to consent check; payload has no birth year', async ({ page }) => {
    for (const age of [16, 17]) {
      const box = await fill(page, 'adult@example.com', String(thisYear - age));
      await box.getByRole('button', { name: 'Subscribe' }).click();
      await expect(box.getByText('Check the box above to get the newsletter.')).toBeVisible();
    }
    let body = '';
    await page.route('**/api/newsletter', async (route) => {
      body = route.request().postData() || '';
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });
    const box = page.getByTestId('newsletter-signup').first();
    await box.getByRole('checkbox').check();
    await box.getByRole('button', { name: 'Subscribe' }).click();
    await expect(page.getByText("You're signed up.")).toBeVisible();
    expect(body).not.toContain(String(thisYear - 17));
    expect(body).not.toMatch(/birth/i);
  });
});
