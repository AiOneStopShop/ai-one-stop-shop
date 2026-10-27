-- 032: privacy-safe, aggregate site statistics (Lexi legal check, Oct 2026).
--  * public.site_event_counts: daily counters (day, event, dimension) -> count.
--    No IP, user agent, session ID or fingerprint column exists. RLS on, no
--    public policies: only service_role (server code) can read or write.
--  * public.increment_site_event(): atomic upsert, EXECUTE for service_role only.
--  * affiliate_clicks: drop ip_hash and user_agent (existing values are erased).
--  * search_queries: retention cut from 90 to 30 days; length cap 60.
-- Rollback: supabase/rollbacks/032_privacy_safe_stats.rollback.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.site_event_counts (
  day date NOT NULL DEFAULT (pg_catalog.now() AT TIME ZONE 'utc')::date,
  event text NOT NULL CHECK (event IN ('search', 'finder', 'form_success', 'utm')),
  dimension text NOT NULL DEFAULT '' CHECK (pg_catalog.length(dimension) <= 80),
  count bigint NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (day, event, dimension)
);

ALTER TABLE public.site_event_counts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.site_event_counts FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.site_event_counts TO service_role;

CREATE OR REPLACE FUNCTION public.increment_site_event(p_event text, p_dimension text)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  INSERT INTO public.site_event_counts (day, event, dimension, count)
  VALUES ((pg_catalog.now() AT TIME ZONE 'utc')::date, p_event, pg_catalog.left(COALESCE(p_dimension, ''), 80), 1)
  ON CONFLICT (day, event, dimension)
  DO UPDATE SET count = public.site_event_counts.count + 1;
$$;
REVOKE ALL ON FUNCTION public.increment_site_event(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_site_event(text, text) TO service_role;

-- Outbound /go clicks: no per-visitor data at all.
ALTER TABLE public.affiliate_clicks DROP COLUMN IF EXISTS ip_hash;
ALTER TABLE public.affiliate_clicks DROP COLUMN IF EXISTS user_agent;

-- Search text log: shorter retention, shorter cap.
DELETE FROM public.search_queries WHERE pg_catalog.length(query) > 60;
CREATE OR REPLACE FUNCTION public.delete_old_search_queries()
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH d AS (
    DELETE FROM public.search_queries WHERE created_at < pg_catalog.now() - interval '30 days' RETURNING 1
  )
  SELECT pg_catalog.count(*)::integer FROM d;
$$;
REVOKE ALL ON FUNCTION public.delete_old_search_queries() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_old_search_queries() TO service_role;

DROP POLICY IF EXISTS search_queries_insert_only ON public.search_queries;
CREATE POLICY search_queries_insert_only ON public.search_queries
  FOR INSERT TO anon, authenticated
  WITH CHECK (pg_catalog.length(query) BETWEEN 1 AND 60 AND result_count >= 0);

COMMIT;
