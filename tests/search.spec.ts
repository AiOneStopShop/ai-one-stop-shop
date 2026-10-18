import { test, expect } from '@playwright/test';
import { fallbackTools } from '../lib/fallback-data';
import {
  expandSearchTerms,
  searchTools,
  suggestDidYouMean,
  toolMatchesQuery,
} from '../lib/search-tools';

const published = fallbackTools.filter((tool) => tool.status === 'published');

// Offline-fallback unit tests (lib/search-tools.ts). Real ranking is tested against Postgres in
// tests/search-golden.spec.ts.
test('synonym expansion reads the shared seed, with text to speech as a phrase', () => {
  expect(expandSearchTerms('voice')).toEqual(expect.arrayContaining(['voice', 'audio', 'speech', 'tts']));
  expect(expandSearchTerms('text to speech')).toEqual(expect.arrayContaining(['voice', 'speech', 'tts']));
  expect(expandSearchTerms('text to speech')).not.toContain('text');
  expect(expandSearchTerms('image')).toEqual(expect.arrayContaining(['image', 'art', 'generator']));
});

test('fallback: windsurf is a hidden tool and returns nothing', () => {
  expect(published.find((tool) => tool.name === 'Windsurf')).toBeUndefined();
  expect(searchTools(published, { q: 'windsurf' })).toEqual([]);
});

test('fallback: exact names rank first and every word must match', () => {
  expect(searchTools(published, { q: 'grammarly' })[0]?.name).toBe('Grammarly');
  const voice = searchTools(published, { q: 'voice' }).map((tool) => tool.name);
  expect(voice.slice(0, 3)).toContain('ElevenLabs');
  const chat = searchTools(published, { q: 'chat' }).map((tool) => tool.name);
  expect(chat).toEqual(expect.arrayContaining(['ChatGPT Plus']));
});

test('fallback: filters combine with the query', () => {
  const free = searchTools(published, { q: 'writing', freeOnly: true });
  expect(free.every((tool) => tool.has_free_tier)).toBe(true);
  expect(toolMatchesQuery(published.find((tool) => tool.name === 'Grammarly')!, 'writing')).toBe(true);
});

test('fallback: zero-result suggestions use nearby names', () => {
  expect(suggestDidYouMean('grammerly', published)?.name).toBe('Grammarly');
  expect(suggestDidYouMean('zzzzqqq', published)).toBeNull();
});

async function expectWritingResults(page: import('@playwright/test').Page) {
  await expect(page).toHaveURL(/\/tools\?q=writing/);
  await expect(page.getByRole('search').locator('input[name="q"]')).toHaveValue('writing');
  await expect(page.getByRole('article').filter({ hasText: 'Grammarly' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /Showing \d+ tools/ })).toContainText(/Showing \d+ tools \(filtered from \d+\)/);
}

test('public tools API exposes only public fields and short cache headers', async ({ request }) => {
  const response = await request.get('/api/v1/tools?q=Voice');
  expect(response.ok()).toBeTruthy();
  // Vercel's edge consumes s-maxage and forwards only `public`; locally the full header is visible.
  const cacheControl = response.headers()['cache-control'] ?? '';
  expect(cacheControl).toMatch(/^public(, s-maxage=300, stale-while-revalidate=600)?$/);
  const body = await response.json();
  expect(body.tools.length).toBeGreaterThan(0);
  // M11: paid tools route through /go/<slug> (labeled redirect); unpaid tools link straight
  // to the maker's site with no redirect (lib/public-tool.ts).
  for (const tool of body.tools) {
    expect(tool).toEqual(expect.objectContaining({ name: expect.any(String), slug: expect.any(String) }));
    if (tool.paid_link) {
      expect(tool.go_url).toMatch(/\/go\//);
    } else {
      expect(tool.go_url).toBe(tool.website_url ?? null);
    }
  }
  const tool = body.tools[0];
  expect(tool).not.toHaveProperty('editorial_why');
  expect(tool).not.toHaveProperty('review_notes');
  expect(tool).not.toHaveProperty('source_url');
  expect(tool).not.toHaveProperty('status');
  expect(tool).not.toHaveProperty('tags');
  expect(tool).not.toHaveProperty('editorial_score');
});

test('home page search submits on Enter and filters /tools', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('search');
  await search.locator('input[name="q"]').fill('writing');
  await search.locator('input[name="q"]').press('Enter');
  await expectWritingResults(page);
});

test('/tools search submits on Enter and shows filtered results', async ({ page }) => {
  await page.goto('/tools');
  const search = page.getByRole('search');
  await search.locator('input[name="q"]').fill('writing');
  await search.locator('input[name="q"]').press('Enter');
  await expectWritingResults(page);
});

test('typo query copliot ranks GitHub Copilot first', async ({ page }) => {
  await page.goto('/tools?q=copliot');
  const names = await page.locator('article h2').allTextContents();
  expect(names[0]).toContain('GitHub Copilot');
  if (names.includes('Copy.ai')) {
    expect(names.indexOf('Copy.ai')).toBeGreaterThan(names.findIndex((name) => name.includes('GitHub Copilot')));
  }
});

