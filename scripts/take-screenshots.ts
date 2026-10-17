import { chromium } from 'playwright';
import * as path from 'path';

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
  const browser = await chromium.launch();
  
  for (const { url, name } of pages) {
    for (const { width, name: sizeName } of widths) {
      console.log(`Screenshot: ${name} (${sizeName} - ${width}px)...`);
      
      const context = await browser.newContext({
        viewport: { width, height: 1080 },
      });
      const page = await context.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle' });
      
      const outputPath = path.join(
        '/opt/cursor/artifacts/screenshots',
        `${name}-${sizeName}-${width}px.png`
      );
      
      await page.screenshot({
        path: outputPath,
        fullPage: true,
      });
      
      console.log(`  ✓ Saved to ${outputPath}`);
      
      await context.close();
    }
  }
  
  await browser.close();
  console.log('\n✓ All screenshots complete!');
}

main().catch(console.error);
