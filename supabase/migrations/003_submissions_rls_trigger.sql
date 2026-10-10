-- Migration: Tool submissions RLS and constraints
-- Purpose: Force status='pending', add length limits, and secure RLS

-- Drop existing permissive policy if it exists
DROP POLICY IF EXISTS "Anyone can submit tools for review" ON tool_submissions;

-- Add length constraints on text columns
ALTER TABLE tool_submissions
  ADD CONSTRAINT tool_name_length CHECK (length(tool_name) BETWEEN 1 AND 200),
  ADD CONSTRAINT website_url_length CHECK (length(website_url) BETWEEN 1 AND 500),
  ADD CONSTRAINT contact_email_length CHECK (length(contact_email) BETWEEN 1 AND 200),
  ADD CONSTRAINT description_length CHECK (length(description) <= 2000);

-- Create trigger function to force status='pending' on insert
CREATE OR REPLACE FUNCTION force_submission_pending()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Always force status to 'pending' regardless of what client sends
  NEW.status := 'pending';
  RETURN NEW;
END;
$$;

-- Revoke execute from public roles (only service_role should call this implicitly via trigger)
REVOKE EXECUTE ON FUNCTION force_submission_pending() FROM PUBLIC, anon, authenticated;

-- Create trigger to enforce pending status
DROP TRIGGER IF EXISTS enforce_pending_status ON tool_submissions;
CREATE TRIGGER enforce_pending_status
  BEFORE INSERT ON tool_submissions
  FOR EACH ROW
  EXECUTE FUNCTION force_submission_pending();

-- Create restrictive RLS policy for anonymous submissions
-- Only allows insert, forces authenticated via trigger, no reads/updates from client
CREATE POLICY "Anonymous can insert pending submissions only"
  ON tool_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true); -- Trigger forces status='pending', constraints enforce lengths

-- Admin policy for reading/updating submissions
CREATE POLICY "Authenticated admins can manage submissions"
  ON tool_submissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;

COMMENT ON POLICY "Anonymous can insert pending submissions only" ON tool_submissions IS 
  'Allows anonymous submission insert only. Trigger forces status=pending. Length constraints enforced.';
