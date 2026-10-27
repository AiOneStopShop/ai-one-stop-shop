-- Rollback for 032. Dropped affiliate_clicks.ip_hash / user_agent values cannot be restored.
BEGIN;
DROP FUNCTION IF EXISTS public.increment_site_event(text, text);
DROP TABLE IF EXISTS public.site_event_counts;
ALTER TABLE public.affiliate_clicks ADD COLUMN IF NOT EXISTS ip_hash text;
ALTER TABLE public.affiliate_clicks ADD COLUMN IF NOT EXISTS user_agent text;
COMMIT;
