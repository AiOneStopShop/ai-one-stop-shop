-- Migration: Add 90-day click retention policy
-- Purpose: Comply with legal requirement for 90-day affiliate click retention

-- Create function to delete old clicks (for scheduled cleanup)
CREATE OR REPLACE FUNCTION delete_old_affiliate_clicks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM affiliate_clicks
  WHERE clicked_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Create HTTP-callable function with JSON response (for Vercel Cron / webhook)
CREATE OR REPLACE FUNCTION delete_old_affiliate_clicks_http()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM affiliate_clicks
  WHERE clicked_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'timestamp', NOW()
  );
END;
$$;

-- Revoke execute from all roles (only service_role can call these)
REVOKE EXECUTE ON FUNCTION delete_old_affiliate_clicks() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION delete_old_affiliate_clicks_http() FROM PUBLIC, anon, authenticated;

-- Create plain index for efficient retention cleanup queries
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at
  ON affiliate_clicks (clicked_at);

-- Add comments
COMMENT ON FUNCTION delete_old_affiliate_clicks IS 
  'Deletes affiliate clicks older than 90 days. SECURITY DEFINER with restricted search_path. Execute revoked from all roles except service_role.';

COMMENT ON FUNCTION delete_old_affiliate_clicks_http IS 
  'HTTP-callable cleanup function. Returns JSON with deletion count. Execute revoked from all roles except service_role. Call via service_role from Vercel Cron.';