test('writing ranks Copy.ai above Descript', async ({ page }) => {
  await page.goto('/tools?q=writing');
  const names = await page.locator('article h2').allTextContents();
  expect(names.indexOf('Copy.ai')).toBeGreaterThanOrEqual(0);
  if (names.includes('Descript')) {
    expect(names.indexOf('Descript')).toBeGreaterThan(names.indexOf('Copy.ai'));
  }
});

test('typo query grammerly finds Grammarly', async ({ page }) => {
  await page.goto('/tools');
  const search = page.getByRole('search');
  await search.locator('input[name="q"]').fill('grammerly');
  await search.locator('input[name="q"]').press('Enter');
  await expect(page).toHaveURL(/q=grammerly/);
  await expect(page.getByRole('article').filter({ hasText: 'Grammarly' })).toBeVisible();
});

test('zero-results state offers suggestions and submit', async ({ page }) => {
  await page.goto('/tools?q=xyzzynope123');
  await expect(page.getByText(/No tools match/)).toBeVisible();
  await expect(page.getByText('Popular categories')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Submit a tool' }).first()).toBeVisible();
});

test('filters plus query hide tools outside the category', async ({ page }) => {
  await page.goto('/tools?q=writing&category=writing');
  await expect(page.getByRole('article').filter({ hasText: 'Jasper AI' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Grammarly' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'GitHub Copilot' })).toHaveCount(0);
});

test('voice ranks ElevenLabs in the top 3', async ({ page }) => {
  await page.goto('/tools?q=voice');
  const names = await page.locator('article h2').allTextContents();
  expect(names.slice(0, 3).join(' ')).toMatch(/ElevenLabs/);
  expect(names[0]).not.toContain('v0');
});

test('text to speech ranks ElevenLabs in the top 3', async ({ page }) => {
  await page.goto('/tools?q=text%20to%20speech');
  const names = await page.locator('article h2').allTextContents();
  expect(names.slice(0, 3).join(' ')).toMatch(/ElevenLabs/);
  expect(names[0]).not.toContain('v0');
});

test('a nonsense query shows the zero-results state', async ({ page }) => {
  // Not tied to one catalog: Windsurf used to be hidden but is published on UAT.
  await page.goto('/tools?q=zzqxv-no-such-tool');
  await expect(page.getByText(/No tools match/)).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('image returns six or more results with image tools first', async ({ page }) => {
  await page.goto('/tools?q=image');
  const names = await page.locator('article h2').allTextContents();
  expect(names.length).toBeGreaterThanOrEqual(6);
  // Catalog-dependent: any well-known image tool may rank first (Picsart does on UAT).
  expect(names.slice(0, 3).join(' ')).toMatch(/Midjourney|Stable Diffusion|Canva|DALL|Leonardo|Ideogram|Flux|Firefly|Picsart|Photoroom|Krea|Recraft/i);
});

test('chat ranks ChatGPT, Claude, and Gemini ahead of Grammarly', async ({ page }) => {
  await page.goto('/tools?q=chat');
  const names = await page.locator('article h2').allTextContents();
  expect(names[0]).toMatch(/ChatGPT/);
  expect(names.slice(0, 6).join(' ')).toMatch(/Claude/);
  expect(names.slice(0, 6).join(' ')).toMatch(/Gemini/);
  if (names.includes('Grammarly')) {
    expect(names.indexOf('Grammarly')).toBeGreaterThan(2);
  }
});

test('code ranks a coding tool first', async ({ page }) => {
  await page.goto('/tools?q=code');
  const names = await page.locator('article h2').allTextContents();
  expect(names[0]).toMatch(/Copilot|Cursor|v0|Bolt|Replit|Kilo|Cline|OpenCode|Codex/i);
});

test('live typing then Enter then double Back returns to unfiltered /tools', async ({ page }) => {
  await page.goto('/tools');
  const search = page.getByRole('search').locator('input[name="q"]');
  await search.fill('image');
  await expect(page).toHaveURL(/\/tools\?q=image/, { timeout: 5000 });
  await search.press('Enter');
  await expect(page).toHaveURL(/\/tools\?q=image/);
  await page.goBack();
  await expect(page).toHaveURL(/\/tools\?q=image/);
  await page.goBack();
  await expect(page).toHaveURL(/\/tools\/?$/);
  await expect(search).toHaveValue('');
});

test('submitted searches use history.push so Back steps through them', async ({ page }) => {
  await page.goto('/tools');
  const search = page.getByRole('search');
  await search.locator('input[name="q"]').fill('writing');
  await search.locator('input[name="q"]').press('Enter');
  await expect(page).toHaveURL(/q=writing/);
  await search.locator('input[name="q"]').fill('voice');
  await search.locator('input[name="q"]').press('Enter');
  await expect(page).toHaveURL(/q=voice/);
  await page.goBack();
  await expect(page).toHaveURL(/q=writing/);
});

test('no-JS GET form submit filters /tools', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  const search = page.getByRole('search');
  await search.locator('input[name="q"]').fill('writing');
  await search.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/tools\?q=writing/);
  await expect(page.getByRole('article').filter({ hasText: 'Jasper AI' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Copy.ai' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Grammarly' })).toBeVisible();
  await context.close();
});
