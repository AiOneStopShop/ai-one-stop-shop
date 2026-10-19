/**
 * Production ran 027 three times: 027_search_phase2_ranking, then _rollback, then _v2
 * (see supabase/MIGRATION_HISTORY.md). Replaying that recorded history must end in the
 * same search behavior as the short chain the golden tests use. Run: npm run test:search
 */
import { test, expect } from '@playwright/test';
import type { PGlite } from '@electric-sql/pglite';
import { createSearchDb, runSearch } from './helpers/search-db';

test.describe.configure({ mode: 'serial' });
test.setTimeout(180_000);

let short: PGlite;
let history: PGlite;

test.beforeAll(async () => {
  short = await createSearchDb(['026_search_phase1.sql', '027_search_phase2_ranking.sql', '028_search_phase3_facets.sql']);
  history = await createSearchDb([
    '026_search_phase1.sql',
    '027_search_phase2_ranking.sql',
    '027_search_phase2_ranking_rollback.sql',
    '027_search_phase2_ranking_v2.sql',
    '028_search_phase3_facets.sql',
  ]);
});

test.afterAll(async () => {
  await short?.close();
  await history?.close();
});

test('replaying the recorded 027 history gives the same search results', async () => {
  for (const q of ['gemini', 'imgae', 'chat', 'video editing', 'free writing', 'code']) {
    const a = await runSearch(short, q);
    const b = await runSearch(history, q);
    expect(b.map((r) => r.slug), q).toEqual(a.map((r) => r.slug));
  }
});

test('the function definitions match after replay', async () => {
  const sql = `SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args, md5(pg_get_functiondef(p.oid)) AS h
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' ORDER BY 1, 2`;
  const a = (await short.query(sql)).rows;
  const b = (await history.query(sql)).rows;
  expect(b).toEqual(a);
});
