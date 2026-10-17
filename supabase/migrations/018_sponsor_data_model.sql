-- Migration 018: Sponsor data model
-- Creates tables, indexes, policies, and triggers for sponsorships and placements
-- Note: Some CREATE INDEX and policy statements may fail on re-run; apply once per database

-- Create tables if they don't exist (idempotent)
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sponsor placements table
CREATE TABLE IF NOT EXISTS sponsor_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  package TEXT NOT NULL CHECK (package IN ('featured_tool', 'category_spotlight', 'newsletter')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  issue_id TEXT,
  blurb TEXT,
  logo_url TEXT,
  link_url TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'live', 'ended', 'declined')),
  price_cents INTEGER NOT NULL DEFAULT 0,
  stripe_payment_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (ends_at > starts_at),
  CONSTRAINT featured_tool_requires_tool_id CHECK (
    package != 'featured_tool' OR tool_id IS NOT NULL
  ),
  CONSTRAINT category_spotlight_requires_category CHECK (
    package != 'category_spotlight' OR category_id IS NOT NULL
  )
);

-- Sponsor intake table (raw form submissions)
CREATE TABLE IF NOT EXISTS sponsor_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_url TEXT NOT NULL,
  package TEXT NOT NULL CHECK (package IN ('featured_tool', 'category_spotlight', 'newsletter', 'founding_bundle', 'request')),
  preferred_start_date DATE,
  category_slug TEXT,
  blurb TEXT,
  logo_url TEXT,
  logo_file_path TEXT,
  destination_url TEXT,
  targets_children BOOLEAN DEFAULT FALSE,
  agreed_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
  agreed_to_rights BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'declined', 'processing')),
  decline_reason TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Placement events table (aggregated daily counts)
CREATE TABLE IF NOT EXISTS placement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id UUID NOT NULL REFERENCES sponsor_placements(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
  day DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate daily entries
  UNIQUE(placement_id, event_type, day)
);

-- Indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);
CREATE INDEX IF NOT EXISTS idx_sponsors_created_at ON sponsors(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sponsor_placements_sponsor_id ON sponsor_placements(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_placements_tool_id ON sponsor_placements(tool_id) WHERE tool_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sponsor_placements_category_id ON sponsor_placements(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sponsor_placements_status ON sponsor_placements(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_placements_dates ON sponsor_placements(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_sponsor_placements_package ON sponsor_placements(package);

-- Index for finding live placements efficiently
CREATE INDEX IF NOT EXISTS idx_sponsor_placements_live ON sponsor_placements(status, starts_at, ends_at, package) 
  WHERE status = 'live';

CREATE INDEX IF NOT EXISTS idx_sponsor_intake_status ON sponsor_intake(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_intake_submitted_at ON sponsor_intake(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_placement_events_placement_id ON placement_events(placement_id);
CREATE INDEX IF NOT EXISTS idx_placement_events_day ON placement_events(day DESC);
CREATE INDEX IF NOT EXISTS idx_placement_events_lookup ON placement_events(placement_id, event_type, day);

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_events ENABLE ROW LEVEL SECURITY;

-- Create view for public display of live placements
CREATE OR REPLACE VIEW public_live_placements AS
SELECT 
  sp.id,
  sp.tool_id,
  sp.package,
  sp.category_id,
  sp.blurb,
  sp.logo_url,
  sp.link_url,
  sp.starts_at,
  sp.ends_at,
  s.company
FROM sponsor_placements sp
JOIN sponsors s ON s.id = sp.sponsor_id
WHERE sp.status = 'live'
  AND sp.starts_at <= NOW()
  AND sp.ends_at >= NOW();

-- Grant access to the view for anon users
GRANT SELECT ON public_live_placements TO anon;
GRANT SELECT ON public_live_placements TO authenticated;

-- RLS Policies: Anonymous users can only read through the view
-- All direct table access requires service role

-- Sponsors: service role only
CREATE POLICY sponsors_service_only ON sponsors
  FOR ALL
  USING (auth.role() = 'service_role');

-- Sponsor placements: service role only  
CREATE POLICY sponsor_placements_service_only ON sponsor_placements
  FOR ALL
  USING (auth.role() = 'service_role');

-- Sponsor intake: service role only
CREATE POLICY sponsor_intake_service_only ON sponsor_intake
  FOR ALL
  USING (auth.role() = 'service_role');

-- Placement events: service role only
CREATE POLICY placement_events_service_only ON placement_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- Update triggers for updated_at

CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_placements_updated_at BEFORE UPDATE ON sponsor_placements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_intake_updated_at BEFORE UPDATE ON sponsor_intake
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placement_events_updated_at BEFORE UPDATE ON placement_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to increment placement events (used by API)
CREATE OR REPLACE FUNCTION increment_placement_event(
  p_placement_id UUID,
  p_event_type TEXT,
  p_day DATE DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO placement_events (placement_id, event_type, day, count)
  VALUES (p_placement_id, p_event_type, p_day, 1)
  ON CONFLICT (placement_id, event_type, day)
  DO UPDATE SET 
    count = placement_events.count + 1,
    updated_at = NOW();
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_placement_event TO service_role;

-- Comments for documentation
COMMENT ON TABLE sponsors IS 'Sponsor companies that purchase advertising placements';
COMMENT ON TABLE sponsor_placements IS 'Active and historical sponsored placements across different packages';
COMMENT ON TABLE sponsor_intake IS 'Raw sponsor intake form submissions awaiting review';
COMMENT ON TABLE placement_events IS 'Daily aggregated impression and click counts per placement (no IP storage)';
COMMENT ON VIEW public_live_placements IS 'Public view of currently live placements for anonymous users';
COMMENT ON FUNCTION increment_placement_event IS 'Safely increment impression or click count for a placement';

-- NOTE: This migration has been applied to production. Do not re-run.
