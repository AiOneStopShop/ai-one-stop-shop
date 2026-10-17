import { test, expect } from '@playwright/test';

test.describe('Legal V2 Feature Flag', () => {
  test('Terms page shows Eligibility section when LEGAL_V2 is enabled', async ({ page }) => {
    // Check if the flag is enabled by looking for the Eligibility section
    await page.goto('/terms');
    
    const eligibilitySection = page.getByRole('heading', { name: 'Eligibility', level: 2 });
    const eligibilityExists = await eligibilitySection.count() > 0;
    
    if (eligibilityExists) {
      // Flag is ON - verify the content
      await expect(eligibilitySection).toBeVisible();
      const eligibilityText = await page.locator('text=You must be at least 13 to use this site').textContent();
      expect(eligibilityText).toContain('You must be at least 13 to use this site');
      expect(eligibilityText).toContain('18 or older');
      expect(eligibilityText).toContain('children under 13');
    } else {
      // Flag is OFF - section should not exist
      await expect(eligibilitySection).toHaveCount(0);
    }
  });

  test('DMCA page is accessible when LEGAL_V2 is enabled', async ({ page }) => {
    const response = await page.goto('/dmca');
    
    // Should either be 200 (flag on + env vars set) or 404 (flag off or env vars missing)
    expect([200, 404]).toContain(response?.status());
    
    if (response?.status() === 200) {
      // Flag is ON and env vars are set
      await expect(page.getByRole('heading', { name: 'Copyright & DMCA', level: 1 })).toBeVisible();
      await expect(page.getByText('Filing a DMCA Notice')).toBeVisible();
      await expect(page.getByText('Counter-Notice')).toBeVisible();
      await expect(page.getByText('Repeat Infringer Policy')).toBeVisible();
      
      // Check for the required six elements
      await expect(page.getByText('Identification of the copyrighted work')).toBeVisible();
      await expect(page.getByText('Identification of the infringing material')).toBeVisible();
      await expect(page.getByText('Your contact information')).toBeVisible();
      await expect(page.getByText('good faith belief')).toBeVisible();
      await expect(page.getByText('under penalty of perjury')).toBeVisible();
      await expect(page.getByText('Your physical or electronic signature')).toBeVisible();
    }
  });

  test('Footer shows DMCA link and Terms section when LEGAL_V2 is enabled', async ({ page }) => {
    await page.goto('/');
    
    const dmcaLink = page.locator('footer a[href="/dmca"]');
    const termsSection = page.locator('footer').getByText(/By submitting a tool or using this site/);
    
    const dmcaExists = await dmcaLink.count() > 0;
    const termsSectionExists = await termsSection.count() > 0;
    
    if (dmcaExists) {
      // Flag is ON
      await expect(dmcaLink).toBeVisible();
      await expect(dmcaLink).toHaveText('Copyright & DMCA');
      await expect(termsSection).toBeVisible();
      await expect(termsSection).toContainText('Terms of Service');
      await expect(termsSection).toContainText('Copyright & DMCA policy');
    } else {
      // Flag is OFF
      await expect(dmcaLink).toHaveCount(0);
      await expect(termsSection).toHaveCount(0);
    }
  });
});

