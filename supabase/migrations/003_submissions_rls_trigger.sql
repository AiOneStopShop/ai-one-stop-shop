-- Migration: Tool submissions RLS and constraints
-- Purpose: Force status='pending', add length limits, and secure RLS

-- Drop existing permissive policy from 001
DROP POLICY IF EXISTS "Anyone can submit tools" ON tool_submissions;

-- Add length constraints on text columns
ALTER TABLE tool_submissions
  ADD CONSTRAINT tool_name_length CHECK (length(tool_name) BETWEEN 1 AND 200),
  ADD CONSTRAINT website_url_length CHECK (length(website_url) BETWEEN 1 AND 500),
  ADD CONSTRAINT contact_email_length CHECK (length(contact_email) BETWEEN 1 AND 200),
  ADD CONSTRAINT description_length CHECK (length(description) <= 2000);

-- Create trigger function to force status='pending' and clear reviewer fields on insert
CREATE OR REPLACE FUNCTION force_submission_pending()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Always force status to 'pending' and clear reviewer fields
  NEW.status := 'pending';
  NEW.reviewed_by := NULL;
  NEW.reviewed_at := NULL;
  NEW.review_notes := NULL;
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

-- Remove all client-side insert policies (submissions go through server action only)
-- Server action uses service_role, which bypasses RLS

-- Admin policy for reading/updating submissions (requires admin role in profiles)
CREATE POLICY "Admins can manage submissions"
  ON tool_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;

COMMENT ON POLICY "Admins can manage submissions" ON tool_submissions IS 
  'Only admin role can read/update submissions. Submissions are inserted via server action with service_role.';

-- IMPORTANT: Disable public signups in Supabase Auth settings
-- Set "Enable Email Confirmations" to OFF or "Disable signups" to ON
-- Admin accounts must be created manually via SQL (see 004_profiles_and_admin.sql)
