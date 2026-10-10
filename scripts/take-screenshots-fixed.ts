import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const pages = [
  { url: 'http://localhost:3000/', name: 'home' },
  { url: 'http://localhost:3000/tools', name: 'tools' },
  { url: 'http://localhost:3000/tools/chatgpt-plus', name: 'tool-detail' },
  { url: 'http://localhost:3000/finder', name: 'finder' },
  { url: 'http://localhost:3000/our-kits', name: 'our-kits' },
];

const widths = [
  { width: 1280, name: 'desktop' },
  { width: 390, name: 'mobile' },
];

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  
  for (const { url, name: pageName } of pages) {
    for (const { width, name: sizeName } of widths) {
      console.log(`\nCapturing: ${pageName} (${sizeName} - ${width}px)`);
      console.log(`URL: ${url}`);
      
      const context = await browser.newContext({
        viewport: { width, height: 1080 },
      });
      const page = await context.newPage();
      
      // Navigate and wait for everything to load
      console.log('  - Navigating...');
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for styles to be applied
      console.log('  - Waiting for styles...');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Extra time for fonts and styles
      
      // Check if styled
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      console.log(`  - Body background: ${bgColor}`);
      
      const outputPath = path.join(
        '/workspace/docs/screenshots',
        `${pageName}-${sizeName}-${width}px.png`
      );
      
      console.log(`  - Taking screenshot...`);
      await page.screenshot({
        path: outputPath,
        fullPage: true,
      });
      
      const stats = fs.statSync(outputPath);
      console.log(`  ✅ Saved (${Math.round(stats.size / 1024)}KB): ${outputPath}`);
      
      await context.close();
    }
  }
  
  await browser.close();
  console.log('\n✅ All screenshots complete!');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
