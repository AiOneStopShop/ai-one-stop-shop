import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

const pages = [
  { url: 'http://localhost:3000/', name: 'home' },
  { url: 'http://localhost:3000/tools', name: 'tools' },
  { url: 'http://localhost:3000/tools/chatgpt-plus', name: 'tool-detail' },
  { url: 'http://localhost:3000/category/coding', name: 'category' },
  { url: 'http://localhost:3000/compare?tools=chatgpt-plus,claude-pro', name: 'compare' },
  { url: 'http://localhost:3000/finder', name: 'finder' },
  { url: 'http://localhost:3000/our-kits', name: 'our-kits' },
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  for (const { url, name } of pages) {
    console.log(`Testing ${name}...`);
    const page = await context.newPage();
    await page.goto(url);
    
    const results = await new AxeBuilder({ page }).analyze();
    
    const outputPath = path.join('/opt/cursor/artifacts/axe', `${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
    const violations = results.violations;
    const critical = violations.filter((v: any) => v.impact === 'critical');
    const serious = violations.filter((v: any) => v.impact === 'serious');
    
    console.log(`  ${name}: ${violations.length} violations (${critical.length} critical, ${serious.length} serious)`);
    
    await page.close();
  }
  
  await browser.close();
  console.log('\nAll axe tests complete!');
}

main().catch(console.error);
