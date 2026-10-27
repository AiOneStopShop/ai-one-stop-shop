/** Unit + migration tests for first-party aggregate stats (lib/site-stats.ts, migration 032). */
import { test, expect } from '@playwright/test';
import { cleanUtmValue, parseStatsPayload, recordSiteEvent, resultBucket, scrubText, utmDimensions } from '../lib/site-stats';
import { parseSearchLogPayload } from '../lib/search-log';
import { createSearchDb, readMigration } from './helpers/search-db';

test('utm: only utm_* kept, click IDs and other params dropped, values cleaned', () => {
  const p = new URLSearchParams('utm_source=NewsLetter&utm_medium=email&utm_campaign=Fall%202026!&fbclid=abc&gclid=xyz&email=a@b.co&ref=me');
  expect(utmDimensions(p)).toEqual(['utm_source=newsletter', 'utm_medium=email', 'utm_campaign=fall 2026']);
  expect(utmDimensions(new URLSearchParams('fbclid=1&gclid=2&msclkid=3'))).toEqual([]);
  expect(cleanUtmValue('me@example.com')).toBe('');
  expect(cleanUtmValue('call +1 (555) 123-4567 now')).toBe('call now');
  expect(cleanUtmValue('x'.repeat(200)).length).toBe(40);
});

test('scrubText strips emails and phone numbers and caps length', () => {
  expect(scrubText('ai for jo@x.io and 555-123-4567')).toBe('ai for and');
  expect(scrubText('a'.repeat(100)).length).toBe(60);
});

test('search payload -> bucket and category only, never the text', () => {
  expect(parseStatsPayload({ event: 'search', q: 'secret words', count: 0, category: 'writing' })).toEqual([
    { event: 'search', dimension: 'results=0;category=writing' },
  ]);
  expect(parseStatsPayload({ event: 'search', count: 12, category: 'Bad Value!' })[0].dimension).toBe('results=6-20;category=all');
  expect(resultBucket(3)).toBe('1-5');
  expect(resultBucket(99)).toBe('21+');
});

test('finder payload accepts only fixed labels', () => {
  expect(parseStatsPayload({ event: 'finder', useCase: 'coding', budget: 'free', experience: 'beginner', count: 2 })).toEqual([
    { event: 'finder', dimension: 'useCase=coding;budget=free;experience=beginner;results=1-5' },
  ]);
  expect(parseStatsPayload({ event: 'finder', useCase: 'me@x.com', budget: 'free', experience: 'beginner' })).toEqual([]);
  expect(parseStatsPayload({ event: 'form_success', form: 'newsletter' })).toEqual([]);
  expect(parseStatsPayload(null)).toEqual([]);
});

test('search text log scrubs and caps', () => {
  expect(parseSearchLogPayload({ q: 'email me@x.com', count: 1 })).toBeNull();
  expect(parseSearchLogPayload({ q: 'tools 555-123-4567', count: 1 })).toEqual({ query: 'tools', result_count: 1 });
  expect(parseSearchLogPayload({ q: 'w'.repeat(90), count: 1 })!.query.length).toBe(60);
});

test('recordSiteEvent logs only the error code', async () => {
  const logs: string[] = [];
  const ok = await recordSiteEvent('utm', 'utm_source=x', async () => ({ error: { code: '42501', message: 'ip 203.0.113.9' } as { code: string } }), (m) => logs.push(m));
  expect(ok).toBe(false);
  expect(logs).toEqual(['[site-stats] utm not counted: 42501']);
  const thrown = await recordSiteEvent('utm', 'x', async () => { throw new Error('203.0.113.9'); }, (m) => logs.push(m));
  expect(thrown).toBe(false);
  expect(logs.join(' ')).not.toContain('203.0.113.9');
});

test('migration 032: counters upsert, RLS on, no identifying columns, click columns dropped', async () => {
  test.setTimeout(120_000);
  const db = await createSearchDb(['026_search_phase1.sql']);
  await db.exec(`CREATE TABLE public.affiliate_clicks (id serial PRIMARY KEY, tool_id uuid, clicked_at timestamptz DEFAULT now(), ip_hash text NOT NULL DEFAULT 'h', user_agent text, referrer text, page_path text, is_bot boolean DEFAULT false);`);
  await db.exec(readMigration('032_privacy_safe_stats.sql'));
  await db.exec(`SELECT public.increment_site_event('utm', 'utm_source=x'); SELECT public.increment_site_event('utm', 'utm_source=x'); SELECT public.increment_site_event('form_success', 'newsletter');`);
  const rows = await db.query<{ event: string; dimension: string; count: string }>(`SELECT event, dimension, count::text FROM public.site_event_counts ORDER BY event`);
  expect(rows.rows).toEqual([
    { event: 'form_success', dimension: 'newsletter', count: '1' },
    { event: 'utm', dimension: 'utm_source=x', count: '2' },
  ]);
  const cols = await db.query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('site_event_counts','affiliate_clicks')`
  );
  const names = cols.rows.map((r) => r.column_name);
  for (const bad of ['ip', 'ip_hash', 'user_agent', 'session_id', 'fingerprint']) expect(names).not.toContain(bad);
  const rls = await db.query<{ relrowsecurity: boolean }>(`SELECT relrowsecurity FROM pg_class WHERE relname = 'site_event_counts'`);
  expect(rls.rows[0].relrowsecurity).toBe(true);
  await expect(db.exec(`SELECT public.increment_site_event('bogus', 'x')`)).rejects.toThrow();
  await db.close();
});
