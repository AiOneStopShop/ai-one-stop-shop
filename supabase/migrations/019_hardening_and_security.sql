-- Migration 019: Security hardening and fixes
-- Restores hardening from 009, revokes public EXECUTE on security-sensitive functions

-- 1. Restore update_updated_at_column with proper search_path hardening
-- (Migration 018 redefined it with `search_path = public`, which is less secure than the original `search_path = ''` from 009)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Revoke public EXECUTE on increment_placement_event
-- This function is SECURITY DEFINER and should only be callable by service role
-- Revoking from PUBLIC, anon and authenticated prevents direct RPC calls that could fake impression/click counts
REVOKE EXECUTE ON FUNCTION increment_placement_event(UUID, TEXT, DATE) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_placement_event(UUID, TEXT, DATE) FROM anon;
REVOKE EXECUTE ON FUNCTION increment_placement_event(UUID, TEXT, DATE) FROM authenticated;

-- Keep it available for the API to call (via service role)
GRANT EXECUTE ON FUNCTION increment_placement_event(UUID, TEXT, DATE) TO service_role;

-- Comment for documentation
COMMENT ON FUNCTION increment_placement_event IS 'Safely increment impression or click count for a placement. Only callable by service role via API.';
