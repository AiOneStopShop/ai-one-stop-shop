-- 029: public_live_placements runs as the caller, and only the server reads it.
-- NOT APPLIED. Needs Kati's approval before it runs on production.
--
-- Advisor ERROR security_definer_view: the view was created in 018 without
-- security_invoker, so it bypassed RLS and ran as its owner. sponsor_placements
-- and sponsors are service-role-only under RLS, so flipping the flag alone would
-- hide every sponsored slot from the anon client. The app now reads this view
-- with the server-only service client (lib/sponsor-placements.ts), so anon and
-- authenticated lose all access to it.
--
-- Deploy order: ship the app change first (it works with or without this
-- migration), then apply this migration.

BEGIN;

ALTER VIEW public.public_live_placements SET (security_invoker = true);

REVOKE ALL ON public.public_live_placements FROM anon, authenticated;
GRANT SELECT ON public.public_live_placements TO service_role;

COMMIT;
