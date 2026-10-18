-- Migration 024: newsletter signups (simple list, no third-party email service)
-- Written to by /api/newsletter with the service role only. Not readable by anon.
-- Re-runnable.

CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'newsletter_page',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  CONSTRAINT newsletter_signups_email_len CHECK (char_length(email) BETWEEN 3 AND 254)
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_signups_email_lower_idx
  ON public.newsletter_signups (lower(email));

ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.newsletter_signups FROM anon, authenticated;

DROP POLICY IF EXISTS newsletter_signups_service_only ON public.newsletter_signups;
CREATE POLICY newsletter_signups_service_only ON public.newsletter_signups
  FOR ALL
  USING (auth.role() = 'service_role');
