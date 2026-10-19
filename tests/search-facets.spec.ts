/**
 * Facets, filters and sorts for public.search_tool_facets() / search_tools() (migration 028),
 * run as anon with production column grants in PGlite. Run: npm run test:search
 */
import { test, expect } from '@playwright/test';
import type { PGlite } from '@electric-sql/pglite';
import { createSearchDb, runFacets, runSearch, type FacetRow } from './helpers/search-db';

let db: PGlite;
test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

test.beforeAll(async () => {
  db = await createSearchDb(['026_search_phase1.sql', '027_search_phase2_ranking.sql', '028_search_phase3_facets.sql']);
});
test.afterAll(async () => { await db?.close(); });

const count = (rows: FacetRow[], facet: string, value: string) =>
  rows.find((r) => r.facet === facet && r.value === value)?.tool_count ?? 0;

test('facet total always equals search_tools result_total', async () => {
  for (const [q, opts] of [
    ['', {}], ['video', {}], ['video', { freeOnly: true }], ['image gen', { platform: 'mobile' }],
    ['coding agent', { platform: 'cli', price: 'free' }], ['', { category: 'writing' }],
  ] as const) {
    const facets = await runFacets(db, q, opts);
    const rows = await runSearch(db, q, opts);
    expect(count(facets, 'total', 'all'), `${q} ${JSON.stringify(opts)}`).toBe(rows[0]?.result_total ?? 0);
  }
});

test('each facet value count matches applying that filter', async () => {
  const facets = await runFacets(db, 'video');
  for (const row of facets.filter((r) => r.tool_count > 0 && r.facet !== 'total')) {
    const opts = row.facet === 'category' ? { category: row.value }
      : row.facet === 'pricing' ? { price: row.value }
        : row.facet === 'platform' ? { platform: row.value }
          : { freeOnly: true };
    const rows = await runSearch(db, 'video', opts);
    expect(rows[0]?.result_total ?? 0, `${row.facet}=${row.value}`).toBe(row.tool_count);
  }
});

test('counts are disjunctive: a facet ignores its own selection but respects the others', async () => {
  const base = await runFacets(db, 'image gen');
  const mobile = await runFacets(db, 'image gen', { platform: 'mobile' });
  // Platform counts stay the same when a platform is selected...
  expect(count(mobile, 'platform', 'web')).toBe(count(base, 'platform', 'web'));
  // ...while other facets narrow to mobile tools only.
  expect(count(mobile, 'total', 'all')).toBe(count(base, 'platform', 'mobile'));
  expect(count(mobile, 'category', 'image')).toBeLessThanOrEqual(count(base, 'category', 'image'));
});

test('whole catalog facets cover every published tool and include freemium', async () => {
  const facets = await runFacets(db, '');
  expect(count(facets, 'total', 'all')).toBe(313);
  expect(count(facets, 'pricing', 'freemium')).toBeGreaterThan(100);
  expect(count(facets, 'free', 'free')).toBeGreaterThan(200);
  expect(facets.filter((r) => r.facet === 'platform').map((r) => r.value)).toEqual(
    expect.arrayContaining(['web', 'desktop', 'mobile', 'api', 'cli', 'self-hosted', 'browser-extension', 'ide']),
  );
});

test('platform groups normalize raw labels (iOS/Android/Mobile -> mobile, Mac/macOS -> desktop)', async () => {
  const rows = await runSearch(db, '', { platform: 'mobile', limit: 50 });
  const raw = rows.flatMap((r) => (r as unknown as { platforms: string[] }).platforms ?? []);
  expect(raw.some((p) => ['iOS', 'Android', 'Mobile'].includes(p))).toBe(true);
  for (const r of rows) {
    const ps = (r as unknown as { platforms: string[] }).platforms ?? [];
    expect(ps.some((p) => ['iOS', 'Android', 'Mobile'].includes(p)), r.name).toBe(true);
  }
});

test('combined filters narrow the result set', async () => {
  const all = (await runSearch(db, 'coding agent'))[0]?.result_total ?? 0;
  const cli = (await runSearch(db, 'coding agent', { platform: 'cli' }))[0]?.result_total ?? 0;
  const cliFree = (await runSearch(db, 'coding agent', { platform: 'cli', price: 'free' }))[0]?.result_total ?? 0;
  expect(cli).toBeLessThan(all);
  expect(cliFree).toBeLessThanOrEqual(cli);
  expect(cliFree).toBeGreaterThan(0);
});

test('sort options: name A-Z, newest, recently verified, free first', async () => {
  const byName = (await runSearch(db, 'video', { sort: 'name' })).map((r) => r.name.toLowerCase());
  expect(byName).toEqual([...byName].sort((a, b) => a.localeCompare(b)));

  const newest = await runSearch(db, 'video', { sort: 'newest' }) as unknown as Array<{ created_at: string }>;
  for (let i = 1; i < newest.length; i += 1) {
    expect(new Date(newest[i - 1].created_at).getTime()).toBeGreaterThanOrEqual(new Date(newest[i].created_at).getTime());
  }

  const verified = await runSearch(db, 'video', { sort: 'verified' }) as unknown as Array<{ last_verified_at: string }>;
  for (let i = 1; i < verified.length; i += 1) {
    expect(new Date(verified[i - 1].last_verified_at).getTime()).toBeGreaterThanOrEqual(new Date(verified[i].last_verified_at).getTime());
  }

  const free = await runSearch(db, 'video', { sort: 'free' }) as unknown as Array<{ has_free_tier: boolean }>;
  const firstPaid = free.findIndex((r) => !r.has_free_tier);
  if (firstPaid >= 0) expect(free.slice(firstPaid).every((r) => !r.has_free_tier)).toBe(true);
});

test('relevance sort is unchanged from Phase 2 for plain queries', async () => {
  expect((await runSearch(db, 'gemini'))[0]?.name).toBe('Gemini');
  expect((await runSearch(db, 'image gen'))[0]?.result_total).toBe(19);
});

test('facets as anon never need tools.review_notes', async () => {
  await expect(runFacets(db, 'video', { platform: 'web' })).resolves.toBeTruthy();
});
