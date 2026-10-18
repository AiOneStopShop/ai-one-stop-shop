import { chromium } from 'playwright';
import * as AxeCore from 'axe-core';

async function runAxe(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  // Inject axe-core
  await page.evaluate(AxeCore.source);

  // Run axe
  const results = await page.evaluate(async () => {
    const axe = (window as any).axe;
    return await axe.run();
  });

  await browser.close();

  return results;
}

(async () => {
  console.log('Running axe on homepage...\n');
  const results = await runAxe('http://localhost:3000/');

  console.log('Violations:', results.violations.length);
  console.log('Passes:', results.passes.length);
  console.log('Incomplete:', results.incomplete.length);

  if (results.violations.length > 0) {
    console.log('\n=== Violations ===');
    results.violations.forEach((v: any) => {
      console.log(`\n[${v.impact}] ${v.id}: ${v.description}`);
      console.log(`  Affected: ${v.nodes.length} nodes`);
      if (v.nodes.length > 0) {
        console.log(`  Example: ${v.nodes[0].html.substring(0, 100)}...`);
      }
    });
  } else {
    console.log('\n✅ No accessibility violations found!');
  }

  // Check for serious/critical issues
  const serious = results.violations.filter((v: any) => v.impact === 'serious' || v.impact === 'critical');
  console.log(`\nSerious/Critical issues: ${serious.length}`);

  process.exit(serious.length > 0 ? 1 : 0);
})();
