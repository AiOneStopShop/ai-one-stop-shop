-- Add automatic deletion of click logs older than 90 days
-- This job runs daily and deletes old affiliate_clicks records

-- Create function to delete old clicks
CREATE OR REPLACE FUNCTION delete_old_affiliate_clicks()
RETURNS void AS $$
BEGIN
  DELETE FROM affiliate_clicks
  WHERE clicked_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a pg_cron job (requires pg_cron extension)
-- If pg_cron is not available, this should be run manually or via an external cron
-- Schedule: Run daily at 3am UTC
-- SELECT cron.schedule('delete-old-clicks', '0 3 * * *', 'SELECT delete_old_affiliate_clicks()');

-- Note: The above cron.schedule line is commented in SQL because pg_cron may not be enabled
-- To enable: Run this manually after enabling pg_cron extension:
-- SELECT cron.schedule('delete-old-clicks', '0 3 * * *', 'SELECT delete_old_affiliate_clicks()');

-- Alternative: Create a webhook-triggered function for platforms without pg_cron
-- This can be called from a Vercel Cron or external scheduler
CREATE OR REPLACE FUNCTION delete_old_affiliate_clicks_http()
RETURNS json AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated role
GRANT EXECUTE ON FUNCTION delete_old_affiliate_clicks_http() TO authenticated;

-- Add index on clicked_at for faster deletion
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at_retention 
ON affiliate_clicks(clicked_at) 
WHERE clicked_at < NOW() - INTERVAL '80 days';

COMMENT ON FUNCTION delete_old_affiliate_clicks IS 'Deletes affiliate click records older than 90 days for GDPR/privacy compliance';
COMMENT ON FUNCTION delete_old_affiliate_clicks_http IS 'HTTP-callable version of click retention cleanup, returns JSON with deletion count';
