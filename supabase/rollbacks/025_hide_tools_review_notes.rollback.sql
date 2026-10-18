-- Rollback for 025_hide_tools_review_notes.sql (not a migration; run by hand only if needed).
-- Restores table-level SELECT for anon/authenticated (re-exposes review_notes) and the
-- original search_tools() from 015. The explicit-column app code keeps working either way.
BEGIN;
REVOKE SELECT (
  id,
  slug,
  name,
  tagline,
  description,
  website_url,
  pricing_summary,
  pricing_model,
  has_free_tier,
  platforms,
  features,
  logo_url,
  editorial_score,
  editorial_why,
  source_url,
  last_verified_at,
  status,
  is_sponsored,
  created_at,
  updated_at,
  tags,
  search_categories,
  search_features,
  search_vector
) ON TABLE public.tools FROM anon, authenticated;
GRANT SELECT ON TABLE public.tools TO anon, authenticated;
COMMENT ON COLUMN public.tools.review_notes IS
  'Admin-only hold and review reasons. Never select this column in the public API or public pages.';
COMMIT;
-- search_tools(): no change needed on rollback. The explicit-column version returns the same
-- rows and columns as the 015 version; re-run the function block from 015 only if you want
-- the exact old text back.
NOTIFY pgrst, 'reload schema';
