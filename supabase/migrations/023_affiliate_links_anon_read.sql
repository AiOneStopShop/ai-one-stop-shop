-- Migration 023: Allow anonymous read access to active affiliate links
-- Required for public pages to display paid link labels and affiliate disclosures,
-- and for scripts/check-affiliate-flag.mjs (anon key) to see live rows.
--
-- PostgreSQL has no CREATE POLICY IF NOT EXISTS, so drop-then-create keeps this re-runnable.

ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read active affiliate links" ON public.affiliate_links;

CREATE POLICY "Allow anon read active affiliate links"
  ON public.affiliate_links
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
