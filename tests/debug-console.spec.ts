import { test, expect } from '@playwright/test';

test(' /tools hydrates without CSP or MIME errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedAssets: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log('PAGE ERROR:', error.message);
  });
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/_next/static') && response.status() >= 400) {
      failedAssets.push(`${response.status()} ${url}`);
      console.log('FAILED ASSET:', response.status(), url);
    }
  });

  await page.goto('/tools', { waitUntil: 'networkidle' });

  const checkbox = page.locator('input[type="checkbox"][aria-label^="Compare"]').first();
  await expect(checkbox).toBeVisible({ timeout: 15000 });

  expect(failedAssets, `static assets failed:\n${failedAssets.join('\n')}`).toEqual([]);
  const blocking = [...consoleErrors, ...pageErrors].filter(msg =>
    /Refused to|CSP|Content Security Policy|MIME type|400 \(Bad Request\)/i.test(msg)
  );
  expect(blocking, `hydration blockers:\n${blocking.join('\n')}`).toEqual([]);
});
