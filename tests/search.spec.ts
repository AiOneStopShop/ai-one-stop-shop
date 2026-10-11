import { test, expect } from '@playwright/test';
import { fallbackTools } from '../lib/fallback-data';
import {
  expandSearchTerms,
  searchTools,
  suggestDidYouMean,
  toolMatchesQuery,
} from '../lib/search-tools';

const published = fallbackTools.filter((tool) => tool.status === 'published');

test('audio synonyms include voice, tts, speech, and text to speech', () => {
  expect(expandSearchTerms('voice')).toEqual(
    expect.arrayContaining(['voice', 'audio', 'speech', 'tts', 'text to speech'])
  );
  expect(expandSearchTerms('text to speech')).toEqual(
    expect.arrayContaining(['voice', 'speech', 'tts'])
  );
  expect(expandSearchTerms('text to speech')).not.toContain('text');
  expect(expandSearchTerms('tts')).toEqual(expect.arrayContaining(['voice', 'speech']));
});

test('voice and text to speech rank ElevenLabs above v0', () => {
  const voice = searchTools(published, { q: 'voice' }).map((tool) => tool.name);
  expect(voice.slice(0, 3)).toContain('ElevenLabs');
  expect(voice[0]).not.toBe('v0 by Vercel');
  if (voice.includes('v0 by Vercel')) {
    expect(voice.indexOf('ElevenLabs')).toBeLessThan(voice.indexOf('v0 by Vercel'));
  }

  const tts = searchTools(published, { q: 'text to speech' }).map((tool) => tool.name);
  expect(tts.slice(0, 3)).toContain('ElevenLabs');
  expect(tts[0]).not.toBe('v0 by Vercel');
});

test('windsurf is a hidden tool and does not return unrelated results', () => {
  expect(published.find((tool) => tool.name === 'Windsurf')).toBeUndefined();
  expect(searchTools(published, { q: 'windsurf' })).toEqual([]);
});

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
  expect(copilot[0]?.name).toBe('GitHub Copilot');
  expect(copilot.map((tool) => tool.name).indexOf('GitHub Copilot'))
    .toBeLessThan(copilot.map((tool) => tool.name).indexOf('Copy.ai'));
});

test('image expands through synonyms and ranks image tools first', () => {
  expect(expandSearchTerms('image')).toEqual(
    expect.arrayContaining(['image', 'art', 'generation', 'generate', 'generator', 'images', 'design'])
  );
  const names = searchTools(published, { q: 'image' }).map((tool) => tool.name);
  expect(names.length).toBeGreaterThanOrEqual(6);
  expect(names[0]).toMatch(/Midjourney|Stable Diffusion|Canva|DALL/);
  expect(names.slice(0, 3).join(' ')).toMatch(/Midjourney|Stable Diffusion|Canva|DALL/);
});

test('code ranks a coding tool first instead of Copy.ai', () => {
  const names = searchTools(published, { q: 'code' }).map((tool) => tool.name);
  expect(names[0]).toMatch(/Copilot|Cursor|v0|Bolt|Replit/);
  if (names.includes('Copy.ai')) {
    expect(names.indexOf('Copy.ai')).toBeGreaterThan(0);
  }
});

test('chat maps to AI assistants ahead of Grammarly', () => {
  expect(expandSearchTerms('chat')).toEqual(
    expect.arrayContaining(['chat', 'chatbot', 'assistant', 'llm', 'chatgpt', 'claude', 'gemini'])
  );
  const names = searchTools(published, { q: 'chat' }).map((tool) => tool.name);
  expect(names).toEqual(expect.arrayContaining(['ChatGPT Plus', 'Claude Pro', 'Gemini Pro']));
  expect(names.slice(0, 3)).toEqual(expect.arrayContaining(['ChatGPT Plus', 'Claude Pro', 'Gemini Pro']));
  if (names.includes('Grammarly')) {
    expect(names.indexOf('Grammarly')).toBeGreaterThan(names.indexOf('Claude Pro'));
    expect(names.indexOf('Grammarly')).toBeGreaterThan(names.indexOf('Gemini Pro'));
  }
});

