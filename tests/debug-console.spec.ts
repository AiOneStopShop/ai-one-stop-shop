import { test } from '@playwright/test';

test('capture console and CSP errors on /tools', async ({ page }) => {
  const consoleMessages: string[] = [];
  const cspViolations: string[] = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    console.log(`CONSOLE [${msg.type()}]:`, text);
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
    consoleMessages.push(`[error] ${error.message}`);
  });

  // Listen for CSP violations
  page.on('response', response => {
    const csp = response.headers()['content-security-policy'];
    if (csp) {
      console.log('CSP Header:', csp);
    }
  });

  await page.goto('http://localhost:3100/tools', { waitUntil: 'networkidle' });
  
  // Wait a bit for hydration
  await page.waitForTimeout(3000);
  
  // Check if checkboxes are interactive
  const checkboxes = await page.locator('input[type="checkbox"][aria-label^="Compare"]').count();
  console.log(`Found ${checkboxes} compare checkboxes`);
  
  if (checkboxes > 0) {
    // Try to click one
    await page.locator('input[type="checkbox"][aria-label^="Compare"]').first().click();
    await page.waitForTimeout(1000);
    
    // Check localStorage
    const stored = await page.evaluate(() => localStorage.getItem('compareList'));
    console.log('localStorage after click:', stored);
  }
  
  console.log('\n=== All Console Messages ===');
  consoleMessages.forEach(msg => console.log(msg));
});
