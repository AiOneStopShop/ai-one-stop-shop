-- Migration: Admin policy for tool submissions
-- Purpose: Allow admin role to read/update submissions after profiles table exists

-- Admin policy for reading/updating submissions (requires admin role in profiles)
DROP POLICY IF EXISTS "Admins can manage submissions" ON tool_submissions;
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

COMMENT ON POLICY "Admins can manage submissions" ON tool_submissions IS 
  'Only admin role can read/update submissions. Submissions are inserted via server action with service_role.';
