-- Migration 022: Fix affiliate slug collision check to use schema-qualified table name
-- The 021 trigger function had search_path='' but queried unqualified "tools",
-- which causes "relation tools does not exist" errors.

CREATE OR REPLACE FUNCTION public.check_affiliate_go_slug_no_collision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE slug = NEW.go_slug
  ) THEN
    RAISE EXCEPTION 'Affiliate go_slug "%" collides with an existing tool slug', NEW.go_slug;
  END IF;
  RETURN NEW;
END;
$$;

-- Revoke execute from public roles for safety
REVOKE EXECUTE ON FUNCTION public.check_affiliate_go_slug_no_collision() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_affiliate_go_slug_no_collision() FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_affiliate_go_slug_no_collision() FROM authenticated;

COMMENT ON FUNCTION public.check_affiliate_go_slug_no_collision IS 'Prevents affiliate go_slug from colliding with tool slugs. Trigger-only function.';
