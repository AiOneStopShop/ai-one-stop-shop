-- Grant execute on click-cleanup functions to service_role (002 only REVOKE'd others).
GRANT EXECUTE ON FUNCTION public.delete_old_affiliate_clicks() TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_old_affiliate_clicks_http() TO service_role;

-- 001 already indexes affiliate_clicks(clicked_at) as idx_affiliate_clicks_clicked_at.
-- 002 added a second index on the same column under a misleading name.
DROP INDEX IF EXISTS idx_affiliate_clicks_created_at;
