-- Migration 023: Allow anonymous read access to active affiliate links
-- Required for public pages to display paid link labels and affiliate disclosures

-- Allow anonymous users to read active affiliate links
CREATE POLICY IF NOT EXISTS "Allow anon read active affiliate links"
  ON public.affiliate_links
  FOR SELECT
  USING (is_active = true);
