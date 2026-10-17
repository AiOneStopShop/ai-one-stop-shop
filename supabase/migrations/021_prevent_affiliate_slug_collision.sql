-- Migration 021: Prevent affiliate go_slug from colliding with tool slugs
-- Ensures affiliate_links.go_slug never matches an existing tools.slug

-- Add a constraint to prevent collisions
-- This uses a function to check that go_slug doesn't exist in tools.slug
CREATE OR REPLACE FUNCTION check_affiliate_go_slug_no_collision()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tools WHERE slug = NEW.go_slug
  ) THEN
    RAISE EXCEPTION 'Affiliate go_slug "%" collides with an existing tool slug', NEW.go_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = '';

CREATE TRIGGER affiliate_links_go_slug_collision_check
  BEFORE INSERT OR UPDATE ON affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION check_affiliate_go_slug_no_collision();

COMMENT ON FUNCTION check_affiliate_go_slug_no_collision IS 'Prevents affiliate go_slug from colliding with tool slugs';
