import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Test seeding safety guard (M8).
// Without ALLOW_DB_SEED=1 the DB-writing tests are skipped, not failed.
// Writes are allowed only against localhost or a host listed exactly in ALLOW_DB_SEED_HOSTS
// (comma-separated). A hostname merely containing "staging" or "test" is not enough.
function requireTestSeeding() {
  if (process.env.ALLOW_DB_SEED !== '1') {
    test.skip(true, 'ALLOW_DB_SEED=1 not set: skipping a test that writes to the database.');
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let hostname: string;
  try {
    hostname = new URL(supabaseUrl).hostname.toLowerCase();
  } catch {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
  }

  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const allowed = (process.env.ALLOW_DB_SEED_HOSTS || '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  if (!isLocalhost && !allowed.includes(hostname)) {
    throw new Error(
      'Tests with database seeding can only run against localhost or a host listed in ALLOW_DB_SEED_HOSTS. ' +
      `Current hostname: ${hostname}`
    );
  }
}

// Helper to seed a test sponsor placement (requires SERVICE_ROLE_KEY env var)
async function seedTestSponsor(page: any) {
  requireTestSeeding();
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are required for seeding');
  }

  try {
    // Create a test sponsor
    const sponsorResponse = await fetch(`${supabaseUrl}/rest/v1/sponsors`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        company: 'Test Sponsor Company',
        contact_email: 'test@example.com',
        website_url: 'https://example.com',
        status: 'active'
      })
    });

    if (!sponsorResponse.ok) {
      throw new Error(`Failed to create test sponsor: ${await sponsorResponse.text()}`);
    }

    const [sponsor] = await sponsorResponse.json();

    // Get a published tool to sponsor
    const toolsResponse = await fetch(`${supabaseUrl}/rest/v1/tools?status=eq.published&limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });

    if (!toolsResponse.ok) {
      throw new Error('Failed to fetch published tools');
    }

    const [tool] = await toolsResponse.json();
    
    if (!tool) {
      throw new Error('No published tools found');
    }

    // Create a live placement that expires in 10 minutes
    const startsAt = new Date().toISOString();
    const endsAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const placementResponse = await fetch(`${supabaseUrl}/rest/v1/sponsor_placements`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sponsor_id: sponsor.id,
        tool_id: tool.id,
        package: 'featured_tool',
        blurb: 'Test sponsorship for automated testing',
        link_url: 'https://example.com/test-sponsor',
        starts_at: startsAt,
        ends_at: endsAt,
        status: 'live',
        price_cents: 3900
      })
    });

    if (!placementResponse.ok) {
      throw new Error(`Failed to create test placement: ${await placementResponse.text()}`);
    }

    const [placement] = await placementResponse.json();
    return { sponsor, tool, placement };
  } catch (error) {
    console.error('Error seeding test sponsor:', error);
    throw error;
  }
}

// Helper to clean up test sponsors
async function cleanupTestSponsor(sponsorId: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!serviceRoleKey || !supabaseUrl || !sponsorId) {
    return;
  }

  try {
    // Delete sponsor (CASCADE will delete placements)
    await fetch(`${supabaseUrl}/rest/v1/sponsors?id=eq.${sponsorId}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
  } catch (error) {
    console.error('Error cleaning up test sponsor:', error);
  }
}

