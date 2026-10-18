/**
 * Spins up an in-process Postgres (PGlite + pg_trgm + fuzzystrmatch), loads a snapshot of the
 * published catalog (tests/fixtures/search-catalog.json, public columns only) and applies the
 * search migrations, so search ranking can be tested exactly as it runs in Supabase.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { fuzzystrmatch } from '@electric-sql/pglite/contrib/fuzzystrmatch';

const root = path.resolve(__dirname, '..', '..');

const BASE_SCHEMA = `
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA extensions;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN; END IF;
END $$;
CREATE TABLE public.categories (id uuid PRIMARY KEY, slug text NOT NULL, name text NOT NULL, description text);
CREATE TABLE public.tools (
  id uuid PRIMARY KEY, slug text NOT NULL, name text NOT NULL, tagline text, description text,
  website_url text, pricing_summary text, pricing_model text, has_free_tier boolean, platforms text[],
  features text[], logo_url text, editorial_score integer, editorial_why text, source_url text,
  last_verified_at timestamptz, status text NOT NULL DEFAULT 'published', is_sponsored boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), tags text[],
  review_notes text,
  search_categories text NOT NULL DEFAULT '', search_features text NOT NULL DEFAULT '',
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english'::regconfig, COALESCE(name, ''::text)), 'A') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(tagline, ''::text) || ' ' || COALESCE(search_categories, ''::text) || ' ' || COALESCE(search_features, ''::text)), 'B') ||
    setweight(to_tsvector('english'::regconfig, COALESCE(description, ''::text)), 'C')
  ) STORED
);
CREATE TABLE public.tool_categories (tool_id uuid REFERENCES public.tools(id), category_id uuid REFERENCES public.categories(id), is_primary boolean DEFAULT false);
`;

type Fixture = {
  tools: Array<Record<string, unknown>>;
  categories: Array<{ id: string; slug: string; name: string }>;
  tool_categories: Array<{ tool_id: string; category_id: string }>;
};

export function readMigration(name: string): string {
  return readFileSync(path.join(root, 'supabase', 'migrations', name), 'utf8');
}

export async function createSearchDb(migrations: string[]): Promise<PGlite> {
  const db = await PGlite.create({ extensions: { pg_trgm, fuzzystrmatch } });
  await db.exec(BASE_SCHEMA);
  const fixture = JSON.parse(readFileSync(path.join(root, 'tests', 'fixtures', 'search-catalog.json'), 'utf8')) as Fixture;
  for (const c of fixture.categories) {
    await db.query('INSERT INTO public.categories (id, slug, name) VALUES ($1, $2, $3)', [c.id, c.slug, c.name]);
  }
  for (const t of fixture.tools) {
    await db.query(
      `INSERT INTO public.tools (id, slug, name, tagline, description, pricing_model, has_free_tier, platforms, features, tags,
        editorial_score, search_categories, search_features, is_sponsored)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [t.id, t.slug, t.name, t.tagline, t.description, t.pricing_model, t.has_free_tier, t.platforms, t.features, t.tags,
        t.editorial_score, t.search_categories ?? '', t.search_features ?? '', t.is_sponsored ?? false],
    );
  }
  for (const tc of fixture.tool_categories) {
    await db.query('INSERT INTO public.tool_categories (tool_id, category_id) VALUES ($1, $2)', [tc.tool_id, tc.category_id]);
  }
  for (const m of migrations) await db.exec(readMigration(m));
  return db;
}

export type SearchRow = { slug: string; name: string; search_rank: number; result_total: number; corrected_query?: string | null };

export async function runSearch(db: PGlite, q: string, opts: { exact?: boolean; limit?: number; freeOnly?: boolean } = {}): Promise<SearchRow[]> {
  const hasExact = (await db.query<{ n: number }>(
    "SELECT pronargs AS n FROM pg_proc WHERE proname = 'search_tools' ORDER BY pronargs DESC LIMIT 1",
  )).rows[0]?.n === 7;
  const sql = hasExact
    ? 'SELECT * FROM public.search_tools(q => $1, free_only => $2, "limit" => $3, exact => $4)'
    : 'SELECT * FROM public.search_tools(q => $1, free_only => $2, "limit" => $3)';
  const params = hasExact ? [q, opts.freeOnly ?? false, opts.limit ?? 50, opts.exact ?? false] : [q, opts.freeOnly ?? false, opts.limit ?? 50];
  return (await db.query<SearchRow>(sql, params)).rows;
}