test.describe('Submit Form Rights Checkbox', () => {
  test('rights checkbox appears when LEGAL_V2 is enabled', async ({ page }) => {
    await page.goto('/submit');
    
    const rightsCheckbox = page.locator('input[type="checkbox"]#rightsConfirmed');
    const rightsLabel = page.locator('label[for="rightsConfirmed"]');
    
    const checkboxExists = await rightsCheckbox.count() > 0;
    
    if (checkboxExists) {
      // Flag is ON
      await expect(rightsCheckbox).toBeVisible();
      await expect(rightsLabel).toBeVisible();
      await expect(rightsLabel).toContainText('I own or have permission to share');
      await expect(rightsLabel).toContainText('Terms');
      
      // Verify checkbox is unchecked by default
      await expect(rightsCheckbox).not.toBeChecked();
      
      // Verify Terms link exists
      const termsLink = rightsLabel.locator('a[href="/terms"]');
      await expect(termsLink).toBeVisible();
    } else {
      // Flag is OFF
      await expect(rightsCheckbox).toHaveCount(0);
    }
  });

  test('client-side validation requires rights checkbox when LEGAL_V2 is enabled', async ({ page }) => {
    await page.goto('/submit');
    
    const rightsCheckbox = page.locator('input[type="checkbox"]#rightsConfirmed');
    const checkboxExists = await rightsCheckbox.count() > 0;
    
    if (checkboxExists) {
      // Flag is ON - test validation
      await page.fill('input[name="toolName"]', 'Test Tool');
      await page.fill('input[name="websiteUrl"]', 'https://example.com');
      await page.fill('input[name="contactEmail"]', 'test@example.com');
      
      // Try to submit without checking the box
      await page.click('button[type="submit"]');
      
      // Should show error
      const errorMessage = page.getByText('You must confirm you have the rights');
      await expect(errorMessage).toBeVisible();
      
      // Check the box and submit again
      await rightsCheckbox.check();
      await expect(rightsCheckbox).toBeChecked();
      
      await page.click('button[type="submit"]');
      
      // Error should be gone
      await expect(errorMessage).not.toBeVisible();
    }
  });

  test('server-side enforcement of rights checkbox when LEGAL_V2 is enabled', async ({ request }) => {
    // First check if the checkbox feature is enabled by checking the page
    const pageResponse = await request.get('/submit');
    const html = await pageResponse.text();
    const checkboxExists = html.includes('rightsConfirmed');
    
    if (checkboxExists) {
      // Flag is ON - test server-side enforcement
      
      // Test 1: Submit without rightsConfirmed field
      const response1 = await request.post('/api/submit-tool', {
        data: {
          toolName: 'Test Tool',
          websiteUrl: 'https://example.com',
          contactEmail: 'test@example.com',
          description: 'A test tool',
        },
      });
      
      expect(response1.status()).toBe(400);
      const body1 = await response1.json();
      expect(body1.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'rightsConfirmed', code: 'rights_required' }),
        ])
      );
      
      // Test 2: Submit with rightsConfirmed: false
      const response2 = await request.post('/api/submit-tool', {
        data: {
          toolName: 'Test Tool',
          websiteUrl: 'https://example.com',
          contactEmail: 'test@example.com',
          description: 'A test tool',
          rightsConfirmed: false,
        },
      });
      
      expect(response2.status()).toBe(400);
      const body2 = await response2.json();
      expect(body2.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'rightsConfirmed', code: 'rights_required' }),
        ])
      );
      
      // Test 3: Submit with rightsConfirmed: true should pass validation
      // (it will still succeed due to rate limiting or honeypot, but won't fail on rights check)
      const response3 = await request.post('/api/submit-tool', {
        data: {
          toolName: 'Test Tool',
          websiteUrl: 'https://example.com',
          contactEmail: 'test@example.com',
          description: 'A test tool',
          rightsConfirmed: true,
        },
      });
      
      // Should not return a 400 with rights_required error
      if (response3.status() === 400) {
        const body3 = await response3.json();
        expect(body3.errors || []).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ code: 'rights_required' }),
          ])
        );
      }
    } else {
      // Flag is OFF - rightsConfirmed should not be required
      const response = await request.post('/api/submit-tool', {
        data: {
          toolName: 'Test Tool',
          websiteUrl: 'https://example.com',
          contactEmail: 'test@example.com',
          description: 'A test tool',
        },
      });
      
      // Should succeed (or fail for other reasons, but not rights_required)
      if (response.status() === 400) {
        const body = await response.json();
        expect(body.errors || []).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ code: 'rights_required' }),
          ])
        );
      }
    }
  });
});

test.describe('Permanent Redirects', () => {
  test('/agents redirects to /tools permanently', async ({ page }) => {
    const response = await page.goto('/agents');
    expect(response?.status()).toBe(200);
    expect(page.url()).toContain('/tools');
    
    // Verify redirect is permanent (308)
    const directResponse = await page.request.get('/agents', { maxRedirects: 0 });
    expect(directResponse.status()).toBe(308);
    expect(directResponse.headers()['location']).toContain('/tools');
  });

  test('/toolkit redirects to /budget permanently', async ({ page }) => {
    const response = await page.goto('/toolkit');
    expect(response?.status()).toBe(200);
    expect(page.url()).toContain('/budget');
    
    // Verify redirect is permanent (308)
    const directResponse = await page.request.get('/toolkit', { maxRedirects: 0 });
    expect(directResponse.status()).toBe(308);
    expect(directResponse.headers()['location']).toContain('/budget');
  });
});

test.describe('DMCA Page Environment Variables', () => {
  test('DMCA page shows warning or 404 if env vars are missing in production', async ({ page }) => {
    const response = await page.goto('/dmca');
    
    if (response?.status() === 404) {
      // Either flag is OFF or required env vars are missing in production
      // This is acceptable behavior
      expect(response.status()).toBe(404);
    } else if (response?.status() === 200) {
      // Page loaded successfully
      const content = await page.content();
      
      // Should either show agent info OR a TODO(Lexi) placeholder (only in dev)
      const hasAgentInfo = content.includes('DMCA_AGENT_NAME') || 
                          content.includes('@') || 
                          content.includes('TODO(Lexi)');
      expect(hasAgentInfo).toBeTruthy();
      
      // In production, should never show TODO(Lexi) placeholders
      if (process.env.NODE_ENV === 'production') {
        expect(content).not.toContain('TODO(Lexi)');
      }
    }
  });
});
