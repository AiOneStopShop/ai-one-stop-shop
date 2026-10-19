-- 030: lock down trigger functions.
-- NOT APPLIED. Needs Kati's approval before it runs on production.
--
-- update_llm_pricing_updated_at (from 017) had a mutable search_path (advisor
-- WARN). Its body only calls NOW(), which lives in pg_catalog, so an empty
-- search_path is safe. Any future table reference in it must be schema-qualified.
--
-- Trigger functions do not need EXECUTE for the roles that fire the trigger,
-- so remove the default PUBLIC/anon/authenticated EXECUTE grants.

BEGIN;

ALTER FUNCTION public.update_llm_pricing_updated_at() SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.update_llm_pricing_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_tool_search_categories() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_tool_search_features() FROM PUBLIC, anon, authenticated;

COMMIT;
