import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { publishedFallbackTools } from '../lib/catalog-tools';
import { parseBudgetSearchParams, serializeBudgetSearchParams } from '../lib/budget-url';
import { parseListedPrice, priceForStack } from '../lib/pricing';
import { PERSONAS } from '../lib/personas';
import { buildToolkit, starterToolkitForPersona } from '../lib/toolkit';

const catalog = publishedFallbackTools();

test('persona list covers the four launch personas', () => {
  expect(PERSONAS.map((persona) => persona.slug)).toEqual(['sarah', 'fred', 'claire', 'steve']);
});

test('each persona has its own audience, goals and starter picks', () => {
  const audiences = new Set(PERSONAS.map((persona) => persona.audience));
  expect(audiences.size).toBe(PERSONAS.length);
  const slotIds = PERSONAS.flatMap((persona) => persona.slotIds);
  expect(new Set(slotIds).size).toBe(slotIds.length);
  const picks = PERSONAS.flatMap((persona) => starterToolkitForPersona(catalog, persona.slug).pickedSlugs);
  expect(picks.length).toBeGreaterThan(0);
  expect(new Set(picks).size).toBe(picks.length);
});

test('unknown listed prices stay check price', () => {
  expect(parseListedPrice({ pricing_summary: 'Pay-per-use', pricing_model: 'pay-per-use' }).label).toBe('check price');
  expect(parseListedPrice({ pricing_summary: '', pricing_model: 'subscription' }).label).toBe('check price');
  expect(parseListedPrice({ pricing_summary: '$20/month', pricing_model: 'subscription' }).monthlyUsd).toBe(20);
});

test('$0 stack uses only free or free-tier tools', () => {
  const result = buildToolkit(catalog, {
    persona: 'sarah',
    budget: 0,
    goals: [],
    needs: [],
    freeFirst: false,
    picks: {},
  });
  expect(result.pickedSlugs.length).toBeGreaterThan(0);
  expect(result.monthlyTotal).toBe(0);
  for (const slot of result.slots) {
    if (!slot.pick) continue;
    expect(slot.pick.price.kind).toBe('free');
    expect(slot.pick.price.monthlyUsd).toBe(0);
    expect(slot.pick.tool.has_free_tier || slot.pick.tool.pricing_model === 'free').toBeTruthy();
  }
});

test('$50 stack stays at or under $50 using listed monthly prices', () => {
  const result = buildToolkit(catalog, {
    persona: 'fred',
    budget: 50,
    goals: [],
    needs: [],
    freeFirst: false,
    picks: {},
  });
  expect(result.pickedSlugs.length).toBeGreaterThan(0);
  expect(result.monthlyTotal).toBeLessThanOrEqual(50);
  let sum = 0;
  for (const slot of result.slots) {
    if (!slot.pick) continue;
    expect(slot.pick.price.kind).not.toBe('unknown');
    sum += slot.pick.price.monthlyUsd || 0;
  }
  expect(sum).toBe(result.monthlyTotal);
  expect(sum).toBeLessThanOrEqual(50);
});

test('URL query round-trips persona, budget, goals, and picks', () => {
  const query = parseBudgetSearchParams({
    persona: 'freelance-fred',
    budget: '50',
    goals: 'writing,design',
    need: 'writing',
    free: '1',
    picks: 'writing:grammarly',
  });
  expect(query).toEqual({
    persona: 'fred',
    budget: 50,
    goals: ['writing', 'design'],
    needs: ['writing'],
    freeFirst: true,
    picks: { writing: 'grammarly' },
  });
  expect(serializeBudgetSearchParams(query)).toBe(
    'persona=fred&budget=50&goals=writing%2Cdesign&need=writing&free=1&picks=writing%3Agrammarly'
  );
});

test('free-first counts a free tier as $0 instead of inventing a paid price', () => {
  const priced = priceForStack(
    { pricing_summary: '$12/month', pricing_model: 'subscription', has_free_tier: true },
    { freeFirst: true }
  );
  expect(priced).toMatchObject({ kind: 'free', monthlyUsd: 0, label: 'Free tier' });
});

