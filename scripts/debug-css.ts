import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  
  // Check link tags
  const cssLinks = await page.$$eval('link[rel="stylesheet"]', (links: any[]) => 
    links.map(l => ({ href: l.href, loaded: l.sheet !== null }))
  );
  console.log('CSS Links:', JSON.stringify(cssLinks, null, 2));
  
  // Check computed styles
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const styles = window.getComputedStyle(body);
    return {
      bgColor: styles.backgroundColor,
      fontFamily: styles.fontFamily,
      color: styles.color,
      classes: body.className,
    };
  });
  console.log('Body styles:', bodyStyles);
  
  // Check if CSS file loads
  if (cssLinks.length > 0) {
    const cssUrl = cssLinks[0].href;
    console.log('\nTrying to load CSS from:', cssUrl);
    try {
      const response = await page.goto(cssUrl);
      console.log('CSS response status:', response?.status());
      if (response && response.ok()) {
        const cssText = await response.text();
        console.log('CSS loaded! Length:', cssText.length);
        console.log('First 300 chars:', cssText.substring(0, 300));
      }
    } catch (e: any) {
      console.error('Error loading CSS:', e.message);
    }
  }
  
  await browser.close();
})().catch(console.error);