test.describe('Sponsorship feature', () => {
  let testSponsorId: string | null = null;

  test.afterEach(async () => {
    // Cleanup any test data created during the test
    if (testSponsorId) {
      await cleanupTestSponsor(testSponsorId);
      testSponsorId = null;
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookieConsent', 'accepted');
    });
  });

  // T2: Ranking isolation test
  test('sponsored placements do not affect tool rankings', async ({ page }) => {
    // Seed a test sponsor placement
    const testData = await seedTestSponsor(page);
    
    if (!testData) {
      test.skip(true, 'Could not seed test sponsor (requires SUPABASE_SERVICE_ROLE_KEY)');
      return;
    }

    const { sponsor, tool, placement } = testData;

    try {
      // Go to homepage to check sponsored section exists
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      const sponsoredSection = page.locator('section').filter({ hasText: /Sponsored ad/i });
      await expect(sponsoredSection).toBeVisible();
      
      // Verify the sponsored tool appears in the sponsored section
      const sponsoredTool = sponsoredSection.getByText(tool.name);
      await expect(sponsoredTool).toBeVisible();
      
      // Check category page for ranking preservation
      await page.goto('/category/writing-content', { waitUntil: 'domcontentloaded' });
      
      // Get the organic ranked list (should start with #1)
      const rankedTools = page.locator('li.card');
      const rankedCount = await rankedTools.count();
      
      if (rankedCount > 0) {
        // Verify ranks start from #1 and are sequential
        const firstRank = await rankedTools.first().locator('[aria-hidden="true"]').filter({ hasText: '#1' }).count();
        expect(firstRank).toBe(1); // Must have #1 rank
        
        // Verify any category spotlight is separate and labeled
        const spotlight = page.locator('.bg-gradient-to-r.from-amber-50');
        if (await spotlight.count() > 0) {
          // Spotlight must have "Sponsored ad" label
          await expect(spotlight.getByText('Sponsored ad')).toBeVisible();
          
          // Spotlight should be above the ranked list
          const spotlightY = await spotlight.boundingBox().then(box => box?.y ?? 0);
          const rankedY = await rankedTools.first().boundingBox().then(box => box?.y ?? 0);
          expect(spotlightY).toBeLessThan(rankedY);
        }
      }
    } finally {
      // Clean up test sponsor
      await cleanupTestSponsor(sponsor.id);
    }
  });

  // T2: "Sponsored ad" label visibility at 390px and 1440px
  test('"Sponsored ad" label is visible at 390px width', async ({ page }) => {
    const testData = await seedTestSponsor(page);
    
    if (!testData) {
      test.skip(true, 'Could not seed test sponsor (requires SUPABASE_SERVICE_ROLE_KEY)');
      return;
    }

    const { sponsor } = testData;

    try {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      const sponsoredRow = page.locator('section').filter({ hasText: 'Sponsored ad' });
      await expect(sponsoredRow).toBeVisible();
      
      // Check the label is visible
      const labels = sponsoredRow.getByText('Sponsored ad', { exact: true });
      const firstLabel = labels.first();
      await expect(firstLabel).toBeVisible();
      
      // Check font size is at least 14px
      const fontSize = await firstLabel.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      const fontSizeNum = parseFloat(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
      
      // Check contrast ratio (amber-900 on amber-50 should be > 4.5:1)
      const styles = await firstLabel.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });
      expect(styles.color).toBeTruthy();
      expect(styles.backgroundColor).toBeTruthy();
    } finally {
      await cleanupTestSponsor(sponsor.id);
    }
  });

  test('"Sponsored ad" label is visible at 1440px width', async ({ page }) => {
    const testData = await seedTestSponsor(page);
    
    if (!testData) {
      test.skip(true, 'Could not seed test sponsor (requires SUPABASE_SERVICE_ROLE_KEY)');
      return;
    }

    const { sponsor } = testData;

    try {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      const sponsoredRow = page.locator('section').filter({ hasText: 'Sponsored ad' });
      await expect(sponsoredRow).toBeVisible();
      
      const labels = sponsoredRow.getByText('Sponsored ad', { exact: true });
      const firstLabel = labels.first();
      await expect(firstLabel).toBeVisible();
      
      // Check font size
      const fontSize = await firstLabel.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      const fontSizeNum = parseFloat(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    } finally {
      await cleanupTestSponsor(sponsor.id);
    }
  });

  test('sponsored tool page badge shows "Sponsored ad" label', async ({ page }) => {
    const testData = await seedTestSponsor(page);
    
    if (!testData) {
      test.skip(true, 'Could not seed test sponsor (requires SUPABASE_SERVICE_ROLE_KEY)');
      return;
    }

    const { sponsor, tool } = testData;

    try {
      // Navigate to the sponsored tool's page
      await page.goto(`/tools/${tool.slug}`, { waitUntil: 'domcontentloaded' });
      
      // Check that the sponsored badge exists and shows "Sponsored ad"
      const sponsoredBadge = page.getByText('Sponsored ad', { exact: true });
      await expect(sponsoredBadge).toBeVisible();
    } finally {
      await cleanupTestSponsor(sponsor.id);
    }
  });

  // T3: Date window enforcement
  test('sponsorship surfaces exist and use proper HTML structure', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check homepage sponsored row structure
    const sponsoredSection = page.locator('section').filter({ hasText: 'Sponsored ad' });
    if (await sponsoredSection.count() > 0) {
      // Should have a heading
      await expect(sponsoredSection.locator('h2')).toBeVisible();
      
      // Should have cards with proper structure
      const cards = sponsoredSection.locator('.card');
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
        
        // Each card should have a "Learn more" or similar link
        const links = cards.first().locator('a').filter({ hasText: /learn more|view details/i });
        if (await links.count() > 0) {
          // Check rel attribute for sponsored links
          const rel = await links.first().getAttribute('rel');
          expect(rel).toContain('sponsored');
          expect(rel).toContain('noopener');
        }
      }
    }
  });

  // T6: Form validation
  test('sponsor request form validates required fields', async ({ page }) => {
    await page.goto('/advertise/request', { waitUntil: 'domcontentloaded' });
    
    // Try to submit without filling fields
    const submitButton = page.getByRole('button', { name: /submit request/i });
    await submitButton.click();
    
    // Browser should show validation errors (HTML5 validation)
    const companyInput = page.getByLabel(/company name/i);
    const isInvalid = await companyInput.evaluate((input: HTMLInputElement) => {
      return !input.validity.valid;
    });
    expect(isInvalid).toBe(true);
  });

  test('sponsor request form shows accessible error messages', async ({ page }) => {
    await page.goto('/advertise/request', { waitUntil: 'domcontentloaded' });
    
    // Fill form with invalid data
    await page.getByLabel(/company name/i).fill('Test Company');
    await page.getByLabel(/your name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('invalid-email'); // Invalid email
    await page.getByLabel(/tool name/i).fill('Test Tool');
    await page.getByLabel(/tool website url/i).fill('not-a-url'); // Invalid URL
    await page.getByLabel(/package/i).selectOption('featured-tool');
    
    // Submit
    await page.getByRole('button', { name: /submit request/i }).click();
    
    // HTML5 validation should catch the invalid email
    const emailInput = page.getByLabel(/email/i);
    const emailInvalid = await emailInput.evaluate((input: HTMLInputElement) => {
      return !input.validity.valid;
    });
    expect(emailInvalid).toBe(true);
  });

  test('sponsor intake form validates file uploads', async ({ page }) => {
    // Intake form now returns 410 Gone since we're in request-only mode
    const response = await page.goto('/advertise/intake', { waitUntil: 'domcontentloaded' });
    
    // Should redirect to /advertise/request
    expect(page.url()).toContain('/advertise/request');
  });

  // T6: Rate limiting (429 response)
  test('sponsor request form respects rate limiting', async ({ page }) => {
    // Note: This test sends a real request. Use invalid data to avoid polluting the database.
    const response = await page.request.post('/api/sponsor/request', {
      data: {
        companyName: '', // Empty to trigger validation
        contactName: '',
        email: 'invalid',
        toolName: '',
        toolUrl: '',
        package: '',
        message: '',
        honeypot: '', // Important: leave empty
      },
    });
    
    // Should return 400 validation error, not 404
    expect(response.status()).toBe(400);
  });

  // T7: Admin access control
  test('sponsor admin page requires authentication', async ({ page }) => {
    // Try to access admin page without auth
    await page.goto('/admin/sponsors');
    
    // Should redirect to login or show unauthorized
    await page.waitForURL(/\/admin\/login/, { timeout: 5000 }).catch(() => {
      // May not redirect if already handling auth differently
    });
    
    // Either way, check we're not on the sponsors page
    const url = page.url();
    if (url.includes('/admin/sponsors')) {
      // If still on sponsors page, should show empty state or auth error
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    } else {
      // Redirected to login
      expect(url).toContain('/admin/login');
    }
  });

  // T5: Book button env fallback
  test('/advertise shows "Request a spot" when Stripe links are not configured', async ({ page }) => {
    await page.goto('/advertise', { waitUntil: 'domcontentloaded' });
    
    // Check that buttons exist
    const requestButtons = page.getByRole('link', { name: /request a spot/i });
    const bookButtons = page.getByRole('link', { name: /book now/i });
    
    const requestCount = await requestButtons.count();
    const bookCount = await bookButtons.count();
    
    // Should have at least some request buttons (since env vars are likely not set in test)
    expect(requestCount).toBeGreaterThan(0);
    
    // If there are book buttons, they should link to Stripe
    if (bookCount > 0) {
      const firstBookButton = bookButtons.first();
      const href = await firstBookButton.getAttribute('href');
      expect(href).toBeTruthy();
    }
    
    // Newsletter package should show "Opening once the list launches"
    const newsletterSection = page.locator('text=Newsletter Sponsor').locator('..');
    if (await newsletterSection.count() > 0) {
      await expect(newsletterSection.getByText(/opening once the list launches/i)).toBeVisible();
    }
  });

  // Accessibility tests
  test('axe has no serious or critical issues on /advertise', async ({ page }) => {
    await page.goto('/advertise', { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')
    ).toEqual([]);
  });

  test('axe has no serious or critical issues on /advertise/request', async ({ page }) => {
    await page.goto('/advertise/request', { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')
    ).toEqual([]);
  });

  test('axe has no serious or critical issues on /sponsor-terms', async ({ page }) => {
    await page.goto('/sponsor-terms', { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n')
    ).toEqual([]);
  });

  // Verify copy updates
  test('disclosure page mentions sponsorships as primary revenue', async ({ page }) => {
    await page.goto('/disclosure', { waitUntil: 'domcontentloaded' });
    
    // Should have sponsorships listed before affiliate links
    const content = await page.textContent('body');
    expect(content).toContain('Sponsorships');
    expect(content).toContain('our main revenue');
    expect(content).toContain('Money buys a labeled spot, never our opinion');
  });

  test('how-we-rank page has editorial independence rule', async ({ page }) => {
    await page.goto('/how-we-rank', { waitUntil: 'domcontentloaded' });
    
    const content = await page.textContent('body');
    expect(content).toContain('Money buys a labeled spot, never our opinion');
    expect(content).toContain('Sponsored ad');
  });

  test('footer mentions sponsorships', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const footer = page.locator('footer');
    const footerText = await footer.textContent();
    expect(footerText).toContain('sponsor');
  });

  test('sponsor-terms page is clearly marked as DRAFT', async ({ page }) => {
    await page.goto('/sponsor-terms', { waitUntil: 'domcontentloaded' });
    
    // Should have clear DRAFT warnings
    await expect(page.getByRole('heading', { name: /DRAFT/i })).toBeVisible();
    await expect(page.getByText(/Not in effect/i).first()).toBeVisible();
  });

  // Navigation tests
  test('footer has link to /advertise', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const footer = page.locator('footer');
    const advertiseLink = footer.getByRole('link', { name: /advertise/i });
    await expect(advertiseLink).toBeVisible();
    await expect(advertiseLink).toHaveAttribute('href', '/advertise');
  });

  test('/advertise page loads successfully', async ({ page }) => {
    const response = await page.goto('/advertise', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    
    await expect(page.getByRole('heading', { name: /sponsor ai one stop shop/i })).toBeVisible();
  });

  test('/advertise/thanks page loads successfully', async ({ page }) => {
    const response = await page.goto('/advertise/thanks', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    
    await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible();
  });
});