test.describe('persona and budget pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookieConsent', 'accepted');
    });
  });

  for (const slug of ['sarah', 'fred', 'claire', 'steve']) {
    test(`/personas/${slug} renders tools and JSON-LD`, async ({ page }) => {
      await page.goto(`/personas/${slug}`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const slots = page.getByTestId('toolkit-slot');
      await expect(slots.first()).toBeVisible();
      const filled = await slots.evaluateAll((nodes) =>
        nodes.filter((node) => node.getAttribute('data-tool-slug')).length
      );
      expect(filled).toBeGreaterThan(0);
      const jsonLd = page.locator('script[type="application/ld+json"]');
      expect(await jsonLd.count()).toBeGreaterThan(0);
      await expect(page.getByText(/Prices come from public pricing pages/)).toBeVisible();
    });
  }

  test('$0 budget page returns only free tools', async ({ page }) => {
    await page.goto('/budget?persona=sarah&budget=0', { waitUntil: 'domcontentloaded' });
    const total = page.getByTestId('toolkit-total');
    await expect(total).toHaveAttribute('data-monthly-total', '0');
    const kinds = await page.getByTestId('toolkit-slot').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-price-kind'))
    );
    expect(kinds.some((kind) => kind && kind !== 'empty')).toBeTruthy();
    for (const kind of kinds) {
      expect(['free', 'empty']).toContain(kind);
    }
  });

  test('$50 budget page stays at or under $50', async ({ page }) => {
    await page.goto('/budget?persona=fred&budget=50', { waitUntil: 'domcontentloaded' });
    const total = Number(await page.getByTestId('toolkit-total').getAttribute('data-monthly-total'));
    expect(total).toBeLessThanOrEqual(50);
    const amounts = await page.getByTestId('toolkit-slot').evaluateAll((nodes) =>
      nodes.map((node) => Number(node.getAttribute('data-monthly') || 0))
    );
    expect(amounts.reduce((sum, amount) => sum + amount, 0)).toBeLessThanOrEqual(50);
  });

  test('shared budget URL round-trips the same stack', async ({ page }) => {
    const url = '/budget?persona=fred&budget=50&goals=writing,design&need=writing&picks=writing:grammarly';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const first = await page.getByTestId('toolkit-slot').evaluateAll((nodes) =>
      nodes.map((node) => `${node.getAttribute('data-slot')}:${node.getAttribute('data-tool-slug')}`)
    );
    expect(first.some((row) => row.startsWith('writing:grammarly'))).toBeTruthy();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const second = await page.getByTestId('toolkit-slot').evaluateAll((nodes) =>
      nodes.map((node) => `${node.getAttribute('data-slot')}:${node.getAttribute('data-tool-slug')}`)
    );
    expect(second).toEqual(first);
    expect(page.url()).toContain('persona=fred');
    expect(page.url()).toContain('budget=50');
    expect(page.url()).toContain('picks=writing');
  });

  test('keyboard-only budget flow updates the stack', async ({ page }) => {
    await page.goto('/budget', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    await page.locator('form').getByRole('radio', { name: /Fred/ }).focus();
    await page.keyboard.press('Space');
    await page.locator('form').getByRole('radio', { name: /\$0 \(free tools only\)/ }).focus();
    await page.keyboard.press('Space');
    await page.locator('form').getByRole('button', { name: 'Update stack' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/persona=fred/);
    await expect(page).toHaveURL(/budget=0/);
    await expect(page.getByTestId('toolkit-total')).toHaveAttribute('data-monthly-total', '0');
  });

  test('axe has 0 violations on personas and budget', async ({ page }) => {
    for (const route of ['/personas', '/personas/sarah', '/budget?persona=fred&budget=50']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations,
        `${route}: ${results.violations.map((v) => `${v.id}: ${v.help}`).join('\n')}`
      ).toEqual([]);
    }
  });
});
