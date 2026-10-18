/**
 * Columns of public.tools that the public site may read with the anon key.
 *
 * Migration 025 grants SELECT on exactly these columns (plus the search helper
 * columns used inside search_tools) to anon and authenticated, and nothing else.
 * `select('*')` on tools fails for those roles, because PostgREST expands `*` to
 * every column, including admin-only review_notes. Always list columns explicitly;
 * if you add a public column to tools, add it here and grant it in a migration.
 */
export const PUBLIC_TOOL_COLUMNS = [
  'id',
  'slug',
  'name',
  'tagline',
  'description',
  'website_url',
  'pricing_summary',
  'pricing_model',
  'has_free_tier',
  'platforms',
  'features',
  'logo_url',
  'editorial_score',
  'editorial_why',
  'source_url',
  'last_verified_at',
  'status',
  'is_sponsored',
  'created_at',
  'updated_at',
  'tags',
].join(', ');