test('common single-word intents return the obvious tools first', () => {
  const first = (q: string) => searchTools(published, { q }).map((tool) => tool.name);
  expect(first('write')[0]).toMatch(/Grammarly|Jasper|Copy\.ai/);
  expect(first('video')[0]).toMatch(/Descript/);
  expect(first('audio')[0]).toMatch(/ElevenLabs|Descript|Whisper/);
  expect(first('music')[0]).toMatch(/ElevenLabs|Descript|Whisper/);
  expect(first('design')[0]).toMatch(/Canva|Midjourney/);
  expect(first('research')[0]).toMatch(/Claude|ChatGPT|Gemini|Notion/);
  expect(first('notes')[0]).toMatch(/Notion/);
  expect(first('agent')[0]).toMatch(/LangChain|Replit/);
  expect(first('automate')[0]).toMatch(/LangChain|Replit|AutoGPT/);
  expect(first('slides')[0]).toMatch(/Canva/);
  expect(first('email')[0]).toMatch(/Copy\.ai|Jasper/);
});

test('writing ranks copy/writing tools above Descript', () => {
  const names = searchTools(published, { q: 'writing' }).map((tool) => tool.name);
  expect(names).toEqual(expect.arrayContaining(['Jasper AI', 'Copy.ai', 'Grammarly', 'Descript']));
  expect(names.indexOf('Copy.ai')).toBeLessThan(names.indexOf('Descript'));
  expect(names.indexOf('Grammarly')).toBeLessThan(names.indexOf('Descript'));
  expect(names.indexOf('Jasper AI')).toBeLessThan(names.indexOf('Descript'));
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
  await expect(page.getByRole('status').filter({ hasText: /Showing \d+ tools/ })).toContainText(/Showing \d+ tools \(filtered from \d+\)/);
}

test('public tools API exposes only public fields and short cache headers', async ({ request }) => {
  const response = await request.get('/api/v1/tools?q=Voice');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['cache-control']).toBe('public, s-maxage=300, stale-while-revalidate=600');
  const body = await response.json();
  expect(body.tools.length).toBeGreaterThan(0);
  const tool = body.tools[0];
  expect(tool).toEqual(expect.objectContaining({
    name: expect.any(String),
    slug: expect.any(String),
    go_url: expect.stringMatching(/\/go\//),
  }));
  expect(tool).not.toHaveProperty('editorial_why');
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
  expect(names.indexOf('Descript')).toBeGreaterThan(names.indexOf('Copy.ai'));
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
  await page.goto('/tools?q=writing&category=content');
  await expect(page.getByRole('article').filter({ hasText: 'Jasper AI' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Grammarly' })).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Copy.ai' })).toHaveCount(0);
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

test('windsurf shows the zero-results state', async ({ page }) => {
  await page.goto('/tools?q=windsurf');
  await expect(page.getByText(/No tools match/)).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('image returns six or more results with image tools first', async ({ page }) => {
  await page.goto('/tools?q=image');
  const names = await page.locator('article h2').allTextContents();
  expect(names.length).toBeGreaterThanOrEqual(6);
  expect(names[0]).toMatch(/Midjourney|Stable Diffusion|Canva|DALL|Leonardo|Ideogram|Flux|Firefly/i);
});

test('chat ranks ChatGPT, Claude, and Gemini ahead of Grammarly', async ({ page }) => {
  await page.goto('/tools?q=chat');
  const names = await page.locator('article h2').allTextContents();
  expect(names).toEqual(expect.arrayContaining(['ChatGPT Plus', 'Claude Pro', 'Gemini Pro']));
  expect(names.slice(0, 3)).toEqual(expect.arrayContaining(['ChatGPT Plus', 'Claude Pro', 'Gemini Pro']));
  if (names.includes('Grammarly')) {
    expect(names.indexOf('Grammarly')).toBeGreaterThan(2);
  }
});

test('code ranks a coding tool first', async ({ page }) => {
  await page.goto('/tools?q=code');
  const names = await page.locator('article h2').allTextContents();
  expect(names[0]).toMatch(/Copilot|Cursor|v0|Bolt|Replit/i);
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
