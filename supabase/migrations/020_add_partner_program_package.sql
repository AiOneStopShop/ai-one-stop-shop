-- Migration 020: Add partner_program to sponsor_intake package constraint
-- Allows partner program submissions through the /partners intake form

-- Update the CHECK constraint to include 'partner_program'
ALTER TABLE sponsor_intake
DROP CONSTRAINT IF EXISTS sponsor_intake_package_check;

ALTER TABLE sponsor_intake
ADD CONSTRAINT sponsor_intake_package_check
CHECK (package IN ('featured_tool', 'category_spotlight', 'newsletter', 'founding_bundle', 'request', 'partner_program'));

COMMENT ON CONSTRAINT sponsor_intake_package_check ON sponsor_intake IS 'Valid package types: featured_tool, category_spotlight, newsletter, founding_bundle, request, partner_program';
