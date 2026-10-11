import { test, expect } from '@playwright/test';
import { fallbackTools } from '../lib/fallback-data';
import {
  expandSearchTerms,
  searchTools,
  suggestDidYouMean,
  toolMatchesQuery,
} from '../lib/search-tools';

const published = fallbackTools.filter((tool) => tool.status === 'published');

test('writing matches Jasper, Copy.ai, and Grammarly via synonyms and category text', () => {
  expect(expandSearchTerms('writing')).toEqual(
    expect.arrayContaining(['writing', 'copy', 'content', 'grammar'])
  );
  const names = searchTools(published, { q: 'writing' }).map((tool) => tool.name);
  expect(names).toEqual(expect.arrayContaining(['Jasper AI', 'Copy.ai', 'Grammarly']));
});

test('typos match nearby tool names with trigram similarity', () => {
  expect(toolMatchesQuery(published.find((tool) => tool.name === 'Grammarly')!, 'grammerly')).toBe(true);
  expect(toolMatchesQuery(published.find((tool) => tool.name === 'GitHub Copilot')!, 'copliot')).toBe(true);
  const grammarly = searchTools(published, { q: 'grammerly' });
  expect(grammarly[0]?.name).toBe('Grammarly');
  const copilot = searchTools(published, { q: 'copliot' });
  expect(copilot.map((tool) => tool.name)).toContain('GitHub Copilot');
});

test('filters combine with the query', () => {
  const contentWriting = searchTools(published, { q: 'writing', category: 'content' }).map((tool) => tool.name);
  expect(contentWriting).toEqual(expect.arrayContaining(['Jasper AI', 'Grammarly']));
  expect(contentWriting).not.toContain('Copy.ai');
});

test('zero-result suggestions use nearby names', () => {
  expect(searchTools(published, { q: 'xyzzynope123' })).toEqual([]);
  expect(suggestDidYouMean('grammerly', published)?.name).toBe('Grammarly');
});

async function expectWritingResults(page: import('@playwright/test').Page) {
  await expect(page).toHaveURL(/\/tools\?q=writing/);
  await expect(page.getByRole('search').locator('input[name="q"]')).toHaveValue('writing');
  await expect(page.getByRole('article').filter({ hasText: 'Jasper AI' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Copy.ai' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Grammarly' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText(/Showing \d+ tools \(filtered from \d+\)/);
}

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
  await expect(page.getByRole('link', { name: 'Submit a tool' })).toBeVisible();
});

test('filters plus query hide tools outside the category', async ({ page }) => {
  await page.goto('/tools?q=writing&category=content');
  await expect(page.getByRole('article').filter({ hasText: 'Jasper AI' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Grammarly' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Copy.ai' })).toHaveCount(0);
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
