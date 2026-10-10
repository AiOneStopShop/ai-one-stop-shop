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

-- Revoke execute from public and anon (only service_role and authenticated)
REVOKE EXECUTE ON FUNCTION delete_old_affiliate_clicks() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION delete_old_affiliate_clicks_http() FROM PUBLIC, anon;

-- Grant execute to authenticated for HTTP function (requires auth token)
GRANT EXECUTE ON FUNCTION delete_old_affiliate_clicks_http() TO authenticated;

-- Create plain index for efficient retention cleanup queries
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at
  ON affiliate_clicks (clicked_at);

-- Add comments
COMMENT ON FUNCTION delete_old_affiliate_clicks IS 
  'Deletes affiliate clicks older than 90 days. SECURITY DEFINER with restricted search_path. Execute revoked from anon/public.';

COMMENT ON FUNCTION delete_old_affiliate_clicks_http IS 
  'HTTP-callable cleanup function. Returns JSON with deletion count. Requires authenticated role.';
