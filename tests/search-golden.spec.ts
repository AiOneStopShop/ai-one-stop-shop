/**
 * Golden queries for public.search_tools() (migration 027), run against an in-process Postgres
 * (PGlite) loaded with a snapshot of the published catalog. This is the single ranking source,
 * so these expectations guard real production behavior. Run: npm run test:search
 */
import { test, expect } from '@playwright/test';
import type { PGlite } from '@electric-sql/pglite';
import { createSearchDb, runSearch } from './helpers/search-db';

let db: PGlite;

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

test.beforeAll(async () => {
  db = await createSearchDb(['026_search_phase1.sql', '027_search_phase2_ranking.sql']);
});

test.afterAll(async () => {
  await db?.close();
});

const names = async (q: string, opts: { exact?: boolean; freeOnly?: boolean } = {}) => {
  const rows = await runSearch(db, q, opts);
  return { rows, names: rows.map((r) => r.name), total: rows[0]?.result_total ?? 0, corrected: rows[0]?.corrected_query ?? null };
};

test('gemini: exact name first, only Gemini-family tools', async () => {
  const r = await names('gemini');
  expect(r.names[0]).toBe('Gemini');
  expect(r.names.slice(0, 5).every((n) => n.startsWith('Gemini'))).toBe(true);
  expect(r.total).toBeLessThanOrEqual(15);
  expect(r.corrected).toBeNull();
});

test('imgae: corrected to image, with image generators on top', async () => {
  const r = await names('imgae');
  expect(r.corrected).toBe('image');
  expect(r.total).toBeGreaterThan(10);
  expect(r.names.slice(0, 10)).toEqual(expect.arrayContaining(['Leonardo.Ai']));
});

test('imgae with exact=true is not corrected', async () => {
  const r = await names('imgae', { exact: true });
  expect(r.corrected).toBeNull();
  expect(r.total).toBe(0);
});

test('grammerly: corrected to grammarly, Grammarly first', async () => {
  const r = await names('grammerly');
  expect(r.corrected).toBe('grammarly');
  expect(r.names[0]).toBe('Grammarly');
});

test('image gen: a focused set of image generators (about 20, not 118)', async () => {
  const r = await names('image gen');
  expect(r.total).toBeGreaterThanOrEqual(10);
  expect(r.total).toBeLessThanOrEqual(30);
  expect(r.names).toEqual(expect.arrayContaining(['Midjourney', 'Leonardo.Ai', 'Ideogram', 'DALL-E 3', 'Adobe Firefly']));
  for (const music of ['Suno', 'Udio', 'Boomy']) expect(r.names).not.toContain(music);
});

test('video: video tools on top, bounded result set', async () => {
  const r = await names('video');
  expect(r.total).toBeLessThanOrEqual(40);
  expect(r.names.slice(0, 10)).toEqual(expect.arrayContaining(['InVideo', 'HeyGen']));
});

test('make videos from text: text-to-video tools only', async () => {
  const r = await names('make videos from text');
  expect(r.total).toBeGreaterThanOrEqual(5);
  expect(r.total).toBeLessThanOrEqual(20);
  expect(r.names.slice(0, 3)).toEqual(expect.arrayContaining(['Fliki', 'Runway']));
});

test('coding agent: coding agents first', async () => {
  const r = await names('coding agent');
  expect(r.total).toBeLessThanOrEqual(40);
  expect(r.names.slice(0, 5)).toEqual(expect.arrayContaining(['Claude Code']));
  expect(r.names.slice(0, 10)).toEqual(expect.arrayContaining(['Codex CLI']));
});

test('free chatbot: only free-tier tools, chat assistants first', async () => {
  const r = await names('free chatbot');
  expect(r.rows.length).toBeGreaterThanOrEqual(5);
  expect(r.rows.every((row) => (row as unknown as { has_free_tier: boolean }).has_free_tier)).toBe(true);
  expect(r.names.slice(0, 3)).toEqual(expect.arrayContaining(['Gemini']));
});

test('text to speech: TTS tools, ElevenLabs in the top 5', async () => {
  const r = await names('text to speech');
  expect(r.total).toBeLessThanOrEqual(25);
  expect(r.names.slice(0, 5)).toEqual(expect.arrayContaining(['Murf AI', 'Speechify', 'ElevenLabs']));
});

test('chatgpt and notion: exact product first', async () => {
  expect((await names('chatgpt')).names[0]).toBe('ChatGPT Plus');
  expect((await names('notion')).names[0]).toBe('Notion AI');
});

test('writing: writing tools, Grammarly included', async () => {
  const r = await names('writing');
  expect(r.total).toBeLessThanOrEqual(40);
  expect(r.names).toContain('Grammarly');
  expect(r.names.slice(0, 5)).toEqual(expect.arrayContaining(['Writesonic']));
});

test('filler-only and empty queries browse the catalog', async () => {
  expect((await names('ai tools')).total).toBeGreaterThan(100);
  expect((await names('')).total).toBeGreaterThan(100);
});

test('nonsense query returns nothing', async () => {
  expect((await names('zzqxjv')).total).toBe(0);
});
