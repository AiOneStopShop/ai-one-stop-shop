import { test, expect } from '@playwright/test';

test(' /tools hydrates without CSP or MIME errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedAssets: string[] = [];
  const cspViolations: string[] = [];

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

  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      const detail = `${event.violatedDirective} ${event.blockedURI} (${event.effectiveDirective})`;
      (window as any).__cspViolations = (window as any).__cspViolations || [];
      (window as any).__cspViolations.push(detail);
    });
  });

  await page.goto('/tools', { waitUntil: 'networkidle' });

  const checkbox = page.locator('input[type="checkbox"][aria-label^="Compare"]').first();
  await expect(checkbox).toBeVisible({ timeout: 15000 });

  const reported = await page.evaluate(() => (window as any).__cspViolations || []);
  cspViolations.push(...reported);

  expect(failedAssets, `static assets failed:\n${failedAssets.join('\n')}`).toEqual([]);
  expect(cspViolations, `CSP violations:\n${cspViolations.join('\n')}`).toEqual([]);
  const blocking = [...consoleErrors, ...pageErrors].filter(msg =>
    /Refused to|CSP|Content Security Policy|MIME type|400 \(Bad Request\)/i.test(msg)
  );
  expect(blocking, `hydration blockers:\n${blocking.join('\n')}`).toEqual([]);
});
