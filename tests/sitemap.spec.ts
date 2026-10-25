import { test, expect } from '@playwright/test';
import { resolveSitemap } from 'next/dist/build/webpack/loaders/metadata/resolve-route-data';
import {
  buildSitemap,
  safeDate,
  safeRows,
  sitemapBaseUrl,
  slugSegment,
  STATIC_SITEMAP_ROUTES,
} from '../lib/sitemap';
import { TAXONOMY } from '../lib/taxonomy';

const BASE = 'https://www.aionestop.shop';
const NOW = new Date('2026-10-22T12:00:00Z');

function locs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]*)<\/loc>/g), (m) => m[1]);
}

test('static pages still ship when both database queries fail', () => {
  const entries = buildSitemap({ baseUrl: BASE, tools: null, categories: null, now: NOW });
  const xml = resolveSitemap(entries);
  expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  const urls = locs(xml);
  for (const route of STATIC_SITEMAP_ROUTES) expect(urls).toContain(`${BASE}${route}`);
  // Falls back to the built-in taxonomy for category pages.
  for (const category of TAXONOMY) expect(urls).toContain(`${BASE}/category/${category.slug}`);
  expect(urls.some((u) => u.includes('/tools/'))).toBe(false);
});

test('bad rows cannot crash serialization or break the XML', () => {
  const entries = buildSitemap({
    baseUrl: `${BASE}/`,
    now: NOW,
    tools: [
      { slug: 'chatgpt', updated_at: '2026-10-19T14:27:39Z', last_verified_at: null },
      { slug: 'bad-date', updated_at: 'not a date', last_verified_at: 'also bad' },
      { slug: 'no-dates' },
      { slug: 'a&b <c>', updated_at: '2026-10-10T00:00:00Z' },
      { slug: '', updated_at: '2026-10-10T00:00:00Z' },
      { slug: null },
      { slug: 'chatgpt', updated_at: '2026-10-01T00:00:00Z' },
    ],
    categories: [{ slug: 'writing', updated_at: 'garbage' }, { slug: 42 }],
  });
  // Next calls toISOString() on every Date; this would throw on an Invalid Date.
  const xml = resolveSitemap(entries);
  const urls = locs(xml);
  expect(urls).toContain(`${BASE}/tools/chatgpt`);
  expect(urls.filter((u) => u === `${BASE}/tools/chatgpt`)).toHaveLength(1);
  expect(urls).toContain(`${BASE}/tools/bad-date`);
  expect(urls).toContain(`${BASE}/tools/no-dates`);
  expect(urls).toContain(`${BASE}/tools/a%26b%20%3Cc%3E`);
  expect(urls).toContain(`${BASE}/category/writing`);
  expect(urls.some((u) => u.endsWith('/tools/'))).toBe(false);
  expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
  expect(xml).toContain('<lastmod>2026-10-19T14:27:39.000Z</lastmod>');
  expect(xml).not.toContain('Invalid');
});

test('safeRows returns null instead of throwing on error, throw, or timeout', async () => {
  const errors: string[] = [];
  const original = console.error;
  console.error = (msg: string) => errors.push(String(msg));
  try {
    expect(await safeRows('ok', async () => ({ data: [{ slug: 'x' }], error: null }))).toEqual([{ slug: 'x' }]);
    expect(await safeRows('error', async () => ({ data: null, error: { message: 'permission denied' } }))).toBeNull();
    expect(await safeRows('throws', () => { throw new Error('fetch failed'); })).toBeNull();
    expect(await safeRows('rejects', () => Promise.reject(new Error('boom')))).toBeNull();
    expect(await safeRows('hangs', () => new Promise(() => {}), 50)).toBeNull();
    expect(await safeRows('weird', async () => ({ data: 'nope' as any, error: null }))).toBeNull();
  } finally {
    console.error = original;
  }
  expect(errors.join('\n')).toContain('permission denied');
  expect(errors.join('\n')).toContain('timed out');
});

test('helpers', () => {
  expect(sitemapBaseUrl(undefined)).toBe(BASE);
  expect(sitemapBaseUrl(' https://example.com/ ')).toBe('https://example.com');
  expect(safeDate(NOW, null, 'bad', '2026-01-01T00:00:00Z').toISOString()).toBe('2026-01-01T00:00:00.000Z');
  expect(safeDate(NOW, undefined, 'bad')).toBe(NOW);
  expect(slugSegment('  ')).toBeNull();
  expect(slugSegment('notion-ai')).toBe('notion-ai');
});

test('audience guides are listed in the sitemap', () => {
  const xml = resolveSitemap(buildSitemap({ baseUrl: BASE, tools: null, categories: null, now: NOW }));
  const urls = locs(xml);
  expect(urls).toContain(`${BASE}/guides`);
  for (const slug of [
    'best-ai-tools-for-teachers',
    'best-ai-tools-for-small-business',
    'best-ai-tools-for-writers',
    'best-ai-tools-for-students',
    'ai-tools-under-20-a-month',
    'free-ai-tools',
  ]) expect(urls).toContain(`${BASE}/guides/${slug}`);
  expect(urls.some((u) => /monica|musicgpt|chatllm/i.test(u))).toBe(false);
});
